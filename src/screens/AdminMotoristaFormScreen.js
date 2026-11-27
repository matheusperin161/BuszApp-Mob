/**
 * SCREEN — AdminMotoristaFormScreen
 * Cadastro e edição de motorista pelo administrador (o mesmo formulário do site).
 * Ao cadastrar, o backend cria também o login do motorista (e-mail + senha).
 *   params.motorista → edição; sem params → cadastro novo
 */
import { useEffect, useMemo, useRef, useState } from 'react';
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
  CATEGORIAS_CNH,
  STATUS_MOTORISTA,
  excluirMotorista,
  opcoesDeLinha,
  salvarMotorista,
} from '../services/admin';
import { espacamentos } from '../theme';
import { criarEstilos } from '../theme/tema';
import {
  dataBrParaIso,
  dataIsoParaBr,
  mascaraCpf,
  mascaraData,
  mascaraTelefone,
  somenteDigitos,
} from '../utils/formato';
import { cpfValido, erroVisivel, obrigatorio, primeiroErro, validarEmail } from '../utils/validacao';

const SEM_LINHA = '__sem_linha__';

export function AdminMotoristaFormScreen({ navigation, route }) {
  const styles = useStyles();
  const toast = useToast();
  const original = route.params?.motorista ?? null;
  const editando = Boolean(original);

  const [form, setForm] = useState(() => ({
    nome: original?.nome ?? '',
    cpf: mascaraCpf(original?.cpf ?? ''),
    telefone: mascaraTelefone(original?.telefone ?? ''),
    email: original?.email ?? '',
    senha: '',
    cnhNumero: original?.cnh_numero ?? '',
    cnhCategoria: original?.cnh_categoria ?? 'D',
    cnhValidade: dataIsoParaBr(original?.cnh_validade),
    status: original?.status ?? 'ativo',
    linha: original?.bus_line ?? SEM_LINHA,
    codigo: original?.code ?? '',
  }));
  const [linhas, setLinhas] = useState([]);
  const [carregandoLinhas, setCarregandoLinhas] = useState(true);
  const [tocados, setTocados] = useState({});
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState(null);
  const refs = { cpf: useRef(null), telefone: useRef(null), email: useRef(null), senha: useRef(null) };

  useEffect(() => {
    opcoesDeLinha()
      .then(setLinhas)
      .catch(() => setLinhas([]))
      .finally(() => setCarregandoLinhas(false));
  }, []);

  const erros = useMemo(
    () => ({
      nome: obrigatorio(form.nome, 'o nome'),
      cpf: !somenteDigitos(form.cpf) ? 'Informe o CPF.' : cpfValido(form.cpf) ? null : 'CPF inválido.',
      email: editando && !form.email ? null : validarEmail(form.email),
      senha:
        !editando && !form.senha
          ? 'Informe a senha de acesso.'
          : form.senha && form.senha.length < 6
            ? 'A senha precisa ter pelo menos 6 caracteres.'
            : null,
      cnhNumero: obrigatorio(form.cnhNumero, 'o número da CNH'),
      cnhValidade: dataBrParaIso(form.cnhValidade) ? null : 'Data inválida (use DD/MM/AAAA).',
    }),
    [form, editando],
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
      await salvarMotorista(original?.id, {
        nome: form.nome.trim(),
        cpf: somenteDigitos(form.cpf),
        telefone: form.telefone,
        email: form.email.trim().toLowerCase(),
        ...(form.senha ? { senha: form.senha } : {}),
        cnh_numero: form.cnhNumero.trim(),
        cnh_categoria: form.cnhCategoria,
        cnh_validade: dataBrParaIso(form.cnhValidade),
        status: form.status,
        bus_line: form.linha === SEM_LINHA ? '' : form.linha,
        code: form.codigo.trim(),
      });
      toast.mostrar(editando ? 'Motorista atualizado' : 'Motorista cadastrado');
      navigation.goBack();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir motorista', `Excluir ${original.nome} e o acesso dele ao app?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setExcluindo(true);
          setErro(null);
          try {
            await excluirMotorista(original.id);
            toast.mostrar('Motorista excluído');
            navigation.goBack();
          } catch (e) {
            // 409: tem viagem → o backend pede para inativar
            setErro(e.message);
          } finally {
            setExcluindo(false);
          }
        },
      },
    ]);
  }

  const opcoesLinha = [{ id: SEM_LINHA, marcador: '—', rotulo: 'Sem linha fixa' }, ...linhas];

  return (
    <ScreenTemplate
      cabecalho={{
        titulo: editando ? 'Editar motorista' : 'Novo motorista',
        subtitulo: editando ? original.nome : 'Cadastro com acesso ao app',
        voltar: true,
      }}>
      <ErrorMessage mensagem={erro} />

      <Card titulo="Dados pessoais" icone="user">
        <FormField
          label="Nome completo"
          placeholder="Carlos da Silva"
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => refs.cpf.current?.focus()}
          onChangeText={v => mudar('nome', v)}
          {...campo('nome')}
        />
        <View style={styles.linha}>
          <FormField
            ref={refs.cpf}
            label="CPF"
            placeholder="000.000.000-00"
            keyboardType="number-pad"
            style={styles.metade}
            onChangeText={v => mudar('cpf', mascaraCpf(v))}
            {...campo('cpf')}
          />
          <FormField
            ref={refs.telefone}
            label="Telefone"
            placeholder="(49) 99999-9999"
            keyboardType="phone-pad"
            style={styles.metade}
            onChangeText={v => mudar('telefone', mascaraTelefone(v))}
            {...campo('telefone')}
          />
        </View>
      </Card>

      <Card titulo="Acesso ao app" icone="lock">
        <FormField
          ref={refs.email}
          label="E-mail"
          placeholder="motorista@email.com"
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={v => mudar('email', v)}
          {...campo('email')}
        />
        <FormField
          ref={refs.senha}
          label={editando ? 'Nova senha (opcional)' : 'Senha'}
          placeholder={editando ? 'Deixe em branco para manter' : 'Mínimo 6 caracteres'}
          secureTextEntry
          onChangeText={v => mudar('senha', v)}
          {...campo('senha')}
        />
      </Card>

      <Card titulo="CNH" icone="award">
        <View style={styles.linha}>
          <FormField
            label="Número"
            placeholder="00000000000"
            keyboardType="number-pad"
            style={styles.metade}
            onChangeText={v => mudar('cnhNumero', somenteDigitos(v).slice(0, 20))}
            {...campo('cnhNumero')}
          />
          <FormField
            label="Validade"
            placeholder="DD/MM/AAAA"
            keyboardType="number-pad"
            style={styles.metade}
            onChangeText={v => mudar('cnhValidade', mascaraData(v))}
            {...campo('cnhValidade')}
          />
        </View>
        <ChipGrupo
          label="Categoria"
          opcoes={CATEGORIAS_CNH.map(c => ({ id: c, rotulo: c }))}
          valor={form.cnhCategoria}
          onChange={v => mudar('cnhCategoria', v)}
          horizontal
        />
      </Card>

      <Card titulo="Trabalho" icone="truck">
        <ChipGrupo
          label="Situação"
          opcoes={STATUS_MOTORISTA}
          valor={form.status}
          onChange={v => mudar('status', v)}
        />
        <SeletorBusca
          label="Linha"
          titulo="Linha do motorista"
          opcoes={opcoesLinha}
          valor={form.linha}
          onChange={v => mudar('linha', v)}
          carregando={carregandoLinhas}
          corMarcador={item => (item.id === SEM_LINHA ? '#94A3B8' : corDaLinha(item.marcador))}
        />
        <FormField
          label="Código interno (opcional)"
          placeholder="MOT-001"
          autoCapitalize="characters"
          onChangeText={v => mudar('codigo', v)}
          style={styles.codigo}
          {...campo('codigo')}
        />
      </Card>

      <Button
        title={editando ? 'Salvar alterações' : 'Cadastrar motorista'}
        icone="save"
        onPress={salvar}
        carregando={salvando}
      />
      {editando ? (
        <>
          <Button
            title="Excluir motorista"
            icone="trash-2"
            variante="perigoContorno"
            onPress={confirmarExclusao}
            carregando={excluindo}
            style={styles.excluir}
          />
          <Label variante="legenda" style={styles.nota}>
            Motorista com viagens no histórico não pode ser excluído: mude a situação para Inativo.
          </Label>
        </>
      ) : null}
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(() => ({
  linha: { flexDirection: 'row', gap: espacamentos.sm + 4 },
  metade: { flex: 1 },
  codigo: { marginTop: espacamentos.md, marginBottom: 0 },
  excluir: { marginTop: espacamentos.sm },
  nota: { textAlign: 'center', marginTop: espacamentos.sm },
}));
