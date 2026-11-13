/**
 * SCREEN — MotoristaScreen (aba "Painel")
 * Painel do Motorista, no mesmo fluxo do site (motorista.html):
 *   sem trajeto → linha (seletor com busca) → horário → "Iniciar Trajeto"
 *   em trajeto  → GPS ligado, posição enviada a cada 5 s para o ônibus do horário,
 *                 mapa, ocorrência e "Encerrar Trajeto"
 *   sempre      → "Registro de atividade" e o status Online/Offline no cabeçalho
 *
 * Como usa as mesmas rotas do site, o passageiro vê o trajeto iniciado
 * e a posição tanto no site quanto no app, pelo horário escolhido.
 * O envio continua com a tela bloqueada: quem envia é o services/rastreio
 * (serviço em primeiro plano no Android, localização em segundo plano no iOS).
 * Esta tela só liga, desliga e mostra o que está acontecendo.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Platform, StyleSheet, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { Card } from '../components/molecules/Card';
import { EstadoCarga } from '../components/molecules/EstadoCarga';
import { Selo } from '../components/molecules/Selo';
import { Cabecalho } from '../components/organisms/Cabecalho';
import { MapaLinha } from '../components/organisms/MapaLinha';
import { TrajetoForm } from '../components/organisms/TrajetoForm';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { voltarAoLogin } from '../navigation/acoes';
import { listarHorarios, paradasDaLinha } from '../services/linhas';
import {
  encerrarTrajeto,
  iniciarTrajeto,
  linhasDoMotorista,
  trajetoSalvo,
} from '../services/motorista';
import { pedirPermissaoLocalizacao } from '../services/nativos';
import {
  abrirAjusteDeBateria,
  assinar,
  bateriaRestringe,
  iniciarRastreio,
  pararRastreio,
} from '../services/rastreio';
import { cores, espacamentos, raios } from '../theme';

const MAX_REGISTROS = 8;
const GPS_INICIAL = { ultima: null, envios: 0, ultimoEnvioOk: null, erro: null, falhaEnvio: null };
const TEXTO_SEGUNDO_PLANO = Platform.select({
  ios: 'Pode bloquear a tela ou usar outro app: enquanto o trajeto estiver ativo, a localização continua sendo enviada.',
  default:
    'Pode bloquear a tela ou usar outro app: enquanto a notificação “trajeto em andamento” estiver aparecendo, a localização continua sendo enviada.',
});

function agora() {
  return new Date().toTimeString().slice(0, 8);
}

function textoPrecisao(metros) {
  if (metros == null) return 'Aguardando...';
  const m = Math.round(metros);
  if (m <= 20) return `±${m} m — Ótimo`;
  if (m <= 50) return `±${m} m — Bom`;
  return `±${m} m — Ruim`;
}

function StatusConexao({ online, texto }) {
  return (
    <View style={styles.status}>
      <Label style={styles.statusTexto}>{texto}</Label>
      <View style={[styles.statusPonto, online ? styles.pontoOnline : styles.pontoOffline]} />
    </View>
  );
}

function Estatistica({ rotulo, valor }) {
  return (
    <View style={styles.estat}>
      <Label variante="secao" style={styles.estatRotulo}>
        {rotulo}
      </Label>
      <Label style={styles.estatValor} numberOfLines={1}>
        {valor}
      </Label>
    </View>
  );
}

export function MotoristaScreen({ navigation }) {
  const [trajeto, setTrajeto] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [linhas, setLinhas] = useState([]);
  const [carregandoLinhas, setCarregandoLinhas] = useState(false);
  const [linhaId, setLinhaId] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [paradas, setParadas] = useState([]);
  const [acao, setAcao] = useState(null);
  const [erro, setErro] = useState(null);
  const [gps, setGps] = useState(GPS_INICIAL);
  const [registro, setRegistro] = useState([]);
  const [bateria, setBateria] = useState(false);
  const montado = useRef(true);

  const registrar = useCallback((texto, tipo = 'info') => {
    setRegistro(atual =>
      [{ id: `${Date.now()}-${Math.random()}`, hora: agora(), texto, tipo }, ...atual].slice(0, MAX_REGISTROS),
    );
  }, []);

  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);

  const carregarLinhas = useCallback(async () => {
    setCarregandoLinhas(true);
    try {
      const lista = await linhasDoMotorista();
      if (!montado.current) return;
      setLinhas(lista);
      registrar(lista.length ? 'Rotas carregadas com sucesso' : 'Nenhuma rota cadastrada', lista.length ? 'sucesso' : 'erro');
    } catch (e) {
      if (e.status === 401) {
        voltarAoLogin(navigation);
        return;
      }
      registrar(e.message, 'erro');
      setErro(e.message);
    } finally {
      if (montado.current) setCarregandoLinhas(false);
    }
  }, [navigation, registrar]);

  // Ao abrir: retoma um trajeto que ficou aberto ou carrega as linhas
  useEffect(() => {
    trajetoSalvo()
      .then(salvo => {
        if (!montado.current) return;
        if (salvo) {
          setTrajeto(salvo);
          registrar(`Trajeto retomado: ${salvo.linha.nome} | ${salvo.horario.departure_time}`, 'sucesso');
        }
      })
      .finally(() => {
        if (montado.current) setCarregando(false);
      });
    carregarLinhas();
  }, [carregarLinhas, registrar]);

  // Horários da linha escolhida
  useEffect(() => {
    const linha = linhas.find(l => l.id === linhaId);
    if (!linha) {
      setHorarios([]);
      return undefined;
    }
    let ativo = true;
    setCarregandoHorarios(true);
    listarHorarios(linha.numero)
      .then(lista => ativo && setHorarios(lista || []))
      .catch(e => {
        if (!ativo) return;
        setHorarios([]);
        registrar(`Erro ao carregar horários: ${e.message}`, 'erro');
      })
      .finally(() => ativo && setCarregandoHorarios(false));
    return () => {
      ativo = false;
    };
  }, [linhaId, linhas, registrar]);

  // Paradas da linha do trajeto (para o mapa)
  const numeroDoTrajeto = trajeto?.linha?.numero;
  useEffect(() => {
    if (!numeroDoTrajeto) {
      setParadas([]);
      return;
    }
    paradasDaLinha(numeroDoTrajeto)
      .then(lista => montado.current && setParadas(lista))
      .catch(() => {});
  }, [numeroDoTrajeto]);

  // Estado do envio (o laço roda em services/rastreio, também com a tela bloqueada)
  useEffect(
    () =>
      assinar((atual, evento) => {
        if (!montado.current) return;
        setGps({
          ultima: atual.ultima,
          envios: atual.envios,
          ultimoEnvioOk: atual.ultimoEnvioOk,
          erro: atual.erroGps,
          falhaEnvio: atual.falhaEnvio,
        });
        if (evento) registrar(evento.texto, evento.tipo);
      }),
    [registrar],
  );

  // Trajeto aberto (inclusive o retomado ao abrir o app) → envio ligado
  useEffect(() => {
    if (!trajeto) return;
    iniciarRastreio(trajeto).catch(e => registrar(`Não foi possível ligar o envio: ${e.message}`, 'erro'));
  }, [trajeto, registrar]);

  // Economia de bateria do Android pode cortar o envio com a tela bloqueada
  useEffect(() => {
    let ativo = true;
    const conferir = () => bateriaRestringe().then(r => ativo && montado.current && setBateria(r));
    conferir();
    // ao voltar do ajuste do sistema, confere de novo
    const assinatura = AppState.addEventListener('change', estadoApp => {
      if (estadoApp === 'active') conferir();
    });
    return () => {
      ativo = false;
      assinatura.remove();
    };
  }, []);

  async function handleIniciar(horario) {
    const linha = linhas.find(l => l.id === linhaId);
    if (!linha) return;
    setAcao('iniciar');
    setErro(null);
    try {
      // sem GPS não adianta abrir o trajeto: os passageiros veriam "iniciado" sem posição
      if (!(await pedirPermissaoLocalizacao())) {
        throw new Error('Permita a localização do celular para iniciar o trajeto.');
      }
      const novo = await iniciarTrajeto({ linha, horario });
      setGps(GPS_INICIAL);
      setTrajeto(novo);
      registrar(`Trajeto iniciado: ${linha.nome} | ${horario.departure_time}`, 'sucesso');
    } catch (e) {
      setErro(e.message);
      registrar(e.message, 'erro');
    } finally {
      setAcao(null);
    }
  }

  function handleEncerrar() {
    Alert.alert('Encerrar trajeto', 'Os passageiros deixam de ver este ônibus no mapa.', [
      { text: 'Continuar', style: 'cancel' },
      {
        text: 'Encerrar',
        style: 'destructive',
        onPress: async () => {
          setAcao('encerrar');
          const envios = gps.envios;
          try {
            await pararRastreio();
            await encerrarTrajeto();
          } catch (e) {
            registrar(`Aviso: ${e.message}`, 'erro');
          } finally {
            setTrajeto(null);
            setGps(GPS_INICIAL);
            setAcao(null);
            registrar(`Trajeto encerrado. Total: ${envios} atualizações enviadas.`, 'info');
          }
        },
      },
    ]);
  }

  const transmitindo = Boolean(trajeto) && gps.ultimoEnvioOk && !gps.falhaEnvio;
  const cabecalho = {
    subtitulo: 'Painel do Motorista',
    direita: (
      <StatusConexao
        online={transmitindo}
        texto={!trajeto ? 'Offline' : gps.falhaEnvio ? 'Sem conexão' : transmitindo ? 'Transmitindo' : 'Aguardando GPS'}
      />
    ),
  };

  if (carregando) {
    return (
      <View style={styles.flex}>
        <Cabecalho {...cabecalho} />
        <EstadoCarga carregando />
      </View>
    );
  }

  const avisoBateria = bateria ? (
    <AvisoBox
      tipo="alerta"
      titulo="Libere o BusZapp na economia de bateria"
      mensagem="Assim o envio da localização não para quando a tela do celular bloquear.">
      <Button
        title="Abrir ajuste de bateria"
        icone="settings"
        variante="secundario"
        onPress={() => abrirAjusteDeBateria().catch(() => {})}
        style={styles.botaoAviso}
      />
    </AvisoBox>
  ) : null;

  const cartaoRegistro = (
    <Card>
      <Label variante="secao" style={styles.secao}>
        Registro de atividade
      </Label>
      {registro.map(item => (
        <View key={item.id} style={styles.registro}>
          <Label style={styles.registroHora}>{item.hora}</Label>
          <Label
            style={[
              styles.registroTexto,
              item.tipo === 'sucesso' && styles.textoSucesso,
              item.tipo === 'erro' && styles.textoErro,
            ]}>
            {item.texto}
          </Label>
        </View>
      ))}
      {!trajeto ? (
        <View style={styles.registro}>
          <Label style={styles.registroHora}>—</Label>
          <Label style={styles.registroTexto}>Aguardando início...</Label>
        </View>
      ) : null}
    </Card>
  );

  // keys diferentes: ao iniciar/encerrar, a rolagem volta para o topo
  if (!trajeto) {
    return (
      <ScreenTemplate key="escolher" cabecalho={cabecalho}>
        {avisoBateria}
        <TrajetoForm
          key={linhaId ?? 'sem-linha'}
          linhas={linhas}
          linhaId={linhaId}
          onMudarLinha={setLinhaId}
          horarios={horarios}
          carregandoLinhas={carregandoLinhas}
          carregandoHorarios={carregandoHorarios}
          onSubmit={handleIniciar}
          carregando={acao === 'iniciar'}
          erro={erro}
        />
        {cartaoRegistro}
      </ScreenTemplate>
    );
  }

  const pos = gps.ultima;
  const onibus = pos
    ? [{ id: 'eu', latitude: pos.latitude, longitude: pos.longitude, titulo: `Ônibus ${trajeto.horario.bus_number}`, destaque: true }]
    : [];

  return (
    <ScreenTemplate key="em-trajeto" cabecalho={cabecalho}>
      <Card>
        <View style={styles.tripTopo}>
          <View style={styles.flex}>
            <Label style={styles.tripNome} numberOfLines={2}>
              {trajeto.linha.nome}
            </Label>
            <Label style={styles.tripSub}>
              Linha {trajeto.linha.numero} · {trajeto.horario.departure_time} — Ônibus {trajeto.horario.bus_number}
            </Label>
          </View>
          <Selo icone="radio" texto="EM ROTA" tipo="verde" />
        </View>

        <View style={styles.grade}>
          <Estatistica rotulo="Latitude" valor={pos ? pos.latitude.toFixed(5) : '—'} />
          <Estatistica rotulo="Longitude" valor={pos ? pos.longitude.toFixed(5) : '—'} />
          <Estatistica rotulo="Velocidade" valor={pos?.velocidadeKmh != null ? `${pos.velocidadeKmh} km/h` : '—'} />
          <Estatistica rotulo="Envios" valor={String(gps.envios)} />
        </View>

        <View style={styles.precisao}>
          <Icone nome="radio" cor={cores.primariaEscura} tamanho={20} />
          <View>
            <Label variante="legenda">Precisão GPS</Label>
            <Label style={styles.precisaoValor}>{textoPrecisao(pos?.precisao)}</Label>
          </View>
        </View>
      </Card>

      <AvisoBox
        tipo="info"
        mensagem={TEXTO_SEGUNDO_PLANO}
      />
      {avisoBateria}
      {gps.erro ? <AvisoBox tipo="alerta" titulo="GPS" mensagem={gps.erro} /> : null}
      {gps.falhaEnvio ? (
        <AvisoBox
          tipo="info"
          mensagem="Sem conexão com o servidor. O app continua tentando a cada 5 segundos."
        />
      ) : null}

      <MapaLinha paradas={paradas} onibus={onibus} seguir={pos} altura={240} style={styles.mapa} />

      <View style={styles.botoes}>
        <Button
          title="Encerrar Trajeto"
          icone="square"
          variante="perigo"
          onPress={handleEncerrar}
          carregando={acao === 'encerrar'}
        />
        <Button
          title="Registrar ocorrência"
          icone="alert-triangle"
          variante="secundario"
          onPress={() => navigation.navigate('Ocorrencia', { trajeto })}
        />
      </View>

      {cartaoRegistro}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 8, marginRight: espacamentos.md },
  statusTexto: { color: 'rgba(255,255,255,0.92)', fontSize: 14 },
  statusPonto: { width: 10, height: 10, borderRadius: 5 },
  pontoOnline: { backgroundColor: '#4ADE80' },
  pontoOffline: { backgroundColor: '#6B7280' },
  secao: { marginBottom: espacamentos.md },
  tripTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: espacamentos.sm, marginBottom: espacamentos.md },
  tripNome: { fontSize: 19, fontWeight: '800', color: cores.texto },
  tripSub: { color: cores.textoSecundario, marginTop: 2 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: espacamentos.sm },
  estat: {
    width: '48.5%',
    backgroundColor: cores.fundo,
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    borderRadius: raios.md,
    padding: espacamentos.sm + 4,
  },
  estatRotulo: { fontSize: 10, letterSpacing: 1.2, marginBottom: 4 },
  estatValor: { fontSize: 17, fontWeight: '700', color: cores.texto },
  precisao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm + 4,
    marginTop: espacamentos.md,
    padding: espacamentos.sm + 4,
    borderRadius: raios.md,
    backgroundColor: cores.superficieAlt,
  },
  precisaoValor: { fontWeight: '700' },
  mapa: { marginBottom: espacamentos.md },
  botoes: { gap: espacamentos.sm, marginBottom: espacamentos.md },
  botaoAviso: { marginTop: espacamentos.sm, minHeight: 44 },
  registro: {
    flexDirection: 'row',
    gap: espacamentos.md,
    backgroundColor: '#FEF7DC',
    borderRadius: raios.md,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 4,
    marginBottom: espacamentos.sm,
  },
  registroHora: { color: cores.textoSecundario, fontSize: 13, fontVariant: ['tabular-nums'] },
  registroTexto: { flex: 1, fontSize: 14 },
  textoSucesso: { color: cores.sucesso },
  textoErro: { color: cores.perigo },
});
