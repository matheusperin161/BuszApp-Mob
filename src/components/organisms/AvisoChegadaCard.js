/**
 * ORGANISM — AvisoChegadaCard
 * "Avisar quando chegar": o passageiro escolhe a parada e a antecedência;
 * o app notifica quando o ônibus estiver perto (services/avisoChegada).
 * Com o aviso ligado para esta linha, mostra quanto falta e o botão de cancelar.
 */
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../atoms/Button';
import { Label } from '../atoms/Label';
import { AvisoBox } from '../molecules/AvisoBox';
import { Card } from '../molecules/Card';
import { ChipGrupo } from '../molecules/ChipGrupo';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { SeletorBusca } from '../molecules/SeletorBusca';
import { useToast } from './Toast';
import { ANTECEDENCIAS, assinarAviso, avisoSalvo, iniciarAviso, pararAviso } from '../../services/avisoChegada';
import { espacamentos } from '../../theme';
import { criarEstilos } from '../../theme/tema';

export function AvisoChegadaCard({ linha, paradas }) {
  const styles = useStyles();
  const toast = useToast();
  const [estado, setEstado] = useState(null);
  const [salvo, setSalvo] = useState(null);
  const [parada, setParada] = useState(null);
  const [minutos, setMinutos] = useState(5);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => assinarAviso(setEstado), []);
  useEffect(() => {
    avisoSalvo().then(setSalvo);
  }, [estado?.ativo]);

  const alvo = estado?.alvo ?? salvo;
  const ligadoAqui = Boolean(alvo) && String(alvo.linha.numero) === String(linha.numero);
  const ligadoOutra = Boolean(alvo) && !ligadoAqui;

  async function ativar() {
    const escolhida = paradas.find(p => p.name === parada);
    if (!escolhida) {
      setErro('Escolha a parada onde você vai embarcar.');
      return;
    }
    setOcupado(true);
    setErro(null);
    try {
      await iniciarAviso({ linha, parada: escolhida, paradas, minutos });
      toast.mostrar(`Vamos avisar ${minutos} min antes do ônibus chegar`);
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  async function cancelar() {
    setOcupado(true);
    await pararAviso();
    setSalvo(null);
    setOcupado(false);
    toast.mostrar('Aviso cancelado', 'info');
  }

  if (ligadoAqui) {
    const ultimo = estado?.ultimo;
    return (
      <Card titulo="Aviso de chegada ligado" icone="bell">
        <AvisoBox
          tipo="sucesso"
          mensagem={`Parada ${alvo.parada.name} · aviso ${alvo.minutos} min antes. Pode fechar o app.`}
        />
        <Label variante="legenda" style={styles.situacao}>
          {ultimo
            ? `Próximo ônibus a ~${Math.max(1, Math.round(ultimo.minutos))} min da sua parada.`
            : 'Esperando um ônibus da linha vir na direção da sua parada.'}
        </Label>
        <Button title="Cancelar aviso" icone="x" variante="secundario" onPress={cancelar} carregando={ocupado} />
      </Card>
    );
  }

  return (
    <Card titulo="Avisar quando chegar" icone="bell">
      <Label variante="legenda" style={styles.explica}>
        Escolha sua parada e receba uma notificação quando o ônibus estiver perto — mesmo com o app fechado.
      </Label>
      {ligadoOutra ? (
        <AvisoBox
          tipo="info"
          mensagem={`Você já tem um aviso na linha ${alvo.linha.numero}. Ligar este cancela o outro.`}
        />
      ) : null}
      <SeletorBusca
        label="Minha parada"
        titulo="Onde você vai embarcar?"
        placeholder="Escolha a parada"
        opcoes={paradas.map((p, i) => ({ id: p.name, marcador: String(i + 1), rotulo: p.name }))}
        valor={parada}
        onChange={v => {
          setParada(v);
          setErro(null);
        }}
        marcadorNoCampo={false}
      />
      <View style={styles.espaco} />
      <ChipGrupo label="Avisar com antecedência de" opcoes={ANTECEDENCIAS} valor={minutos} onChange={setMinutos} horizontal />
      <ErrorMessage mensagem={erro} />
      <Button title="Ativar aviso" icone="bell" onPress={ativar} carregando={ocupado} style={styles.botao} />
    </Card>
  );
}

const useStyles = criarEstilos(() => ({
  explica: { marginBottom: espacamentos.md },
  situacao: { marginVertical: espacamentos.md },
  espaco: { height: espacamentos.sm },
  botao: { marginTop: espacamentos.md, marginBottom: 0 },
}));
