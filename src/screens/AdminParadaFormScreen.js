/**
 * SCREEN — AdminParadaFormScreen
 * Incluir ou editar uma parada da linha: nome, ponto no mapa e minutos até a
 * próxima parada (usado na previsão de chegada).
 * Parada nova entra antes do destino final, que é o mais comum; dá para
 * escolher "depois do destino" quando a linha foi estendida.
 *   params = { rotaId, parada?, paradas }
 */
import { useMemo, useState } from 'react';

import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { ChipGrupo } from '../components/molecules/ChipGrupo';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { FormField } from '../components/molecules/FormField';
import { MapaSeletor } from '../components/organisms/MapaSeletor';
import { useToast } from '../components/organisms/Toast';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { salvarParada } from '../services/admin';
import { espacamentos } from '../theme';
import { criarEstilos } from '../theme/tema';
import { somenteDigitos } from '../utils/formato';
import { erroVisivel, obrigatorio, primeiroErro, validarInteiro } from '../utils/validacao';

const POSICOES = [
  { id: 'antes', rotulo: 'Antes do destino' },
  { id: 'fim', rotulo: 'No final da linha' },
];

export function AdminParadaFormScreen({ navigation, route }) {
  const styles = useStyles();
  const toast = useToast();
  const { rotaId, parada: original = null, paradas = [] } = route.params;
  const editando = Boolean(original);
  const ultima = paradas[paradas.length - 1];

  const [nome, setNome] = useState(original?.name ?? '');
  const [minutos, setMinutos] = useState(
    original?.tempo_ate_proxima_min ? String(original.tempo_ate_proxima_min) : '',
  );
  const [ponto, setPonto] = useState(
    original ? { latitude: original.latitude, longitude: original.longitude } : null,
  );
  const [posicao, setPosicao] = useState(paradas.length >= 2 ? 'antes' : 'fim');
  const [tocados, setTocados] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const erros = useMemo(
    () => ({
      nome: obrigatorio(nome, 'o nome da parada'),
      minutos: minutos ? validarInteiro(minutos, { rotulo: 'os minutos', min: 1, max: 240 }) : null,
      ponto: ponto ? null : 'Toque no mapa para marcar a parada.',
    }),
    [nome, minutos, ponto],
  );

  // as outras paradas aparecem no mapa como referência
  const marcadores = useMemo(
    () =>
      paradas
        .map((p, i) => ({ ...p, indice: i }))
        .filter(p => p.id !== original?.id)
        .map(p => ({
          latitude: p.latitude,
          longitude: p.longitude,
          rotulo: `${p.indice + 1}. ${p.name}`,
          texto: String(p.indice + 1),
          cor: '#64748B',
        })),
    [paradas, original?.id],
  );

  async function salvar() {
    setTocados({ nome: true, minutos: true, ponto: true });
    if (primeiroErro(erros) || salvando) return;
    setSalvando(true);
    setErro(null);
    const base = {
      name: nome.trim(),
      latitude: ponto.latitude,
      longitude: ponto.longitude,
      tempo_ate_proxima_min: minutos ? Number(minutos) : null,
    };
    try {
      if (editando) {
        await salvarParada(rotaId, original.id, base);
      } else if (posicao === 'antes' && ultima) {
        // a nova parada assume a posição do destino e o destino vai uma para frente
        await salvarParada(rotaId, ultima.id, { order: ultima.order + 1 });
        await salvarParada(rotaId, null, { ...base, order: ultima.order });
      } else {
        await salvarParada(rotaId, null, { ...base, order: (ultima?.order ?? 0) + 1 });
      }
      toast.mostrar(editando ? 'Parada atualizada' : 'Parada incluída');
      navigation.goBack();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <ScreenTemplate
      cabecalho={{
        titulo: editando ? 'Editar parada' : 'Nova parada',
        subtitulo: editando ? original.name : `${paradas.length} paradas na linha`,
        voltar: true,
      }}>
      <ErrorMessage mensagem={erro} />

      <Card titulo="Parada" icone="map-pin">
        <FormField
          label="Nome"
          placeholder="Av. Getúlio Vargas, 500"
          value={nome}
          onChangeText={setNome}
          onBlur={() => setTocados(t => ({ ...t, nome: true }))}
          mensagemErro={erroVisivel(tocados, erros, 'nome')}
        />
        <FormField
          label="Minutos até a próxima parada (opcional)"
          placeholder="3"
          keyboardType="number-pad"
          value={minutos}
          onChangeText={v => setMinutos(somenteDigitos(v).slice(0, 3))}
          onBlur={() => setTocados(t => ({ ...t, minutos: true }))}
          mensagemErro={erroVisivel(tocados, erros, 'minutos')}
          ajuda="Sem valor, a previsão usa a distância e a velocidade média."
        />
        {!editando && paradas.length >= 2 ? (
          <ChipGrupo label="Posição" opcoes={POSICOES} valor={posicao} onChange={setPosicao} />
        ) : null}
      </Card>

      <Card titulo="Local no mapa" icone="map">
        <MapaSeletor
          marcadores={marcadores}
          valor={ponto}
          onEscolher={setPonto}
          dica={ponto ? 'Toque de novo para ajustar' : 'Toque no ponto exato da parada'}
        />
        {erroVisivel(tocados, erros, 'ponto') ? <ErrorMessage mensagem={erros.ponto} /> : null}
      </Card>

      <Button
        title={editando ? 'Salvar parada' : 'Incluir parada'}
        icone="check"
        onPress={salvar}
        carregando={salvando}
        style={styles.botao}
      />
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(() => ({
  botao: { marginTop: espacamentos.xs },
}));
