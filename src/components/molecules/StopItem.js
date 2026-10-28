/**
 * MOLECULE — StopItem
 * Linha da listagem de paradas, com indicação de ativa/inativa (CA05.5).
 */
import { Pressable, StyleSheet, View } from 'react-native';

import Badge from '../atoms/Badge';
import Label from '../atoms/Label';
import { cores, espacos, raios } from '../../theme';

export default function StopItem({ parada, onPress, onLongPress }) {
  const { nome, endereco, ativa } = parada;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={ativa ? 'Toque para editar, segure para desativar' : 'Toque para editar, segure para reativar'}
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.item, pressed && styles.pressionado]}
    >
      <View style={styles.topo}>
        <Label variante="subtitulo" style={styles.nome} numberOfLines={1}>
          {nome}
        </Label>
        <Badge texto={ativa ? 'ativa' : 'inativa'} tom={ativa ? 'sucesso' : 'neutro'} />
      </View>
      <Label variante="legenda" numberOfLines={1}>
        {endereco}
      </Label>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: espacos.md,
    marginBottom: espacos.sm,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  pressionado: { opacity: 0.7 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm, marginBottom: 2 },
  nome: { flex: 1 },
});
