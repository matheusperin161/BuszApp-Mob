/**
 * ATOM — TextArea
 * TextInput multilinha (creme com borda âmbar, como no site). O pai controla value.
 */
import { useState } from 'react';
import { TextInput } from 'react-native';

import { espacamentos, raios, tipografia } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

export function TextArea({
  value,
  onChangeText,
  placeholder,
  erro = false,
  style,
  onFocus,
  onBlur,
  ...rest
}) {
  const styles = useStyles();
  const { cores } = useTema();
  const [focado, setFocado] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={cores.textoFraco}
      multiline
      textAlignVertical="top"
      onFocus={e => {
        setFocado(true);
        onFocus?.(e);
      }}
      onBlur={e => {
        setFocado(false);
        onBlur?.(e);
      }}
      style={[styles.base, focado && styles.focado, erro && styles.erro, style]}
      {...rest}
    />
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  base: {
    minHeight: 110,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.md,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 4,
    fontSize: tipografia.corpo,
    color: cores.texto,
    backgroundColor: cores.fundo,
  },
  focado: { borderColor: cores.bordaFoco, backgroundColor: cores.superficie },
  erro: { borderColor: cores.perigo },
}));
