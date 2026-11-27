/**
 * MOLECULE — RegistroItem
 * Linha de uma lista do admin: ícone/marcador, título, detalhes e um selo de status.
 * Com onPress vira tocável (abre a edição) e mostra uma setinha no fim.
 */
import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { IconeCaixa } from './IconeCaixa';
import { Selo } from './Selo';
import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

export const RegistroItem = memo(function RegistroItem({ icone, titulo, linhas = [], selo, direita, onPress }) {
  const styles = useStyles();
  const { cores } = useTema();
  const Caixa = onPress ? Pressable : View;
  return (
    <Caixa
      style={onPress ? ({ pressed }) => [styles.item, pressed && styles.pressionado] : styles.item}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}>
      <IconeCaixa nome={icone} tamanho={42} />
      <View style={styles.textos}>
        <Label style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Label>
        {linhas.filter(Boolean).map((l, i) => (
          <Label key={i} variante="legenda" numberOfLines={1}>
            {l}
          </Label>
        ))}
      </View>
      {direita}
      {selo ? <Selo {...selo} /> : null}
      {onPress ? <Icone nome="chevron-right" tamanho={18} cor={cores.textoFraco} /> : null}
    </Caixa>
  );
});

const useStyles = criarEstilos(({ cores, sombra }) => ({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    backgroundColor: cores.superficie,
    borderRadius: raios.lg,
    padding: espacamentos.md,
    marginBottom: espacamentos.sm + 2,
    ...sombra,
  },
  pressionado: { opacity: 0.75 },
  textos: { flex: 1 },
  titulo: { fontWeight: '700', fontSize: 15 },
}));
