/**
 * TEMPLATE — CenteredTemplate
 * Conteúdo centralizado na tela (login, cadastro, recuperar senha).
 */
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { cores, espacos } from '../../theme';

export default function CenteredTemplate({ children }) {
  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.centro} keyboardShouldPersistTaps="handled">
          <View style={styles.caixa}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  centro: { flexGrow: 1, justifyContent: 'center', padding: espacos.xl },
  caixa: { width: '100%', maxWidth: 420, alignSelf: 'center' },
});
