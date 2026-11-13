/**
 * Tokens visuais compartilhados por todos os componentes.
 * Copiados do CSS do site (static/css/main.css e as classes Tailwind das
 * páginas), para o app e o site parecerem o mesmo produto.
 * Nada de "números mágicos" nos StyleSheet.
 */

export const cores = {
  fundo: '#FFFBEB', // --color-bg (creme)
  superficie: '#FFFFFF',
  superficieAlt: '#FEF3C7', // amber-100
  primaria: '#F59E0B', // amber-500
  primariaEscura: '#D97706', // amber-600
  primariaClara: '#FBBF24', // amber-400
  // âmbar escuro para TEXTO sobre fundo claro (o âmbar puro não tem contraste)
  primariaTexto: '#B45309', // amber-700
  rotuloAtalho: '#92400E', // amber-800 — texto dos atalhos da Home
  link: '#CA8A04', // yellow-600 — "Esqueceu a senha?", "Cadastre-se"
  destaque: '#F97316', // orange-500
  perigo: '#EF4444',
  perigoFundo: '#FEE2E2',
  perigoTexto: '#B91C1C',
  sucesso: '#16A34A',
  sucessoFundo: '#DCFCE7',
  sucessoTexto: '#15803D',
  info: '#2563EB',
  infoFundo: '#DBEAFE',
  infoTexto: '#1E40AF',
  roxo: '#4F46E5',
  roxoFundo: '#E0E7FF',
  avisoTexto: '#92400E',
  texto: '#111827', // gray-900
  textoMedio: '#374151', // gray-700 (rótulos dos campos)
  textoSecundario: '#6B7280', // gray-500
  textoFraco: '#9CA3AF', // gray-400
  textoInverso: '#FFFFFF',
  borda: '#FDE68A', // amber-200
  bordaSuave: '#FEF3C7', // amber-100 (borda dos cards)
  bordaNeutra: '#E5E7EB', // gray-200
  bordaFoco: '#F59E0B',
  campoCinza: '#F8FAFC', // inputs do login/cadastro
  campoCinzaBorda: '#E5E7EB',
  cinzaClaro: '#F3F4F6', // botão "Cancelar"
};

/**
 * Degradês (react-native-svg). angulo segue o CSS: 135 = diagonal ↘, 180 = de cima para baixo.
 */
export const gradientes = {
  // --gradient-brand: cabeçalho, botões, cartão de saldo
  marca: { cores: ['#FBBF24', '#F97316'], angulo: 135 },
  // botão "Entrar" do login (from-yellow-400 to-amber-500)
  botao: { cores: ['#FBBF24', '#F59E0B'], angulo: 135 },
  // botões de ação (Salvar, Enviar avaliação): amarelo → laranja
  acao: { cores: ['#FACC15', '#F97316'], angulo: 90 },
  // topo do cartão de login (from-yellow-400 to-amber-600)
  login: { cores: ['#FACC15', '#D97706'], angulo: 180 },
  // fundo atrás do cartão de login
  fundoLogin: { cores: ['#F59E0B', '#D97706'], angulo: 160 },
  // cartão de transporte (tela Recarga)
  cartaoAzul: { cores: ['#60A5FA', '#2563EB'], angulo: 135 },
  // botão de finalizar viagem
  perigo: { cores: ['#F87171', '#DC2626'], angulo: 135 },
  // botão de iniciar trajeto
  sucesso: { cores: ['#4ADE80', '#16A34A'], angulo: 135 },
};

/** cor sólida usada onde não cabe degradê (status bar, spinner do botão) */
export const corBotao = '#F59E0B';

export const espacamentos = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
};

export const raios = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pilula: 999,
};

export const tipografia = {
  titulo: 24,
  subtitulo: 17,
  corpo: 15,
  legenda: 13,
  destaque: 40,
};

/** sombra leve dos cards (shadow-sm do Tailwind) */
export const sombra = {
  shadowColor: '#92400E',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};

/** sombra mais forte para o cartão de saldo e botões em degradê */
export const sombraForte = {
  shadowColor: '#F97316',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.25,
  shadowRadius: 16,
  elevation: 6,
};
