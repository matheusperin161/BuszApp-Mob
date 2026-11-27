/**
 * SCREEN — EmbarqueScreen (motorista)
 * Lê o QR Code do passageiro com a câmera e cobra a tarifa da linha do trajeto.
 * Resultado grande e colorido (verde = liberado, vermelho = recusado) e, depois
 * de 2,5 s, volta a ler o próximo.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Vibration, View } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';

import { Button } from '../components/atoms/Button';
import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { cobrarPorQr } from '../services/motorista';
import { pedirCameraAndroid } from '../services/nativos';
import { espacamentos, raios } from '../theme';
import { criarEstilos, useTema } from '../theme/tema';
import { dinheiro } from '../utils/formato';

const PAUSA_MS = 2500;

export function EmbarqueScreen() {
  const styles = useStyles();
  const { cores } = useTema();
  const [permitido, setPermitido] = useState(Platform.OS !== 'android' ? true : null);
  const [resultado, setResultado] = useState(null);
  const [embarques, setEmbarques] = useState({ quantidade: 0, total: 0 });
  const ocupado = useRef(false);
  const timer = useRef(null);

  const pedirPermissao = useCallback(() => {
    pedirCameraAndroid('A câmera lê o QR Code do passageiro para cobrar a passagem.').then(setPermitido);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'android') pedirPermissao();
    return () => clearTimeout(timer.current);
  }, [pedirPermissao]);

  const lido = useCallback(async evento => {
    const token = evento?.nativeEvent?.codeStringValue;
    if (!token || ocupado.current) return;
    ocupado.current = true;
    try {
      const r = await cobrarPorQr(token);
      Vibration.vibrate(80);
      setResultado({ ok: true, ...r });
      setEmbarques(e => ({ quantidade: e.quantidade + 1, total: e.total + (r.valor || 0) }));
    } catch (e) {
      Vibration.vibrate([0, 120, 80, 120]);
      setResultado({ ok: false, mensagem: e.message, passageiro: e.dados?.passageiro });
    }
    timer.current = setTimeout(() => {
      setResultado(null);
      ocupado.current = false;
    }, PAUSA_MS);
  }, []);

  return (
    <ScreenTemplate
      cabecalho={{
        titulo: 'Cobrar passagem',
        subtitulo: `${embarques.quantidade} embarques · ${dinheiro(embarques.total)}`,
        voltar: true,
      }}>
      {permitido === false ? (
        <>
          <AvisoBox tipo="alerta" mensagem="Permita a câmera para ler o QR Code dos passageiros." />
          <Button title="Permitir câmera" icone="camera" onPress={pedirPermissao} />
        </>
      ) : (
        <View style={styles.cameraCaixa}>
          {permitido ? (
            <Camera
              style={styles.camera}
              cameraType={CameraType.Back}
              scanBarcode={!resultado}
              allowedBarcodeTypes={['qr']}
              showFrame
              laserColor={cores.primaria}
              frameColor="#FFFFFF"
              onReadCode={lido}
            />
          ) : null}
          {resultado ? (
            <View
              style={[styles.resultado, { backgroundColor: resultado.ok ? cores.sucesso : cores.perigo }]}
              accessibilityLiveRegion="assertive">
              <Icone nome={resultado.ok ? 'check-circle' : 'x'} cor="#FFFFFF" tamanho={64} />
              <Label style={styles.resultadoTitulo}>{resultado.ok ? 'Embarque liberado' : 'Recusado'}</Label>
              {resultado.passageiro ? <Label style={styles.resultadoTexto}>{resultado.passageiro}</Label> : null}
              <Label style={styles.resultadoTexto}>
                {resultado.ok
                  ? `${dinheiro(resultado.valor)} cobrado · saldo ${dinheiro(resultado.saldo)}`
                  : resultado.mensagem}
              </Label>
            </View>
          ) : null}
        </View>
      )}
      <Label variante="legenda" style={styles.dica}>
        Aponte para o QR Code na tela do passageiro. A tarifa é a da linha do trajeto em andamento.
      </Label>
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  cameraCaixa: {
    height: 440,
    borderRadius: raios.xl,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginBottom: espacamentos.md,
  },
  camera: { flex: 1 },
  resultado: {
    ...{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    alignItems: 'center',
    justifyContent: 'center',
    padding: espacamentos.lg,
    gap: espacamentos.sm,
  },
  resultadoTitulo: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  resultadoTexto: { color: '#FFFFFF', fontSize: 17, textAlign: 'center' },
  dica: { textAlign: 'center', color: cores.textoSecundario },
}));
