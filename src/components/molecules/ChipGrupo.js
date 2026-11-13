/**
 * MOLECULE — ChipGrupo
 * Rótulo + fileira de Chips (escolha única). horizontal=true rola de lado.
 * Faz o papel dos <select> do site, mas com tudo à vista (um toque só).
 */
import { ScrollView, StyleSheet, View } from 'react-native';

import { Chip } from '../atoms/Chip';
import { Label } from '../atoms/Label';
import { cores, espacamentos } from '../../theme';

export function ChipGrupo({
  label,
  opcoes,
  valor,
  onChange,
  horizontal = false,
  mensagemErro,
  desabilitado = false,
  vazio,
}) {
  const chips = opcoes.map(opcao => (
    <Chip
      key={String(opcao.id)}
      rotulo={opcao.rotulo}
      selecionado={opcao.id === valor}
      desabilitado={desabilitado || opcao.desabilitado}
      onPress={() => onChange(opcao.id)}
    />
  ));

  return (
    <View style={styles.container}>
      {label ? (
        <Label variante="secao" style={styles.label}>
          {label}
        </Label>
      ) : null}
      {!opcoes.length && vazio ? (
        <Label variante="legenda">{vazio}</Label>
      ) : horizontal ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.linha}>
          {chips}
        </ScrollView>
      ) : (
        <View style={[styles.linha, styles.quebra]}>{chips}</View>
      )}
      {mensagemErro ? (
        <Label variante="legenda" style={styles.erro}>
          {mensagemErro}
        </Label>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: espacamentos.md },
  label: { marginBottom: espacamentos.sm, letterSpacing: 1 },
  linha: { flexDirection: 'row', gap: espacamentos.sm },
  quebra: { flexWrap: 'wrap' },
  erro: { color: cores.perigo, marginTop: espacamentos.xs },
});
