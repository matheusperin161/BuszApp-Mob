/**
 * MOLECULE — HorarioItem
 * Um horário do "Escolha seu horário" do painel do site:
 * hora grande, "Ônibus 403" e o selo do período (Manhã / Tarde / Noite).
 * Selecionado = borda âmbar.
 */
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

const PERIODOS = {
  'Manhã': { fundo: '#FEF3C7', cor: '#B45309' },
  Tarde: { fundo: '#FFEDD5', cor: '#C2410C' },
  Noite: { fundo: '#EDE9FE', cor: '#6D28D9' },
};

export const HorarioItem = memo(function HorarioItem({ horario, selecionado, onPress, desabilitado = false }) {
  const periodo = PERIODOS[horario.period] ?? PERIODOS['Manhã'];
  return (
    <Pressable
      onPress={() => onPress(horario)}
      disabled={desabilitado}
      accessibilityRole="button"
      accessibilityLabel={`Horário ${horario.departure_time}, ônibus ${horario.bus_number}`}
      accessibilityState={{ selected: selecionado, disabled: desabilitado }}
      style={({ pressed }) => [
        styles.item,
        selecionado && styles.selecionado,
        pressed && styles.pressionado,
        desabilitado && styles.inativo,
      ]}>
      <View style={styles.textos}>
        <Label style={styles.hora}>{horario.departure_time}</Label>
        <Label style={styles.onibus}>Ônibus {horario.bus_number}</Label>
      </View>
      <View style={[styles.periodo, { backgroundColor: periodo.fundo }]}>
        <Label style={[styles.periodoTexto, { color: periodo.cor }]}>{horario.period || '—'}</Label>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.bordaNeutra,
    borderRadius: raios.lg,
    paddingHorizontal: espacamentos.md + 2,
    paddingVertical: espacamentos.md,
    marginBottom: espacamentos.sm + 2,
  },
  selecionado: { borderColor: cores.primaria, backgroundColor: cores.fundo },
  pressionado: { opacity: 0.85 },
  inativo: { opacity: 0.5 },
  textos: { flex: 1 },
  hora: { fontSize: 22, fontWeight: '800', color: cores.texto },
  onibus: { color: cores.textoSecundario, marginTop: 2, fontSize: 15 },
  periodo: { borderRadius: raios.pilula, paddingHorizontal: espacamentos.md, paddingVertical: 6 },
  periodoTexto: { fontWeight: '700', fontSize: 14 },
});
