/**
 * ATOM — Checkbox
 * Caixinha de marcar com texto ao lado ("Lembrar de mim", aceite dos termos).
 * children permite texto com partes em destaque.
 */
import { Pressable, View } from 'react-native';

import { espacamentos } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';
import { Icone } from './Icone';
import { Label } from './Label';

export function Checkbox({ marcado, onChange, rotulo, children, erro = false, style }) {
  const styles = useStyles();
  const { cores } = useTema();
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

const useStyles = criarEstilos(({ cores }) => ({
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
}));
