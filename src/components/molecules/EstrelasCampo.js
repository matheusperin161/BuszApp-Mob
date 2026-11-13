/**
 * MOLECULE — EstrelasCampo
 * 5 estrelas tocáveis. valor 0 = não avaliado.
 * grande=true é a "Avaliação Geral"; o compacto vai na grade 2×2 dos critérios.
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { cores, espacamentos } from '../../theme';

const TEXTOS = ['Não avaliado', 'Muito ruim', 'Ruim', 'Regular', 'Boa', 'Excelente'];

export function EstrelasCampo({ rotulo, valor, onChange, grande = false, mensagemErro, dica }) {
  const tamanho = grande ? 42 : 26;
  return (
    <View style={[styles.container, grande && styles.grande]}>
      <View style={styles.estrelas}>
        {[1, 2, 3, 4, 5].map(n => {
          const ativa = n <= valor;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n === valor ? 0 : n)}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityLabel={`${rotulo}: ${n} de 5`}
              accessibilityState={{ selected: ativa }}>
              <Icone
                nome="star"
                tamanho={tamanho}
                cor={ativa ? cores.primaria : '#D1D5DB'}
                preenchido={ativa}
                espessura={grande ? 1.6 : 1.8}
              />
            </Pressable>
          );
        })}
      </View>
      <Label variante="legenda" style={[styles.texto, grande && styles.textoGrande]}>
        {valor ? TEXTOS[valor] : dica ?? TEXTOS[0]}
      </Label>
      {mensagemErro ? (
        <Label variante="legenda" style={styles.erro}>
          {mensagemErro}
        </Label>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  grande: { paddingVertical: espacamentos.xs },
  estrelas: { flexDirection: 'row', gap: 6 },
  texto: { marginTop: espacamentos.sm, textAlign: 'center' },
  textoGrande: { fontWeight: '600', color: cores.textoMedio, fontSize: 14 },
  erro: { color: cores.perigo, marginTop: espacamentos.xs },
});
