/**
 * URL base da API — backend Flask do BusZapp (pasta BusZapp/)
 * Android emulator → 10.0.2.2 | iOS simulator → localhost
 * Em dispositivo físico, use o IP da máquina na LAN.
 *
 * Para trocar sem editar o código: EXPO_PUBLIC_API_URL=http://192.168.0.10:8080 npx expo start
 */
import { Platform } from 'react-native';

const PORTA = 8080; // src/main.py sobe o Flask na 8080

const URL_PADRAO = Platform.OS === 'android' ? `http://10.0.2.2:${PORTA}` : `http://localhost:${PORTA}`;

export const API_URL = (process.env.EXPO_PUBLIC_API_URL || URL_PADRAO).replace(/\/$/, '');

/** RNF08 — intervalo fixo de envio da posição durante a viagem. */
export const INTERVALO_ENVIO_POSICAO_MS = 10_000;

/** Atualização dos mapas de passageiro e admin. */
export const INTERVALO_ATUALIZACAO_MAPA_MS = 10_000;
