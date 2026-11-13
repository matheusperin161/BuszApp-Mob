/**
 * MOLECULE — TransacaoItem
 * Uma linha do extrato, como em "Últimas transações" do site:
 * seta verde (recarga) ou vermelha (passagem), descrição, data e valor.
 * memo: a lista não redesenha itens que não mudaram.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { cores, espacamentos } from '../../theme';
import { dataHora, dinheiro } from '../../utils/formato';

export const TransacaoItem = memo(function TransacaoItem({ transacao, ultima = false }) {
  const entrada = transacao.transaction_type === 'recharge';
  const cor = entrada ? cores.sucesso : cores.perigo;

  return (
    <View style={[styles.item, !ultima && styles.divisor]}>
      <Icone nome={entrada ? 'arrow-up-circle' : 'arrow-down-circle'} cor={cor} tamanho={24} />
      <View style={styles.textos}>
        <Label numberOfLines={2}>{transacao.description || (entrada ? 'Recarga' : 'Passagem')}</Label>
        <Label variante="legenda">{dataHora(transacao.created_at)}</Label>
      </View>
      <Label style={[styles.valor, { color: cor }]}>
        {entrada ? '+' : '−'}
        {dinheiro(Math.abs(transacao.amount))}
      </Label>
    </View>
  );
});

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: espacamentos.sm + 4,
    gap: espacamentos.md,
  },
  divisor: { borderBottomWidth: 1, borderBottomColor: cores.cinzaClaro },
  textos: { flex: 1 },
  valor: { fontWeight: '700', fontSize: 16 },
});
