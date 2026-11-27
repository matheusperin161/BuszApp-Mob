/**
 * ORGANISM — Toast
 * Mensagem curta que aparece por cima da tela e some sozinha
 * ("Motorista salvo", "Parada excluída"...). Funciona em qualquer tela:
 *   const toast = useToast();
 *   toast.mostrar('Motorista salvo');            // sucesso
 *   toast.mostrar('Não foi possível', 'erro');
 */
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

const DURACAO_MS = 2600;
const ICONES = { sucesso: 'check-circle', erro: 'alert-circle', info: 'info' };

const ToastContext = createContext({ mostrar: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const styles = useStyles();
  const { cores } = useTema();
  const insets = useSafeAreaInsets();
  const [atual, setAtual] = useState(null);
  const opacidade = useRef(new Animated.Value(0)).current;
  const timer = useRef(null);

  const mostrar = useCallback(
    (texto, tipo = 'sucesso') => {
      clearTimeout(timer.current);
      setAtual({ texto, tipo });
      Animated.timing(opacidade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(() => {
        Animated.timing(opacidade, { toValue: 0, duration: 220, useNativeDriver: true }).start(() =>
          setAtual(null),
        );
      }, DURACAO_MS);
    },
    [opacidade],
  );

  const valor = useMemo(() => ({ mostrar }), [mostrar]);
  const corIcone = { sucesso: cores.sucesso, erro: cores.perigo, info: cores.info }[atual?.tipo] ?? cores.info;

  return (
    <ToastContext.Provider value={valor}>
      <View style={styles.raiz}>
        {children}
        {atual ? (
          <Animated.View
            pointerEvents="none"
            accessibilityLiveRegion="polite"
            style={[
              styles.toast,
              {
                bottom: insets.bottom + 90,
                opacity: opacidade,
                transform: [{ translateY: opacidade.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
              },
            ]}>
            <Icone nome={ICONES[atual.tipo] ?? 'info'} cor={corIcone} tamanho={20} />
            <Label style={styles.texto}>{atual.texto}</Label>
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

const useStyles = criarEstilos(({ cores, sombraForte, escuro }) => ({
  raiz: { flex: 1 },
  toast: {
    position: 'absolute',
    left: espacamentos.lg,
    right: espacamentos.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm + 2,
    paddingVertical: espacamentos.sm + 6,
    paddingHorizontal: espacamentos.md,
    borderRadius: raios.lg,
    backgroundColor: escuro ? cores.superficieAlt : '#1F2937',
    ...sombraForte,
    shadowColor: '#000000',
  },
  texto: { flex: 1, color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
}));
