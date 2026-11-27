/**
 * MOLECULE — FormField
 * Rótulo + Input + mensagem de erro do campo.
 * label é opcional: no login/cadastro o site mostra só o ícone e o placeholder.
 * mensagemErro pinta a borda e o texto; o pai decide quando mostrar.
 */
import { forwardRef } from 'react';
import { View } from 'react-native';

import { espacamentos } from '../../theme';
import { criarEstilos } from '../../theme/tema';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';

export const FormField = forwardRef(function FormField(
  { label, erro = false, mensagemErro, ajuda, rotuloSecao = false, style, ...props },
  ref,
) {
  const styles = useStyles();
  const temErro = erro || Boolean(mensagemErro);

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <Label variante={rotuloSecao ? 'secao' : 'corpo'} style={rotuloSecao ? styles.secao : styles.label}>
          {label}
        </Label>
      ) : null}
      <Input ref={ref} erro={temErro} {...props} />
      {mensagemErro ? (
        <Label variante="legenda" style={styles.erro}>
          {mensagemErro}
        </Label>
      ) : ajuda ? (
        <Label variante="legenda" style={styles.ajuda}>
          {ajuda}
        </Label>
      ) : null}
    </View>
  );
});

const useStyles = criarEstilos(({ cores }) => ({
  container: { marginBottom: espacamentos.md },
  label: {
    marginBottom: espacamentos.sm,
    fontWeight: '600',
    color: cores.textoMedio,
  },
  secao: { marginBottom: espacamentos.sm, letterSpacing: 1 },
  erro: { color: cores.perigo, marginTop: espacamentos.xs },
  ajuda: { marginTop: espacamentos.xs },
}));
