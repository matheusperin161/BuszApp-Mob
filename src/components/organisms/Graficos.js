/**
 * ORGANISM — Graficos
 * Gráficos simples desenhados com react-native-svg (sem biblioteca de gráficos):
 *   GraficoBarras   colunas por dia (recargas)
 *   GraficoBarrasH  barras deitadas com rótulo (viagens por linha)
 *   GraficoLinha    linha com pontos (média das avaliações por semana)
 * A largura vem do onLayout; as cores, do tema (claro/escuro).
 * Tocar numa coluna/ponto mostra o valor exato.
 */
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';

import { Label } from '../atoms/Label';
import { espacamentos } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

const MARGEM_ESQ = 36;
const MARGEM_BAIXO = 22;
const MARGEM_TOPO = 10;

function useLargura() {
  const [largura, setLargura] = useState(0);
  return [largura, e => setLargura(Math.round(e.nativeEvent.layout.width))];
}

/** 3 marcas "redondas" no eixo Y */
function marcas(max) {
  if (max <= 0) return [0];
  const passo = 10 ** Math.floor(Math.log10(max));
  const topo = Math.ceil(max / passo) * passo;
  return [0, topo / 2, topo];
}

export function GraficoBarras({ dados, altura = 180, formatar = v => String(v), descricao }) {
  const styles = useStyles();
  const { cores } = useTema();
  const [largura, onLayout] = useLargura();
  const [ativo, setAtivo] = useState(null);
  const maximo = Math.max(0, ...dados.map(d => d.valor));
  const eixo = marcas(maximo);
  const topo = eixo[eixo.length - 1] || 1;
  const areaL = Math.max(0, largura - MARGEM_ESQ);
  const areaA = altura - MARGEM_BAIXO - MARGEM_TOPO;
  const passo = dados.length ? areaL / dados.length : 0;
  const barra = Math.max(2, passo * 0.7);
  // rótulos do eixo X: ~6 ao longo do período
  const cadaQuantos = Math.max(1, Math.ceil(dados.length / 6));
  const selecionado = ativo != null ? dados[ativo] : null;

  return (
    <View onLayout={onLayout} accessible accessibilityLabel={descricao}>
      <Label variante="legenda" style={styles.valorAtivo}>
        {selecionado ? `${selecionado.rotuloLongo ?? selecionado.rotulo}: ${formatar(selecionado.valor)}` : 'Toque numa coluna para ver o valor'}
      </Label>
      {largura ? (
        <Svg width={largura} height={altura}>
          {eixo.map(v => {
            const y = MARGEM_TOPO + areaA - (v / topo) * areaA;
            return (
              <Line key={`g${v}`} x1={MARGEM_ESQ} x2={largura} y1={y} y2={y} stroke={cores.bordaNeutra} strokeWidth={1} />
            );
          })}
          {eixo.map(v => (
            <SvgText
              key={`t${v}`}
              x={MARGEM_ESQ - 6}
              y={MARGEM_TOPO + areaA - (v / topo) * areaA + 4}
              fontSize={10}
              fill={cores.textoSecundario}
              textAnchor="end">
              {formatar(v, true)}
            </SvgText>
          ))}
          {dados.map((d, i) => {
            const h = (d.valor / topo) * areaA;
            const x = MARGEM_ESQ + i * passo + (passo - barra) / 2;
            return (
              <Rect
                key={d.rotulo + i}
                x={x}
                y={MARGEM_TOPO + areaA - h}
                width={barra}
                height={Math.max(h, d.valor > 0 ? 2 : 0)}
                rx={Math.min(3, barra / 2)}
                fill={ativo === i ? cores.destaque : cores.primaria}
                onPress={() => setAtivo(i)}
              />
            );
          })}
          {dados.map((d, i) =>
            i % cadaQuantos === 0 ? (
              <SvgText
                key={`x${i}`}
                x={MARGEM_ESQ + i * passo + passo / 2}
                y={altura - 6}
                fontSize={10}
                fill={cores.textoSecundario}
                textAnchor="middle">
                {d.rotulo}
              </SvgText>
            ) : null,
          )}
        </Svg>
      ) : (
        <View style={{ height: altura }} />
      )}
    </View>
  );
}

