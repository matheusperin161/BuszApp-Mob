/**
 * ATOM — Checkbox
 * Caixinha de marcar com texto ao lado ("Lembrar de mim", aceite dos termos).
 * children permite texto com partes em destaque.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { cores, espacamentos } from '../../theme';
import { Icone } from './Icone';
import { Label } from './Label';

export function Checkbox({ marcado, onChange, rotulo, children, erro = false, style }) {
  return (
    <Pressable
      onPress={() => onChange(!marcado)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: marcado }}
      hitSlop={6}
      style={[styles.linha, style]}>
      <View style={[styles.caixa, marcado && styles.marcado, erro && styles.erro]}>
        {marcado ? <Icone nome="check" cor={cores.textoInverso} tamanho={14} espessura={3} /> : null}
      </View>
      {rotulo ? <Label style={styles.texto}>{rotulo}</Label> : children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm, flexShrink: 1 },
  caixa: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: cores.textoSecundario,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.superficie,
  },
  marcado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  erro: { borderColor: cores.perigo },
  texto: { color: cores.textoMedio },
});
