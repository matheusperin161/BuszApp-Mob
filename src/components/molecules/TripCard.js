/**
 * MOLECULE — TripCard
 * Ônibus em viagem: próxima parada e estimativa de chegada (CA08.6).
 */
import { StyleSheet, View } from 'react-native';

import Badge from '../atoms/Badge';
import Label from '../atoms/Label';
import { cores, espacos, raios } from '../../theme';
import { distancia, hora, minutos } from '../../utils/formatacao';

export default function TripCard({ viagem, mostrarLinha = false }) {
  const { linha, veiculo, motorista, sentido, ultima_posicao: posicao, proxima_parada: proxima } = viagem;
  return (
    <View style={styles.card}>
      <View style={styles.topo}>
        <Label variante="subtitulo" style={styles.titulo}>
          {mostrarLinha ? `Linha ${linha?.numero} · ` : ''}
          {veiculo?.plate}
        </Label>
        <Badge texto={sentido === 'ida' ? 'Ida' : 'Volta'} tom="info" />
      </View>
      {mostrarLinha && motorista ? <Label variante="legenda">Motorista: {motorista.nome}</Label> : null}
      {proxima ? (
        <>
          <Label>
            Próxima parada: <Label style={styles.negrito}>{proxima.name}</Label>
          </Label>
          <Label>
            Chega em <Label style={styles.negrito}>{minutos(proxima.eta_min)}</Label> (~{hora(proxima.chegada_estimada)}) ·{' '}
            {distancia(proxima.distancia_m)}
          </Label>
        </>
      ) : (
        <Label variante="legenda">{posicao ? 'Linha sem paradas cadastradas.' : 'Aguardando a primeira posição…'}</Label>
      )}
      {posicao ? <Label variante="legenda">Posição de {hora(posicao.registrado_em)}</Label> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: espacos.md,
    marginTop: espacos.sm,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    gap: 2,
  },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espacos.sm },
  titulo: { flex: 1 },
  negrito: { fontWeight: '700' },
});
