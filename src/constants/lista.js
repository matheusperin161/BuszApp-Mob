/**
 * Ajustes comuns de FlatList (virtualização).
 * Pensados para cards de altura variável (feed, usuários, respostas).
 *
 * Ver listas_renderizacao_desempenho.md
 */

export const ajustesLista = {
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  windowSize: 7,
  removeClippedSubviews: true,
  keyboardShouldPersistTaps: 'handled',
};

export const chavePorId = (item) => String(item.id);
