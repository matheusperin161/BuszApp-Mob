/**
 * ORGANISM — MapaSeletor
 * Mapa para escolher um ponto com um toque (local de uma parada, origem e
 * destino de uma linha). Mesmo Leaflet + OpenStreetMap do resto do app.
 *   marcadores  pontos já existentes, só para referência ({ latitude, longitude, rotulo, cor })
 *   valor       ponto escolhido ({ latitude, longitude }) — aparece com o pino laranja
 *   onEscolher  chamado com { latitude, longitude } a cada toque no mapa
 * O botão "Minha localização" usa o GPS do celular para marcar onde você está.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { API_BASE_URL } from '../../services/config';
import { obterPosicao } from '../../services/nativos';
import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

const CENTRO_CHAPECO = [-27.1, -52.615];

function montarHtml(escuro) {
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #mapa { margin: 0; height: 100%; background: ${escuro ? '#0F172A' : '#FFFBEB'}; }
  ${escuro ? '.leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.92) contrast(0.9); }' : ''}
  .pino { width: 26px; height: 26px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
          background: #F97316; border: 3px solid #fff; box-shadow: 0 2px 6px rgba(0,0,0,.4); }
  .ref { width: 22px; height: 22px; border-radius: 50%; color: #fff; font: 700 11px sans-serif;
         display: flex; align-items: center; justify-content: center; border: 2px solid #fff;
         box-shadow: 0 1px 4px rgba(0,0,0,.35); }
  .leaflet-tooltip { font: 600 12px -apple-system, Roboto, sans-serif; }
</style>
</head><body>
<div id="mapa"></div>
<script>
  var mapa = L.map('mapa', { zoomControl: false }).setView(${JSON.stringify(CENTRO_CHAPECO)}, 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(mapa);
  L.control.zoom({ position: 'bottomright' }).addTo(mapa);
  var refs = L.layerGroup().addTo(mapa);
  var pino = null;
  var enquadrou = false;

  window.atualizar = function (d) {
    refs.clearLayers();
    var pts = [];
    (d.marcadores || []).forEach(function (m) {
      var ic = L.divIcon({ className: '', html: '<div class="ref" style="background:' + (m.cor || '#B45309') + '">' + (m.texto || '') + '</div>', iconSize: [22, 22], iconAnchor: [11, 11] });
      L.marker([m.latitude, m.longitude], { icon: ic }).bindTooltip(m.rotulo || '').addTo(refs);
      pts.push([m.latitude, m.longitude]);
    });
    if (pino) { mapa.removeLayer(pino); pino = null; }
    if (d.valor) {
      var icp = L.divIcon({ className: '', html: '<div class="pino"></div>', iconSize: [26, 26], iconAnchor: [13, 26] });
      pino = L.marker([d.valor.latitude, d.valor.longitude], { icon: icp }).addTo(mapa);
      pts.push([d.valor.latitude, d.valor.longitude]);
    }
    if (d.centralizar && d.valor) { mapa.setView([d.valor.latitude, d.valor.longitude], 16); enquadrou = true; }
    else if (!enquadrou && pts.length) {
      enquadrou = true;
      if (pts.length === 1) mapa.setView(pts[0], 15); else mapa.fitBounds(pts, { padding: [40, 40] });
    }
  };

  mapa.on('click', function (e) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ lat: e.latlng.lat, lng: e.latlng.lng }));
  });
  window.ReactNativeWebView.postMessage('pronto');
</script>
</body></html>`;
}

export function MapaSeletor({ marcadores = [], valor = null, onEscolher, altura = 300, dica }) {
  const styles = useStyles();
  const { cores, escuro } = useTema();
  const ref = useRef(null);
  const [pronto, setPronto] = useState(false);
  const [localizando, setLocalizando] = useState(false);
  const [erroGps, setErroGps] = useState(null);
  const centralizar = useRef(false);
  const html = useMemo(() => montarHtml(escuro), [escuro]);

  useEffect(() => {
    setPronto(false);
  }, [html]);

  const dados = useMemo(
    () => JSON.stringify({ marcadores, valor, centralizar: centralizar.current }),
    [marcadores, valor],
  );

  useEffect(() => {
    if (pronto) {
      ref.current?.injectJavaScript(`window.atualizar(${dados}); true;`);
      centralizar.current = false;
    }
  }, [pronto, dados]);

  async function usarMinhaLocalizacao() {
    setLocalizando(true);
    setErroGps(null);
    try {
      const pos = await obterPosicao();
      centralizar.current = true;
      onEscolher({ latitude: pos.latitude, longitude: pos.longitude });
    } catch (e) {
      setErroGps(e.message);
    } finally {
      setLocalizando(false);
    }
  }

  return (
    <View>
      <View style={[styles.mapa, { height: altura }]}>
        <WebView
          ref={ref}
          source={{ html, baseUrl: API_BASE_URL }}
          originWhitelist={['*']}
          onMessage={evento => {
            const msg = evento.nativeEvent.data;
            if (msg === 'pronto') {
              setPronto(true);
              return;
            }
            try {
              const { lat, lng } = JSON.parse(msg);
              onEscolher({ latitude: Number(lat.toFixed(6)), longitude: Number(lng.toFixed(6)) });
            } catch {
              // mensagem desconhecida: ignora
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          nestedScrollEnabled
          style={styles.webview}
        />
        {!pronto ? (
          <View style={styles.carregando}>
            <ActivityIndicator color={cores.primaria} />
          </View>
        ) : null}
        <View style={styles.dica} pointerEvents="none">
          <Icone nome="crosshair" cor="#FFFFFF" tamanho={14} />
          <Label style={styles.dicaTexto}>{dica ?? 'Toque no mapa para marcar o local'}</Label>
        </View>
      </View>
      <View style={styles.rodape}>
        <Label variante="legenda" style={styles.coords} numberOfLines={1}>
          {valor
            ? `${valor.latitude.toFixed(5)}, ${valor.longitude.toFixed(5)}`
            : 'Nenhum ponto marcado'}
        </Label>
        <Pressable
          onPress={usarMinhaLocalizacao}
          disabled={localizando}
          accessibilityRole="button"
          style={styles.gps}>
          {localizando ? (
            <ActivityIndicator size="small" color={cores.primariaTexto} />
          ) : (
            <Icone nome="navigation" cor={cores.primariaTexto} tamanho={16} />
          )}
          <Label style={styles.gpsTexto}>Minha localização</Label>
        </Pressable>
      </View>
      {erroGps ? (
        <Label variante="legenda" style={styles.erro}>
          {erroGps}
        </Label>
      ) : null}
    </View>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  mapa: {
    borderRadius: raios.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    backgroundColor: cores.fundoMapa,
  },
  webview: { flex: 1, backgroundColor: 'transparent' },
  carregando: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dica: {
    position: 'absolute',
    top: espacamentos.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(17,24,39,0.78)',
    borderRadius: raios.pilula,
    paddingHorizontal: espacamentos.md,
    paddingVertical: 6,
  },
  dicaTexto: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacamentos.sm,
    gap: espacamentos.sm,
  },
  coords: { flex: 1, fontVariant: ['tabular-nums'] },
  gps: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  gpsTexto: { color: cores.primariaTexto, fontWeight: '700', fontSize: 14 },
  erro: { color: cores.perigo, marginTop: 4 },
}));
