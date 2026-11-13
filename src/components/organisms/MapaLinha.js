/**
 * ORGANISM — MapaLinha
 * Mapa da linha: paradas, traçado e ônibus em tempo real.
 *
 * Usa o mesmo mapa do site (Leaflet + OpenStreetMap) dentro de uma WebView,
 * então não precisa de chave do Google Maps para rodar no emulador.
 * O React Native só manda os dados; o desenho acontece no HTML:
 *   RN → injectJavaScript("window.atualizar({...})")
 *   HTML → postMessage("pronto") quando o Leaflet terminou de carregar
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Label } from '../atoms/Label';
import { API_BASE_URL } from '../../services/config';
import { cores, espacamentos, raios } from '../../theme';

const CENTRO_CHAPECO = [-27.1, -52.615];

const HTML = `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #mapa { margin: 0; height: 100%; background: #FFFBEB; }
  .onibus div { width: 34px; height: 34px; border-radius: 50%;
                background: linear-gradient(135deg, #FBBF24, #F97316);
                border: 3px solid #fff; box-sizing: border-box;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 3px 8px rgba(0,0,0,.35); }
  .onibus.destaque div { width: 40px; height: 40px; }
  .leaflet-tooltip { font: 600 12px -apple-system, Roboto, sans-serif; }
</style>
</head><body>
<div id="mapa"></div>
<script>
  var mapa = L.map('mapa', { zoomControl: false, attributionControl: true })
    .setView(${JSON.stringify(CENTRO_CHAPECO)}, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19, attribution: '© OpenStreetMap'
  }).addTo(mapa);
  L.control.zoom({ position: 'bottomright' }).addTo(mapa);

  // ícone "truck" do Feather (o mesmo do site), em branco
  var CAMINHAO = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>';
  var camadaParadas = L.layerGroup().addTo(mapa);
  var camadaOnibus = L.layerGroup().addTo(mapa);
  var assinaturaParadas = null;

  window.atualizar = function (d) {
    var chave = JSON.stringify(d.paradas || []);
    if (chave !== assinaturaParadas) {
      assinaturaParadas = chave;
      camadaParadas.clearLayers();
      var pontos = (d.paradas || []).map(function (p) { return [p.latitude, p.longitude]; });
      if (pontos.length > 1) {
        L.polyline(pontos, { color: '#F97316', weight: 5, opacity: 0.75 }).addTo(camadaParadas);
      }
      (d.paradas || []).forEach(function (p, i) {
        L.circleMarker([p.latitude, p.longitude], {
          radius: 7, color: '#B45309', weight: 2, fillColor: '#FBBF24', fillOpacity: 1
        }).bindTooltip((i + 1) + '. ' + p.name).addTo(camadaParadas);
      });
      if (pontos.length) { mapa.fitBounds(pontos, { padding: [36, 36] }); }
    }

    camadaOnibus.clearLayers();
    (d.onibus || []).forEach(function (o) {
      var icone = L.divIcon({
        className: 'onibus' + (o.destaque ? ' destaque' : ''),
        html: '<div>' + CAMINHAO + '</div>',
        iconSize: o.destaque ? [40, 40] : [34, 34],
        iconAnchor: o.destaque ? [20, 20] : [17, 17]
      });
      L.marker([o.latitude, o.longitude], { icon: icone })
        .bindTooltip(o.titulo, { permanent: !!o.destaque, direction: 'top', offset: [0, -14] })
        .addTo(camadaOnibus);
    });
    var semParadas = !(d.paradas || []).length;
    if (d.enquadrar && semParadas && (d.onibus || []).length && !window.jaEnquadrou) {
      window.jaEnquadrou = true;
      var pts = d.onibus.map(function (o) { return [o.latitude, o.longitude]; });
      if (pts.length === 1) { mapa.setView(pts[0], 15); } else { mapa.fitBounds(pts, { padding: [40, 40] }); }
    }
    if (d.seguir) {
      mapa.panTo([d.seguir.latitude, d.seguir.longitude]);
    }
  };

  window.ReactNativeWebView.postMessage('pronto');
</script>
</body></html>`;

export function MapaLinha({ paradas = [], onibus = [], seguir = null, altura = 320, aviso, style, enquadrar = false }) {
  const ref = useRef(null);
  const [pronto, setPronto] = useState(false);
  const [falhou, setFalhou] = useState(false);

  const dados = useMemo(
    () =>
      JSON.stringify({
        paradas: [...paradas]
          .sort((a, b) => a.order - b.order)
          .map(p => ({ latitude: p.latitude, longitude: p.longitude, name: p.name })),
        onibus,
        seguir,
        enquadrar,
      }),
    [paradas, onibus, seguir, enquadrar],
  );

  useEffect(() => {
    if (pronto) {
      ref.current?.injectJavaScript(`window.atualizar(${dados}); true;`);
    }
  }, [pronto, dados]);

  return (
    <View style={[styles.container, { height: altura }, style]}>
      <WebView
        ref={ref}
        // baseUrl = site do BusZapp: os tiles do OpenStreetMap recebem o mesmo Referer do site
        source={{ html: HTML, baseUrl: API_BASE_URL }}
        originWhitelist={['*']}
        onMessage={evento => {
          if (evento.nativeEvent.data === 'pronto') setPronto(true);
        }}
        onError={() => setFalhou(true)}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        nestedScrollEnabled
        style={styles.webview}
      />
      {!pronto && !falhou ? (
        <View style={styles.sobreposicao}>
          <ActivityIndicator color={cores.primaria} />
          <Label variante="legenda" style={styles.texto}>
            Carregando mapa...
          </Label>
        </View>
      ) : null}
      {pronto && aviso ? (
        <View style={styles.selo} pointerEvents="none">
          <Label style={styles.seloTexto}>{aviso}</Label>
        </View>
      ) : null}
      {falhou ? (
        <View style={styles.sobreposicao}>
          <Label variante="legenda">Não foi possível carregar o mapa. Confira a internet.</Label>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: raios.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    backgroundColor: cores.superficieAlt,
    marginBottom: espacamentos.md,
  },
  webview: { flex: 1, backgroundColor: 'transparent' },
  sobreposicao: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficieAlt,
    padding: espacamentos.md,
  },
  texto: { marginTop: espacamentos.sm },
  selo: {
    position: 'absolute',
    top: espacamentos.md,
    alignSelf: 'center',
    backgroundColor: 'rgba(17,24,39,0.78)',
    borderRadius: raios.pilula,
    paddingHorizontal: espacamentos.md,
    paddingVertical: 6,
  },
  seloTexto: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
});
