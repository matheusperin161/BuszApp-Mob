/**
 * MOLECULE — Selo
 * Pílula pequena com ícone ("✓ Verificado", "Usuário", "Membro desde...").
 */
import { StyleSheet, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

const TIPOS = {
  verde: { fundo: cores.sucessoFundo, cor: cores.sucessoTexto },
  ambar: { fundo: '#FEF9C3', cor: '#A16207' },
  cinza: { fundo: cores.cinzaClaro, cor: cores.textoMedio },
  azul: { fundo: cores.infoFundo, cor: cores.infoTexto },
  vermelho: { fundo: cores.perigoFundo, cor: cores.perigoTexto },
};

export function Selo({ icone, texto, tipo = 'cinza' }) {
  const visual = TIPOS[tipo] ?? TIPOS.cinza;
  return (
    <View style={[styles.selo, { backgroundColor: visual.fundo }]}>
      {icone ? <Icone nome={icone} cor={visual.cor} tamanho={14} /> : null}
      <Label style={[styles.texto, { color: visual.cor }]}>{texto}</Label>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: espacamentos.sm + 4,
    paddingVertical: 5,
    borderRadius: raios.pilula,
  },
  texto: { fontSize: 13, fontWeight: '600' },
});
