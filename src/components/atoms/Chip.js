/**
 * ATOM — Chip
 * Opção selecionável pequena (valor de recarga, horário, tipo de cartão).
 * Desmarcado: creme com borda âmbar (igual aos campos do site). Marcado: âmbar cheio.
 */
import { Pressable, Text } from 'react-native';

import { espacamentos, raios, tipografia } from '../../theme';
import { criarEstilos, escalarTexto, useTema } from '../../theme/tema';

export function Chip({ rotulo, selecionado = false, onPress, desabilitado = false, style }) {
  const styles = useStyles();
  const { escalaFonte } = useTema();
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityState={{ selected: selecionado, disabled: desabilitado }}
      style={({ pressed }) => [
        styles.base,
        selecionado && styles.selecionado,
        pressed && styles.pressionado,
        desabilitado && styles.inativo,
        style,
      ]}>
      <Text style={escalarTexto([styles.texto, selecionado && styles.textoSelecionado], escalaFonte)}>{rotulo}</Text>
    </Pressable>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  base: {
    minHeight: 42,
    paddingHorizontal: espacamentos.md,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selecionado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  pressionado: { opacity: 0.8 },
  inativo: { opacity: 0.4 },
  texto: { fontSize: tipografia.corpo, fontWeight: '600', color: cores.textoMedio },
  textoSelecionado: { color: '#FFFFFF' },
}));
