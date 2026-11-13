/**
 * MOLECULE — OpcaoTile
 * Bloco grande com ícone colorido, título e descrição
 * ("Cadastrar Cartão" / "Recarregar" da tela Recarga do site).
 */
import { Pressable, StyleSheet } from 'react-native';

import { Label } from '../atoms/Label';
import { IconeCaixa } from './IconeCaixa';
import { cores, espacamentos, raios, sombra } from '../../theme';

export function OpcaoTile({ icone, titulo, descricao, fundo, cor, onPress, desabilitado = false }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityState={{ disabled: desabilitado }}
      style={({ pressed }) => [styles.tile, pressed && styles.pressionado, desabilitado && styles.inativo]}>
      <IconeCaixa nome={icone} tamanho={60} fundo={fundo} cor={cor} />
      <Label style={styles.titulo}>{titulo}</Label>
      {descricao ? (
        <Label variante="legenda" style={styles.descricao}>
          {descricao}
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
    paddingVertical: espacamentos.lg,
    paddingHorizontal: espacamentos.md,
    gap: espacamentos.sm,
    ...sombra,
  },
  pressionado: { transform: [{ scale: 0.98 }] },
  inativo: { opacity: 0.55 },
  titulo: { fontSize: 17, fontWeight: '800', color: cores.texto, textAlign: 'center', marginTop: 4 },
  descricao: { textAlign: 'center', fontSize: 13 },
});
