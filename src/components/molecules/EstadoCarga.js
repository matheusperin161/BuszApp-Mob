/**
 * MOLECULE — EstadoCarga
 * Três estados de uma tela que fala com a API:
 * carregando (spinner), erro (faixa + retry), ou nada (o pai pinta os dados).
 */
import { ActivityIndicator, View } from 'react-native';

import { espacamentos } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';
import { Button } from '../atoms/Button';
import { Label } from '../atoms/Label';
import { ErrorMessage } from './ErrorMessage';

export function EstadoCarga({ carregando, erro, onTentarDeNovo }) {
  const styles = useStyles();
  const { cores } = useTema();
  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Label variante="legenda" style={styles.texto}>
          Carregando...
        </Label>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.caixa}>
        <ErrorMessage mensagem={erro} />
        {onTentarDeNovo ? (
          <Button title="Tentar de novo" icone="refresh-cw" onPress={onTentarDeNovo} />
        ) : null}
      </View>
    );
  }

  return null;
}

const useStyles = criarEstilos(({ cores }) => ({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamentos.lg,
    backgroundColor: cores.fundo,
  },
  caixa: {
    flex: 1,
    justifyContent: 'center',
    padding: espacamentos.lg,
    backgroundColor: cores.fundo,
  },
  texto: { marginTop: espacamentos.md },
}));
