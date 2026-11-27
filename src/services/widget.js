/**
 * SERVICE — widget da tela inicial do Android.
 * Manda para o código nativo (BuszappWidgetModule) o saldo e os horários de
 * hoje da primeira linha favorita; o widget calcula sozinho o próximo ônibus.
 * Em iOS (ou se o módulo não existir, como no Jest) não faz nada.
 */
import { NativeModules, Platform } from 'react-native';

import { hora } from '../utils/formato';
import { horariosComCache } from './offline';

const modulo = () => (Platform.OS === 'android' ? NativeModules.BuszappWidget : null);

/** monta o JSON do widget (separado para dar para testar) */
export function dadosDoWidget({ cartao, favorita, horarios, agora = new Date() }) {
  return {
    saldo: cartao?.card_number ? Number(cartao.card_balance ?? 0) : null,
    linha: favorita ? { numero: String(favorita.numero), nome: favorita.nome } : null,
    horarios: (horarios || []).map(h => h.departure_time).filter(Boolean),
    atualizadoEm: hora(agora.toISOString()),
  };
}

export async function atualizarWidget({ cartao, favoritas }) {
  const nativo = modulo();
  if (!nativo?.atualizar) return false;
  const favorita = favoritas?.[0] ?? null;
  const horarios = favorita ? await horariosComCache(favorita.numero).then(r => r.dados).catch(() => []) : [];
  await nativo.atualizar(JSON.stringify(dadosDoWidget({ cartao, favorita, horarios })));
  return true;
}

export async function limparWidget() {
  await modulo()?.limpar?.().catch(() => {});
}
