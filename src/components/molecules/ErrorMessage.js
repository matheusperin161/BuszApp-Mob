/**
 * MOLECULE — ErrorMessage
 * Faixa de erro exibida acima do formulário. Se não houver mensagem,
 * não renderiza nada — quem chama não precisa fazer o if.
 */
import { StyleSheet, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

export function ErrorMessage({ mensagem }) {
  if (!mensagem) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Icone nome="alert-circle" cor={cores.perigoTexto} tamanho={20} />
      <Label style={styles.texto}>{mensagem}</Label>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.sm + 2,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: raios.lg,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  texto: { color: cores.perigoTexto, flex: 1, fontSize: 14, lineHeight: 20 },
});
