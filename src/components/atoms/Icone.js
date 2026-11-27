/**
 * ATOM — Icone
 * Ícone de traço (Feather), o mesmo conjunto usado no site.
 * Desenhado com react-native-svg: nítido em qualquer tamanho e com a cor que quiser.
 *   <Icone nome="map-pin" cor="#B45309" tamanho={22} />
 * preenchido=true pinta o miolo (estrela marcada, por exemplo).
 */
import { memo } from 'react';
import Svg, { Circle, Line, Path, Polygon, Polyline, Rect } from 'react-native-svg';

import { ICONES } from '../../constants/icones';
import { useTema } from '../../theme/tema';


const ELEMENTOS = {
  path: Path,
  circle: Circle,
  line: Line,
  polyline: Polyline,
  polygon: Polygon,
  rect: Rect,
};

export const Icone = memo(function Icone({
  nome,
  tamanho = 22,
  cor,
  espessura = 2,
  preenchido = false,
  style,
}) {
  const { cores } = useTema();
  const partes = ICONES[nome];
  const traco = cor ?? cores.texto;
  if (!partes) {
    return null;
  }
  return (
    <Svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill={preenchido ? traco : 'none'}
      stroke={traco}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      accessible={false}>
      {partes.map(([tag, atributos], i) => {
        const Elemento = ELEMENTOS[tag];
        return Elemento ? <Elemento key={i} {...atributos} /> : null;
      })}
    </Svg>
  );
});
