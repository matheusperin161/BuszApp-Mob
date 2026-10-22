/**
 * ATOM — Badge
 * Etiqueta de status (ex.: ônibus em rota, incidente).
 * Tons: sucesso, perigo, aviso, info, neutro.
 */
import { StyleSheet, Text, View } from 'react-native';

import { cores, espacos, raios } from '../../theme';

const TONS = {
  sucesso: [cores.sucessoFundo, cores.sucessoTexto],
  perigo: [cores.perigoFundo, cores.perigoTexto],
  aviso: [cores.avisoFundo, cores.avisoTexto],
  info: [cores.infoFundo, cores.infoTexto],
  neutro: ['#f3f4f6', cores.textoSuave],
};

export default function Badge({ texto, tom = 'neutro', style }) {
  const [fundo, cor] = TONS[tom];
  return (
    <View style={[styles.badge, { backgroundColor: fundo }, style]}>
      <Text style={[styles.texto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: espacos.sm,
    paddingVertical: 2,
    borderRadius: raios.pilula,
  },
  texto: { fontSize: 12, fontWeight: '700' },
});
