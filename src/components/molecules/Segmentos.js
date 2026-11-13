/**
 * MOLECULE — Segmentos
 * Abas internas roláveis (Motoristas · Frota · Rotas · Cartões), como os botões
 * de aba do painel do admin no site.
 */
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

export function Segmentos({ opcoes, valor, onChange }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.rolagem}
      contentContainerStyle={styles.linha}>
      {opcoes.map(o => {
        const ativo = o.id === valor;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: ativo }}
            style={[styles.botao, ativo && styles.ativo]}>
            <Icone nome={o.icone} tamanho={17} cor={ativo ? '#FFFFFF' : cores.textoMedio} />
            <Label style={[styles.texto, ativo && styles.textoAtivo]}>{o.rotulo}</Label>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // sem isto a fileira estica na altura da tela (ScrollView dentro de ScrollView)
  rolagem: { flexGrow: 0, marginBottom: espacamentos.md },
  linha: { gap: espacamentos.sm, alignItems: 'center' },
  botao: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 2,
    borderRadius: raios.pilula,
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.bordaSuave,
  },
  ativo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  texto: { fontWeight: '600', color: cores.textoMedio },
  textoAtivo: { color: '#FFFFFF' },
});
