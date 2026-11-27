/**
 * MOLECULE — RegistroItem
 * Linha de uma lista do admin: ícone/marcador, título, detalhes e um selo de status.
 */
import { memo } from 'react';
import { View } from 'react-native';

import { Label } from '../atoms/Label';
import { IconeCaixa } from './IconeCaixa';
import { Selo } from './Selo';
import { espacamentos, raios } from '../../theme';
import { criarEstilos } from '../../theme/tema';

export const RegistroItem = memo(function RegistroItem({ icone, titulo, linhas = [], selo, direita }) {
  const styles = useStyles();
  return (
    <View style={styles.item}>
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
    </View>
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
  textos: { flex: 1 },
  titulo: { fontWeight: '700', fontSize: 15 },
}));
