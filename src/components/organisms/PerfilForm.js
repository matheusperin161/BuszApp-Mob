/**
 * ORGANISM — PerfilForm
 * "Informações Pessoais" do perfil do site: nome, e-mail e o bloco
 * "Alterar Senha" (em branco = mantém a atual). Salvar / Cancelar lado a lado.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { FormField } from '../molecules/FormField';
import { cores, espacamentos } from '../../theme';
import {
  LIMITES,
  erroVisivel,
  primeiroErro,
  validarConfirmacaoSenha,
  validarEmail,
  validarNome,
} from '../../utils/validacao';

export function PerfilForm({ usuario, onSubmit, carregando = false, erro = null }) {
  const [nome, setNome] = useState(usuario?.nome ?? '');
  const [email, setEmail] = useState(usuario?.login ?? '');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tocados, setTocados] = useState({});

  const erros = {
    nome: validarNome(nome),
    email: validarEmail(email),
    senha:
      senha && senha.length < LIMITES.senhaMin
        ? `Senha precisa ter pelo menos ${LIMITES.senhaMin} caracteres.`
        : null,
    confirmacao: senha ? validarConfirmacaoSenha(senha, confirmacao) : null,
  };

  function tocar(campo) {
    setTocados(atual => ({ ...atual, [campo]: true }));
  }

  function limparSenha() {
    setSenha('');
    setConfirmacao('');
    setTocados({});
  }

  function cancelar() {
    setNome(usuario?.nome ?? '');
    setEmail(usuario?.login ?? '');
    limparSenha();
  }

  async function enviar() {
    setTocados({ nome: true, email: true, senha: true, confirmacao: true });
    if (primeiroErro(erros) || carregando) return;
    const ok = await onSubmit({ nome: nome.trim(), email: email.trim().toLowerCase(), senha });
    if (ok) limparSenha();
  }

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />
      <FormField
        label="Nome de Usuário"
        value={nome}
        onChangeText={setNome}
        onBlur={() => tocar('nome')}
        mensagemErro={erroVisivel(tocados, erros, 'nome')}
        autoCapitalize="words"
      />
      <FormField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        onBlur={() => tocar('email')}
        mensagemErro={erroVisivel(tocados, erros, 'email')}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
      />

      <View style={styles.divisor} />
      <View style={styles.secao}>
        <Icone nome="lock" cor={cores.primaria} tamanho={20} />
        <Label style={styles.secaoTitulo}>Alterar Senha</Label>
      </View>
      <Label variante="legenda" style={styles.secaoAjuda}>
        Deixe em branco para manter a senha atual
      </Label>

      <FormField
        label="Nova Senha"
        placeholder="Nova senha (opcional)"
        value={senha}
        onChangeText={setSenha}
        onBlur={() => tocar('senha')}
        mensagemErro={erroVisivel(tocados, erros, 'senha')}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
      />
      <FormField
        label="Confirmar Nova Senha"
        placeholder="Confirme a nova senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        onBlur={() => tocar('confirmacao')}
        mensagemErro={erroVisivel(tocados, erros, 'confirmacao')}
        secureTextEntry
        editable={Boolean(senha)}
        textContentType="newPassword"
      />

      <View style={styles.botoes}>
        <Button
          title="Salvar"
          icone="save"
          onPress={enviar}
          carregando={carregando}
          style={styles.flex}
        />
        <Button title="Cancelar" variante="claro" onPress={cancelar} style={styles.flex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  divisor: { height: 1, backgroundColor: cores.cinzaClaro, marginVertical: espacamentos.sm },
  secao: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm, marginTop: espacamentos.sm },
  secaoTitulo: { fontWeight: '700', fontSize: 17 },
  secaoAjuda: { marginTop: 2, marginBottom: espacamentos.md },
  botoes: { flexDirection: 'row', gap: espacamentos.sm + 4, marginTop: espacamentos.sm },
  flex: { flex: 1 },
});
