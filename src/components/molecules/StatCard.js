/**
 * MOLECULE — StatCard
 * Número grande com ícone e rótulo (cartões de resumo do painel do admin no site).
 */
import { Pressable, StyleSheet } from 'react-native';

import { Label } from '../atoms/Label';
import { IconeCaixa } from './IconeCaixa';
import { cores, espacamentos, raios, sombra } from '../../theme';

export function StatCard({ icone, valor, rotulo, fundo, cor, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${rotulo}: ${valor}`}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressionado]}>
      <IconeCaixa nome={icone} tamanho={40} fundo={fundo} cor={cor} />
      <Label style={styles.valor} numberOfLines={1} adjustsFontSizeToFit>
        {valor}
      </Label>
      <Label variante="legenda" numberOfLines={1}>
        {rotulo}
      </Label>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48.3%',
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    padding: espacamentos.md,
    gap: 4,
    ...sombra,
  },
  pressionado: { opacity: 0.85 },
  valor: { fontSize: 26, fontWeight: '800', color: cores.texto, marginTop: espacamentos.sm },
});
