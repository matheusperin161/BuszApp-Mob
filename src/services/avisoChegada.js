/**
 * SERVICE — aviso de chegada do ônibus.
 *
 * O passageiro escolhe a linha, a parada e com quantos minutos de antecedência
 * quer ser avisado. A cada 20 s o app consulta onde estão os ônibus da linha,
 * calcula quanto falta até a parada e, quando o primeiro estiver perto, mostra
 * a notificação "Seu ônibus chega em ~4 min".
 *
 * Com o app fechado:
 *   Android → serviço em primeiro plano (Notifee) com a notificação fixa
 *             "Aviso de chegada ativo"; o mesmo truque do GPS do motorista.
 *   iOS     → o laço roda enquanto o app está aberto ou recém-minimizado.
 * O aviso desliga sozinho depois de disparar ou em 2 horas.
 *
 * Fontes de posição (as mesmas do acompanhamento):
 *   /viagens/ativas?linha_id  → motorista usando o app
 *   /bus_location/:busId      → motorista usando o site (um por horário)
 */
import notifee, { AndroidForegroundServiceType, AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

import { listarHorarios, posicaoDoOnibus, viagensAtivas } from './linhas';
import { pedirPermissaoNotificacao } from './nativos';
import { obterLocal, removerLocal, salvarLocal } from './storage';

export const ID_NOTIFICACAO_AVISO = 'aviso-chegada';
const CANAL_SERVICO = 'aviso-servico';
const CANAL_ALERTA = 'aviso-chegada';
const CHAVE = 'aviso_chegada';
const INTERVALO_MS = 20000;
const DURACAO_MAXIMA_MS = 2 * 60 * 60 * 1000;
const VELOCIDADE_PADRAO_KMH = 22;
// valor do enum do Notifee (o mock do Jest não traz o enum)
const TIPO_DADOS = AndroidForegroundServiceType?.FOREGROUND_SERVICE_TYPE_DATA_SYNC ?? 1;

export const ANTECEDENCIAS = [
  { id: 3, rotulo: '3 min' },
  { id: 5, rotulo: '5 min' },
  { id: 10, rotulo: '10 min' },
];

/* ------------------------------------------------------------------ cálculo */

/** distância em metros entre dois pontos (haversine) */
export function distanciaMetros(a, b) {
  const R = 6371000;
  const rad = g => (g * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Minutos até o ônibus chegar à parada escolhida, seguindo as paradas em ordem
 * (mesma conta do backend). null se o ônibus já passou dela.
 *   onibus  = { latitude, longitude, velocidade?, proximaParada? (nome) }
 *   paradas = paradas da linha (qualquer ordem; usa .order)
 */
export function minutosAteParada(onibus, paradas, alvoNome) {
  const lista = [...paradas].sort((a, b) => a.order - b.order);
  const alvo = lista.findIndex(p => p.name === alvoNome);
  if (alvo < 0 || !lista.length) return null;
  // de onde o ônibus está: a próxima parada informada pelo servidor ou a mais próxima
  let inicio = onibus.proximaParada ? lista.findIndex(p => p.name === onibus.proximaParada) : -1;
  if (inicio < 0) {
    let menor = Infinity;
    lista.forEach((p, i) => {
      const d = distanciaMetros(onibus, p);
      if (d < menor) {
        menor = d;
        inicio = i;
      }
    });
  }
  if (alvo < inicio) return null;
  let metros = distanciaMetros(onibus, lista[inicio]);
  for (let i = inicio + 1; i <= alvo; i += 1) metros += distanciaMetros(lista[i - 1], lista[i]);
  const kmh = onibus.velocidade > 5 ? onibus.velocidade : VELOCIDADE_PADRAO_KMH;
  return (metros / 1000 / kmh) * 60;
}

/** ônibus da linha agora, no formato que minutosAteParada espera */
export async function onibusDaLinha({ rastreioId, horarios }) {
  const [viagens, legados] = await Promise.all([
    rastreioId ? viagensAtivas(rastreioId).catch(() => []) : [],
    Promise.all((horarios || []).map(h => posicaoDoOnibus(h.bus_id).catch(() => null))),
  ]);
  const lista = (viagens || [])
    .filter(v => v.ultima_posicao)
    .map(v => ({
      id: `v${v.id}`,
      rotulo: v.veiculo?.plate ?? 'Ônibus',
      latitude: v.ultima_posicao.latitude,
      longitude: v.ultima_posicao.longitude,
      velocidade: v.ultima_posicao.velocidade,
      proximaParada: v.proxima_parada?.name,
    }));
  legados.forEach((r, i) => {
    if (r?.found && r.trip_active && r.data) {
      lista.push({
        id: `h${horarios[i].id}`,
        rotulo: `Ônibus ${horarios[i].bus_number} (${horarios[i].departure_time})`,
        latitude: r.data.latitude,
        longitude: r.data.longitude,
        velocidade: r.data.speed,
        proximaParada: r.data.next_stop?.name,
      });
    }
  });
  return lista;
}

/** o ônibus que chega primeiro na parada: { onibus, minutos } ou null */
export function maisProximo(onibus, paradas, alvoNome) {
  let melhor = null;
  for (const o of onibus) {
    const minutos = minutosAteParada(o, paradas, alvoNome);
    if (minutos != null && (!melhor || minutos < melhor.minutos)) melhor = { onibus: o, minutos };
  }
  return melhor;
}

/* ------------------------------------------------------------------ estado */

const ESTADO_INICIAL = { ativo: false, alvo: null, ultimo: null, verificadoEm: null, disparou: false };
let estado = ESTADO_INICIAL;
const ouvintes = new Set();
let pararLaco = null;
let lacoAtual = null;

function mudar(parcial) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach(fn => fn(estado));
}

export function assinarAviso(fn) {
  ouvintes.add(fn);
  fn(estado);
  return () => ouvintes.delete(fn);
}

export async function avisoSalvo() {
  const salvo = await obterLocal(CHAVE).catch(() => null);
  if (!salvo) return null;
  if (Date.now() - salvo.criadoEm > DURACAO_MAXIMA_MS) {
    await removerLocal(CHAVE).catch(() => {});
    return null;
  }
  return salvo;
}

/* ------------------------------------------------------------------ laço */

async function alertar(alvo, resultado) {
  await notifee.createChannel({
    id: CANAL_ALERTA,
    name: 'Ônibus chegando',
    description: 'Avisa quando o ônibus está perto da sua parada.',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });
  const minutos = Math.max(1, Math.round(resultado.minutos));
  await notifee.displayNotification({
    title: `🚌 Linha ${alvo.linha.numero} chegando`,
    body: `${resultado.onibus.rotulo} chega em ~${minutos} min na parada ${alvo.parada.name}.`,
    android: {
      channelId: CANAL_ALERTA,
      importance: AndroidImportance.HIGH,
      pressAction: { id: 'default', launchActivity: 'default' },
      color: '#F59E0B',
    },
    ios: { sound: 'default' },
  });
}

async function atualizarNotificacaoFixa(alvo, texto) {
  if (Platform.OS !== 'android') return;
  await notifee.displayNotification({
    id: ID_NOTIFICACAO_AVISO,
    title: `Aviso de chegada · Linha ${alvo.linha.numero}`,
    body: texto,
    android: {
      channelId: CANAL_SERVICO,
      asForegroundService: true,
      foregroundServiceTypes: [TIPO_DADOS],
      ongoing: true,
      onlyAlertOnce: true,
      color: '#F59E0B',
      pressAction: { id: 'default', launchActivity: 'default' },
      actions: [{ title: 'Cancelar aviso', pressAction: { id: 'cancelar-aviso' } }],
    },
  }).catch(() => {});
}

function executarLaco(alvo) {
  return new Promise(resolve => {
    let encerrado = false;
    let ocupado = false;

    async function verificar() {
      if (ocupado || encerrado) return;
      ocupado = true;
      try {
        if (Date.now() - alvo.criadoEm > DURACAO_MAXIMA_MS) {
          await pararAviso();
          return;
        }
        const onibus = await onibusDaLinha(alvo.linha);
        const resultado = maisProximo(onibus, alvo.paradas, alvo.parada.name);
        mudar({ ultimo: resultado, verificadoEm: Date.now() });
        if (resultado && resultado.minutos <= alvo.minutos) {
          await alertar(alvo, resultado);
          mudar({ disparou: true });
          await pararAviso();
          return;
        }
        await atualizarNotificacaoFixa(
          alvo,
          resultado
            ? `Próximo ônibus a ~${Math.round(resultado.minutos)} min de ${alvo.parada.name}. Aviso com ${alvo.minutos} min.`
            : `Esperando um ônibus da linha sair em direção a ${alvo.parada.name}.`,
        );
      } finally {
        ocupado = false;
      }
    }

    const timer = setInterval(verificar, INTERVALO_MS);
    verificar();
    pararLaco = () => {
      encerrado = true;
      clearInterval(timer);
      pararLaco = null;
      lacoAtual = null;
      resolve();
    };
  });
}

/** um laço só: se o serviço chamar a tarefa de novo, devolve o que já está rodando */
function garantirLaco(alvo) {
  if (!lacoAtual) lacoAtual = executarLaco(alvo);
  return lacoAtual;
}

/** tarefa do serviço em primeiro plano (chamada pelo index.js) */
export async function tarefaDoAviso() {
  const alvo = estado.alvo ?? (await avisoSalvo());
  if (!alvo) {
    await notifee.stopForegroundService().catch(() => {});
    return;
  }
  mudar({ ativo: true, alvo });
  await garantirLaco(alvo);
}

/**
 * Liga o aviso.
 *   linha   = { numero, nome, rastreioId }
 *   parada  = { name, latitude, longitude, order }
 *   paradas = todas as paradas da linha
 */
export async function iniciarAviso({ linha, parada, paradas, minutos = 5 }) {
  if (!(await pedirPermissaoNotificacao().catch(() => false))) {
    throw new Error('Permita as notificações para receber o aviso de chegada.');
  }
  if (estado.ativo) await pararAviso();
  const horarios = await listarHorarios(linha.numero).catch(() => []);
  const alvo = {
    linha: { numero: String(linha.numero), nome: linha.nome, rastreioId: linha.rastreioId ?? null, horarios },
    parada: { name: parada.name, latitude: parada.latitude, longitude: parada.longitude, order: parada.order },
    paradas: paradas.map(p => ({ name: p.name, latitude: p.latitude, longitude: p.longitude, order: p.order })),
    minutos,
    criadoEm: Date.now(),
  };
  await salvarLocal(CHAVE, alvo);
  estado = { ...ESTADO_INICIAL, ativo: true, alvo };
  mudar({});
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CANAL_SERVICO,
      name: 'Aviso de chegada ativo',
      description: 'Aparece enquanto o BusZapp acompanha o ônibus para você.',
      importance: AndroidImportance.LOW,
    });
    // o Notifee chama tarefaDoAviso(), que roda o laço
    await atualizarNotificacaoFixa(alvo, `Vamos avisar quando o ônibus estiver a ${minutos} min de ${parada.name}.`);
  } else {
    garantirLaco(alvo);
  }
  return alvo;
}

export async function pararAviso() {
  pararLaco?.();
  await removerLocal(CHAVE).catch(() => {});
  if (Platform.OS === 'android') {
    await notifee.stopForegroundService().catch(() => {});
    await notifee.cancelNotification(ID_NOTIFICACAO_AVISO).catch(() => {});
  }
  const disparou = estado.disparou;
  estado = { ...ESTADO_INICIAL, disparou };
  mudar({});
}

/** botão "Cancelar aviso" da notificação fixa */
export function tratarAcaoDaNotificacao({ type, detail }, EventType) {
  if (type === EventType?.ACTION_PRESS && detail?.pressAction?.id === 'cancelar-aviso') {
    return pararAviso();
  }
  return null;
}
