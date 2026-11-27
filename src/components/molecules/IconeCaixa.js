/**
 * MOLECULE — IconeCaixa
 * Ícone dentro de um quadrado arredondado — o "selo" dos atalhos e títulos do site.
 *   degrade  quadrado em degradê âmbar → laranja com ícone branco (atalhos da Home)
 *   fundo/cor  quadrado de cor clara com ícone colorido (Ações rápidas, Recarga)
 */
import { View } from 'react-native';

import { raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';
import { Gradiente } from '../atoms/Gradiente';
import { Icone } from '../atoms/Icone';

export function IconeCaixa({
  nome,
  tamanho = 48,
  degrade = false,
  fundo,
  cor,
  redondo = false,
  style,
}) {
  const styles = useStyles();
  const { cores, gradientes } = useTema();
  return (
    <View
      style={[
        styles.caixa,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: redondo ? tamanho / 2 : Math.round(tamanho * 0.3),
          backgroundColor: degrade ? cores.primaria : fundo ?? cores.superficieAlt,
        },
        style,
      ]}>
      {degrade ? <Gradiente {...gradientes.marca} /> : null}
      <Icone nome={nome} cor={degrade ? cores.textoInverso : cor ?? cores.primariaEscura} tamanho={Math.round(tamanho * 0.48)} />
    </View>
  );
}

const useStyles = criarEstilos(() => ({
  caixa: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: raios.md,
  },
}));
