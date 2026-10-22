/**
 * ATOM — Label
 * Texto com variantes: titulo, subtitulo, corpo, legenda.
 */
import { Text } from 'react-native';

import { tipografia } from '../../theme';

export default function Label({ variante = 'corpo', style, children, ...props }) {
  return (
    <Text style={[tipografia[variante], style]} {...props}>
      {children}
    </Text>
  );
}
