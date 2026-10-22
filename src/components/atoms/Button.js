/**
 * ATOM — Button
 * Menor unidade clicável. Recebe título e onPress.
 * Variantes: primario (padrão), secundario, perigo.
 */
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { cores, espacos, raios } from '../../theme';

const VARIANTES = {
  primario: { fundo: cores.primaria, texto: cores.textoInverso, borda: cores.primaria },
  secundario: { fundo: cores.superficie, texto: cores.primariaEscura, borda: cores.bordaForte },
  perigo: { fundo: cores.perigo, texto: cores.textoInverso, borda: cores.perigo },
};

export default function Button({ titulo, onPress, variante = 'primario', carregando = false, desabilitado = false, style }) {
  const v = VARIANTES[variante];
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      onPress={onPress}
      disabled={inativo}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: v.fundo, borderColor: v.borda },
        (pressed || inativo) && styles.apagado,
        style,
      ]}
    >
      {carregando ? <ActivityIndicator color={v.texto} /> : <Text style={[styles.texto, { color: v.texto }]}>{titulo}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: espacos.lg,
    borderRadius: raios.md,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texto: { fontSize: 16, fontWeight: '700' },
  apagado: { opacity: 0.6 },
});
