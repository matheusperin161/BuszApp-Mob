/**
 * Opções visuais do header — objeto JavaScript compartilhado.
 * O spread (...opcoesCabecalho) copia essas chaves para screenOptions.
 */
import { corBotao, cores } from '../theme';

export const opcoesCabecalho = {
  headerStyle: { backgroundColor: corBotao },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: cores.fundo },
};
