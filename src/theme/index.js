/**
 * Tokens visuais compartilhados por todos os componentes.
 * Copiados do CSS do site (static/css/main.css e as classes Tailwind das
 * páginas), para o app e o site parecerem o mesmo produto.
 *
 * Duas paletas, como no site: claro (creme/âmbar) e escuro (o ".dark" do site,
 * em tons de ardósia). As cores NÃO são importadas direto pelos componentes:
 * elas vêm do tema ativo, por useTema() ou criarEstilos() — ver theme/tema.js.
 * Espaçamentos, raios e tipografia não mudam com o tema e podem ser importados daqui.
 */

const claro = {
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
  infoBorda: '#BFDBFE',
  roxo: '#4F46E5',
  roxoFundo: '#E0E7FF',
  laranjaFundo: '#FFEDD5',
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
  cinzaClaro: '#F3F4F6', // botão "Cancelar", divisores
  estrelaVazia: '#D1D5DB',
  realce: '#FFFDF7', // fundo de item novo/destacado
  registro: '#FEF7DC', // linhas do "Registro de atividade"
  sobreposicao: 'rgba(0,0,0,0.45)',
  fundoMapa: '#FFFBEB',
};

/** o ".dark" do site: ardósia (slate) com o mesmo âmbar da marca */
const escuro = {
  ...claro,
  fundo: '#0F172A', // slate-900
  superficie: '#1E293B', // slate-800
  superficieAlt: '#334155', // slate-700
  primariaTexto: '#FBBF24',
  rotuloAtalho: '#FDE68A',
  link: '#FBBF24',
  perigoFundo: '#7F1D1D',
  perigoTexto: '#FCA5A5',
  sucesso: '#22C55E',
  sucessoFundo: '#14532D',
  sucessoTexto: '#86EFAC',
  info: '#60A5FA',
  infoFundo: '#1E3A8A',
  infoTexto: '#BFDBFE',
  infoBorda: '#1E40AF',
  roxo: '#A5B4FC',
  roxoFundo: '#312E81',
  laranjaFundo: '#7C2D12',
  avisoTexto: '#FDE68A',
  texto: '#F8FAFC',
  textoMedio: '#CBD5E1',
  textoSecundario: '#94A3B8',
  textoFraco: '#64748B',
  borda: '#334155',
  bordaSuave: '#334155',
  bordaNeutra: '#334155',
  bordaFoco: '#FBBF24',
  campoCinza: '#0F172A',
  campoCinzaBorda: '#334155',
  cinzaClaro: '#334155',
  estrelaVazia: '#475569',
  realce: '#272F1F',
  registro: '#2A2617',
  sobreposicao: 'rgba(0,0,0,0.6)',
  fundoMapa: '#0F172A',
};

/**
 * Alto contraste (acessibilidade): textos secundários e bordas bem mais fortes,
 * para quem enxerga pouco ou usa o celular no sol. Vale nos dois temas.
 */
const contrasteClaro = {
  textoMedio: '#111827',
  textoSecundario: '#1F2937',
  textoFraco: '#374151',
  primariaTexto: '#78350F',
  link: '#78350F',
  borda: '#92400E',
  bordaSuave: '#B45309',
  bordaNeutra: '#4B5563',
  campoCinzaBorda: '#4B5563',
  perigoTexto: '#7F1D1D',
  sucessoTexto: '#14532D',
  infoTexto: '#1E3A8A',
};
const contrasteEscuro = {
  fundo: '#000000',
  superficie: '#0B1120',
  texto: '#FFFFFF',
  textoMedio: '#F1F5F9',
  textoSecundario: '#E2E8F0',
  textoFraco: '#CBD5E1',
  primariaTexto: '#FDE68A',
  link: '#FDE68A',
  borda: '#E2E8F0',
  bordaSuave: '#94A3B8',
  bordaNeutra: '#94A3B8',
  campoCinzaBorda: '#94A3B8',
};

export const paletas = {
  claro,
  escuro,
  claroContraste: { ...claro, ...contrasteClaro },
  escuroContraste: { ...escuro, ...contrasteEscuro },
};

/** tamanhos de letra do app (além do ajuste de fonte do próprio celular) */
export const ESCALAS_FONTE = [
  { id: 1, rotulo: 'Normal' },
  { id: 1.15, rotulo: 'Grande' },
  { id: 1.3, rotulo: 'Muito grande' },
];

/**
 * Degradês (react-native-svg). angulo segue o CSS: 135 = diagonal ↘, 180 = de cima para baixo.
 * São os mesmos nos dois temas (a marca não muda); só o fundo do login escurece.
 */
export function gradientesDe(eEscuro) {
  return {
    // --gradient-brand: cabeçalho, botões, cartão de saldo
    marca: { cores: ['#FBBF24', '#F97316'], angulo: 135 },
    // botão "Entrar" do login (from-yellow-400 to-amber-500)
    botao: { cores: ['#FBBF24', '#F59E0B'], angulo: 135 },
    // botões de ação (Salvar, Enviar avaliação): amarelo → laranja
    acao: { cores: ['#FACC15', '#F97316'], angulo: 90 },
    // topo do cartão de login (from-yellow-400 to-amber-600)
    login: { cores: ['#FACC15', '#D97706'], angulo: 180 },
    // fundo atrás do cartão de login
    fundoLogin: eEscuro
      ? { cores: ['#1E293B', '#0F172A'], angulo: 160 }
      : { cores: ['#F59E0B', '#D97706'], angulo: 160 },
    // cartão de transporte (tela Recarga)
    cartaoAzul: { cores: ['#60A5FA', '#2563EB'], angulo: 135 },
    // botão de finalizar viagem / excluir
    perigo: { cores: ['#F87171', '#DC2626'], angulo: 135 },
    // botão de iniciar trajeto
    sucesso: { cores: ['#4ADE80', '#16A34A'], angulo: 135 },
  };
}

/** sombra leve dos cards (shadow-sm do Tailwind); no escuro é preta e mais forte */
export function sombraDe(eEscuro) {
  return {
    shadowColor: eEscuro ? '#000000' : '#92400E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: eEscuro ? 0.3 : 0.08,
    shadowRadius: 8,
    elevation: 2,
  };
}

/** sombra mais forte para o cartão de saldo e botões em degradê */
export function sombraForteDe(eEscuro) {
  return {
    shadowColor: eEscuro ? '#000000' : '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: eEscuro ? 0.45 : 0.25,
    shadowRadius: 16,
    elevation: 6,
  };
}

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
