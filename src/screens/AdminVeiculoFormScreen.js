/**
 * SCREEN — AdminVeiculoFormScreen
 * Cadastro e edição de veículo da frota (placa, modelo, marca, ano, capacidade,
 * situação, linha e motorista).
 *   params.veiculo → edição; sem params → cadastro novo
 */
import { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { ChipGrupo } from '../components/molecules/ChipGrupo';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { FormField } from '../components/molecules/FormField';
import { corDaLinha } from '../components/molecules/LinhaItem';
import { SeletorBusca } from '../components/molecules/SeletorBusca';
import { useToast } from '../components/organisms/Toast';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import {
  STATUS_VEICULO,
  excluirVeiculo,
  motoristas as listarMotoristas,
  opcoesDeLinha,
  salvarVeiculo,
} from '../services/admin';
import { espacamentos } from '../theme';
import { criarEstilos } from '../theme/tema';
import { mascaraPlaca, somenteDigitos } from '../utils/formato';
import { erroVisivel, obrigatorio, primeiroErro, validarInteiro } from '../utils/validacao';

const NENHUM = '__nenhum__';
const ANO_ATUAL = new Date().getFullYear();

export function AdminVeiculoFormScreen({ navigation, route }) {
  const styles = useStyles();
  const toast = useToast();
  const original = route.params?.veiculo ?? null;
  const editando = Boolean(original);

  const [form, setForm] = useState(() => ({
    placa: original?.plate ?? '',
    modelo: original?.model ?? '',
    marca: original?.brand ?? '',
    ano: original?.year ? String(original.year) : '',
    capacidade: original?.capacity ? String(original.capacity) : '',
    status: original?.status ?? 'ativo',
    linha: original?.bus_line ?? NENHUM,
    motorista: original?.driver_id ?? NENHUM,
  }));
  const [linhas, setLinhas] = useState([]);
  const [motoristas, setMotoristas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [tocados, setTocados] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    Promise.all([opcoesDeLinha().catch(() => []), listarMotoristas().catch(() => [])])
      .then(([l, m]) => {
        setLinhas(l);
        setMotoristas(m);
      })
      .finally(() => setCarregando(false));
  }, []);

  const erros = useMemo(
    () => ({
      placa: form.placa.replace('-', '').length >= 7 ? null : 'Placa inválida (ex.: ABC1D23).',
      modelo: obrigatorio(form.modelo, 'o modelo'),
      marca: obrigatorio(form.marca, 'a marca'),
      ano: validarInteiro(form.ano, { rotulo: 'o ano', min: 1980, max: ANO_ATUAL + 1 }),
      capacidade: validarInteiro(form.capacidade, { rotulo: 'a capacidade', min: 1, max: 300 }),
    }),
    [form],
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

  async function salvar() {
    setTocados(Object.fromEntries(Object.keys(erros).map(k => [k, true])));
    if (primeiroErro(erros) || salvando) return;
    setSalvando(true);
    setErro(null);
    try {
      await salvarVeiculo(original?.id, {
        plate: form.placa,
        model: form.modelo.trim(),
        brand: form.marca.trim(),
        year: Number(form.ano),
        capacity: Number(form.capacidade),
        status: form.status,
        bus_line: form.linha === NENHUM ? null : form.linha,
        driver_id: form.motorista === NENHUM ? null : form.motorista,
      });
      toast.mostrar(editando ? 'Veículo atualizado' : 'Veículo cadastrado');
      navigation.goBack();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir veículo', `Excluir o veículo ${original.plate}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setExcluindo(true);
          setErro(null);
          try {
            await excluirVeiculo(original.id);
            toast.mostrar('Veículo excluído');
            navigation.goBack();
          } catch (e) {
            setErro(e.message);
          } finally {
            setExcluindo(false);
          }
        },
      },
    ]);
  }

  const opcoesLinha = [{ id: NENHUM, marcador: '—', rotulo: 'Sem linha fixa' }, ...linhas];
  const opcoesMotorista = [
    { id: NENHUM, marcador: '—', rotulo: 'Sem motorista' },
    ...motoristas.map(m => ({
      id: m.id,
      marcador: (m.nome || '?').slice(0, 1).toUpperCase(),
      rotulo: m.nome,
      detalhe: [m.code, m.status !== 'ativo' ? m.status : null].filter(Boolean).join(' · ') || undefined,
    })),
  ];

  return (
    <ScreenTemplate
      cabecalho={{
        titulo: editando ? 'Editar veículo' : 'Novo veículo',
        subtitulo: editando ? `${original.plate} · ${original.model}` : 'Frota do transporte',
        voltar: true,
      }}>
      <ErrorMessage mensagem={erro} />

      <Card titulo="Identificação" icone="truck">
        <FormField
          label="Placa"
          placeholder="ABC1D23"
          autoCapitalize="characters"
          autoCorrect={false}
          onChangeText={v => mudar('placa', mascaraPlaca(v))}
          {...campo('placa')}
        />
        <View style={styles.linha}>
          <FormField
            label="Marca"
            placeholder="Mercedes-Benz"
            style={styles.metade}
            onChangeText={v => mudar('marca', v)}
            {...campo('marca')}
          />
          <FormField
            label="Modelo"
            placeholder="OF-1721"
            style={styles.metade}
            onChangeText={v => mudar('modelo', v)}
            {...campo('modelo')}
          />
        </View>
        <View style={styles.linha}>
          <FormField
            label="Ano"
            placeholder={String(ANO_ATUAL)}
            keyboardType="number-pad"
            style={styles.metade}
            onChangeText={v => mudar('ano', somenteDigitos(v).slice(0, 4))}
            {...campo('ano')}
          />
          <FormField
            label="Lugares"
            placeholder="44"
            keyboardType="number-pad"
            style={styles.metade}
            onChangeText={v => mudar('capacidade', somenteDigitos(v).slice(0, 3))}
            {...campo('capacidade')}
          />
        </View>
      </Card>

      <Card titulo="Operação" icone="activity">
        <ChipGrupo label="Situação" opcoes={STATUS_VEICULO} valor={form.status} onChange={v => mudar('status', v)} />
        <SeletorBusca
          label="Linha"
          titulo="Linha do veículo"
          opcoes={opcoesLinha}
          valor={form.linha}
          onChange={v => mudar('linha', v)}
          carregando={carregando}
          corMarcador={item => (item.id === NENHUM ? '#94A3B8' : corDaLinha(item.marcador))}
        />
        <View style={styles.espaco} />
        <SeletorBusca
          label="Motorista"
          marcadorNoCampo={false}
          titulo="Motorista do veículo"
          opcoes={opcoesMotorista}
          valor={form.motorista}
          onChange={v => mudar('motorista', v)}
          carregando={carregando}
          corMarcador={item => (item.id === NENHUM ? '#94A3B8' : '#2563EB')}
        />
      </Card>

      <Button
        title={editando ? 'Salvar alterações' : 'Cadastrar veículo'}
        icone="save"
        onPress={salvar}
        carregando={salvando}
      />
      {editando ? (
        <>
          <Button
            title="Excluir veículo"
            icone="trash-2"
            variante="perigoContorno"
            onPress={confirmarExclusao}
            carregando={excluindo}
            style={styles.excluir}
          />
          <Label variante="legenda" style={styles.nota}>
            Veículo com viagens registradas não pode ser excluído: mude a situação para Inativo.
          </Label>
        </>
      ) : null}
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(() => ({
  linha: { flexDirection: 'row', gap: espacamentos.sm + 4 },
  metade: { flex: 1 },
  espaco: { height: espacamentos.sm },
  excluir: { marginTop: espacamentos.sm },
  nota: { textAlign: 'center', marginTop: espacamentos.sm },
}));
