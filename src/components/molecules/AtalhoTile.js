/**
 * MOLECULE — AtalhoTile
 * Quadradinho branco da Home do site: ícone em degradê + rótulo âmbar escuro.
 */
import { Pressable, StyleSheet } from 'react-native';

import { Label } from '../atoms/Label';
import { IconeCaixa } from './IconeCaixa';
import { cores, espacamentos, raios, sombra } from '../../theme';

export function AtalhoTile({ icone, rotulo, onPress, badge }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [styles.tile, pressed && styles.pressionado]}>
      <IconeCaixa nome={icone} degrade tamanho={50} />
      <Label style={styles.rotulo} numberOfLines={1}>
        {rotulo}
      </Label>
      {badge ? (
        <Label style={styles.badge} numberOfLines={1}>
          {badge}
        </Label>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    paddingVertical: espacamentos.md,
    paddingHorizontal: espacamentos.xs,
    gap: espacamentos.sm + 2,
    ...sombra,
  },
  pressionado: { transform: [{ scale: 0.97 }] },
  rotulo: { color: cores.rotuloAtalho, fontWeight: '700', fontSize: 15 },
  badge: { color: cores.textoSecundario, fontSize: 11, marginTop: -6 },
});
