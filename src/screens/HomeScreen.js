/**
 * SCREEN — HomeScreen (passageiro)
 * Igual ao dashboard do site: cartão de saldo em degradê com a saudação,
 * três atalhos (Cartão, Rastrear, Avaliar) e as últimas transações.
 * Melhorias do app: aviso de saldo baixo e atalho para a última linha acompanhada.
 */
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { AtalhoTile } from '../components/molecules/AtalhoTile';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { Card } from '../components/molecules/Card';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { corDaLinha } from '../components/molecules/LinhaItem';
import { SaldoCard } from '../components/molecules/SaldoCard';
import { TransacaoItem } from '../components/molecules/TransacaoItem';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { SALDO_BAIXO } from '../constants/cartao';
import { voltarAoLogin } from '../navigation/acoes';
import { obterSessao } from '../services/auth';
import { listarTransacoes, obterCartao } from '../services/cartao';
import { enviarAvisoLocal } from '../services/nativos';
import { obterPreferencias } from '../services/preferencias';
import { cores, espacamentos, raios, sombra } from '../theme';
import { dinheiro, hora } from '../utils/formato';

// aviso local de saldo baixo: no máximo uma vez por abertura do app
let avisoSaldoMostrado = false;

function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function HomeScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [cartao, setCartao] = useState(null);
  const [transacoes, setTransacoes] = useState([]);
  const [prefs, setPrefs] = useState(null);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [sessao, info, lista, preferencias] = await Promise.all([
        obterSessao(),
        obterCartao(),
        listarTransacoes().catch(() => []),
        obterPreferencias(),
      ]);
      setUsuario(sessao);
      setCartao(info);
      setTransacoes(lista || []);
      setPrefs(preferencias);
      setAtualizadoEm(new Date());

      const saldoBaixo = info?.card_number && info.card_balance < SALDO_BAIXO;
      if (saldoBaixo && preferencias.avisoSaldoBaixo && !avisoSaldoMostrado) {
        avisoSaldoMostrado = true;
        enviarAvisoLocal({
          titulo: 'Saldo baixo no BusZapp',
          corpo: `Seu saldo é ${dinheiro(info.card_balance)}. Recarregue para não ficar sem passagem.`,
        }).catch(() => {});
      }
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
  const saldo = cartao?.card_balance;
  const ultimas = transacoes.slice(0, 4);
  const ultimaLinha = prefs?.ultimaLinha;

  return (
    <ScreenTemplate
      onRefresh={() => {
        setRefreshing(true);
        carregar();
      }}
      refreshing={refreshing}>
      <ErrorMessage mensagem={erro} />

      <SaldoCard
        saldo={saldo}
        carregando={carregando}
        saudacao={saudacao()}
        nome={usuario?.nome}
        rodape={
          !temCartao && !carregando
            ? 'Nenhum cartão cadastrado'
            : atualizadoEm
              ? `Atualizado às ${hora(atualizadoEm.toISOString())}`
              : 'Atualizando...'
        }
        onPress={() => navigation.navigate('Cartao')}
      />

      {temCartao && saldo < SALDO_BAIXO ? (
        <AvisoBox
          tipo="alerta"
          titulo="Saldo baixo"
          mensagem={`Você tem ${dinheiro(saldo)}. Recarregue antes da próxima viagem.`}
        />
      ) : null}

      <View style={styles.atalhos}>
        <AtalhoTile icone="credit-card" rotulo="Cartão" onPress={() => navigation.navigate('Cartao')} />
        <AtalhoTile icone="map-pin" rotulo="Rastrear" onPress={() => navigation.navigate('Mapa')} />
        <AtalhoTile icone="star" rotulo="Avaliar" onPress={() => navigation.navigate('Avaliar')} />
      </View>

      {ultimaLinha ? (
        <Pressable
          onPress={() => navigation.navigate('Acompanhamento', { linha: ultimaLinha })}
          accessibilityRole="button"
          style={({ pressed }) => [styles.continuar, pressed && styles.pressionado]}>
          <View style={[styles.continuarNumero, { backgroundColor: corDaLinha(ultimaLinha.numero) }]}>
            <Label style={styles.continuarNumeroTexto}>{ultimaLinha.numero}</Label>
          </View>
          <View style={styles.flex}>
            <Label variante="legenda">Continuar acompanhando</Label>
            <Label style={styles.continuarNome} numberOfLines={1}>
              {ultimaLinha.nome}
            </Label>
          </View>
          <Icone nome="chevron-right" cor={cores.primaria} />
        </Pressable>
      ) : null}

      <Card
        titulo="Últimas transações"
        icone="list"
        acao={transacoes.length ? 'Ver todas' : undefined}
        onAcao={() => navigation.navigate('Extrato')}>
        {ultimas.length ? (
          ultimas.map((t, i) => <TransacaoItem key={t.id} transacao={t} ultima={i === ultimas.length - 1} />)
        ) : (
          <View style={styles.vazio}>
            <Icone nome="inbox" cor={cores.textoFraco} tamanho={32} />
            <Label variante="legenda" style={styles.vazioTexto}>
              {carregando ? 'Carregando...' : 'Nenhuma transação ainda. Faça sua primeira recarga!'}
            </Label>
          </View>
        )}
      </Card>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  atalhos: { flexDirection: 'row', gap: espacamentos.md, marginBottom: espacamentos.lg },
  continuar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
    ...sombra,
  },
  pressionado: { opacity: 0.85 },
  continuarNumero: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  continuarNumeroTexto: { color: '#FFFFFF', fontWeight: '800' },
  continuarNome: { fontWeight: '700', fontSize: 16 },
  flex: { flex: 1 },
  vazio: { alignItems: 'center', paddingVertical: espacamentos.md, gap: espacamentos.sm },
  vazioTexto: { textAlign: 'center' },
});
