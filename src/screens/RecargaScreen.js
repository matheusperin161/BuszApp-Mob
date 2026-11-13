/**
 * SCREEN — RecargaScreen
 * Escolhe valor e forma de pagamento; mostra o comprovante ao final.
 * Obs.: o backend ainda aprova a recarga na hora (pagamento simulado).
 */
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { Card } from '../components/molecules/Card';
import { CartaoTransporte } from '../components/molecules/CartaoTransporte';
import { IconeCaixa } from '../components/molecules/IconeCaixa';
import { InfoLinha } from '../components/molecules/InfoLinha';
import { RecargaForm } from '../components/organisms/RecargaForm';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { irParaAba } from '../navigation/acoes';
import { obterCartao, recarregar } from '../services/cartao';
import { cores, espacamentos } from '../theme';
import { dataHora, dinheiro } from '../utils/formato';

const CABECALHO = { titulo: 'Recarregar', subtitulo: 'Adicionar saldo ao cartão', voltar: true };

export function RecargaScreen({ navigation }) {
  const [cartao, setCartao] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [comprovante, setComprovante] = useState(null);

  useFocusEffect(
    useCallback(() => {
      obterCartao()
        .then(setCartao)
        .catch(e => setErro(e.message));
    }, []),
  );

  async function handleRecarga({ valor, forma }) {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await recarregar(valor, forma);
      setComprovante(resposta);
      setCartao(atual => ({ ...atual, card_balance: resposta.new_balance }));
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  if (comprovante) {
    const { transaction: t, payment_info: pagamento } = comprovante;
    return (
      <ScreenTemplate
        cabecalho={{ ...CABECALHO, subtitulo: 'Comprovante' }}
        rodape={
          <View style={styles.botoes}>
            <Button title="Voltar ao início" icone="home" onPress={() => irParaAba(navigation, 'Home')} />
            <Button title="Fazer outra recarga" variante="secundario" onPress={() => setComprovante(null)} />
          </View>
        }>
        <Card style={styles.sucesso}>
          <IconeCaixa nome="check-circle" redondo tamanho={72} fundo={cores.sucessoFundo} cor={cores.sucesso} />
          <Label variante="titulo" style={styles.sucessoTitulo}>
            Recarga aprovada!
          </Label>
          <Label style={styles.sucessoTexto}>Novo saldo: {dinheiro(comprovante.new_balance)}</Label>
        </Card>
        <Card titulo="Comprovante" icone="list">
          <InfoLinha rotulo="Valor" valor={dinheiro(t?.amount)} />
          <InfoLinha rotulo="Pagamento" valor={pagamento?.method} />
          <InfoLinha rotulo="Situação" valor={pagamento?.status} />
          <InfoLinha rotulo="Código" valor={pagamento?.transaction_id} />
          <InfoLinha rotulo="Data" valor={dataHora(t?.created_at)} ultima />
        </Card>
      </ScreenTemplate>
    );
  }

  const semCartao = cartao && !cartao.card_number;

  return (
    <ScreenTemplate cabecalho={CABECALHO}>
      <CartaoTransporte cartao={cartao} carregando={!cartao} />
      {semCartao ? (
        <AvisoBox
          tipo="alerta"
          titulo="Cadastre um cartão primeiro"
          mensagem="A recarga vai para o seu cartão de transporte.">
          <Button
            title="Cadastrar cartão"
            icone="plus-circle"
            variante="secundario"
            onPress={() => navigation.navigate('CadastroCartao')}
            style={styles.botaoAviso}
          />
        </AvisoBox>
      ) : (
        <Card titulo="Nova recarga" icone="dollar-sign">
          <RecargaForm onSubmit={handleRecarga} carregando={carregando} erro={erro} />
        </Card>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  sucesso: { alignItems: 'center', paddingVertical: espacamentos.xl },
  sucessoTitulo: { marginTop: espacamentos.md },
  sucessoTexto: { color: cores.textoSecundario, marginTop: 4, fontSize: 16 },
  botoes: { gap: espacamentos.sm },
  botaoAviso: { marginTop: espacamentos.sm, minHeight: 44 },
});
