/**
 * SCREEN — RechargeScreen
 * Saldo, recarga e extrato do cartão.
 * Equivalente web: static/recarga.html
 *
 * Nesta entrega (RF11, RF12): cadastro do cartão (CA06.1/06.2), saldo em R$ de cada
 * cartão do passageiro (CA06.3/06.4) e bloqueio por perda (CA06.6), com notificação local.
 * Recarga e extrato entram com o CRUD 07.
 */
import { useCallback, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Label from '../components/atoms/Label';
import EstadoCarga from '../components/molecules/EstadoCarga';
import BalanceCard from '../components/organisms/BalanceCard';
import CardForm from '../components/organisms/CardForm';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { bloquearCartao, cadastrarCartao, meusCartoes } from '../services/cartao';
import { notificar } from '../services/notificacoes';
import { espacos } from '../theme';
import { cartaoOculto, moeda } from '../utils/formatacao';

export default function RechargeScreen() {
  const [cartoes, setCartoes] = useState(null);
  const [erro, setErro] = useState(null);
  const [bloqueando, setBloqueando] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setCartoes(await meusCartoes());
    } catch (e) {
      setErro(e.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const cadastrar = async (numero) => {
    const cartao = await cadastrarCartao(numero);
    await carregar();
    notificar('Cartão cadastrado', `Cartão ${cartaoOculto(cartao.numero)} pronto para uso. Saldo: ${moeda(cartao.saldo)}.`);
  };

  const confirmarBloqueio = (cartao) => {
    Alert.alert(
      'Bloquear cartão',
      `Bloquear o cartão ${cartaoOculto(cartao.numero)}? Ele deixa de aceitar recarga e pagamento de tarifa. ` +
        'O desbloqueio só pode ser feito pelo atendimento.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Bloquear',
          style: 'destructive',
          onPress: async () => {
            setBloqueando(cartao.id);
            try {
              await bloquearCartao(cartao.id);
              await carregar();
              notificar('Cartão bloqueado', `O cartão ${cartaoOculto(cartao.numero)} foi bloqueado. Se não foi você, procure o atendimento.`);
            } catch (e) {
              Alert.alert('Não foi possível bloquear', e.message);
            } finally {
              setBloqueando(null);
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenTemplate titulo="Meu cartão" subtitulo="Saldo dos seus cartões de transporte">
      {cartoes?.length ? (
        cartoes.map((cartao) => (
          <BalanceCard
            key={cartao.id}
            cartao={cartao}
            aoBloquear={() => confirmarBloqueio(cartao)}
            bloqueando={bloqueando === cartao.id}
          />
        ))
      ) : (
        <EstadoCarga
          carregando={!cartoes && !erro}
          erro={erro}
          vazio={Boolean(cartoes)}
          mensagemVazia="Você ainda não tem cartão cadastrado."
          aoTentarDeNovo={carregar}
        />
      )}
      <Label variante="subtitulo" style={styles.secao}>
        Cadastrar cartão
      </Label>
      <Label variante="legenda" style={styles.dica}>
        Informe o número impresso no cartão. Ele começa com saldo de {moeda(0)}.
      </Label>
      <CardForm aoCadastrar={cadastrar} />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  secao: { marginTop: espacos.lg },
  dica: { marginBottom: espacos.md },
});
