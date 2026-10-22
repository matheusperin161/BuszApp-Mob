/**
 * ORGANISM — DriverForm
 * Cadastro/edição de motorista (CA02.2). Valida no app antes de enviar;
 * duplicidade de CPF/CNH (CA02.3) só o servidor sabe — vem como erro geral.
 */
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import Button from '../atoms/Button';
import Label from '../atoms/Label';
import ErrorMessage from '../molecules/ErrorMessage';
import FormField from '../molecules/FormField';
import OptionChips from '../molecules/OptionChips';
import { espacos } from '../../theme';
import { isoParaDataBR, mascaraCpf, mascaraData } from '../../utils/formatacao';
import * as v from '../../utils/validacao';

const CATEGORIAS = ['A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'].map((c) => ({ valor: c, rotulo: c }));
const STATUS = [
  { valor: 'ativo', rotulo: 'Ativo' },
  { valor: 'afastado', rotulo: 'Afastado' },
  { valor: 'inativo', rotulo: 'Inativo' },
];

function estadoInicial(m) {
  return {
    nome: m?.nome ?? '',
    cpf: m ? mascaraCpf(m.cpf) : '',
    cnh_numero: m?.cnh_numero ?? '',
    cnh_categoria: m?.cnh_categoria ?? '',
    cnh_validade: m?.cnh_validade ? isoParaDataBR(m.cnh_validade) : '',
    telefone: m?.telefone ?? '',
    status: m?.status ?? 'ativo',
    email: m?.email ?? '',
    senha: '',
  };
}

export default function DriverForm({ motorista, aoSalvar }) {
  const edicao = Boolean(motorista);
  const [campos, setCampos] = useState(() => estadoInicial(motorista));
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const alterar = (nome, mascara) => (texto) => setCampos((c) => ({ ...c, [nome]: mascara ? mascara(texto) : texto }));

  const validar = () => {
    const e = {
      nome: v.obrigatorio(campos.nome, 'Nome'),
      cpf: v.obrigatorio(campos.cpf, 'CPF') || v.cpf(campos.cpf),
      cnh_numero: v.obrigatorio(campos.cnh_numero, 'Número da CNH'),
      cnh_categoria: v.obrigatorio(campos.cnh_categoria, 'Categoria'),
      cnh_validade: v.obrigatorio(campos.cnh_validade, 'Validade') || v.dataBR(campos.cnh_validade),
      email: v.obrigatorio(campos.email, 'E-mail') || v.email(campos.email),
      senha: v.senha(campos.senha, { opcional: edicao }),
    };
    setErros(e);
    return !Object.values(e).some(Boolean);
  };

  const salvar = async () => {
    if (!validar()) return;
    setErroGeral(null);
    setSalvando(true);
    try {
      await aoSalvar({
        ...campos,
        cpf: v.somenteDigitos(campos.cpf),
        cnh_validade: v.dataBRParaISO(campos.cnh_validade),
        email: campos.email.trim().toLowerCase(),
        senha: campos.senha || undefined,
      });
    } catch (erro) {
      setErroGeral(erro.message);
      setSalvando(false);
    }
  };

  return (
    <>
      <ErrorMessage mensagem={erroGeral} />
      <FormField rotulo="Nome completo" obrigatorio value={campos.nome} onChangeText={alterar('nome')} erro={erros.nome} />
      <FormField
        rotulo="CPF"
        obrigatorio
        value={campos.cpf}
        onChangeText={alterar('cpf', mascaraCpf)}
        onBlur={() => setErros((e) => ({ ...e, cpf: v.cpf(campos.cpf) }))}
        erro={erros.cpf}
        keyboardType="number-pad"
        placeholder="000.000.000-00"
      />
      <FormField
        rotulo="Número da CNH"
        obrigatorio
        value={campos.cnh_numero}
        onChangeText={alterar('cnh_numero', v.somenteDigitos)}
        erro={erros.cnh_numero}
        keyboardType="number-pad"
      />
      <FormField rotulo="Categoria da CNH" obrigatorio erro={erros.cnh_categoria}>
        <OptionChips opcoes={CATEGORIAS} valor={campos.cnh_categoria} aoMudar={alterar('cnh_categoria')} />
      </FormField>
      <FormField
        rotulo="Validade da CNH"
        obrigatorio
        value={campos.cnh_validade}
        onChangeText={alterar('cnh_validade', mascaraData)}
        erro={erros.cnh_validade}
        keyboardType="number-pad"
        placeholder="DD/MM/AAAA"
      />
      <FormField
        rotulo="Telefone"
        value={campos.telefone}
        onChangeText={alterar('telefone')}
        keyboardType="phone-pad"
        placeholder="(49) 99999-0000"
      />
      <FormField rotulo="Status">
        <OptionChips opcoes={STATUS} valor={campos.status} aoMudar={alterar('status')} />
      </FormField>

      <Label variante="subtitulo" style={styles.secao}>
        Acesso ao app
      </Label>
      <Label variante="legenda" style={styles.dica}>
        {edicao
          ? 'Deixe a senha em branco para manter a atual.'
          : 'O motorista entra no app com este e-mail e senha.'}
      </Label>
      <FormField
        rotulo="E-mail"
        obrigatorio
        value={campos.email}
        onChangeText={alterar('email')}
        erro={erros.email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormField
        rotulo="Senha"
        obrigatorio={!edicao}
        value={campos.senha}
        onChangeText={alterar('senha')}
        erro={erros.senha}
        secureTextEntry
      />
      <Button titulo={edicao ? 'Salvar alterações' : 'Cadastrar motorista'} onPress={salvar} carregando={salvando} />
    </>
  );
}

const styles = StyleSheet.create({
  secao: { marginTop: espacos.md },
  dica: { marginBottom: espacos.md },
});
