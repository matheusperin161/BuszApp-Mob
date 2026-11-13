/**
 * SCREEN — AdminAvaliacoesScreen (aba "Avaliações" do administrador)
 * "Histórico de Avaliações" do painel do site: médias por critério,
 * filtro por motorista e a lista com nota, linha, comentário e autor.
 */
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { ChipGrupo } from '../components/molecules/ChipGrupo';
import { EstadoCarga } from '../components/molecules/EstadoCarga';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { voltarAoLogin } from '../navigation/acoes';
import { avaliacoes } from '../services/admin';
import { cores, espacamentos, raios, sombra } from '../theme';
import { dataCurta } from '../utils/formato';

const TODOS = 'todos';
const CRITERIOS = [
  { campo: 'overall_rating', rotulo: 'Geral' },
  { campo: 'punctuality_rating', rotulo: 'Pontualidade' },
  { campo: 'cleanliness_rating', rotulo: 'Limpeza' },
  { campo: 'comfort_rating', rotulo: 'Conforto' },
  { campo: 'service_rating', rotulo: 'Motorista' },
];

function media(lista, campo) {
  const notas = lista.map(r => Number(r[campo])).filter(n => n > 0);
  return notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
}

function Estrelas({ nota }) {
  return (
    <View style={styles.estrelas}>
      {[1, 2, 3, 4, 5].map(n => (
        <Icone
          key={n}
          nome="star"
          tamanho={15}
          cor={n <= nota ? cores.primaria : '#D1D5DB'}
          preenchido={n <= nota}
        />
      ))}
    </View>
  );
}

export function AdminAvaliacoesScreen({ navigation }) {
  const [lista, setLista] = useState(null);
  const [motorista, setMotorista] = useState(TODOS);
  const [erro, setErro] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setLista(await avaliacoes());
    } catch (e) {
      if (e.status === 401) {
        voltarAoLogin(navigation);
        return;
      }
      setErro(e.message);
    } finally {
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const motoristas = useMemo(() => {
    const nomes = new Set((lista || []).map(r => r.driver_name).filter(Boolean));
    return [...nomes].sort();
  }, [lista]);

  const filtradas = useMemo(
    () => (lista || []).filter(r => motorista === TODOS || r.driver_name === motorista),
    [lista, motorista],
  );

  return (
    <ScreenTemplate
      cabecalho={{ titulo: 'Avaliações', subtitulo: 'O que os passageiros acharam' }}
      onRefresh={() => {
        setRefreshing(true);
        carregar();
      }}
      refreshing={refreshing}>
      {lista == null || erro ? (
        <View style={styles.estado}>
          <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={carregar} />
        </View>
      ) : (
        <>
          {motoristas.length ? (
            <ChipGrupo
              opcoes={[{ id: TODOS, rotulo: 'Todos os motoristas' }, ...motoristas.map(n => ({ id: n, rotulo: n }))]}
              valor={motorista}
              onChange={setMotorista}
              horizontal
            />
          ) : null}

          <Card titulo={`${filtradas.length} avaliações`} icone="award">
            {CRITERIOS.map(c => {
              const m = media(filtradas, c.campo);
              return (
                <View key={c.campo} style={styles.criterio}>
                  <Label style={styles.criterioNome}>{c.rotulo}</Label>
                  <View style={styles.barra}>
                    <View style={[styles.barraCheia, { width: `${((m ?? 0) / 5) * 100}%` }]} />
                  </View>
                  <Label style={styles.criterioNota}>{m != null ? m.toFixed(1).replace('.', ',') : '—'}</Label>
                </View>
              );
            })}
          </Card>

          {filtradas.map(r => (
            <View key={r.id} style={styles.item}>
              <View style={styles.itemTopo}>
                <Estrelas nota={r.overall_rating} />
                <Label variante="legenda">{dataCurta(r.trip_date ?? r.created_at)}</Label>
              </View>
              <Label style={styles.linha} numberOfLines={1}>
                {r.bus_line || 'Linha não informada'}
                {r.schedule_departure ? ` · ${r.schedule_departure}` : ''}
              </Label>
              {r.comments ? <Label style={styles.comentario}>“{r.comments}”</Label> : null}
              <Label variante="legenda">
                {r.username ?? 'Passageiro'}
                {r.driver_name ? ` · Motorista: ${r.driver_name}` : ''}
              </Label>
            </View>
          ))}
          {!filtradas.length ? (
            <Label variante="legenda" style={styles.vazio}>
              Nenhuma avaliação ainda.
            </Label>
          ) : null}
        </>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  estado: { minHeight: 240 },
  criterio: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm, marginBottom: espacamentos.sm },
  criterioNome: { width: 100, color: cores.textoMedio },
  barra: { flex: 1, height: 8, borderRadius: 4, backgroundColor: cores.cinzaClaro, overflow: 'hidden' },
  barraCheia: { height: 8, borderRadius: 4, backgroundColor: cores.primaria },
  criterioNota: { width: 34, textAlign: 'right', fontWeight: '700' },
  item: {
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.md,
    marginBottom: espacamentos.sm + 2,
    gap: 4,
    ...sombra,
  },
  itemTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  estrelas: { flexDirection: 'row', gap: 2 },
  linha: { fontWeight: '700' },
  comentario: { color: cores.textoMedio, fontStyle: 'italic', lineHeight: 20 },
  vazio: { textAlign: 'center', marginTop: espacamentos.lg },
});
