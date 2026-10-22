/**
 * MOLECULE — MenuButton
 * Botão grande com ícone, título e descrição.
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Label from '../atoms/Label';
import { cores, espacos, raios } from '../../theme';

export default function MenuButton({ icone, titulo, descricao, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}
    >
      <Text style={styles.icone}>{icone}</Text>
      <View style={styles.textos}>
        <Label variante="subtitulo">{titulo}</Label>
        {descricao ? <Label variante="legenda">{descricao}</Label> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    padding: espacos.lg,
    marginBottom: espacos.md,
    borderRadius: raios.lg,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  pressionado: { backgroundColor: cores.avisoFundo },
  icone: { fontSize: 28, width: 40, textAlign: 'center' },
  textos: { flex: 1 },
});
