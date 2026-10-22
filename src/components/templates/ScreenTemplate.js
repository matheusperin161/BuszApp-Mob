/**
 * TEMPLATE — ScreenTemplate
 * Esqueleto das telas internas: título, subtítulo opcional e um corpo
 * rolável. Nenhum dado real mora aqui — só a estrutura visual.
 *
 * rolavel={false} para telas com FlatList ou mapa (que já rolam sozinhos).
 */
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Label from '../atoms/Label';
import { cores, espacos } from '../../theme';

export default function ScreenTemplate({ titulo, subtitulo, rolavel = true, children }) {
  // Android edge-to-edge: o conteúdo não pode ficar atrás da barra de navegação
  const { bottom } = useSafeAreaInsets();
  const respiro = { paddingBottom: espacos.lg + bottom };
  const cabecalho = titulo ? (
    <View style={styles.cabecalho}>
      <Label variante="titulo">{titulo}</Label>
      {subtitulo ? <Label variante="legenda">{subtitulo}</Label> : null}
    </View>
  ) : null;

  if (!rolavel) {
    return (
      <View style={[styles.tela, styles.conteudo, respiro]}>
        {cabecalho}
        {children}
      </View>
    );
  }
  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={[styles.conteudo, respiro]}
      keyboardShouldPersistTaps="handled"
    >
      {cabecalho}
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, padding: espacos.lg },
  cabecalho: { marginBottom: espacos.lg },
});
