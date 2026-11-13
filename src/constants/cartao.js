/**
 * Tipos de cartão e valores rápidos de recarga — os mesmos da tela
 * Recarga do site (CARD_TYPE_LABELS em recarga.html).
 */
export const TIPOS_CARTAO = [
  { id: 'cidadao', rotulo: 'Cidadão' },
  { id: 'normal', rotulo: 'Normal (VT)' },
  { id: 'estudante', rotulo: 'Estudante' },
  { id: 'idoso', rotulo: 'Idoso' },
  { id: 'acompanhante', rotulo: 'Acompanhante' },
  { id: 'carteiro', rotulo: 'Carteiro' },
  { id: 'colaborador', rotulo: 'Colaborador' },
  { id: 'pcd', rotulo: 'PcD' },
];

export function rotuloTipoCartao(id) {
  return TIPOS_CARTAO.find(tipo => tipo.id === id)?.rotulo ?? 'Cartão BusZapp';
}

export const VALORES_RECARGA = [10, 20, 50, 100];

export const FORMAS_PAGAMENTO = [
  { id: 'pix', rotulo: 'PIX' },
  { id: 'cartao', rotulo: 'Cartão de crédito' },
];

/** abaixo disso o backend manda a notificação "Saldo Baixo" */
export const SALDO_BAIXO = 5;
