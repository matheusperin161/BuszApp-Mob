/**
 * ORGANISM — EscalaCard
 * "Minha escala": os turnos do motorista nos próximos 7 dias, definidos pelo admin.
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Label } from '../atoms/Label';
import { Card } from '../molecules/Card';
import { minhaEscala } from '../../services/motorista';
import { espacamentos, raios } from '../../theme';
import { criarEstilos } from '../../theme/tema';
import { rotuloDoDia } from '../../utils/formato';

export function EscalaCard() {
  const styles = useStyles();
  const [itens, setItens] = useState(null);

  useEffect(() => {
    minhaEscala(7)
      .then(setItens)
      .catch(() => setItens([]));
  }, []);

  if (!itens) return null;

  return (
    <Card titulo="Minha escala" icone="calendar">
      {itens.length ? (
        itens.map((e, i) => (
          <View key={e.id} style={[styles.item, i > 0 && styles.divisor]}>
            <View style={styles.dia}>
              <Label style={styles.diaTexto}>{rotuloDoDia(e.data)}</Label>
            </View>
            <View style={styles.flex}>
              <Label style={styles.horario}>
                {e.inicio} – {e.fim}
              </Label>
              <Label variante="legenda" numberOfLines={2}>
                {[e.linha ? `Linha ${e.linha}` : 'Linha a definir', e.observacao].filter(Boolean).join(' · ')}
              </Label>
            </View>
          </View>
        ))
      ) : (
        <Label variante="legenda">Nenhum turno marcado para os próximos 7 dias.</Label>
      )}
    </Card>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  item: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.md, paddingVertical: espacamentos.sm + 2 },
  divisor: { borderTopWidth: 1, borderTopColor: cores.cinzaClaro },
  dia: {
    minWidth: 64,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: raios.md,
    backgroundColor: cores.superficieAlt,
    alignItems: 'center',
  },
  diaTexto: { fontWeight: '800', fontSize: 13, color: cores.primariaTexto },
  flex: { flex: 1 },
  horario: { fontWeight: '700', fontSize: 16 },
}));
