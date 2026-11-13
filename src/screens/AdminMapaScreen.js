/**
 * SCREEN — AdminMapaScreen (aba "Mapa" do administrador)
 * "Ônibus em Rota" do painel do site: todos os ônibus que mandaram GPS nos
 * últimos 15 minutos (motorista pelo site ou pelo app), com filtro por linha.
 * Atualiza a cada 10 s enquanto a tela está aberta.
 */
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { ChipGrupo } from '../components/molecules/ChipGrupo';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { RegistroItem } from '../components/molecules/RegistroItem';
import { MapaLinha } from '../components/organisms/MapaLinha';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { voltarAoLogin } from '../navigation/acoes';
import { onibusAoVivo } from '../services/admin';
import { espacamentos } from '../theme';
import { hora, tempoRelativo } from '../utils/formato';

const ATUALIZA_MS = 10000;
const TODAS = 'todas';

export function AdminMapaScreen({ navigation }) {
  const [lista, setLista] = useState(null);
  const [linha, setLinha] = useState(TODAS);
  const [erro, setErro] = useState(null);
  const [atualizadoEm, setAtualizadoEm] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLista(await onibusAoVivo());
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
});
