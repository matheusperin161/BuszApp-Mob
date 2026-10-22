/**
 * MOLECULE — LogoutButton
 * Botão "Sair" para o canto do cabeçalho.
 */
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAuth } from '../../contexts/AuthContext';
import { cores, espacos } from '../../theme';

export default function LogoutButton() {
  const { sair } = useAuth();
  return (
    <Pressable accessibilityRole="button" onPress={sair} hitSlop={8} style={styles.botao}>
      <Text style={styles.texto}>Sair</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: { paddingHorizontal: espacos.sm },
  texto: { color: cores.texto, fontWeight: '700', fontSize: 15 },
});
