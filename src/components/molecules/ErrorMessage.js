/**
 * MOLECULE — ErrorMessage
 * Caixa de erro com botão "tentar de novo".
 */
import { StyleSheet, View } from 'react-native';

import Button from '../atoms/Button';
import Label from '../atoms/Label';
import { cores, espacos, raios } from '../../theme';

export default function ErrorMessage({ mensagem, aoTentarDeNovo, style }) {
  if (!mensagem) return null;
  return (
    <View style={[styles.caixa, style]} accessibilityRole="alert">
      <Label style={styles.texto}>{mensagem}</Label>
      {aoTentarDeNovo ? (
        <Button titulo="Tentar de novo" variante="secundario" onPress={aoTentarDeNovo} style={styles.botao} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    backgroundColor: cores.perigoFundo,
    borderRadius: raios.md,
    padding: espacos.md,
    marginBottom: espacos.md,
  },
  texto: { color: cores.perigoTexto },
  botao: { marginTop: espacos.sm },
});
