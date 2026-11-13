/**
 * MOLECULE — AvisoBox
 * Faixa colorida de aviso (sucesso, informação ou alerta), com ícone.
 * Igual ao ErrorMessage: sem texto, não renderiza nada.
 */
import { StyleSheet, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

const TIPOS = {
  sucesso: { fundo: cores.sucessoFundo, borda: '#BBF7D0', texto: cores.sucessoTexto, icone: 'check-circle' },
  info: { fundo: '#EFF6FF', borda: '#BFDBFE', texto: cores.infoTexto, icone: 'info' },
  alerta: { fundo: cores.superficieAlt, borda: cores.borda, texto: cores.avisoTexto, icone: 'alert-triangle' },
};

export function AvisoBox({ tipo = 'info', titulo, mensagem, children, style }) {
  if (!mensagem && !titulo && !children) {
    return null;
  }
  const visual = TIPOS[tipo] ?? TIPOS.info;

  return (
    <View style={[styles.container, { backgroundColor: visual.fundo, borderColor: visual.borda }, style]}>
      <Icone nome={visual.icone} cor={visual.texto} tamanho={20} style={styles.icone} />
      <View style={styles.textos}>
        {titulo ? <Label style={[styles.titulo, { color: visual.texto }]}>{titulo}</Label> : null}
        {mensagem ? <Label style={[styles.texto, { color: visual.texto }]}>{mensagem}</Label> : null}
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: espacamentos.sm + 2,
    borderWidth: 1,
    borderRadius: raios.lg,
    padding: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  icone: { marginTop: 1 },
  textos: { flex: 1 },
  titulo: { fontWeight: '700', fontSize: 15 },
  texto: { marginTop: 2, fontSize: 14, lineHeight: 20 },
});
