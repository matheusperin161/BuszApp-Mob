/**
 * MOLECULE — CartaoTransporte
 * O cartão azul da tela Recarga do site: tipo, chip dourado, número mascarado,
 * saldo e titular. Sem cartão, mostra o convite para cadastrar.
 */
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Gradiente } from '../atoms/Gradiente';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { rotuloTipoCartao } from '../../constants/cartao';
import { espacamentos, gradientes, raios } from '../../theme';
import { dinheiro, mascararCartao } from '../../utils/formato';

export function CartaoTransporte({ cartao, carregando = false }) {
  const temCartao = Boolean(cartao?.card_number);
  const titular = (cartao?.card_holder || '').split(' ')[0]?.toUpperCase();

  return (
    <View style={styles.cartao}>
      <Gradiente {...gradientes.cartaoAzul} />
      <View style={[styles.circulo, styles.circuloA]} />
      <View style={[styles.circulo, styles.circuloB]} />

      <View style={styles.topo}>
        <View style={styles.flex}>
          <Label style={styles.rotulo}>CARTÃO DE TRANSPORTE</Label>
          <Label style={styles.tipo} numberOfLines={1}>
            {temCartao ? rotuloTipoCartao(cartao.card_type) : 'Nenhum cartão'}
          </Label>
        </View>
        <View style={styles.direita}>
          <Label style={styles.rotulo}>SALDO</Label>
          {carregando && !cartao ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Label style={styles.saldo}>{dinheiro(cartao?.card_balance)}</Label>
          )}
        </View>
      </View>

      <View style={styles.chip}>
        <View style={styles.chipMiolo} />
      </View>

      <View style={styles.rodape}>
        <View style={styles.flex}>
          <Label style={styles.rotuloFraco}>Número do Cartão</Label>
          {temCartao ? (
            <Label style={styles.numero} numberOfLines={1} adjustsFontSizeToFit>
              {mascararCartao(cartao.card_number)}
            </Label>
          ) : (
            <View style={styles.convite}>
              <Icone nome="plus-circle" cor="#FFFFFF" tamanho={16} />
              <Label style={styles.conviteTexto}>Cadastre seu cartão abaixo</Label>
            </View>
          )}
        </View>
        {titular ? (
          <View style={styles.direita}>
            <Label style={styles.rotuloFraco}>Titular</Label>
            <Label style={styles.titular}>{titular}</Label>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartao: {
    borderRadius: raios.xl + 4,
    padding: espacamentos.lg + 4,
    marginBottom: espacamentos.lg,
    overflow: 'hidden',
    minHeight: 220,
    backgroundColor: '#3B82F6',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 7,
  },
  circulo: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.08)' },
  circuloA: { width: 200, height: 200, borderRadius: 100, right: -40, top: -70 },
  circuloB: { width: 200, height: 200, borderRadius: 100, left: -70, bottom: -110 },
  topo: { flexDirection: 'row', justifyContent: 'space-between', gap: espacamentos.md },
  flex: { flex: 1 },
  direita: { alignItems: 'flex-end' },
  rotulo: { color: 'rgba(255,255,255,0.85)', fontSize: 11, letterSpacing: 2, fontWeight: '600' },
  rotuloFraco: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  tipo: { color: '#FFFFFF', fontSize: 19, fontWeight: '800', marginTop: 4 },
  saldo: { color: '#FFFFFF', fontSize: 24, fontWeight: '800', marginTop: 2 },
  chip: {
    width: 44,
    height: 34,
    borderRadius: 7,
    backgroundColor: '#FDE68A',
    marginTop: espacamentos.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipMiolo: { width: 22, height: 18, borderRadius: 3, borderWidth: 1.5, borderColor: '#D4A72C' },
  rodape: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: espacamentos.lg,
    gap: espacamentos.md,
  },
  numero: { color: '#FFFFFF', fontSize: 18, letterSpacing: 2, marginTop: 4, fontWeight: '600' },
  convite: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  conviteTexto: { color: '#FFFFFF', fontWeight: '600' },
  titular: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, marginTop: 2 },
});
