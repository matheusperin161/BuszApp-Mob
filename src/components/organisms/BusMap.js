/**
 * ORGANISM — BusMap
 * Mapa com a posição dos ônibus da linha.
 *
 * paradas: StopPoints da linha (opcional — o admin vê várias linhas sem paradas).
 * viagens: viagens em andamento vindas de /api/viagens/ativas.
 */
import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { cores, raios } from '../../theme';
import { hora, minutos } from '../../utils/formatacao';

// Chapecó-SC (mesma origem padrão do backend)
const REGIAO_INICIAL = { latitude: -27.0964, longitude: -52.6182, latitudeDelta: 0.08, longitudeDelta: 0.08 };

export default function BusMap({ paradas = [], viagens = [], style }) {
  const mapa = useRef(null);

  const coordenadas = useMemo(
    () => [
      ...paradas.map((p) => ({ latitude: p.latitude, longitude: p.longitude })),
      ...viagens.filter((v) => v.ultima_posicao).map((v) => ({
        latitude: v.ultima_posicao.latitude,
        longitude: v.ultima_posicao.longitude,
      })),
    ],
    [paradas, viagens],
  );

  // Enquadra quando muda o conjunto de pontos (linha nova ou ônibus novo), não a cada posição
  const assinatura = `${paradas.map((p) => p.id).join(',')}|${viagens.map((v) => v.id).join(',')}`;
  useEffect(() => {
    if (coordenadas.length && mapa.current) {
      mapa.current.fitToCoordinates(coordenadas, {
        edgePadding: { top: 48, right: 48, bottom: 48, left: 48 },
        animated: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assinatura]);

  return (
    <View style={[styles.caixa, style]}>
      <MapView ref={mapa} style={StyleSheet.absoluteFill} initialRegion={REGIAO_INICIAL}>
        {paradas.length > 1 ? (
          <Polyline
            coordinates={paradas.map((p) => ({ latitude: p.latitude, longitude: p.longitude }))}
            strokeColor={cores.primaria}
            strokeWidth={4}
          />
        ) : null}
        {paradas.map((p) => (
          <Marker
            key={`p${p.id}`}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            title={p.name}
            pinColor={cores.info}
          />
        ))}
        {viagens
          .filter((v) => v.ultima_posicao)
          .map((v) => (
            <Marker
              key={`v${v.id}`}
              coordinate={{ latitude: v.ultima_posicao.latitude, longitude: v.ultima_posicao.longitude }}
              title={`Linha ${v.linha?.numero ?? ''} · ${v.veiculo?.plate ?? ''}`}
              description={
                v.proxima_parada
                  ? `Próxima: ${v.proxima_parada.name} em ${minutos(v.proxima_parada.eta_min)} (${hora(v.proxima_parada.chegada_estimada)})`
                  : `Atualizado às ${hora(v.ultima_posicao.registrado_em)}`
              }
            >
              <View style={styles.onibus}>
                <Text style={styles.onibusTexto}>🚌</Text>
              </View>
            </Marker>
          ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: { height: 320, borderRadius: raios.lg, overflow: 'hidden', backgroundColor: cores.borda },
  onibus: {
    backgroundColor: cores.primaria,
    borderColor: cores.superficie,
    borderWidth: 2,
    borderRadius: raios.pilula,
    padding: 4,
  },
  onibusTexto: { fontSize: 18 },
});
