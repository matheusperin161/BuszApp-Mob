/**
 * MOLECULE — ForcaSenha
 * Quatro barrinhas abaixo do campo de senha do cadastro (igual ao site).
 */
import { View } from 'react-native';

import { Label } from '../atoms/Label';
import { espacamentos } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';
import { forcaSenha } from '../../utils/validacao';

const NIVEIS = [
  { cor: null, texto: '' },
  { cor: '#EF4444', texto: 'Fraca' },
  { cor: '#F97316', texto: 'Razoável' },
  { cor: '#EAB308', texto: 'Boa' },
  { cor: '#22C55E', texto: 'Forte' },
];

export function ForcaSenha({ senha }) {
  const styles = useStyles();
  const { cores } = useTema();
  const nivel = forcaSenha(senha);
  return (
    <View style={styles.container}>
      <View style={styles.barras}>
        {[1, 2, 3, 4].map(n => (
          <View
            key={n}
            style={[styles.barra, { backgroundColor: n <= nivel ? NIVEIS[nivel].cor : cores.bordaNeutra }]}
          />
        ))}
      </View>
      {nivel ? (
        <Label variante="legenda" style={{ color: NIVEIS[nivel].cor }}>
          Senha {NIVEIS[nivel].texto.toLowerCase()}
        </Label>
      ) : null}
    </View>
  );
}

const useStyles = criarEstilos(() => ({
  container: { marginTop: -espacamentos.sm, marginBottom: espacamentos.md },
  barras: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  barra: { flex: 1, height: 4, borderRadius: 2 },
}));
