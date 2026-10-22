/**
 * SCREEN — TrackingScreen
 * Acompanhar ônibus da linha em tempo real.
 * Equivalente web: static/acompanhamento.html
 *
 * CA08.5 veículos com viagem em andamento na linha · CA08.6 próxima parada e ETA
 */
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import Label from '../components/atoms/Label';
import EstadoCarga from '../components/molecules/EstadoCarga';
import FormField from '../components/molecules/FormField';
import OptionChips from '../components/molecules/OptionChips';
import TripCard from '../components/molecules/TripCard';
import BusMap from '../components/organisms/BusMap';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { useAtualizacaoPeriodica } from '../hooks/useAtualizacaoPeriodica';
import { INTERVALO_ATUALIZACAO_MAPA_MS } from '../services/config';
import { listarLinhas, viagensDaLinha } from '../services/rastreamento';
import { espacos } from '../theme';

export default function TrackingScreen() {
  const [linhas, setLinhas] = useState(null);
  const [erroLinhas, setErroLinhas] = useState(null);
  const [linhaId, setLinhaId] = useState(null);

  const carregarLinhas = async () => {
    setErroLinhas(null);
    try {
      const lista = await listarLinhas();
      setLinhas(lista);
      setLinhaId((atual) => atual ?? lista[0]?.id ?? null);
    } catch (erro) {
      setErroLinhas(erro.message);
    }
  };

  useEffect(() => {
    carregarLinhas();
  }, []);

  const { dados: viagens, erro } = useAtualizacaoPeriodica(
    () => (linhaId ? viagensDaLinha(linhaId) : Promise.resolve([])),
    INTERVALO_ATUALIZACAO_MAPA_MS,
    [linhaId],
  );

  if (!linhas) {
    return (
      <ScreenTemplate titulo="Acompanhar ônibus">
        <EstadoCarga carregando={!erroLinhas} erro={erroLinhas} aoTentarDeNovo={carregarLinhas} />
      </ScreenTemplate>
    );
  }

  const linha = linhas.find((l) => l.id === linhaId);
  return (
    <ScreenTemplate titulo="Acompanhar ônibus" subtitulo="Atualiza a cada 10 segundos">
      <FormField rotulo="Linha">
        <OptionChips
          opcoes={linhas.map((l) => ({ valor: l.id, rotulo: `${l.numero} — ${l.nome}` }))}
          valor={linhaId}
          aoMudar={setLinhaId}
        />
      </FormField>
      {linha ? (
        <>
          <BusMap paradas={linha.paradas} viagens={viagens ?? []} />
          <EstadoCarga
            carregando={!viagens && !erro}
            erro={erro}
            vazio={viagens?.length === 0}
            mensagemVazia="Nenhum ônibus em viagem nesta linha agora."
          />
          {viagens?.map((v) => <TripCard key={v.id} viagem={v} />)}
        </>
      ) : (
        <Label variante="legenda" style={styles.vazio}>
          Nenhuma linha ativa.
        </Label>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  vazio: { marginTop: espacos.lg },
});
