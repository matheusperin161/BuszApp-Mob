/**
 * SERVICE — nativos (versão React Native CLI)
 * Câmera, galeria, GPS, permissões e aviso local (Notifee).
 * A tela não importa essas libs direto — só este módulo.
 */
import notifee, {
  AndroidImportance,
  AuthorizationStatus,
} from '@notifee/react-native';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

export function configurarNotificacoes() {
  // Notifee não exige handler global como o Expo.
}

function rotuloAndroid(concedida) {
  return concedida ? 'granted' : 'denied';
}

async function pedirCameraAndroid() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.CAMERA,
    {
      title: 'Câmera',
      message: 'O BusZapp usa a câmera para a foto do seu perfil.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Negar',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

async function pedirGpsAndroid() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Localização',
      message: 'O BusZapp usa sua localização para mostrar você no mapa e enviar a posição do ônibus durante a viagem.',
      buttonPositive: 'Permitir',
      buttonNegative: 'Negar',
    },
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

export async function capturarFoto() {
  const ok = await pedirCameraAndroid();
  if (!ok) {
    throw new Error('Permissão da câmera negada.');
  }
  const response = await launchCamera({
    mediaType: 'photo',
    quality: 0.6,
    cameraType: 'front',
  });
  if (response.didCancel) {
    return null;
  }
  if (response.errorCode) {
    throw new Error(
      response.errorMessage || 'Câmera indisponível neste aparelho.',
    );
  }
  return { uri: response.assets[0].uri };
}

export async function escolherImagem() {
  const response = await launchImageLibrary({
    mediaType: 'photo',
    quality: 0.6,
  });
  if (response.didCancel) {
    return null;
  }
  if (response.errorCode) {
    throw new Error(response.errorMessage || 'Galeria indisponível.');
  }
  return { uri: response.assets[0].uri };
}

export function obterPosicao() {
  return new Promise((resolve, reject) => {
    pedirGpsAndroid()
      .then(ok => {
        if (!ok) {
          reject(new Error('Permissão de localização negada.'));
          return;
        }
        Geolocation.getCurrentPosition(
          pos => {
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              precisao: pos.coords.accuracy,
            });
          },
          err => {
            reject(
              new Error(err.message || 'Não foi possível obter a localização.'),
            );
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      })
      .catch(reject);
  });
}

/**
 * GPS contínuo para o motorista durante a viagem.
 * Retorna a função que para de observar (chame ao sair da tela / finalizar).
 */
export async function observarPosicao(aoMudar, aoFalhar, { intervaloMs = 10000 } = {}) {
  const ok = await pedirGpsAndroid();
  if (!ok) {
    throw new Error('Permissão de localização negada.');
  }
  const id = Geolocation.watchPosition(
    pos =>
      aoMudar({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        precisao: pos.coords.accuracy,
        // coords.speed vem em m/s (ou -1 / null quando o aparelho não sabe)
        velocidadeKmh:
          pos.coords.speed != null && pos.coords.speed >= 0
            ? Math.round(pos.coords.speed * 3.6)
            : null,
        em: pos.timestamp,
      }),
    err => aoFalhar?.(new Error(err.message || 'GPS indisponível.')),
    {
      enableHighAccuracy: true,
      distanceFilter: 15,
      interval: intervaloMs,
      fastestInterval: Math.round(intervaloMs / 2),
    },
  );
  return () => Geolocation.clearWatch(id);
}

export async function statusPermissoes() {
  if (Platform.OS === 'android') {
    const camera = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
    const localizacao = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    let notificacoes = false;
    try {
      notificacoes = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    } catch {
      notificacoes = false;
    }
    return {
      camera: rotuloAndroid(camera),
      galeria: 'ao_usar',
      localizacao: rotuloAndroid(localizacao),
      notificacoes: rotuloAndroid(notificacoes),
    };
  }

  const settings = await notifee.getNotificationSettings();
  let notificacoes = 'undetermined';
  if (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  ) {
    notificacoes = 'granted';
  } else if (settings.authorizationStatus === AuthorizationStatus.DENIED) {
    notificacoes = 'denied';
  }

  return {
    camera: 'ao_usar',
    galeria: 'ao_usar',
    localizacao: 'ao_usar',
    notificacoes,
  };
}

export async function pedirPermissaoNotificacao() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: 'buszapp',
      name: 'BusZapp',
      importance: AndroidImportance.DEFAULT,
    });
  }
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function enviarAvisoLocal({ titulo, corpo }) {
  const ok = await pedirPermissaoNotificacao();
  if (!ok) {
    throw new Error('Permissão de notificação negada.');
  }
  await notifee.displayNotification({
    title: titulo,
    body: corpo,
    android: {
      channelId: 'buszapp',
      pressAction: { id: 'default' },
    },
  });
}
