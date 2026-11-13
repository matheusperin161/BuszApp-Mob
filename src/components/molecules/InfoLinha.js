/**
 * MOLECULE — InfoLinha
 * Par rótulo / valor em uma linha (comprovante, dados da viagem, configurações).
 */
import { StyleSheet, View } from 'react-native';

import { Label } from '../atoms/Label';
import { cores, espacamentos } from '../../theme';

export function InfoLinha({ rotulo, valor, ultima = false }) {
  return (
    <View style={[styles.linha, !ultima && styles.divisor]}>
      <Label variante="legenda" style={styles.rotulo}>
        {rotulo}
      </Label>
      <Label style={styles.valor} numberOfLines={2}>
        {valor ?? '—'}
      </Label>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: espacamentos.md,
    paddingVertical: espacamentos.sm + 4,
  },
  divisor: { borderBottomWidth: 1, borderBottomColor: cores.cinzaClaro },
  rotulo: { fontSize: 14 },
  valor: { flexShrink: 1, textAlign: 'right', fontWeight: '600', color: cores.texto },
});
