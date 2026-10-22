/**
 * SCREEN — DriverScreen
 * Painel do motorista: iniciar/encerrar viagem.
 * Equivalente web: static/motorista.html
 *
 * CA08.1 linha/veículo/sentido (só ativos) · CA08.2 conflito vem do servidor (409)
 * CA08.3/08.7 envio periódico com fila offline (useEnvioPosicoes)
 * CA08.4 sem permissão de localização não inicia e leva às configurações
 * CA08.8 finalizar encerra o envio
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Linking, StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';

import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Label from '../components/atoms/Label';
import ErrorMessage from '../components/molecules/ErrorMessage';
import EstadoCarga from '../components/molecules/EstadoCarga';
import FormField from '../components/molecules/FormField';
import OptionChips from '../components/molecules/OptionChips';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { useAuth } from '../contexts/AuthContext';
import { useEnvioPosicoes } from '../hooks/useEnvioPosicoes';
import { INTERVALO_ENVIO_POSICAO_MS } from '../services/config';
import { iniciarViagem, opcoesViagem, viagemAtual } from '../services/motorista';
import { lerJSON, remover, salvarJSON } from '../services/storage';
import { cores, espacos, raios } from '../theme';
import { hora } from '../utils/formatacao';

const SENTIDOS = [
  { valor: 'ida', rotulo: 'Ida' },
  { valor: 'volta', rotulo: 'Volta' },
];
const SEGUNDOS = INTERVALO_ENVIO_POSICAO_MS / 1000;
// Cópia local da viagem: reabrindo o app sem internet, o envio continua (CA08.7)
const CHAVE_VIAGEM = 'viagem_atual';

const guardarViagem = (viagem) => (viagem ? salvarJSON(CHAVE_VIAGEM, viagem) : remover(CHAVE_VIAGEM));

/** Confere GPS ligado + permissão. Retorna null se ok, ou o motivo do bloqueio. */
async function verificarLocalizacao({ pedir }) {
  if (!(await Location.hasServicesEnabledAsync())) {
    return 'O GPS do aparelho está desligado. Ative a localização para iniciar a viagem.';
  }
  let { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
  if (status !== 'granted' && canAskAgain && pedir) {
    ({ status } = await Location.requestForegroundPermissionsAsync());
  }
  if (status !== 'granted') {
    return (
      'Para iniciar a viagem, o BusZapp precisa da sua localização. Ela é enviada a cada ' +
      `${SEGUNDOS} segundos, enquanto o app estiver aberto, para os passageiros acompanharem ` +
      'o ônibus no mapa. Permita o acesso à localização nas configurações do aparelho.'
    );
  }
  return null;
}

function AvisoLocalizacao({ motivo }) {
  return (
    <View style={styles.aviso} accessibilityRole="alert">
      <Label variante="subtitulo" style={styles.avisoTitulo}>
        Localização necessária
      </Label>
      <Label style={styles.avisoTexto}>{motivo}</Label>
      <Button titulo="Abrir configurações" variante="secundario" onPress={() => Linking.openSettings()} />
    </View>
  );
}

export default function DriverScreen() {
  const { sessao } = useAuth();
  const [carregando, setCarregando] = useState(true);
  const [erroCarga, setErroCarga] = useState(null);
  const [opcoes, setOpcoes] = useState(null);
  const [viagem, setViagem] = useState(null);
  const [escolha, setEscolha] = useState({ linhaId: null, veiculoId: null, sentido: null });
  const [bloqueio, setBloqueio] = useState(null);
  const [erroAcao, setErroAcao] = useState(null);
  const [processando, setProcessando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErroCarga(null);
    try {
      const [atual, disponiveis] = await Promise.all([viagemAtual(), opcoesViagem()]);
      setViagem(atual);
      setOpcoes(disponiveis);
      await guardarViagem(atual);
    } catch (erro) {
      const emCache = erro.semConexao ? await lerJSON(CHAVE_VIAGEM) : null;
      if (emCache) setViagem(emCache);
      else setErroCarga(erro.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const envio = useEnvioPosicoes(viagem?.id, {
    aoEncerrarNoServidor: () => {
      setViagem(null);
      guardarViagem(null);
      setErroAcao('Esta viagem foi encerrada pelo administrador.');
      carregar();
    },
  });

  // Voltando das configurações: reavalia a permissão sozinho
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', async (estado) => {
      if (estado === 'active' && bloqueio) setBloqueio(await verificarLocalizacao({ pedir: false }));
    });
    return () => assinatura.remove();
  }, [bloqueio]);

  const iniciar = async () => {
    setErroAcao(null);
    setProcessando(true);
    try {
      const motivo = await verificarLocalizacao({ pedir: true });
      setBloqueio(motivo);
      if (motivo) return;
      const nova = await iniciarViagem(escolha);
      setViagem(nova);
      await guardarViagem(nova);
    } catch (erro) {
      setErroAcao(erro.message);
      if (erro.status === 409 || erro.status === 422) carregar();
    } finally {
      setProcessando(false);
    }
  };

  const finalizar = () => {
    Alert.alert('Finalizar viagem', 'Encerrar a viagem e parar de enviar a localização?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Finalizar',
        style: 'destructive',
        onPress: async () => {
          setErroAcao(null);
          setProcessando(true);
          try {
            await envio.finalizar();
            await guardarViagem(null);
            setViagem(null);
            setEscolha({ linhaId: null, veiculoId: null, sentido: null });
            carregar();
          } catch (erro) {
            setErroAcao(erro.message);
          } finally {
            setProcessando(false);
          }
        },
      },
    ]);
  };

  const nome = sessao?.driver?.nome ?? sessao?.user?.username;

  if (carregando || erroCarga || (!viagem && !opcoes)) {
    return (
      <ScreenTemplate titulo={`Olá, ${nome}`}>
        <EstadoCarga carregando={carregando} erro={erroCarga} aoTentarDeNovo={carregar} />
      </ScreenTemplate>
    );
  }

  if (viagem) {
    const statusEnvio = !envio.online
      ? { tom: 'aviso', texto: `Sem conexão — ${envio.pendentes} posição(ões) guardada(s)` }
      : envio.transmitindo
        ? { tom: 'sucesso', texto: `Transmitindo a cada ${SEGUNDOS} s` }
        : { tom: 'neutro', texto: 'Pausado com o app em segundo plano' };
    return (
      <ScreenTemplate titulo="Viagem em andamento" subtitulo={`Iniciada às ${hora(viagem.iniciada_em)}`}>
        <View style={styles.card}>
          <Label variante="subtitulo">
            Linha {viagem.linha?.numero} — {viagem.linha?.nome}
          </Label>
          <Label variante="legenda">
            Veículo {viagem.veiculo?.plate} · sentido {viagem.sentido}
          </Label>
          <Badge texto={statusEnvio.texto} tom={statusEnvio.tom} style={styles.badge} />
          <Label variante="legenda">
            Último envio:{' '}
            {envio.ultimoEnvio
              ? envio.ultimoEnvio.toLocaleTimeString('pt-BR')
              : envio.pendentes
                ? 'aguardando conexão'
                : 'aguardando GPS…'}
          </Label>
        </View>
        {envio.erroGps ? (
          <AvisoLocalizacao motivo="Não foi possível ler o GPS. Verifique se a localização está ligada e permitida para o BusZapp." />
        ) : null}
        <ErrorMessage mensagem={erroAcao} />
        <Button titulo="Finalizar viagem" variante="perigo" onPress={finalizar} carregando={processando} />
      </ScreenTemplate>
    );
  }

  const linhas = opcoes.linhas.map((l) => ({ valor: l.id, rotulo: `${l.numero} — ${l.nome}` }));
  const veiculos = opcoes.veiculos.map((v) => ({
    valor: v.id,
    rotulo: v.em_uso ? `${v.plate} (em uso)` : `${v.plate} · ${v.model}`,
    desabilitado: v.em_uso,
  }));
  const completo = escolha.linhaId && escolha.veiculoId && escolha.sentido;
  const escolher = (campo) => (valor) => setEscolha((e) => ({ ...e, [campo]: valor }));

  return (
    <ScreenTemplate titulo={`Olá, ${nome}`} subtitulo="Escolha a linha, o veículo e o sentido para iniciar">
      <FormField rotulo="Linha" obrigatorio>
        {linhas.length ? (
          <OptionChips opcoes={linhas} valor={escolha.linhaId} aoMudar={escolher('linhaId')} />
        ) : (
          <Label variante="legenda">Nenhuma linha ativa.</Label>
        )}
      </FormField>
      <FormField rotulo="Veículo" obrigatorio>
        {veiculos.length ? (
          <OptionChips opcoes={veiculos} valor={escolha.veiculoId} aoMudar={escolher('veiculoId')} />
        ) : (
          <Label variante="legenda">Nenhum veículo ativo.</Label>
        )}
      </FormField>
      <FormField rotulo="Sentido" obrigatorio>
        <OptionChips opcoes={SENTIDOS} valor={escolha.sentido} aoMudar={escolher('sentido')} />
      </FormField>
      {bloqueio ? <AvisoLocalizacao motivo={bloqueio} /> : null}
      <ErrorMessage mensagem={erroAcao} />
      <Button titulo="Iniciar viagem" onPress={iniciar} desabilitado={!completo} carregando={processando} />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: espacos.lg,
    marginBottom: espacos.lg,
    borderRadius: raios.lg,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    gap: espacos.xs,
  },
  badge: { marginVertical: espacos.sm },
  aviso: {
    padding: espacos.lg,
    marginBottom: espacos.lg,
    borderRadius: raios.lg,
    backgroundColor: cores.avisoFundo,
    gap: espacos.sm,
  },
  avisoTitulo: { color: cores.avisoTexto },
  avisoTexto: { color: cores.avisoTexto },
});
