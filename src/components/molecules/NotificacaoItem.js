/**
 * MOLECULE — NotificacaoItem
 * Um aviso do sistema. O ícone muda conforme o assunto do título;
 * novo (chegou depois da última visita) = barrinha laranja à esquerda, como no site.
 */
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Label } from '../atoms/Label';
import { IconeCaixa } from './IconeCaixa';
import { cores, espacamentos, raios, sombra } from '../../theme';
import { tempoRelativo } from '../../utils/formato';

function visualDoTitulo(titulo = '') {
  const t = titulo.toLowerCase();
  if (t.includes('recarga')) return { nome: 'dollar-sign', fundo: cores.sucessoFundo, cor: cores.sucesso };
  if (t.includes('saldo')) return { nome: 'alert-triangle', fundo: cores.superficieAlt, cor: cores.primariaEscura };
  if (t.includes('cartão') || t.includes('cartao')) return { nome: 'credit-card', fundo: cores.roxoFundo, cor: cores.roxo };
  if (t.includes('atraso')) return { nome: 'clock', fundo: '#FFEDD5', cor: cores.destaque };
  if (t.includes('pane') || t.includes('acidente') || t.includes('ocorr'))
    return { nome: 'alert-circle', fundo: cores.perigoFundo, cor: cores.perigo };
  return { nome: 'bell', fundo: cores.superficieAlt, cor: cores.primariaEscura };
}

export const NotificacaoItem = memo(function NotificacaoItem({ notificacao, novo = false }) {
  const visual = visualDoTitulo(notificacao.title);
  return (
    <View style={[styles.item, novo && styles.naoLida]}>
      <IconeCaixa {...visual} tamanho={42} redondo />
      <View style={styles.textos}>
        <View style={styles.topo}>
          <Label style={styles.titulo} numberOfLines={1}>
            {notificacao.title}
          </Label>
          <Label variante="legenda" style={styles.quando}>
            {tempoRelativo(notificacao.created_at)}
          </Label>
        </View>
        <Label style={styles.mensagem}>{notificacao.message}</Label>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.md,
    marginBottom: espacamentos.sm + 2,
    gap: espacamentos.md,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    ...sombra,
  },
  naoLida: { borderLeftColor: cores.destaque, backgroundColor: '#FFFDF7' },
  textos: { flex: 1 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', gap: espacamentos.sm },
  titulo: { flex: 1, fontSize: 15, fontWeight: '700' },
  quando: { fontSize: 12 },
  mensagem: { marginTop: 3, color: cores.textoSecundario, fontSize: 14, lineHeight: 20 },
});
