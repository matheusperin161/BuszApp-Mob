/**
 * MOLECULE — OptionChips
 * Seleção única entre poucas opções (status, categoria, sentido, linha...).
 * opcoes: [{ valor, rotulo, desabilitado? }]
 */
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espacos, raios } from '../../theme';

export default function OptionChips({ opcoes, valor, aoMudar, style }) {
  return (
    <View style={[styles.linha, style]} accessibilityRole="radiogroup">
      {opcoes.map((opcao) => {
        const ativo = opcao.valor === valor;
        return (
          <Pressable
            key={String(opcao.valor)}
            accessibilityRole="radio"
            accessibilityState={{ checked: ativo, disabled: opcao.desabilitado }}
            disabled={opcao.desabilitado}
            onPress={() => aoMudar(opcao.valor)}
            style={[styles.chip, ativo && styles.chipAtivo, opcao.desabilitado && styles.chipDesabilitado]}
          >
            <Text style={[styles.texto, ativo && styles.textoAtivo]}>{opcao.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', flexWrap: 'wrap', gap: espacos.sm },
  chip: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: espacos.md,
    borderRadius: raios.pilula,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  chipAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  chipDesabilitado: { opacity: 0.4 },
  texto: { color: cores.texto, fontWeight: '600' },
  textoAtivo: { color: cores.textoInverso },
});
