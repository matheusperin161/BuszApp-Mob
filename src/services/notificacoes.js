/**
 * SERVICE — notificacoes
 * Notificações locais (expo-notifications): avisos do cartão, como cadastro e bloqueio.
 *
 * A permissão só é pedida no momento em que faz sentido (primeiro aviso), nunca ao abrir o app.
 * Sem permissão, o aviso é simplesmente ignorado — a tela já mostra o resultado.
 * O texto nunca leva o número completo do cartão: a notificação aparece na tela bloqueada.
 *
 * O módulo é carregado sob demanda: o Expo Go do Android não tem todos os módulos nativos dele
 * (ExpoTopicSubscriptionModule, de push) e um import no topo derrubava o app inteiro na abertura.
 * Sem o módulo, as notificações ficam indisponíveis e o resto funciona; num build de
 * desenvolvimento/produção elas funcionam normalmente.
 */
import { Platform } from 'react-native';

const CANAL = 'cartao';
let modulo; // undefined = ainda não tentou; null = indisponível

function carregar() {
  if (modulo !== undefined) return modulo;
  try {
    modulo = require('expo-notifications');
    // Com o app aberto, mostra o aviso mesmo assim (o padrão seria esconder)
    modulo.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
  } catch {
    modulo = null;
  }
  return modulo;
}

// Android 13+: o canal precisa existir antes de pedir a permissão
async function prepararCanal(Notifications) {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CANAL, {
    name: 'Cartão de transporte',
    importance: Notifications.AndroidImportance.HIGH,
  });
}

/** Situação da permissão sem abrir diálogo, ou null se as notificações não existem neste app. */
export async function consultarPermissaoNotificacoes() {
  const Notifications = carregar();
  return Notifications ? Notifications.getPermissionsAsync() : null;
}

/** Retorna true se pode notificar; com pedir, abre o diálogo do sistema quando ainda é possível. */
export async function permitirNotificacoes({ pedir }) {
  const Notifications = carregar();
  if (!Notifications) return false;
  await prepararCanal(Notifications);
  let { status, canAskAgain } = await Notifications.getPermissionsAsync();
  if (status !== 'granted' && canAskAgain && pedir) {
    ({ status } = await Notifications.requestPermissionsAsync());
  }
  return status === 'granted';
}

export async function notificar(titulo, corpo) {
  try {
    if (!(await permitirNotificacoes({ pedir: true }))) return;
    await carregar().scheduleNotificationAsync({
      content: { title: titulo, body: corpo },
      trigger: Platform.OS === 'android' ? { channelId: CANAL } : null,
    });
  } catch {
    // aviso é complementar: falhar aqui não pode desfazer a ação que já deu certo
  }
}
