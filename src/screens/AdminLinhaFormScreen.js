/**
 * SCREEN — AdminLinhaFormScreen
 * Cadastro de linha nova pelo administrador.
 * Origem e destino são marcados no mapa (um toque); o backend já cria os dois
 * como 1ª e 2ª paradas e gera os horários padrão — depois é só incluir as
 * paradas do meio na tela de paradas.
 */
import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { FormField } from '../components/molecules/FormField';
import { Segmentos } from '../components/molecules/Segmentos';
import { SeletorBusca } from '../components/molecules/SeletorBusca';
import { MapaSeletor } from '../components/organisms/MapaSeletor';
import { useToast } from '../components/organisms/Toast';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { criarLinha, motoristas as listarMotoristas, veiculos as listarVeiculos } from '../services/admin';
import { espacamentos } from '../theme';
import { criarEstilos } from '../theme/tema';
import { erroVisivel, lerValor, obrigatorio, primeiroErro } from '../utils/validacao';

const NENHUM = '__nenhum__';
const PONTAS = [
  { id: 'origem', rotulo: 'Origem', icone: 'flag' },
  { id: 'destino', rotulo: 'Destino', icone: 'map-pin' },
];

export function AdminLinhaFormScreen({ navigation }) {
  const styles = useStyles();
  const toast = useToast();
  const [form, setForm] = useState({
    numero: '',
    nome: '',
    origem: '',
    destino: '',
    tarifa: '5,50',
    motorista: NENHUM,
    veiculo: NENHUM,
  });
  const [pontos, setPontos] = useState({ origem: null, destino: null });
  const [ponta, setPonta] = useState('origem');
  const [motoristas, setMotoristas] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [tocados, setTocados] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    listarMotoristas().then(setMotoristas).catch(() => {});
    listarVeiculos().then(setVeiculos).catch(() => {});
  }, []);

  const erros = useMemo(
    () => ({
      numero: obrigatorio(form.numero, 'o número da linha'),
      nome: obrigatorio(form.nome, 'o nome da linha'),
      origem: obrigatorio(form.origem, 'o nome da origem'),
      destino: obrigatorio(form.destino, 'o nome do destino'),
      tarifa: lerValor(form.tarifa) > 0 ? null : 'Informe a tarifa (ex.: 5,50).',
      mapa: pontos.origem && pontos.destino ? null : 'Marque a origem e o destino no mapa.',
    }),
    [form, pontos],
  );

  function campo(nome) {
    return {
      value: form[nome],
      onBlur: () => setTocados(t => ({ ...t, [nome]: true })),
      mensagemErro: erroVisivel(tocados, erros, nome),
    };
  }

  function mudar(nome, valor) {
    setForm(f => ({ ...f, [nome]: valor }));
  }

  function marcar(ponto) {
    setPontos(p => ({ ...p, [ponta]: ponto }));
    // marcou a origem? já passa para o destino
    if (ponta === 'origem' && !pontos.destino) setPonta('destino');
  }

  async function salvar() {
    setTocados(Object.fromEntries(Object.keys(erros).map(k => [k, true])));
    if (primeiroErro(erros) || salvando) return;
    setSalvando(true);
    setErro(null);
    try {
      const resposta = await criarLinha({
        route_number: form.numero.trim(),
        route_name: form.nome.trim(),
        origin: form.origem.trim(),
        destination: form.destino.trim(),
        fare: lerValor(form.tarifa),
        origin_lat: pontos.origem.latitude,
        origin_lon: pontos.origem.longitude,
        dest_lat: pontos.destino.latitude,
        dest_lon: pontos.destino.longitude,
        ...(form.motorista !== NENHUM ? { driver_id: form.motorista } : {}),
        ...(form.veiculo !== NENHUM ? { vehicle_id: form.veiculo } : {}),
      });
      toast.mostrar(`Linha ${form.numero} criada. Agora inclua as paradas do meio.`);
      navigation.replace('AdminParadas', {
        rota: {
          id: resposta.route_id,
          route_name: `Linha_${form.numero.trim()}`,
          titulo: `${form.numero.trim()} · ${form.nome.trim()}`,
        },
      });
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  const marcadores = [
    pontos.origem && ponta !== 'origem'
      ? { ...pontos.origem, texto: 'A', cor: '#16A34A', rotulo: form.origem || 'Origem' }
      : null,
    pontos.destino && ponta !== 'destino'
      ? { ...pontos.destino, texto: 'B', cor: '#DC2626', rotulo: form.destino || 'Destino' }
      : null,
  ].filter(Boolean);

  const erroMapa = erroVisivel(tocados, erros, 'mapa');

  return (
    <ScreenTemplate cabecalho={{ titulo: 'Nova linha', subtitulo: 'Itinerário e tarifa', voltar: true }}>
      <ErrorMessage mensagem={erro} />

      <Card titulo="Linha" icone="map">
        <View style={styles.linha}>
          <FormField
            label="Número"
            placeholder="215"
            style={styles.numero}
            autoCapitalize="characters"
            onChangeText={v => mudar('numero', v)}
            {...campo('numero')}
          />
          <FormField
            label="Nome"
            placeholder="Centro - Efapi"
            style={styles.flex}
            onChangeText={v => mudar('nome', v)}
            {...campo('nome')}
          />
        </View>
        <View style={styles.linha}>
          <FormField
            label="Origem"
            placeholder="Terminal Central"
            style={styles.flex}
            onChangeText={v => mudar('origem', v)}
            {...campo('origem')}
          />
          <FormField
            label="Destino"
            placeholder="Bairro Efapi"
            style={styles.flex}
            onChangeText={v => mudar('destino', v)}
            {...campo('destino')}
          />
        </View>
        <FormField
          label="Tarifa (R$)"
          placeholder="5,50"
          keyboardType="decimal-pad"
          onChangeText={v => mudar('tarifa', v)}
          {...campo('tarifa')}
        />
      </Card>

      <Card titulo="Origem e destino no mapa" icone="map-pin">
        <Segmentos opcoes={PONTAS} valor={ponta} onChange={setPonta} />
        <MapaSeletor
          marcadores={marcadores}
          valor={pontos[ponta]}
          onEscolher={marcar}
          dica={ponta === 'origem' ? 'Toque onde a linha começa' : 'Toque onde a linha termina'}
        />
        {erroMapa ? <ErrorMessage mensagem={erroMapa} /> : null}
      </Card>

      <Card titulo="Equipe (opcional)" icone="users">
        <SeletorBusca
          label="Motorista"
          marcadorNoCampo={false}
          opcoes={[
            { id: NENHUM, marcador: '—', rotulo: 'Definir depois' },
            ...motoristas.map(m => ({ id: m.id, marcador: (m.nome || '?')[0].toUpperCase(), rotulo: m.nome })),
          ]}
          valor={form.motorista}
          onChange={v => mudar('motorista', v)}
          corMarcador={item => (item.id === NENHUM ? '#94A3B8' : '#2563EB')}
        />
        <View style={styles.espaco} />
        <SeletorBusca
          label="Veículo"
          marcadorNoCampo={false}
          opcoes={[
            { id: NENHUM, marcador: '—', rotulo: 'Definir depois' },
            ...veiculos.map(v => ({ id: v.id, marcador: '🚌', rotulo: `${v.plate} · ${v.model}` })),
          ]}
          valor={form.veiculo}
          onChange={v => mudar('veiculo', v)}
          corMarcador={item => (item.id === NENHUM ? '#94A3B8' : '#F59E0B')}
        />
      </Card>

      <Button title="Criar linha" icone="check" onPress={salvar} carregando={salvando} />
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(() => ({
  linha: { flexDirection: 'row', gap: espacamentos.sm + 4 },
  numero: { width: 96 },
  flex: { flex: 1 },
  espaco: { height: espacamentos.sm },
}));
