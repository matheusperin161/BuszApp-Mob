/**
 * SCREEN — MeuQrScreen (passageiro)
 * QR Code de embarque: o motorista lê com a câmera e a passagem sai do saldo.
 * O código é assinado pelo servidor, vale 3 minutos e só passa uma vez;
 * quando vence, o app gera outro sozinho.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { Card } from '../components/molecules/Card';
import { EstadoCarga } from '../components/molecules/EstadoCarga';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { gerarQrEmbarque } from '../services/cartao';
import { espacamentos, raios } from '../theme';
import { criarEstilos, useTema } from '../theme/tema';
import { dinheiro } from '../utils/formato';

function segundosRestantes(expiraEm) {
  if (!expiraEm) return 0;
  const iso = /Z|[+-]\d\d:?\d\d$/.test(expiraEm) ? expiraEm : `${expiraEm}Z`;
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 1000));
}

export function MeuQrScreen({ navigation }) {
  const styles = useStyles();
  const { cores } = useTema();
  const [qr, setQr] = useState(null);
  const [restante, setRestante] = useState(0);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const pedindo = useRef(false);

  const gerar = useCallback(async () => {
    if (pedindo.current) return;
    pedindo.current = true;
    setCarregando(true);
    setErro(null);
    try {
      const novo = await gerarQrEmbarque();
      setQr(novo);
      setRestante(segundosRestantes(novo.expira_em));
    } catch (e) {
      setErro(e.message);
    } finally {
      pedindo.current = false;
      setCarregando(false);
    }
  }, []);

  // gera ao abrir a tela (e de novo ao voltar para ela)
  useFocusEffect(
    useCallback(() => {
      gerar();
    }, [gerar]),
  );

  // contagem regressiva; venceu → gera outro
  useEffect(() => {
    if (!qr) return undefined;
    const timer = setInterval(() => {
      const s = segundosRestantes(qr.expira_em);
      setRestante(s);
      if (s <= 0) gerar();
    }, 1000);
    return () => clearInterval(timer);
  }, [qr, gerar]);

  const semCartao = erro && /cartão/i.test(erro);
  const minutos = Math.floor(restante / 60);
  const segundos = String(restante % 60).padStart(2, '0');

  return (
    <ScreenTemplate cabecalho={{ titulo: 'Embarque por QR', subtitulo: 'Mostre para o motorista', voltar: true }}>
      {semCartao ? (
        <>
          <AvisoBox tipo="alerta" mensagem={erro} />
          <Button title="Cadastrar cartão" icone="plus-circle" onPress={() => navigation.navigate('CadastroCartao')} />
        </>
      ) : !qr ? (
        <View style={styles.estado}>
          <EstadoCarga carregando={carregando} erro={erro} onTentarDeNovo={gerar} />
        </View>
      ) : (
        <>
          <Card style={styles.card}>
            <View style={styles.quadro} accessible accessibilityLabel="QR Code de embarque. Mostre para o motorista.">
              <QRCode value={qr.token} size={240} color="#111827" backgroundColor="#FFFFFF" ecl="M" />
            </View>
            <Label style={styles.validade}>
              {carregando ? 'Gerando novo código…' : `Vale por ${minutos}:${segundos}`}
            </Label>
            <View style={styles.barra}>
              <View
                style={[
                  styles.barraCheia,
                  { width: `${Math.round((restante / (qr.validade_s || 180)) * 100)}%`, backgroundColor: cores.primaria },
                ]}
              />
            </View>
            <Label variante="legenda" style={styles.saldo}>
              Saldo: {dinheiro(qr.saldo)}
            </Label>
          </Card>
          <AvisoBox
            tipo="info"
            mensagem="Cada código passa uma vez só. Se der erro, toque em gerar outro. Aumente o brilho da tela para o motorista ler mais rápido."
          />
          <Button title="Gerar outro código" icone="refresh-cw" variante="secundario" onPress={gerar} carregando={carregando} />
        </>
      )}
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  estado: { minHeight: 300 },
  card: { alignItems: 'center', paddingVertical: espacamentos.lg },
  quadro: { padding: 16, borderRadius: raios.lg, backgroundColor: '#FFFFFF' },
  validade: { marginTop: espacamentos.md, fontWeight: '800', fontSize: 18, color: cores.texto },
  barra: {
    width: '80%',
    height: 6,
    borderRadius: 3,
    backgroundColor: cores.cinzaClaro,
    marginTop: espacamentos.sm,
    overflow: 'hidden',
  },
  barraCheia: { height: 6, borderRadius: 3 },
  saldo: { marginTop: espacamentos.sm },
}));
