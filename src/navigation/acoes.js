import { CommonActions } from '@react-navigation/native';

/** id do Stack.Navigator raiz — getParent(id) acha essa pilha a partir de qualquer tela aninhada */
export const ID_PILHA_RAIZ = 'raiz';

function pilhaRaiz(navigation) {
  return navigation.getParent(ID_PILHA_RAIZ) ?? navigation;
}

/**
 * Volta ao Login limpando o histórico.
 * replace('Login') falha se a tela atual mora numa aba:
 * Login não existe nesse navigator. reset na pilha raiz resolve.
 */
export function voltarAoLogin(navigation, params) {
  pilhaRaiz(navigation).dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: 'Login', params }],
    }),
  );
}

/**
 * Abre uma aba (Home, Mapa, Cartao, Avaliar, Perfil, Painel) a partir de
 * qualquer tela — inclusive das telas da pilha raiz (Recarga, Acompanhamento...).
 */
export function irParaAba(navigation, aba, params) {
  pilhaRaiz(navigation).navigate('Principal', { screen: aba, params });
}
