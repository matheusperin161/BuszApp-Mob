/**
 * SCREEN — AdminEscalaFormScreen
 * Criar ou editar um turno: motorista, dia, início, fim, linha e observação.
 * O motorista recebe um aviso quando o turno é criado.
 *   params.escala → edição · params.data → dia sugerido no cadastro
 */
import { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Card } from '../components/molecules/Card';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { FormField } from '../components/molecules/FormField';
import { corDaLinha } from '../components/molecules/LinhaItem';
import { SeletorBusca } from '../components/molecules/SeletorBusca';
import { useToast } from '../components/organisms/Toast';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { excluirEscala, motoristas as listarMotoristas, opcoesDeLinha, salvarEscala } from '../services/admin';
import { espacamentos } from '../theme';
import { criarEstilos } from '../theme/tema';
import { dataBrParaIso, dataIsoParaBr, horaValida, mascaraData, mascaraHora } from '../utils/formato';
import { erroVisivel, primeiroErro } from '../utils/validacao';

const SEM_LINHA = '__sem_linha__';

export function AdminEscalaFormScreen({ navigation, route }) {
  const styles = useStyles();
  const toast = useToast();
  const original = route.params?.escala ?? null;
  const editando = Boolean(original);

  const [form, setForm] = useState(() => ({
    motorista: original?.motorista_id ?? null,
    data: dataIsoParaBr(original?.data ?? route.params?.data),
    inicio: original?.inicio ?? '06:00',
    fim: original?.fim ?? '14:00',
    linha: original?.linha ?? SEM_LINHA,
    observacao: original?.observacao ?? '',
  }));
  const [motoristas, setMotoristas] = useState([]);
  const [linhas, setLinhas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [tocados, setTocados] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    Promise.all([listarMotoristas().catch(() => []), opcoesDeLinha().catch(() => [])])
      .then(([m, l]) => {
        setMotoristas(m.filter(x => x.status !== 'inativo' || x.id === original?.motorista_id));
        setLinhas(l);
      })
      .finally(() => setCarregando(false));
  }, [original?.motorista_id]);

  const erros = useMemo(
    () => ({
      motorista: form.motorista ? null : 'Escolha o motorista.',
      data: dataBrParaIso(form.data) ? null : 'Data inválida (DD/MM/AAAA).',
      inicio: horaValida(form.inicio) ? null : 'Use HH:MM.',
      fim: !horaValida(form.fim) ? 'Use HH:MM.' : form.fim <= form.inicio ? 'Depois do início.' : null,
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
    setTocados({ motorista: true, data: true, inicio: true, fim: true });
    if (primeiroErro(erros) || salvando) return;
    setSalvando(true);
    setErro(null);
    try {
      await salvarEscala(original?.id, {
        motorista_id: form.motorista,
        data: dataBrParaIso(form.data),
        inicio: form.inicio,
        fim: form.fim,
        linha: form.linha === SEM_LINHA ? null : form.linha,
        observacao: form.observacao.trim() || null,
      });
      toast.mostrar(editando ? 'Turno atualizado' : 'Turno criado · motorista avisado');
      navigation.goBack();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  function excluir() {
    Alert.alert('Excluir turno', `Tirar o turno de ${original.motorista_nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirEscala(original.id);
            toast.mostrar('Turno excluído');
            navigation.goBack();
          } catch (e) {
            setErro(e.message);
          }
        },
      },
    ]);
  }

  return (
    <ScreenTemplate
      cabecalho={{
        titulo: editando ? 'Editar turno' : 'Novo turno',
        subtitulo: editando ? original.motorista_nome : 'Escala dos motoristas',
        voltar: true,
      }}>
      <ErrorMessage mensagem={erro} />
      <Card titulo="Turno" icone="calendar">
        <SeletorBusca
          label="Motorista"
          titulo="Quem vai trabalhar?"
          placeholder="Escolha o motorista"
          opcoes={motoristas.map(m => ({
            id: m.id,
            marcador: (m.nome || '?')[0].toUpperCase(),
            rotulo: m.nome,
            detalhe: m.bus_line || undefined,
          }))}
          valor={form.motorista}
          onChange={v => {
            mudar('motorista', v);
            // sugere a linha fixa do motorista
            const m = motoristas.find(x => x.id === v);
            if (m?.bus_line && form.linha === SEM_LINHA) mudar('linha', m.bus_line);
          }}
          carregando={carregando}
          corMarcador={() => '#2563EB'}
          marcadorNoCampo={false}
          mensagemErro={erroVisivel(tocados, erros, 'motorista')}
        />
        <View style={styles.espaco} />
        <FormField
          label="Dia"
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          onChangeText={v => mudar('data', mascaraData(v))}
          {...campo('data')}
        />
        <View style={styles.linha}>
          <FormField
            label="Início"
            placeholder="06:00"
            keyboardType="number-pad"
            style={styles.metade}
            onChangeText={v => mudar('inicio', mascaraHora(v))}
            {...campo('inicio')}
          />
          <FormField
            label="Fim"
            placeholder="14:00"
            keyboardType="number-pad"
            style={styles.metade}
            onChangeText={v => mudar('fim', mascaraHora(v))}
            {...campo('fim')}
          />
        </View>
        <SeletorBusca
          label="Linha"
          titulo="Linha do turno"
          opcoes={[{ id: SEM_LINHA, marcador: '—', rotulo: 'A definir' }, ...linhas]}
          valor={form.linha}
          onChange={v => mudar('linha', v)}
          carregando={carregando}
          corMarcador={item => (item.id === SEM_LINHA ? '#94A3B8' : corDaLinha(item.marcador))}
        />
        <View style={styles.espaco} />
        <FormField
          label="Observação (opcional)"
          placeholder="Ex.: cobrir férias do Carlos"
          onChangeText={v => mudar('observacao', v.slice(0, 200))}
          style={styles.semMargem}
          {...campo('observacao')}
        />
      </Card>
      <Button title={editando ? 'Salvar turno' : 'Criar turno'} icone="check" onPress={salvar} carregando={salvando} />
      {editando ? (
        <Button
          title="Excluir turno"
          icone="trash-2"
          variante="perigoContorno"
          onPress={excluir}
          style={styles.excluir}
        />
      ) : null}
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(() => ({
  linha: { flexDirection: 'row', gap: espacamentos.sm + 4 },
  metade: { flex: 1 },
  espaco: { height: espacamentos.sm },
  semMargem: { marginBottom: 0 },
  excluir: { marginTop: espacamentos.sm },
}));
