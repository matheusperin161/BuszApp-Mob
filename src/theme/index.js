/**
 * Tokens visuais compartilhados por todos os componentes.
 * Cores vindas de BusZapp/static/css/main.css (identidade amarelo/laranja).
 */

export const cores = {
  primaria: '#f59e0b',
  primariaEscura: '#d97706',
  primariaClara: '#fbbf24',
  destaque: '#f97316',

  fundo: '#fffbeb',
  superficie: '#ffffff',
  borda: '#fde68a',
  bordaForte: '#f59e0b',

  texto: '#1f2937',
  textoSuave: '#6b7280',
  textoInverso: '#ffffff',

  sucesso: '#10b981',
  sucessoFundo: '#dcfce7',
  sucessoTexto: '#166534',
  perigo: '#ef4444',
  perigoFundo: '#fee2e2',
  perigoTexto: '#991b1b',
  aviso: '#f59e0b',
  avisoFundo: '#fef3c7',
  avisoTexto: '#92400e',
  info: '#2563eb',
  infoFundo: '#dbeafe',
  infoTexto: '#1e3a8a',
};

export const espacos = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const raios = { sm: 8, md: 12, lg: 16, pilula: 999 };

export const tipografia = {
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto },
  subtitulo: { fontSize: 16, fontWeight: '600', color: cores.texto },
  corpo: { fontSize: 15, color: cores.texto },
  legenda: { fontSize: 13, color: cores.textoSuave },
};
