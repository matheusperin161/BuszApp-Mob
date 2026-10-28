/**
 * SCREEN — AssociateStopScreen
 * Associa uma parada existente à linha, com sentido e ordem sequencial (CA05.2).
 * Ordem repetida no mesmo par linha/sentido é recusada pelo servidor (CA05.3).
 */
import { useEffect, useState } from 'react';

import Button from '../components/atoms/Button';
import ErrorMessage from '../components/molecules/ErrorMessage';
import EstadoCarga from '../components/molecules/EstadoCarga';
import FormField from '../components/molecules/FormField';
import OptionChips from '../components/molecules/OptionChips';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { associarParada, listarParadas, paradasDaLinha } from '../services/paradas';
import { somenteDigitos } from '../utils/validacao';

export default function AssociateStopScreen({ navigation, route }) {
  const { linhaId, sentido } = route.params;
  const [opcoes, setOpcoes] = useState(null);
  const [erroOpcoes, setErroOpcoes] = useState(null);
  const [paradaId, setParadaId] = useState(null);
  const [ordem, setOrdem] = useState('');
  const [tempo, setTempo] = useState('');
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregarOpcoes = async () => {
    setErroOpcoes(null);
    try {
      const [todas, jaAssociadas] = await Promise.all([
        listarParadas({ status: 'ativa' }),
        paradasDaLinha(linhaId, sentido),
      ]);
      const idsAssociados = new Set(jaAssociadas.map((a) => a.parada.id));
      setOpcoes(todas.filter((p) => !idsAssociados.has(p.id)));
    } catch (e) {
      setErroOpcoes(e.message);
    }
  };

  useEffect(() => {
    carregarOpcoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validar = () => {
    const e = {
      paradaId: paradaId ? null : 'Selecione uma parada',
      ordem: ordem ? null : 'Ordem é obrigatória',
    };
    setErros(e);
    return !Object.values(e).some(Boolean);
  };

  const salvar = async () => {
    if (!validar()) return;
    setErroGeral(null);
    setSalvando(true);
    try {
      await associarParada(linhaId, {
        parada_id: paradaId,
        sentido,
        ordem: Number(ordem),
        tempo_estimado_minutos: tempo ? Number(tempo) : null,
      });
      navigation.goBack();
    } catch (erro) {
      setErroGeral(erro.message);
      setSalvando(false);
    }
  };

  if (!opcoes) {
    return (
      <ScreenTemplate titulo="Associar parada">
        <EstadoCarga carregando={!erroOpcoes} erro={erroOpcoes} aoTentarDeNovo={carregarOpcoes} />
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate titulo="Associar parada" subtitulo={`Sentido: ${sentido === 'ida' ? 'ida' : 'volta'}`}>
      <ErrorMessage mensagem={erroGeral} />
      <FormField rotulo="Parada" obrigatorio erro={erros.paradaId}>
        <OptionChips
          opcoes={opcoes.map((p) => ({ valor: p.id, rotulo: p.nome }))}
          valor={paradaId}
          aoMudar={setParadaId}
        />
      </FormField>
      <FormField
        rotulo="Ordem"
        obrigatorio
        value={ordem}
        onChangeText={(t) => setOrdem(somenteDigitos(t))}
        erro={erros.ordem}
        keyboardType="number-pad"
      />
      <FormField
        rotulo="Tempo estimado até a próxima (min)"
        value={tempo}
        onChangeText={(t) => setTempo(somenteDigitos(t))}
        keyboardType="number-pad"
      />
      <Button titulo="Associar" onPress={salvar} carregando={salvando} />
    </ScreenTemplate>
  );
}
