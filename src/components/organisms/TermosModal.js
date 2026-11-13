/**
 * ORGANISM — TermosModal
 * Os Termos de Serviço numa janela por cima do cadastro (como o modal do site).
 */
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { TERMOS } from '../../constants/termos';
import { cores, espacamentos, raios } from '../../theme';

export function TermosModal({ visivel, onFechar, onAceitar }) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onFechar}>
      <Pressable style={styles.fundo} onPress={onFechar}>
        <Pressable style={styles.janela} onPress={() => {}}>
          <View style={styles.topo}>
            <Label variante="subtitulo" style={styles.flex}>
              Termos de Serviço – BuszApp
            </Label>
            <Pressable onPress={onFechar} hitSlop={10} accessibilityLabel="Fechar">
              <Icone nome="x" cor={cores.textoSecundario} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.texto}>
            {TERMOS.map(([titulo, corpo]) => (
              <View key={titulo} style={styles.item}>
                <Label style={styles.itemTitulo}>{titulo}</Label>
                <Label style={styles.itemCorpo}>{corpo}</Label>
              </View>
            ))}
          </ScrollView>
          <View style={styles.botoes}>
            <Button title="Fechar" variante="secundario" onPress={onFechar} style={styles.flex} />
            {onAceitar ? (
              <Button title="Aceitar" variante="entrar" onPress={onAceitar} style={styles.flex} />
            ) : null}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: espacamentos.md,
  },
  janela: { backgroundColor: cores.superficie, borderRadius: raios.lg, maxHeight: '88%' },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: espacamentos.lg,
    borderBottomWidth: 1,
    borderBottomColor: cores.bordaNeutra,
  },
  flex: { flex: 1 },
  texto: { padding: espacamentos.lg },
  item: { marginBottom: espacamentos.md },
  itemTitulo: { fontWeight: '700', marginBottom: 2 },
  itemCorpo: { color: cores.textoMedio, lineHeight: 21, fontSize: 14 },
  botoes: {
    flexDirection: 'row',
    gap: espacamentos.sm,
    padding: espacamentos.md,
    borderTopWidth: 1,
    borderTopColor: cores.bordaNeutra,
  },
});
