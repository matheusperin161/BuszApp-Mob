/**
 * MOLECULE — LinhaItem
 * Card de uma linha, igual à lista "Linhas Disponíveis" do site:
 * círculo colorido com o número, nome, "Centro → Efapi" e a setinha âmbar.
 */
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { cores, espacamentos, raios, sombra } from '../../theme';
import { dinheiro } from '../../utils/formato';

// mesmas cores que o site sorteia para as linhas
const CORES_LINHA = ['#F59E0B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#EC4899', '#14B8A6', '#F97316'];

export function corDaLinha(numero) {
  const texto = String(numero ?? '');
  let soma = 0;
  for (const c of texto) soma += c.charCodeAt(0);
  return CORES_LINHA[soma % CORES_LINHA.length];
}

export const LinhaItem = memo(function LinhaItem({ linha, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(linha)}
      accessibilityRole="button"
      accessibilityLabel={`Linha ${linha.numero}, ${linha.nome}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressionado]}>
      <View style={[styles.numero, { backgroundColor: corDaLinha(linha.numero) }]}>
        <Label style={styles.numeroTexto} adjustsFontSizeToFit numberOfLines={1}>
          {linha.numero}
        </Label>
      </View>
      <View style={styles.textos}>
        <Label variante="subtitulo" numberOfLines={1}>
          {linha.nome}
        </Label>
        {linha.origem && linha.destino ? (
          <Label variante="legenda" numberOfLines={1} style={styles.trajeto}>
            {linha.origem} → {linha.destino}
          </Label>
        ) : null}
        {linha.tarifa != null || linha.paradas?.length ? (
          <Label variante="legenda" style={styles.extra}>
            {linha.tarifa != null ? `Tarifa ${dinheiro(linha.tarifa)}` : ''}
            {linha.tarifa != null && linha.paradas?.length ? ' · ' : ''}
            {linha.paradas?.length ? `${linha.paradas.length} paradas` : ''}
          </Label>
        ) : null}
      </View>
      <Icone nome="chevron-right" cor={cores.primaria} tamanho={22} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    paddingVertical: espacamentos.md + 2,
    paddingHorizontal: espacamentos.md + 2,
    marginBottom: espacamentos.md,
    gap: espacamentos.md,
    ...sombra,
  },
  pressionado: { opacity: 0.85 },
  numero: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  numeroTexto: { fontSize: 17, fontWeight: '800', color: '#FFFFFF' },
  textos: { flex: 1 },
  trajeto: { fontSize: 14, marginTop: 1 },
  extra: { marginTop: 2, color: cores.primariaTexto, fontWeight: '600', fontSize: 12 },
});
