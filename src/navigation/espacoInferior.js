/**
 * Espaço que o conteúdo precisa deixar livre embaixo.
 *   - dentro das abas: a própria barra de abas já desvia da barra do celular → 0
 *   - telas da pilha (Acompanhamento, Recarregar, Avisos...): a barra de navegação
 *     do Android (3 botões ou gestos) fica POR CIMA do app → usa o inset de baixo.
 */
import { useContext } from 'react';
import { BottomTabBarHeightContext } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useEspacoInferior() {
  const alturaAbas = useContext(BottomTabBarHeightContext);
  const insets = useSafeAreaInsets();
  return alturaAbas === undefined ? insets.bottom : 0;
}
