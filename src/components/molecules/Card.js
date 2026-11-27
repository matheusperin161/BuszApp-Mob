/**
 * MOLECULE — Card
 * O cartão branco das telas do site (cantos de 24px, borda âmbar bem clara, sombra leve).
 * titulo + icone (opcional) montam o cabeçalho "Últimas transações ........ Ver todas".
 */
import { Pressable, View } from 'react-native';

import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';

export function Card({
  titulo,
  icone,
  corIcone,
  obrigatorio = false,
  acao,
  onAcao,
  children,
  onPress,
  style,
  semPadding = false,
}) {
  const styles = useStyles();
  const { cores } = useTema();
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper
      onPress={onPress}
      style={[styles.card, semPadding && styles.semPadding, style]}
      accessibilityRole={onPress ? 'button' : undefined}>
      {titulo ? (
        <View style={styles.cabecalho}>
          {icone ? <Icone nome={icone} cor={corIcone ?? cores.primaria} tamanho={22} /> : null}
          <Label variante="subtitulo" style={styles.titulo}>
            {titulo}
            {obrigatorio ? <Label style={styles.obrigatorio}> *</Label> : null}
          </Label>
          {acao ? (
            <Pressable onPress={onAcao} hitSlop={8} accessibilityRole="button">
              <Label style={styles.acao}>{acao}</Label>
            </Pressable>
          ) : null}
        </View>
      ) : null}
      {children}
    </Wrapper>
  );
}

const useStyles = criarEstilos(({ cores, sombra }) => ({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    borderWidth: 1,
    borderColor: cores.bordaSuave,
    padding: espacamentos.lg,
    marginBottom: espacamentos.md,
    ...sombra,
  },
  semPadding: { padding: 0, overflow: 'hidden' },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm + 2,
    marginBottom: espacamentos.md,
  },
  titulo: { flex: 1 },
  obrigatorio: { color: cores.perigo, fontWeight: '700' },
  acao: { color: cores.textoSecundario, fontWeight: '600' },
}));
