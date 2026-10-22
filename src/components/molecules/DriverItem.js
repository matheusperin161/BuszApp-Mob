/**
 * MOLECULE — DriverItem
 * Linha da listagem de motoristas, com alerta visual de CNH vencida (CA02.5).
 */
import { Pressable, StyleSheet, View } from 'react-native';

import Badge from '../atoms/Badge';
import Label from '../atoms/Label';
import { cores, espacos, raios } from '../../theme';
import { isoParaDataBR, mascaraCpf } from '../../utils/formatacao';

const TOM_STATUS = { ativo: 'sucesso', afastado: 'aviso', inativo: 'neutro' };

export default function DriverItem({ motorista, onPress, onLongPress }) {
  const { nome, cpf, cnh_numero, cnh_categoria, cnh_validade, cnh_vencida, status } = motorista;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Toque para editar, segure para excluir"
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [styles.item, cnh_vencida && styles.itemVencido, pressed && styles.pressionado]}
    >
      <View style={styles.topo}>
        <Label variante="subtitulo" style={styles.nome} numberOfLines={1}>
          {nome}
        </Label>
        <Badge texto={status} tom={TOM_STATUS[status]} />
      </View>
      <Label variante="legenda">CPF {mascaraCpf(cpf)}</Label>
      <Label variante="legenda">
        CNH {cnh_numero}
        {cnh_categoria ? ` · cat. ${cnh_categoria}` : ''}
        {cnh_validade ? ` · validade ${isoParaDataBR(cnh_validade)}` : ''}
      </Label>
      {cnh_vencida ? <Badge texto="⚠ CNH vencida" tom="perigo" style={styles.alerta} /> : null}
      {!cnh_validade ? <Badge texto="⚠ Validade da CNH não informada" tom="aviso" style={styles.alerta} /> : null}
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
  itemVencido: { borderColor: cores.perigo, backgroundColor: '#fff7f7' },
  pressionado: { opacity: 0.7 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm, marginBottom: 2 },
  nome: { flex: 1 },
  alerta: { marginTop: espacos.xs },
});
