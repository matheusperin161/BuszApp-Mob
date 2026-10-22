/**
 * Opções visuais do header — objeto JavaScript compartilhado.
 * O spread (...opcoesCabecalho) copia essas chaves para screenOptions.
 */
import LogoutButton from '../components/molecules/LogoutButton';
import { cores } from '../theme';

export const opcoesCabecalho = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: cores.texto,
  headerTitleStyle: { fontWeight: '700' },
  contentStyle: { backgroundColor: cores.fundo },
};

export const comBotaoSair = { headerRight: () => <LogoutButton /> };
