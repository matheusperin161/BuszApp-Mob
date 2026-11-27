/**
 * MOLECULE — Selo
 * Pílula pequena com ícone ("✓ Verificado", "Usuário", "Membro desde...").
 */
import { View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

function tipos(cores, escuro) {
  return {
    verde: { fundo: cores.sucessoFundo, cor: cores.sucessoTexto },
    ambar: escuro ? { fundo: '#422006', cor: '#FDE68A' } : { fundo: '#FEF9C3', cor: '#A16207' },
    cinza: { fundo: cores.cinzaClaro, cor: cores.textoMedio },
    azul: { fundo: cores.infoFundo, cor: cores.infoTexto },
    vermelho: { fundo: cores.perigoFundo, cor: cores.perigoTexto },
  };
}

export function Selo({ icone, texto, tipo = 'cinza' }) {
  const styles = useStyles();
  const { cores, escuro } = useTema();
  const lista = tipos(cores, escuro);
  const visual = lista[tipo] ?? lista.cinza;
  return (
    <View style={[styles.selo, { backgroundColor: visual.fundo }]}>
      {icone ? <Icone nome={icone} cor={visual.cor} tamanho={14} /> : null}
      <Label style={[styles.texto, { color: visual.cor }]}>{texto}</Label>
    </View>
  );
}

const useStyles = criarEstilos(() => ({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espacamentos.sm + 4,
    paddingVertical: 5,
    borderRadius: raios.pilula,
  },
  texto: { fontSize: 13, fontWeight: '600' },
}));
