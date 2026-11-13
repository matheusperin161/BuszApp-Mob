/**
 * MOLECULE — SaldoCard
 * O cartão em degradê do topo da Home do site: "SALDO DO CARTÃO", valor grande,
 * "Atualizado agora" e a pílula com a saudação. Só desenha — quem busca é a screen.
 */
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Gradiente } from '../atoms/Gradiente';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { espacamentos, gradientes, raios, sombraForte } from '../../theme';
import { dinheiro } from '../../utils/formato';

export function SaldoCard({ saldo, carregando = false, saudacao, nome, rodape, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`Saldo do cartão ${dinheiro(saldo)}`}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressionado]}>
      <Gradiente {...gradientes.marca} />
      {/* círculos translúcidos decorativos, como no site */}
      <View style={[styles.circulo, styles.circuloGrande]} />
      <View style={[styles.circulo, styles.circuloMenor]} />
      <View style={[styles.circulo, styles.circuloBolinha]} />

      <View style={styles.rotulo}>
        <Icone nome="credit-card" cor="rgba(255,255,255,0.9)" tamanho={18} />
        <Label style={styles.rotuloTexto}>SALDO DO CARTÃO</Label>
      </View>

      {carregando && saldo == null ? (
        <ActivityIndicator color="#FFFFFF" size="large" style={styles.spinner} />
      ) : (
        <Label style={styles.saldo} adjustsFontSizeToFit numberOfLines={1}>
          {dinheiro(saldo)}
        </Label>
      )}
      <Label style={styles.atualizado}>{rodape ?? 'Atualizado agora'}</Label>

      {nome ? (
        <View style={styles.pilula}>
          <Icone nome="user" cor="#FFFFFF" tamanho={16} />
          <Label style={styles.pilulaTexto} numberOfLines={1}>
            {saudacao}, <Label style={styles.nome}>{nome}</Label>!
          </Label>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: raios.xl + 4,
    paddingHorizontal: espacamentos.xl,
    paddingVertical: espacamentos.xl,
    marginBottom: espacamentos.lg,
    overflow: 'hidden',
    backgroundColor: '#FB923C',
    ...sombraForte,
  },
  pressionado: { opacity: 0.94 },
  circulo: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.12)' },
  circuloGrande: { width: 220, height: 220, borderRadius: 110, right: -50, top: -80 },
  circuloMenor: { width: 140, height: 140, borderRadius: 70, left: -40, bottom: -60 },
  circuloBolinha: {
    width: 32,
    height: 32,
    borderRadius: 16,
    right: 32,
    top: 32,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  rotulo: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  rotuloTexto: { color: 'rgba(255,255,255,0.92)', letterSpacing: 2, fontSize: 12, fontWeight: '600' },
  saldo: { color: '#FFFFFF', fontSize: 46, fontWeight: '800', marginTop: espacamentos.sm },
  spinner: { alignSelf: 'flex-start', marginVertical: espacamentos.md },
  atualizado: { color: 'rgba(255,255,255,0.88)', fontSize: 13 },
  pilula: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: espacamentos.sm,
    marginTop: espacamentos.md,
    paddingHorizontal: espacamentos.md,
    paddingVertical: espacamentos.sm + 2,
    borderRadius: raios.md,
    backgroundColor: 'rgba(255,255,255,0.2)',
    maxWidth: '100%',
  },
  pilulaTexto: { color: '#FFFFFF', fontSize: 15, flexShrink: 1 },
  nome: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});
