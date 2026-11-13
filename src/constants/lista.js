/**
 * Ajustes comuns de FlatList (virtualização).
 * Pensados para cards de altura variável (feed, usuários, respostas).
 *
 * Ver listas_renderizacao_desempenho.md
 */
export const listaVirtualizada = {
  initialNumToRender: 8,
  maxToRenderPerBatch: 6,
  windowSize: 7,
  updateCellsBatchingPeriod: 50,
  removeClippedSubviews: true,
};

export function extrairChave(item) {
  return String(item.id);
}
