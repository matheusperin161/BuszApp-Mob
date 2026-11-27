/**
 * ATOM — Label
 * Texto do app com as variações tipográficas já definidas no tema.
 *   titulo · subtitulo · corpo · legenda · secao (rótulo em CAIXA ALTA espaçada)
 */
import { Text } from 'react-native';

import { tipografia } from '../../theme';
import { criarEstilos, escalarTexto, useTema } from '../../theme/tema';

export function Label({ children, variante = 'corpo', style, ...props }) {
  const styles = useStyles();
  const { escalaFonte } = useTema();
  return (
    <Text style={escalarTexto([styles[variante], style], escalaFonte)} {...props}>
      {children}
    </Text>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  titulo: {
    fontSize: tipografia.titulo,
    fontWeight: '800',
    color: cores.texto,
  },
  subtitulo: {
    fontSize: tipografia.subtitulo,
    fontWeight: '700',
    color: cores.texto,
  },
  corpo: {
    fontSize: tipografia.corpo,
    color: cores.texto,
  },
  legenda: {
    fontSize: tipografia.legenda,
    color: cores.textoSecundario,
  },
  secao: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: cores.textoSecundario,
  },
}));
