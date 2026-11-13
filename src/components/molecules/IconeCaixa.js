/**
 * MOLECULE — IconeCaixa
 * Ícone dentro de um quadrado arredondado — o "selo" dos atalhos e títulos do site.
 *   degrade  quadrado em degradê âmbar → laranja com ícone branco (atalhos da Home)
 *   fundo/cor  quadrado de cor clara com ícone colorido (Ações rápidas, Recarga)
 */
import { StyleSheet, View } from 'react-native';

import { cores, gradientes, raios } from '../../theme';
import { Gradiente } from '../atoms/Gradiente';
import { Icone } from '../atoms/Icone';

export function IconeCaixa({
  nome,
  tamanho = 48,
  degrade = false,
  fundo = cores.superficieAlt,
  cor = cores.primariaEscura,
  redondo = false,
  style,
}) {
  return (
    <View
      style={[
        styles.caixa,
        {
          width: tamanho,
          height: tamanho,
          borderRadius: redondo ? tamanho / 2 : Math.round(tamanho * 0.3),
          backgroundColor: degrade ? cores.primaria : fundo,
        },
        style,
      ]}>
      {degrade ? <Gradiente {...gradientes.marca} /> : null}
      <Icone nome={nome} cor={degrade ? cores.textoInverso : cor} tamanho={Math.round(tamanho * 0.48)} />
    </View>
  );
}

const styles = StyleSheet.create({
  caixa: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: raios.md,
  },
});