export function GraficoBarrasH({ dados, formatar = v => String(v), vazio = 'Sem dados no período.', cor }) {
  const styles = useStyles();
  const { cores } = useTema();
  const maximo = Math.max(1, ...dados.map(d => d.valor));
  if (!dados.length) return <Label variante="legenda">{vazio}</Label>;
  return (
    <View style={styles.listaH}>
      {dados.map(d => (
        <View key={d.rotulo} style={styles.itemH} accessible accessibilityLabel={`${d.rotulo}: ${formatar(d.valor)}`}>
          <View style={styles.rotuloH}>
            <Label style={styles.rotuloHTexto} numberOfLines={1}>
              {d.rotulo}
            </Label>
            {d.detalhe ? (
              <Label variante="legenda" numberOfLines={1}>
                {d.detalhe}
              </Label>
            ) : null}
          </View>
          <View style={styles.trilhoH}>
            <View
              style={[styles.barraH, { width: `${(d.valor / maximo) * 100}%`, backgroundColor: cor ?? cores.primaria }]}
            />
          </View>
          <Label style={styles.valorH}>{formatar(d.valor)}</Label>
        </View>
      ))}
    </View>
  );
}

export function GraficoLinha({ dados, altura = 170, min = 0, max = 5, formatar = v => String(v), descricao }) {
  const styles = useStyles();
  const { cores } = useTema();
  const [largura, onLayout] = useLargura();
  const [ativo, setAtivo] = useState(null);
  const areaL = Math.max(0, largura - MARGEM_ESQ - 12);
  const areaA = altura - MARGEM_BAIXO - 8;
  const x = i => MARGEM_ESQ + (dados.length > 1 ? (i / (dados.length - 1)) * areaL : areaL / 2);
  const y = v => 8 + areaA - ((v - min) / (max - min)) * areaA;
  const selecionado = ativo != null ? dados[ativo] : null;
  const eixo = [min, (min + max) / 2, max];

  if (!dados.length) return <Label variante="legenda">Nenhuma avaliação no período.</Label>;

  return (
    <View onLayout={onLayout} accessible accessibilityLabel={descricao}>
      <Label variante="legenda" style={styles.valorAtivo}>
        {selecionado
          ? `${selecionado.rotuloLongo ?? selecionado.rotulo}: ${formatar(selecionado.valor)}${selecionado.extra ? ` · ${selecionado.extra}` : ''}`
          : 'Toque num ponto para ver o valor'}
      </Label>
      {largura ? (
        <Svg width={largura} height={altura}>
          {eixo.map(v => (
            <Line key={`g${v}`} x1={MARGEM_ESQ} x2={largura} y1={y(v)} y2={y(v)} stroke={cores.bordaNeutra} strokeWidth={1} />
          ))}
          {eixo.map(v => (
            <SvgText key={`t${v}`} x={MARGEM_ESQ - 6} y={y(v) + 4} fontSize={10} fill={cores.textoSecundario} textAnchor="end">
              {formatar(v, true)}
            </SvgText>
          ))}
          <Polyline
            points={dados.map((d, i) => `${x(i)},${y(d.valor)}`).join(' ')}
            fill="none"
            stroke={cores.primaria}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          {dados.map((d, i) => (
            <Circle
              key={d.rotulo + i}
              cx={x(i)}
              cy={y(d.valor)}
              r={ativo === i ? 7 : 5}
              fill={ativo === i ? cores.destaque : cores.superficie}
              stroke={cores.primaria}
              strokeWidth={2.5}
              onPress={() => setAtivo(i)}
            />
          ))}
          {/* alvo de toque maior que o ponto, para quem tem dificuldade de acertar */}
          {dados.map((d, i) => (
            <Circle key={`a${i}`} cx={x(i)} cy={y(d.valor)} r={18} fill="transparent" onPress={() => setAtivo(i)} />
          ))}
          {dados.map((d, i) => (
            <SvgText key={`x${i}`} x={x(i)} y={altura - 4} fontSize={10} fill={cores.textoSecundario} textAnchor="middle">
              {d.rotulo}
            </SvgText>
          ))}
        </Svg>
      ) : (
        <View style={{ height: altura }} />
      )}
    </View>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  valorAtivo: { marginBottom: espacamentos.sm, fontWeight: '600', color: cores.textoMedio },
  listaH: { gap: espacamentos.sm + 2 },
  itemH: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  rotuloH: { width: 104 },
  rotuloHTexto: { fontWeight: '700', fontSize: 14 },
  trilhoH: { flex: 1, height: 14, borderRadius: 7, backgroundColor: cores.cinzaClaro, overflow: 'hidden' },
  barraH: { height: 14, borderRadius: 7 },
  valorH: { width: 34, textAlign: 'right', fontWeight: '800' },
}));
