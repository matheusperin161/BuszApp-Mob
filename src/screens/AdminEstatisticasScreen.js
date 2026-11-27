/**
 * SCREEN — AdminEstatisticasScreen
 * Gráficos do painel: recargas por dia, viagens por linha e média das
 * avaliações por semana, em 7, 30 ou 90 dias (GET /admin/estatisticas).
 */
import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Card } from '../components/molecules/Card';
import { EstadoCarga } from '../components/molecules/EstadoCarga';
import { Segmentos } from '../components/molecules/Segmentos';
import { StatCard } from '../components/molecules/StatCard';
import { GraficoBarras, GraficoBarrasH, GraficoLinha } from '../components/organisms/Graficos';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { estatisticas } from '../services/admin';
import { espacamentos } from '../theme';
import { criarEstilos } from '../theme/tema';
import { dinheiro } from '../utils/formato';

const PERIODOS = [
  { id: 7, rotulo: '7 dias' },
  { id: 30, rotulo: '30 dias' },
  { id: 90, rotulo: '90 dias' },
];

function diaMes(iso) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function reaisCurto(v, eixo) {
  if (!eixo) return dinheiro(v);
  return v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k` : String(Math.round(v));
}

export function AdminEstatisticasScreen() {
  const styles = useStyles();
  const [dias, setDias] = useState(30);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setDados(await estatisticas(dias));
    } catch (e) {
      setErro(e.message);
    }
  }, [dias]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const resumo = dados?.resumo;

  return (
    <ScreenTemplate cabecalho={{ titulo: 'Gráficos', subtitulo: 'Recargas, viagens e notas', voltar: true }}>
      <Segmentos
        opcoes={PERIODOS}
        valor={dias}
        onChange={v => {
          setDias(v);
          setDados(null);
        }}
      />
      {!dados || erro ? (
        <View style={styles.estado}>
          <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={carregar} />
        </View>
      ) : (
        <>
          <View style={styles.resumo}>
            <StatCard icone="dollar-sign" rotulo="Recargas" valor={dinheiro(resumo.recargas_total)} />
            <StatCard icone="truck" rotulo="Viagens" valor={String(resumo.viagens)} />
          </View>
          <View style={styles.resumo}>
            <StatCard icone="hash" rotulo="Embarques QR" valor={String(resumo.embarques_qr)} />
            <StatCard
              icone="star"
              rotulo="Nota média"
              valor={resumo.media_avaliacoes != null ? resumo.media_avaliacoes.toFixed(1).replace('.', ',') : '—'}
            />
          </View>

          <Card titulo="Recargas por dia" icone="bar-chart-2">
            <GraficoBarras
              descricao={`Recargas por dia nos últimos ${dias} dias, total ${dinheiro(resumo.recargas_total)}`}
              dados={dados.recargas_por_dia.map(r => ({
                rotulo: diaMes(r.dia),
                rotuloLongo: `${diaMes(r.dia)} · ${r.quantidade} recarga${r.quantidade === 1 ? '' : 's'}`,
                valor: r.total,
              }))}
              formatar={reaisCurto}
            />
          </Card>

          <Card titulo="Viagens por linha" icone="map">
            <GraficoBarrasH
              dados={dados.viagens_por_linha.slice(0, 10).map(l => ({
                rotulo: `Linha ${l.linha}`,
                detalhe: l.nome,
                valor: l.viagens,
              }))}
              vazio="Nenhuma viagem no período."
            />
          </Card>

          <Card titulo="Avaliações por semana" icone="star">
            <GraficoLinha
              descricao="Média das avaliações por semana, de 1 a 5"
              dados={dados.avaliacoes_por_semana.map(a => ({
                rotulo: diaMes(a.semana),
                rotuloLongo: `Semana de ${diaMes(a.semana)}`,
                valor: a.media,
                extra: `${a.quantidade} avaliaç${a.quantidade === 1 ? 'ão' : 'ões'}`,
              }))}
              min={1}
              max={5}
              formatar={(v, eixo) => (eixo ? String(v) : v.toFixed(1).replace('.', ','))}
            />
          </Card>
        </>
      )}
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(() => ({
  estado: { minHeight: 300 },
  resumo: { flexDirection: 'row', gap: espacamentos.sm + 4, marginBottom: espacamentos.sm + 4 },
}));
