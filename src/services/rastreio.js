/**
 * SERVICE — rastreio do motorista, também com a tela bloqueada.
 *
 * Por que existe: o Android e o iOS congelam o JavaScript quando o app sai da tela.
 *   Android → um "serviço em primeiro plano" (Notifee) com a notificação fixa
 *             "BusZapp — trajeto em andamento". Enquanto ela está lá, o sistema
 *             mantém o GPS e o envio vivos. O tipo "location" fica no AndroidManifest.
 *   iOS     → modo de localização em segundo plano (Info.plist) + permissão "Sempre";
 *             a cada posição nova o iOS acorda o app e ela é enviada.
 *
 * A tela (MotoristaScreen) não envia nada: só liga/desliga e escuta o estado por assinar().
 * O laço de envio roda aqui, no mesmo JavaScript do app — dentro do serviço no Android.
 */
import notifee, { AndroidForegroundServiceType, AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

import { INTERVALO_GPS_MOTORISTA_MS } from './config';
import { enviarLocalizacao, trajetoSalvo } from './motorista';
import { observarPosicao, pedirPermissaoLocalizacao, pedirPermissaoNotificacao } from './nativos';

const CANAL = 'trajeto';
const ID_NOTIFICACAO = 'trajeto-ativo';
// valor do enum do Notifee (o mock do Jest não traz o enum)
const TIPO_LOCALIZACAO = AndroidForegroundServiceType?.FOREGROUND_SERVICE_TYPE_LOCATION ?? 8;

const ESTADO_INICIAL = {
  ativo: false,
  trajeto: null,
  ultima: null,
  envios: 0,
  ultimoEnvioOk: null,
  erroGps: null,
  falhaEnvio: null,
};

let estado = ESTADO_INICIAL;
const ouvintes = new Set();
let pararLaco = null;

function mudar(parcial, evento) {
  estado = { ...estado, ...parcial };
  ouvintes.forEach(fn => fn(estado, evento));
}

/** a tela escuta o estado (e os eventos para o "Registro de atividade") */
export function assinar(fn) {
  ouvintes.add(fn);
  fn(estado, null);
  return () => ouvintes.delete(fn);
}

export function estadoAtual() {
  return estado;
}

/** laço: GPS ligado + envio a cada 5 s; termina quando pararLaco() é chamado */
function executarLaco(trajeto) {
  return new Promise(resolve => {
    let enviando = false;
    let falhou = false;
    let pararGps = null;
    let encerrado = false;

    async function enviar() {
      const posicao = estado.ultima;
      if (!posicao || enviando || encerrado) return;
      enviando = true;
      try {
        await enviarLocalizacao(trajeto, posicao);
        const envios = estado.envios + 1;
        let evento = null;
        if (falhou) evento = { tipo: 'sucesso', texto: 'Conexão restabelecida — enviando de novo' };
        else if (envios === 1) evento = { tipo: 'sucesso', texto: 'GPS conectado — passageiros já veem o ônibus' };
        else if (envios % 20 === 0) evento = { tipo: 'sucesso', texto: `${envios} atualizações enviadas` };
        falhou = false;
        mudar({ envios, ultimoEnvioOk: Date.now(), falhaEnvio: null }, evento);
      } catch (e) {
        const texto =
          e.status === 401
            ? 'Sessão expirada. Entre de novo.'
            : e.causa === 'rede' || e.causa === 'timeout'
              ? 'Sem conexão com o servidor'
              : e.message;
        mudar({ falhaEnvio: texto }, falhou ? null : { tipo: 'erro', texto });
        falhou = true;
      } finally {
        enviando = false;
      }
    }

    const timer = setInterval(enviar, INTERVALO_GPS_MOTORISTA_MS);

    pararLaco = () => {
      encerrado = true;
      clearInterval(timer);
      pararGps?.();
      pararLaco = null;
      resolve();
    };

    observarPosicao(
      posicao => {
        const primeira = !estado.ultima;
        const atrasado = estado.ultimoEnvioOk && Date.now() - estado.ultimoEnvioOk > INTERVALO_GPS_MOTORISTA_MS;
        mudar({ ultima: posicao, erroGps: null });
        // posição nova também dispara o envio: no iOS em segundo plano o timer pode dormir
        if (primeira || atrasado) enviar();
      },
      e => mudar({ erroGps: e.message }, { tipo: 'erro', texto: `GPS: ${e.message}` }),
      { intervaloMs: INTERVALO_GPS_MOTORISTA_MS, segundoPlano: true },
    )
      .then(fn => {
        if (encerrado) fn();
        else pararGps = fn;
      })
      .catch(e => mudar({ erroGps: e.message }, { tipo: 'erro', texto: e.message }));
  });
}

/**
 * Tarefa do serviço em primeiro plano do Android.
 * Registrada uma vez no index.js (fora dos componentes), como o Notifee pede.
 */
export function tarefaDoServico() {
  return (async () => {
    const trajeto = estado.trajeto ?? (await trajetoSalvo());
    if (!trajeto) {
      await notifee.stopForegroundService();
      return;
    }
    mudar({ ativo: true, trajeto });
    await executarLaco(trajeto);
  })();
}

async function mostrarNotificacaoDoServico(trajeto) {
  await pedirPermissaoNotificacao().catch(() => false);
  await notifee.createChannel({
    id: CANAL,
    name: 'Trajeto do motorista',
    description: 'Aparece enquanto o BusZapp envia a localização do ônibus.',
    importance: AndroidImportance.LOW,
  });
  await notifee.displayNotification({
    id: ID_NOTIFICACAO,
    title: 'BusZapp — trajeto em andamento',
    body: `Linha ${trajeto.linha.numero} · ${trajeto.horario.departure_time} — Ônibus ${trajeto.horario.bus_number}. Enviando sua localização.`,
    android: {
      channelId: CANAL,
      asForegroundService: true,
      foregroundServiceTypes: [TIPO_LOCALIZACAO],
      ongoing: true,
      onlyAlertOnce: true,
      color: '#F59E0B',
      colorized: true,
      pressAction: { id: 'default', launchActivity: 'default' },
    },
  });
}

/** liga o envio (se já estiver ligado para este trajeto, não faz nada) */
export async function iniciarRastreio(trajeto) {
  if (estado.ativo && estado.trajeto?.iniciadoEm === trajeto.iniciadoEm) return;
  if (estado.ativo) await pararRastreio();
  estado = { ...ESTADO_INICIAL, ativo: true, trajeto };
  mudar({});
  if (Platform.OS === 'android') {
    // Android 14: o serviço do tipo "location" só pode subir com a permissão já concedida
    if (!(await pedirPermissaoLocalizacao())) {
      estado = ESTADO_INICIAL;
      mudar({}, { tipo: 'erro', texto: 'Permissão de localização negada.' });
      throw new Error('Permita a localização para enviar a posição do ônibus.');
    }
    // o Notifee chama tarefaDoServico(), que roda o laço
    await mostrarNotificacaoDoServico(trajeto);
  } else {
    executarLaco(trajeto);
  }
}

export async function pararRastreio() {
  pararLaco?.();
  if (Platform.OS === 'android') {
    await notifee.stopForegroundService().catch(() => {});
    await notifee.cancelNotification(ID_NOTIFICACAO).catch(() => {});
  }
  estado = ESTADO_INICIAL;
  mudar({});
}

/**
 * Economia de bateria do Android pode matar o serviço (Xiaomi, Samsung...).
 * Devolve true se vale mostrar o aviso para o motorista liberar o BusZapp.
 */
export async function bateriaRestringe() {
  if (Platform.OS !== 'android') return false;
  try {
    return await notifee.isBatteryOptimizationEnabled();
  } catch {
    return false;
  }
}

export async function abrirAjusteDeBateria() {
  try {
    const info = await notifee.getPowerManagerInfo();
    if (info?.activity) {
      await notifee.openPowerManagerSettings();
      return;
    }
  } catch {
    // segue para o ajuste padrão
  }
  await notifee.openBatteryOptimizationSettings();
}
