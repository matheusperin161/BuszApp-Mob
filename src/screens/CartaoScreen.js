/**
 * SCREEN — CartaoScreen (aba "Recarga")
 * Igual à tela Recarga do site: cartão de transporte azul, os blocos
 * "Cadastrar Cartão" e "Recarregar" e a linha "Última Recarga".
 */
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { CartaoTransporte } from '../components/molecules/CartaoTransporte';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { IconeCaixa } from '../components/molecules/IconeCaixa';
import { OpcaoTile } from '../components/molecules/OpcaoTile';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { voltarAoLogin } from '../navigation/acoes';
import { listarTransacoes, obterCartao } from '../services/cartao';
import { cores, espacamentos, raios, sombra } from '../theme';
import { dataCurta, dinheiro } from '../utils/formato';

export function CartaoScreen({ navigation, route }) {
  const [cartao, setCartao] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);
  const aviso = route.params?.aviso ?? null;

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [info, lista] = await Promise.all([obterCartao(), listarTransacoes().catch(() => [])]);
      setCartao(info);
      setTransacoes(lista || []);
    } catch (e) {
      if (e.status === 401) {
        voltarAoLogin(navigation);
        return;
      }
      setErro(e.message);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const temCartao = Boolean(cartao?.card_number);
  const ultimaRecarga = transacoes.find(t => t.transaction_type === 'recharge');

  return (
    <ScreenTemplate
      onRefresh={() => {
        setRefreshing(true);
        carregar();
      }}
      refreshing={refreshing}>
      <ErrorMessage mensagem={erro} />
      <AvisoBox tipo="sucesso" mensagem={aviso} />

      <CartaoTransporte cartao={cartao} carregando={carregando} />

      <View style={styles.opcoes}>
        <OpcaoTile
          icone={temCartao ? 'check-circle' : 'plus-circle'}
          titulo={temCartao ? 'Cartão Cadastrado' : 'Cadastrar Cartão'}
          descricao={temCartao ? 'Seu cartão já está vinculado' : 'Registrar novo cartão'}
          fundo={temCartao ? cores.sucessoFundo : cores.roxoFundo}
          cor={temCartao ? cores.sucesso : cores.roxo}
          desabilitado={temCartao || carregando}
          onPress={() => navigation.navigate('CadastroCartao')}
        />
        <OpcaoTile
          icone="refresh-cw"
          titulo="Recarregar"
          descricao={temCartao ? 'Adicionar saldo ao cartão' : 'Cadastre o cartão primeiro'}
          fundo={cores.sucessoFundo}
          cor={cores.sucesso}
          desabilitado={!temCartao}
          onPress={() => navigation.navigate('Recarga')}
        />
      </View>

      <Pressable
        onPress={() => navigation.navigate('Extrato')}
        accessibilityRole="button"
        accessibilityLabel="Ver extrato"
        style={({ pressed }) => [styles.ultima, pressed && styles.pressionado]}>
        <IconeCaixa nome="clock" redondo tamanho={48} fundo="#FEF9C3" cor={cores.primariaEscura} />
        <View style={styles.flex}>
          <Label variante="legenda" style={styles.ultimaRotulo}>
            Última Recarga
          </Label>
          <Label style={styles.ultimaValor}>
            {ultimaRecarga
              ? `${dataCurta(ultimaRecarga.created_at)} — ${dinheiro(ultimaRecarga.amount)}`
              : 'Nenhuma recarga ainda'}
          </Label>
        </View>
        <Icone nome="chevron-right" cor={cores.textoFraco} />
      </Pressable>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  opcoes: { flexDirection: 'row', gap: espacamentos.md, marginBottom: espacamentos.lg },
  ultima: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    padding: espacamentos.md,
    ...sombra,
  },
  pressionado: { opacity: 0.85 },
  flex: { flex: 1 },
  ultimaRotulo: { fontSize: 14 },
  ultimaValor: { fontWeight: '700', fontSize: 17, marginTop: 1 },
});
