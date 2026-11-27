/**
 * MOLECULE — AvisoBox
 * Faixa colorida de aviso (sucesso, informação ou alerta), com ícone.
 * Igual ao ErrorMessage: sem texto, não renderiza nada.
 */
import { View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

function tipos(cores, escuro) {
  return {
    sucesso: {
      fundo: cores.sucessoFundo,
      borda: escuro ? '#166534' : '#BBF7D0',
      texto: cores.sucessoTexto,
      icone: 'check-circle',
    },
    info: { fundo: escuro ? cores.infoFundo : '#EFF6FF', borda: cores.infoBorda, texto: cores.infoTexto, icone: 'info' },
    alerta: {
      fundo: escuro ? '#3B2A0C' : cores.superficieAlt,
      borda: escuro ? '#78350F' : cores.borda,
      texto: cores.avisoTexto,
      icone: 'alert-triangle',
    },
  };
}

export function AvisoBox({ tipo = 'info', titulo, mensagem, children, style }) {
  const styles = useStyles();
  const { cores, escuro } = useTema();
  if (!mensagem && !titulo && !children) {
    return null;
  }
  const lista = tipos(cores, escuro);
  const visual = lista[tipo] ?? lista.info;

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

const useStyles = criarEstilos(() => ({
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
}));
