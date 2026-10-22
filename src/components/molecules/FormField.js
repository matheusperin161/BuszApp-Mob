/**
 * MOLECULE — FormField
 * Label + Input + mensagem de erro.
 */
import { StyleSheet, Text, View } from 'react-native';

import Input from '../atoms/Input';
import Label from '../atoms/Label';
import { cores, espacos } from '../../theme';

export default function FormField({ rotulo, erro, obrigatorio = false, children, ...inputProps }) {
  return (
    <View style={styles.campo}>
      <Label variante="legenda" style={styles.rotulo}>
        {rotulo}
        {obrigatorio ? ' *' : ''}
      </Label>
      {children ?? <Input erro={Boolean(erro)} accessibilityLabel={rotulo} {...inputProps} />}
      {erro ? <Text style={styles.erro}>{erro}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  campo: { marginBottom: espacos.md },
  rotulo: { fontWeight: '700', marginBottom: espacos.xs, textTransform: 'uppercase' },
  erro: { color: cores.perigo, fontSize: 13, marginTop: espacos.xs },
});
