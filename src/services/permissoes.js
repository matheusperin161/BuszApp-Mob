/**
 * SERVICE — permissoes
 * Situação das permissões nativas usadas pelo app (câmera, localização, notificações),
 * mostrada no perfil para o usuário conferir e corrigir nas configurações.
 *
 * Cada recurso pede a sua permissão só na hora de usar (ver DriverScreen, ProfileScreen,
 * notificacoes.js); aqui só se consulta, sem abrir diálogo.
 */
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { consultarPermissaoNotificacoes } from './notificacoes';

/** 'permitida' | 'negada' | 'pendente' (ainda não perguntada) | 'indisponivel' (recurso ausente). */
function situacao(permissao) {
  if (!permissao) return 'indisponivel';
  const { status } = permissao;
  if (status === 'granted') return 'permitida';
  if (status === 'denied') return 'negada';
  return 'pendente';
}

export async function consultarPermissoes() {
  const [camera, localizacao, notificacoes] = await Promise.all([
    ImagePicker.getCameraPermissionsAsync(),
    Location.getForegroundPermissionsAsync(),
    consultarPermissaoNotificacoes(),
  ]);
  return {
    camera: situacao(camera),
    localizacao: situacao(localizacao),
    notificacoes: situacao(notificacoes),
  };
}

/** Confere/pede a câmera. Retorna null se ok, ou o motivo do bloqueio. */
export async function verificarCamera() {
  let { status, canAskAgain } = await ImagePicker.getCameraPermissionsAsync();
  if (status !== 'granted' && canAskAgain) {
    ({ status } = await ImagePicker.requestCameraPermissionsAsync());
  }
  if (status !== 'granted') {
    return 'Para tirar a foto de perfil, o BusZapp precisa da câmera. Permita o acesso nas configurações do aparelho.';
  }
  return null;
}
