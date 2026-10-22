/**
 * MOLECULE — EstadoCarga
 * Estado de carregamento / vazio / erro de uma tela.
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import Label from '../atoms/Label';
import ErrorMessage from './ErrorMessage';
import { cores, espacos } from '../../theme';

export default function EstadoCarga({ carregando, erro, vazio, mensagemVazia = 'Nada por aqui.', aoTentarDeNovo }) {
  if (carregando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }
  if (erro) return <ErrorMessage mensagem={erro} aoTentarDeNovo={aoTentarDeNovo} />;
  if (vazio) {
    return (
      <View style={styles.centro}>
        <Label variante="legenda">{mensagemVazia}</Label>
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  centro: { paddingVertical: espacos.xxl, alignItems: 'center' },
});
