/**
 * ATOM — Input
 * Campo de texto puro (TextInput estilizado).
 */
import { StyleSheet, TextInput } from 'react-native';

import { cores, espacos, raios } from '../../theme';

export default function Input({ erro = false, style, ...props }) {
  return (
    <TextInput
      placeholderTextColor={cores.textoSuave}
      style={[styles.input, erro && styles.comErro, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 48,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    color: cores.texto,
    fontSize: 15,
  },
  comErro: { borderColor: cores.perigo },
});
