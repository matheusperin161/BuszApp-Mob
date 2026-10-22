/**
 * SCREEN — AdminTripsScreen
 * Todas as viagens em andamento em um único mapa (CA08.10).
 * Equivalente web: mapa do static/admin.html
 */
import Label from '../components/atoms/Label';
import EstadoCarga from '../components/molecules/EstadoCarga';
import TripCard from '../components/molecules/TripCard';
import BusMap from '../components/organisms/BusMap';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { useAtualizacaoPeriodica } from '../hooks/useAtualizacaoPeriodica';
import { viagensEmAndamento } from '../services/admin';
import { INTERVALO_ATUALIZACAO_MAPA_MS } from '../services/config';
import { hora } from '../utils/formatacao';

export default function AdminTripsScreen() {
  const { dados: viagens, erro, atualizadoEm, atualizar } = useAtualizacaoPeriodica(
    viagensEmAndamento,
    INTERVALO_ATUALIZACAO_MAPA_MS,
  );

  return (
    <ScreenTemplate
      titulo={viagens ? `${viagens.length} viagem(ns) em andamento` : 'Viagens em andamento'}
      subtitulo={atualizadoEm ? `Atualizado às ${hora(atualizadoEm.toISOString())}` : undefined}
    >
      <BusMap viagens={viagens ?? []} />
      <EstadoCarga
        carregando={!viagens && !erro}
        erro={erro}
        vazio={viagens?.length === 0}
        mensagemVazia="Nenhuma viagem em andamento agora."
        aoTentarDeNovo={atualizar}
      />
      {viagens?.some((v) => !v.ultima_posicao) ? (
        <Label variante="legenda">Viagens sem posição ainda não aparecem no mapa.</Label>
      ) : null}
      {viagens?.map((v) => <TripCard key={v.id} viagem={v} mostrarLinha />)}
    </ScreenTemplate>
  );
}
