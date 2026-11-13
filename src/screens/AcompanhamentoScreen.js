/**
 * SCREEN — AcompanhamentoScreen
 * Mapa da linha com os ônibus ao vivo, horários do dia e previsão de chegada.
 *
 * Duas fontes de posição (o backend tem as duas):
 *   - horário escolhido → /bus_location/:busId  (motorista usando o site)
 *   - viagens ativas    → /viagens/ativas        (motorista usando o app)
 * Atualiza a cada 5 s enquanto a tela está aberta (igual ao site).
 * Layout do site: quadro de status (STATUS, ÔNIBUS, PRÓXIMA PARADA, ETA),
 * mapa, horários e a lista de paradas.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '../components/atoms/Button';
import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { Card } from '../components/molecules/Card';
import { ChipGrupo } from '../components/molecules/ChipGrupo';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { InfoLinha } from '../components/molecules/InfoLinha';
import { MapaLinha } from '../components/organisms/MapaLinha';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { irParaAba } from '../navigation/acoes';
import { INTERVALO_RASTREIO_MS } from '../services/config';
import {
  listarHorarios,
  listarLinhasRastreio,
  paradasDaLinha,
  posicaoDoOnibus,
  viagensAtivas,
} from '../services/linhas';
import { obterPreferencias, salvarPreferencias } from '../services/preferencias';
import { cores, espacamentos } from '../theme';
import { distancia, hora } from '../utils/formato';

function minutosDoDia(hhmm) {
  const [h, m] = String(hhmm).split(':').map(Number);
  return h * 60 + m;
}

/** próximo horário a partir de agora (ou o primeiro, se já passaram todos) */
function proximoHorario(horarios) {
  if (!horarios.length) return null;
  const agora = new Date();
  const atual = agora.getHours() * 60 + agora.getMinutes();
  return horarios.find(h => minutosDoDia(h.departure_time) >= atual - 30) ?? horarios[0];
}

function textoEta(minutos) {
  if (minutos == null) return '—';
  if (minutos < 1) return 'Chegando';
  return `${Math.round(minutos)} min`;
}

