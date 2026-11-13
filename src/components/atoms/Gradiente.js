/**
 * ATOM — Gradiente
 * Fundo em degradê, igual ao "linear-gradient(135deg, ...)" do CSS do site.
 * Fica atrás do conteúdo (absoluteFill); quem arredonda é o pai (overflow: 'hidden').
 *   <View style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: '#FBBF24' }}>
 *     <Gradiente {...gradientes.marca} />
 *     ...conteúdo
 *   </View>
 *
 * O SVG é desenhado com o tamanho REAL medido (onLayout), em números.
 * Com width="100%" o Android mede o SVG errado e o degradê fica cortado.
 */
import { memo, useCallback, useId, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

/** ângulo do CSS → pontos x1,y1,x2,y2 em pixels, cobrindo o retângulo inteiro (como o CSS faz) */
function pontos(angulo, largura, altura) {
  const rad = (angulo * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  // meio-comprimento da linha do degradê no CSS: |w·sen| + |h·cos|, dividido por 2
  const meio = (Math.abs(largura * dx) + Math.abs(altura * dy)) / 2;
  const cx = largura / 2;
  const cy = altura / 2;
  return { x1: cx - dx * meio, y1: cy - dy * meio, x2: cx + dx * meio, y2: cy + dy * meio };
}

export const Gradiente = memo(function Gradiente({ cores, angulo = 135, opacidade = 1, style }) {
  const id = `g${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const [tamanho, setTamanho] = useState(null);

  const medir = useCallback(evento => {
    const { width, height } = evento.nativeEvent.layout;
    setTamanho(atual =>
      atual && Math.round(atual.width) === Math.round(width) && Math.round(atual.height) === Math.round(height)
        ? atual
        : { width, height },
    );
  }, []);

  const largura = tamanho?.width ?? 0;
  const altura = tamanho?.height ?? 0;
  const { x1, y1, x2, y2 } = pontos(angulo, largura, altura);

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none" onLayout={medir}>
      {largura > 0 && altura > 0 ? (
        <Svg width={largura} height={altura}>
          <Defs>
            <LinearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
              {cores.map((cor, i) => (
                <Stop
                  key={cor + i}
                  offset={cores.length === 1 ? 0 : i / (cores.length - 1)}
                  stopColor={cor}
                  stopOpacity={opacidade}
                />
              ))}
            </LinearGradient>
          </Defs>
          <Rect x={0} y={0} width={largura} height={altura} fill={`url(#${id})`} />
        </Svg>
      ) : null}
    </View>
  );
});
