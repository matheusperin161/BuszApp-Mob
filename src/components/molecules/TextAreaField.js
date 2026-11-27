/**
 * MOLECULE — TextAreaField
 * TextArea + erro do campo + contador de caracteres.
 */
import { View } from 'react-native';

import { espacamentos } from '../../theme';
import { criarEstilos } from '../../theme/tema';
import { TextArea } from '../atoms/TextArea';
import { Label } from '../atoms/Label';

export function TextAreaField({
  value,
  onChangeText,
  placeholder,
  mensagemErro,
  max,
  style,
  ...rest
}) {
  const styles = useStyles();
  const usados = String(value ?? '').trim().length;

  return (
    <View style={styles.container}>
      <TextArea
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        erro={Boolean(mensagemErro)}
        maxLength={max}
        style={style}
        {...rest}
      />
      <View style={styles.rodape}>
        {mensagemErro ? (
          <Label variante="legenda" style={styles.erro}>
            {mensagemErro}
          </Label>
        ) : (
          <View style={styles.flex} />
        )}
        {max != null ? (
          <Label variante="legenda" style={styles.contador}>
            {usados}/{max}
          </Label>
        ) : null}
      </View>
    </View>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  container: { marginBottom: espacamentos.sm },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: espacamentos.xs,
    gap: espacamentos.sm,
  },
  flex: { flex: 1 },
  erro: { color: cores.perigo, flex: 1 },
  contador: { color: cores.textoSecundario },
}));
