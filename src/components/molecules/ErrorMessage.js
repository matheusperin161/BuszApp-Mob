/**
 * MOLECULE — ErrorMessage
 * Faixa de erro exibida acima do formulário. Se não houver mensagem,
 * não renderiza nada — quem chama não precisa fazer o if.
 */
import { View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

export function ErrorMessage({ mensagem }) {
  const styles = useStyles();
  const { cores } = useTema();
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

const useStyles = criarEstilos(({ cores, escuro }) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacamentos.sm + 2,
    backgroundColor: escuro ? cores.perigoFundo : '#FEF2F2',
    borderWidth: 1,
    borderColor: escuro ? '#991B1B' : '#FECACA',
    borderRadius: raios.lg,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  texto: { color: cores.perigoTexto, flex: 1, fontSize: 14, lineHeight: 20 },
}));
