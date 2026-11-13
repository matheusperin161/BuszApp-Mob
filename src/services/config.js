/**
 * URL base da API — backend do BusZapp (Flask) publicado na Hostinger.
 *
 * Troque API_BASE_URL pelo domínio do site, SEM barra no final.
 * Em produção use sempre HTTPS: o cookie de sessão do backend é "Secure"
 * e o iOS bloqueia HTTP por padrão.
 *
 * Para testar contra o backend rodando no seu computador:
 *   Android emulator → http://10.0.2.2:8080 | iOS simulator → http://localhost:8080
 *   Celular físico   → http://IP-DO-COMPUTADOR:8080 (mesma rede Wi-Fi)
 */
export const API_BASE_URL = 'https://buszapp.com.br';

export const API_PREFIX = `${API_BASE_URL}/api`;

/** intervalo de atualização do mapa de acompanhamento (o site usa o mesmo) */
export const INTERVALO_RASTREIO_MS = 5000;

/** de quanto em quanto tempo o app do motorista envia a posição (o painel do site usa 5 s) */
export const INTERVALO_GPS_MOTORISTA_MS = 5000;