export function AcompanhamentoScreen({ navigation, route }) {
  const linha = route.params?.linha;
  const [paradas, setParadas] = useState(linha?.paradas ?? []);
  const [rastreioId, setRastreioId] = useState(linha?.rastreioId ?? null);
  const [horarios, setHorarios] = useState([]);
  const [horarioId, setHorarioId] = useState(null);
  // horários com trajeto iniciado agora (motorista no app ou no site)
  const [ativos, setAtivos] = useState([]);
  const escolheuHorario = useRef(false);
  const [legado, setLegado] = useState(null);
  const [viagens, setViagens] = useState([]);
  const [automatico, setAutomatico] = useState(true);
  const [atualizadoEm, setAtualizadoEm] = useState(null);
  const [erro, setErro] = useState(null);
  const [atualizando, setAtualizando] = useState(false);
  const montado = useRef(true);

  // Carga inicial: paradas, horários e preferência de atualização automática
  useEffect(() => {
    montado.current = true;
    if (!linha) return undefined;

    async function iniciar() {
      try {
        const [rastreio, lista, prefs] = await Promise.all([
          listarLinhasRastreio().catch(() => []),
          listarHorarios(linha.numero),
          obterPreferencias(),
        ]);
        if (!montado.current) return;
        const daLinha = (rastreio || []).find(l => String(l.numero) === String(linha.numero));
        if (daLinha) {
          setRastreioId(daLinha.id);
        }
        if (daLinha?.paradas?.length) {
          setParadas(daLinha.paradas);
        } else {
          // paradas cadastradas no painel do site (as mesmas que o motorista usa)
          const doSite = await paradasDaLinha(linha.numero).catch(() => []);
          if (montado.current && doSite.length) setParadas(doSite);
        }
        const ordenados = [...(lista || [])].sort(
          (a, b) => minutosDoDia(a.departure_time) - minutosDoDia(b.departure_time),
        );
        setHorarios(ordenados);
        setHorarioId(proximoHorario(ordenados)?.id ?? null);
        setAutomatico(prefs.atualizacaoAutomatica);
        await salvarPreferencias({
          ultimaLinha: { numero: linha.numero, nome: linha.nome, tarifa: linha.tarifa },
        });
      } catch (e) {
        if (montado.current) setErro(e.message);
      }
    }

    iniciar();
    return () => {
      montado.current = false;
    };
  }, [linha]);

  // De tempos em tempos, descobre quais horários já têm o trajeto iniciado.
  // Se o passageiro ainda não escolheu um horário, pula para o que está rodando.
  useFocusEffect(
    useCallback(() => {
      if (!horarios.length) return undefined;
      let ativo = true;
      async function verificar() {
        const resultados = await Promise.all(
          horarios.map(h =>
            posicaoDoOnibus(h.bus_id)
              .then(r => (r?.trip_active ? h.id : null))
              .catch(() => null),
          ),
        );
        if (!ativo || !montado.current) return;
        const ids = resultados.filter(Boolean);
        setAtivos(atual => (atual.join() === ids.join() ? atual : ids));
        if (ids.length && !escolheuHorario.current) {
          setHorarioId(atual => (ids.includes(atual) ? atual : ids[0]));
        }
      }
      verificar();
      const timer = setInterval(verificar, 15000);
      return () => {
        ativo = false;
        clearInterval(timer);
      };
    }, [horarios]),
  );

  const horario = useMemo(
    () => horarios.find(h => h.id === horarioId) ?? null,
    [horarios, horarioId],
  );

  const atualizar = useCallback(async () => {
    setAtualizando(true);
    try {
      const [posicao, ativas] = await Promise.all([
        horario ? posicaoDoOnibus(horario.bus_id) : Promise.resolve(null),
        rastreioId ? viagensAtivas(rastreioId) : Promise.resolve([]),
      ]);
      if (!montado.current) return;
      setLegado(posicao);
      setViagens(ativas || []);
      setAtualizadoEm(new Date());
      setErro(null);
    } catch (e) {
      if (montado.current) setErro(e.message);
    } finally {
      if (montado.current) setAtualizando(false);
    }
  }, [horario, rastreioId]);

  // Polling só enquanto a tela está em foco
  useFocusEffect(
    useCallback(() => {
      atualizar();
      if (!automatico) return undefined;
      const timer = setInterval(atualizar, INTERVALO_RASTREIO_MS);
      return () => clearInterval(timer);
    }, [atualizar, automatico]),
  );

  const onibus = useMemo(() => {
    const lista = viagens
      .filter(v => v.ultima_posicao)
      .map(v => ({
        id: `v${v.id}`,
        latitude: v.ultima_posicao.latitude,
        longitude: v.ultima_posicao.longitude,
        titulo: `${v.veiculo?.plate ?? 'Ônibus'} · ${v.sentido}`,
      }));
    if (legado?.found && legado.trip_active && legado.data) {
      lista.push({
        id: `h${horario?.id}`,
        latitude: legado.data.latitude,
        longitude: legado.data.longitude,
        titulo: `Ônibus ${horario?.bus_number} (${horario?.departure_time})`,
        destaque: true,
      });
    }
    return lista;
  }, [viagens, legado, horario]);

  const cabecalho = {
    titulo: linha?.nome ?? 'Linha',
    subtitulo: linha
      ? `Linha ${linha.numero}${horario ? ` · Saída ${horario.departure_time}` : ''}`
      : undefined,
    voltar: true,
  };

  if (!linha) {
    return (
      <ScreenTemplate cabecalho={cabecalho}>
        <AvisoBox tipo="alerta" mensagem="Linha não encontrada." />
        <Button title="Ver linhas" icone="map-pin" onPress={() => irParaAba(navigation, 'Mapa')} />
      </ScreenTemplate>
    );
  }

  const emTrajeto = legado?.trip_active && legado?.found;
  const dadosLegado = legado?.data;
  // a viagem do app mais adiantada também alimenta o quadro de status
  const viagemApp = viagens.find(v => v.ultima_posicao) ?? null;
  const aoVivo = emTrajeto || Boolean(viagemApp);

  const status = emTrajeto
    ? 'Em trajeto'
    : legado?.trip_active
      ? 'Saiu · sem GPS'
      : viagemApp
        ? 'Em trajeto'
        : 'Aguardando';
  const onibusRotulo = emTrajeto
    ? horario?.bus_number
    : viagemApp
      ? viagemApp.veiculo?.plate
      : horario?.bus_number ?? '—';
  const proxima = emTrajeto
    ? dadosLegado?.next_stop?.name
    : viagemApp?.proxima_parada?.name ?? '—';
  const eta = emTrajeto
    ? textoEta(dadosLegado?.next_stop?.eta_minutes)
    : viagemApp?.proxima_parada
      ? textoEta(viagemApp.proxima_parada.eta_min)
      : '—';
  const proximaNome = emTrajeto ? dadosLegado?.next_stop?.name : viagemApp?.proxima_parada?.name;
  const paradasOrdenadas = [...paradas].sort((a, b) => a.order - b.order);

  return (
    <ScreenTemplate cabecalho={cabecalho}>
      <ErrorMessage mensagem={erro} />

      <Card style={styles.quadro}>
        <View style={styles.quadroLinha}>
          <View style={styles.quadroItem}>
            <Label variante="secao" style={styles.quadroRotulo}>
              Status
            </Label>
            <View style={styles.statusValor}>
              <View style={[styles.bolinha, { backgroundColor: aoVivo ? cores.sucesso : cores.primaria }]} />
              <Label style={styles.quadroValor} numberOfLines={1}>
                {status}
              </Label>
            </View>
          </View>
          <View style={styles.quadroItem}>
            <Label variante="secao" style={styles.quadroRotulo}>
              Ônibus
            </Label>
            <Label style={styles.quadroValor} numberOfLines={1}>
              {onibusRotulo}
            </Label>
          </View>
        </View>
        <View style={[styles.quadroLinha, styles.quadroLinhaBaixo]}>
          <View style={styles.quadroItem}>
            <Label variante="secao" style={styles.quadroRotulo}>
              Próxima parada
            </Label>
            <Label style={styles.quadroValor} numberOfLines={2}>
              {proxima}
            </Label>
          </View>
          <View style={styles.quadroItem}>
            <Label variante="secao" style={styles.quadroRotulo}>
              ETA
            </Label>
            <Label style={[styles.quadroValor, aoVivo && styles.eta]}>{eta}</Label>
          </View>
        </View>
      </Card>

      <MapaLinha
        paradas={paradas}
        onibus={onibus}
        aviso={aoVivo ? null : 'Trajeto não iniciado'}
        style={styles.mapa}
      />

      <Card titulo="Horários de hoje" icone="clock">
        <ChipGrupo
          opcoes={horarios.map(h => ({
            id: h.id,
            rotulo: ativos.includes(h.id) ? `${h.departure_time} · ao vivo` : h.departure_time,
          }))}
          valor={horarioId}
          onChange={id => {
            escolheuHorario.current = true;
            setHorarioId(id);
          }}
          horizontal
          vazio="Nenhum horário cadastrado para esta linha."
        />
        {emTrajeto ? (
          <>
            <InfoLinha rotulo="Distância até a parada" valor={distancia(dadosLegado?.distance_to_stop)} />
            <InfoLinha
              rotulo="Velocidade"
              valor={dadosLegado?.speed != null ? `${Math.round(dadosLegado.speed)} km/h` : '—'}
              ultima
            />
          </>
        ) : null}
      </Card>

      {viagens.length ? (
        <Card titulo="Ônibus em viagem agora" icone="truck">
          {viagens.map((v, i) => (
            <InfoLinha
              key={v.id}
              rotulo={`${v.veiculo?.plate ?? 'Ônibus'} · ${v.sentido}`}
              valor={
                v.proxima_parada
                  ? `${v.proxima_parada.name} · ${textoEta(v.proxima_parada.eta_min)}`
                  : 'Aguardando posição'
              }
              ultima={i === viagens.length - 1}
            />
          ))}
        </Card>
      ) : null}

      {!aoVivo && horarios.length ? (
        <AvisoBox
          tipo="info"
          mensagem="Nenhum ônibus desta linha transmitindo agora. Quando o motorista iniciar o trajeto, ele aparece no mapa."
        />
      ) : null}

      {paradasOrdenadas.length ? (
        <Card titulo="Paradas" icone="map-pin">
          {paradasOrdenadas.map((p, i) => {
            const proximaAqui = proximaNome && p.name === proximaNome;
            const ultima = i === paradasOrdenadas.length - 1;
            return (
              <View key={p.id ?? `${p.name}-${i}`} style={styles.parada}>
                <View style={styles.paradaTrilho}>
                  <View style={[styles.paradaPonto, proximaAqui && styles.paradaPontoAtivo]}>
                    <Label style={[styles.paradaNumero, proximaAqui && styles.paradaNumeroAtivo]}>{i + 1}</Label>
                  </View>
                  {!ultima ? <View style={styles.paradaLinha} /> : null}
                </View>
                <View style={styles.paradaTextos}>
                  <Label style={[styles.paradaNome, proximaAqui && styles.paradaNomeAtivo]}>{p.name}</Label>
                  {proximaAqui ? <Label variante="legenda">Próxima parada · {eta}</Label> : null}
                </View>
              </View>
            );
          })}
        </Card>
      ) : null}

      <View style={styles.rodape}>
        <Label variante="legenda" style={styles.flex}>
          {atualizadoEm
            ? `Atualizado às ${hora(atualizadoEm.toISOString())}${automatico ? ' · a cada 5 s' : ''}`
            : 'Carregando...'}
        </Label>
        <Pressable
          onPress={atualizar}
          disabled={atualizando}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Atualizar"
          style={styles.atualizar}>
          <Icone nome="refresh-cw" cor={cores.primariaTexto} tamanho={16} />
          <Label style={styles.atualizarTexto}>{atualizando ? 'Atualizando' : 'Atualizar'}</Label>
        </Pressable>
      </View>

      <Button
        title="Avaliar esta viagem"
        icone="star"
        variante="secundario"
        onPress={() =>
          irParaAba(navigation, 'Avaliar', {
            linhaNumero: linha.numero,
            horario: horario?.departure_time,
          })
        }
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  quadro: { paddingVertical: espacamentos.md },
  quadroLinha: { flexDirection: 'row', gap: espacamentos.md },
  quadroLinhaBaixo: {
    marginTop: espacamentos.md,
    paddingTop: espacamentos.md,
    borderTopWidth: 1,
    borderTopColor: cores.cinzaClaro,
  },
  quadroItem: { flex: 1 },
  quadroRotulo: { fontSize: 11, letterSpacing: 1.2, marginBottom: 4 },
  quadroValor: { fontSize: 16, fontWeight: '700', color: cores.texto },
  eta: { color: cores.sucesso },
  statusValor: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  bolinha: { width: 9, height: 9, borderRadius: 5 },
  mapa: { marginBottom: espacamentos.md },
  parada: { flexDirection: 'row', gap: espacamentos.md },
  paradaTrilho: { alignItems: 'center', width: 28 },
  paradaPonto: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: cores.superficieAlt,
    borderWidth: 2,
    borderColor: cores.primariaClara,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paradaPontoAtivo: { backgroundColor: cores.destaque, borderColor: cores.destaque },
  paradaNumero: { fontSize: 12, fontWeight: '800', color: cores.primariaTexto },
  paradaNumeroAtivo: { color: '#FFFFFF' },
  paradaLinha: { width: 2, flex: 1, minHeight: 14, backgroundColor: cores.borda },
  paradaTextos: { flex: 1, paddingBottom: espacamentos.md, paddingTop: 4 },
  paradaNome: { fontSize: 15, color: cores.textoMedio },
  paradaNomeAtivo: { fontWeight: '700', color: cores.texto },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm,
    marginBottom: espacamentos.md,
    paddingHorizontal: espacamentos.xs,
  },
  atualizar: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  atualizarTexto: { color: cores.primariaTexto, fontWeight: '700' },
});
