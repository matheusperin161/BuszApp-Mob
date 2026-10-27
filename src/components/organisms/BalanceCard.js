/**
 * ORGANISM — BalanceCard
 * Cartão com saldo e dados do cartão de transporte.
 *
 * Saldo em R$ (CA06.4) e só para leitura (CA06.5). O número aparece oculto (só os 4 últimos).
 * Sem aoBloquear, fica somente leitura — é assim que o admin vê (CA06.7).
 */
import { StyleSheet, View } from 'react-native';

import Badge from '../atoms/Badge';
import Button from '../atoms/Button';
import Label from '../atoms/Label';
import { cores, espacos, raios } from '../../theme';
import { cartaoOculto, hora, moeda, utcParaDate } from '../../utils/formatacao';

const TOM_STATUS = { ativo: 'sucesso', bloqueado: 'perigo', cancelado: 'neutro' };

export default function BalanceCard({ cartao, aoBloquear, bloqueando = false, mostrarDono = false }) {
  const { numero, saldo, status, usuario_id, criado_em } = cartao;
  const ativo = status === 'ativo';
  return (
    <View style={[styles.cartao, !ativo && styles.inativo]}>
      <View style={styles.topo}>
        <Label variante="legenda" style={styles.claro}>
          Cartão {cartaoOculto(numero)}
        </Label>
        <Badge texto={status} tom={TOM_STATUS[status]} />
      </View>
      <Label variante="legenda" style={styles.claro}>
        Saldo disponível
      </Label>
      <Label style={styles.saldo} accessibilityLabel={`Saldo ${moeda(saldo)}`}>
        {moeda(saldo)}
      </Label>
      <Label variante="legenda" style={styles.claro}>
        {mostrarDono ? `Usuário #${usuario_id} · ` : ''}
        Cadastrado em {utcParaDate(criado_em)?.toLocaleDateString('pt-BR')} às {hora(criado_em)}
      </Label>
      {!ativo ? (
        <Label variante="legenda" style={styles.aviso}>
          Recarga e uso estão bloqueados neste cartão.
        </Label>
      ) : null}
      {aoBloquear && ativo ? (
        <Button
          titulo="Bloquear (perda ou roubo)"
          variante="secundario"
          onPress={aoBloquear}
          carregando={bloqueando}
          style={styles.botao}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    padding: espacos.lg,
    marginBottom: espacos.md,
    borderRadius: raios.lg,
    backgroundColor: cores.primaria,
    gap: espacos.xs,
  },
  inativo: { backgroundColor: '#9ca3af' },
  topo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  claro: { color: cores.texto },
  saldo: { fontSize: 32, fontWeight: '800', color: cores.texto },
  aviso: { color: cores.perigoTexto, fontWeight: '700' },
  botao: { marginTop: espacos.sm },
});
