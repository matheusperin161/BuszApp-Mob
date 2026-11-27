/**
 * SCREEN — AdminMapaScreen (aba "Mapa" do administrador)
 * "Ônibus em Rota" do painel do site: todos os ônibus que mandaram GPS nos
 * últimos 15 minutos (motorista pelo site ou pelo app), com filtro por linha.
 * Atualiza a cada 10 s enquanto a tela está aberta.
 * Ocorrências abertas aparecem no mapa (marcador vermelho) e numa lista com a
 * foto enviada pelo motorista e o botão "Resolver".
 */
import { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { ChipGrupo } from '../components/molecules/ChipGrupo';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { RegistroItem } from '../components/molecules/RegistroItem';
import { MapaLinha } from '../components/organisms/MapaLinha';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { voltarAoLogin } from '../navigation/acoes';
import { ocorrencias, onibusAoVivo, resolverOcorrencia } from '../services/admin';
import { urlDaFoto } from '../services/usuario';
import { espacamentos, raios } from '../theme';
import { hora, tempoRelativo } from '../utils/formato';

const ATUALIZA_MS = 10000;
const TODAS = 'todas';
const TIPO_OCORRENCIA = { atraso: 'Atraso', pane: 'Pane mecânica', acidente: 'Acidente', outro: 'Ocorrência' };

export function AdminMapaScreen({ navigation }) {
  const [lista, setLista] = useState(null);
  const [linha, setLinha] = useState(TODAS);
  const [erro, setErro] = useState(null);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [resolvendo, setResolvendo] = useState(null);

  const carregar = useCallback(async () => {
    try {
      const [onibus, abertas] = await Promise.all([onibusAoVivo(), ocorrencias('aberto').catch(() => [])]);
      setLista(onibus);
      setAlertas(abertas);
      setAtualizadoEm(new Date());
      setErro(null);
    } catch (e) {
      if (e.status === 401) {
        voltarAoLogin(navigation);
        return;
      }
      setErro(e.message);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
      const timer = setInterval(carregar, ATUALIZA_MS);
      return () => clearInterval(timer);
    }, [carregar]),
  );

  const linhas = useMemo(() => {
    const numeros = new Map();
    (lista || []).forEach(o => {
      const n = o.route?.route_number;
      if (n) numeros.set(String(n), o.route?.route_name);
    });
    return [...numeros.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));
  }, [lista]);

  const filtrados = useMemo(
    () => (lista || []).filter(o => linha === TODAS || String(o.route?.route_number) === linha),
    [lista, linha],
  );

  const marcadores = useMemo(
    () =>
      filtrados.map(o => ({
        id: String(o.id ?? o.bus_number),
        latitude: o.latitude,
        longitude: o.longitude,
        titulo: `${o.bus_number ?? 'Ônibus'}${o.route?.route_number ? ` · L${o.route.route_number}` : ''}`,
        destaque: true,
      })),
    [filtrados],
  );

  const marcadoresAlerta = useMemo(
    () =>
      alertas
        .filter(a => a.latitude != null && a.longitude != null)
        .map(a => ({
          latitude: a.latitude,
          longitude: a.longitude,
          titulo: `${TIPO_OCORRENCIA[a.type] ?? 'Ocorrência'} · ${a.driver_name ?? ''}`,
        })),
    [alertas],
  );

  async function resolver(id) {
    setResolvendo(id);
    try {
      await resolverOcorrencia(id);
      setAlertas(lista2 => lista2.filter(a => a.id !== id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setResolvendo(null);
    }
  }

  return (
    <ScreenTemplate cabecalho={{ titulo: 'Mapa ao Vivo', subtitulo: 'Ônibus em rota agora' }}>
      <ErrorMessage mensagem={erro} />
      <ChipGrupo
        opcoes={[{ id: TODAS, rotulo: 'Todas as linhas' }, ...linhas.map(n => ({ id: n, rotulo: `Linha ${n}` }))]}
        valor={linha}
        onChange={setLinha}
        horizontal
      />
      <MapaLinha
        key={linha}
        onibus={marcadores}
        alertas={marcadoresAlerta}
        enquadrar
        altura={320}
        aviso={lista && !filtrados.length ? 'Nenhum ônibus transmitindo' : null}
        style={styles.mapa}
      />
      <Label variante="legenda" style={styles.status}>
        {lista == null
          ? 'Carregando localização dos ônibus…'
          : `${filtrados.length} ônibus em rota${atualizadoEm ? ` · atualizado às ${hora(atualizadoEm.toISOString())}` : ''}`}
      </Label>
      {alertas.length ? (
        <Card titulo={`Ocorrências abertas (${alertas.length})`} icone="alert-triangle" corIcone="#DC2626">
          {alertas.map((a, i) => (
            <View key={a.id} style={[styles.alerta, i > 0 && styles.divisor]}>
              <View style={styles.alertaTopo}>
                {a.photo ? (
                  <Image source={{ uri: urlDaFoto(a.photo) }} style={styles.foto} accessibilityLabel="Foto da ocorrência" />
                ) : null}
                <View style={styles.flex}>
                  <Label style={styles.alertaTitulo}>{TIPO_OCORRENCIA[a.type] ?? 'Ocorrência'}</Label>
                  <Label variante="legenda">
                    {[a.driver_name, a.bus_number ? `Ônibus ${a.bus_number}` : null, tempoRelativo(a.created_at)]
                      .filter(Boolean)
                      .join(' · ')}
                  </Label>
                  {a.description ? <Label style={styles.descricao}>{a.description}</Label> : null}
                  {a.latitude == null ? <Label variante="legenda">Sem localização</Label> : null}
                </View>
              </View>
              <Button
                title="Marcar como resolvida"
                icone="check"
                variante="secundario"
                onPress={() => resolver(a.id)}
                carregando={resolvendo === a.id}
                style={styles.resolver}
              />
            </View>
          ))}
        </Card>
      ) : null}
      {filtrados.length ? (
        <Card titulo="Ônibus" icone="truck">
          {filtrados.map(o => (
            <RegistroItem
              key={String(o.id ?? o.bus_number)}
              icone="truck"
              titulo={`Ônibus ${o.bus_number ?? '—'}`}
              linhas={[
                o.route ? `Linha ${o.route.route_number} · ${o.route.route_name}` : 'Linha não identificada',
                `${o.speed != null ? `${Math.round(o.speed)} km/h · ` : ''}GPS ${tempoRelativo(o.timestamp)}`,
              ]}
              selo={{ texto: 'Em rota', tipo: 'verde', icone: 'radio' }}
            />
          ))}
        </Card>
      ) : null}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  mapa: { marginBottom: espacamentos.sm },
  status: { marginBottom: espacamentos.md, paddingHorizontal: espacamentos.xs },
  flex: { flex: 1 },
  alerta: { paddingVertical: espacamentos.sm },
  divisor: { borderTopWidth: 1, borderTopColor: 'rgba(148,163,184,0.3)' },
  alertaTopo: { flexDirection: 'row', gap: espacamentos.md },
  foto: { width: 84, height: 84, borderRadius: raios.md, backgroundColor: '#E5E7EB' },
  alertaTitulo: { fontWeight: '800', fontSize: 16 },
  descricao: { marginTop: 4 },
  resolver: { marginTop: espacamentos.sm, marginBottom: 0, minHeight: 44 },
});
