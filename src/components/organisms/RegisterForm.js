/**
 * ORGANISM — RegisterForm
 * Nome de usuário, e-mail, senha (mín. 6, com medidor de força), confirmação
 * e aceite dos Termos de Serviço — os mesmos campos do cadastro do site.
 */
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';
import { Label } from '../atoms/Label';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { ForcaSenha } from '../molecules/ForcaSenha';
import { FormField } from '../molecules/FormField';
import { cores, espacamentos } from '../../theme';
import {
  LIMITES,
  erroVisivel,
  primeiroErro,
  validarConfirmacaoSenha,
  validarEmail,
  validarNome,
  validarSenha,
} from '../../utils/validacao';

export function RegisterForm({ onSubmit, onVerTermos, carregando = false, erro = null }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [aceitou, setAceitou] = useState(false);
  const [tocados, setTocados] = useState({});
  const emailRef = useRef(null);
  const senhaRef = useRef(null);
  const confirmacaoRef = useRef(null);

  const erros = {
    nome: validarNome(nome),
    email: validarEmail(email),
    senha: validarSenha(senha, { minima: true }),
    confirmacao: validarConfirmacaoSenha(senha, confirmacao),
    termos: aceitou ? null : 'Aceite os Termos de Serviço para continuar.',
  };

  function tocar(campo) {
    setTocados(atual => ({ ...atual, [campo]: true }));
  }

  function enviar() {
    setTocados({ nome: true, email: true, senha: true, confirmacao: true, termos: true });
    if (primeiroErro(erros) || carregando) return;
    onSubmit({ nome: nome.trim(), login: email.trim().toLowerCase(), senha });
  }

  const erroTermos = erroVisivel(tocados, erros, 'termos');

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <FormField
        variante="cinza"
        icone="user"
        placeholder="Nome de usuário"
        accessibilityLabel="Nome de usuário"
        value={nome}
        onChangeText={setNome}
        onBlur={() => tocar('nome')}
        mensagemErro={erroVisivel(tocados, erros, 'nome')}
        autoCapitalize="words"
        autoComplete="name"
        textContentType="name"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => emailRef.current?.focus()}
      />

      <FormField
        ref={emailRef}
        variante="cinza"
        icone="mail"
        placeholder="seu@email.com"
        accessibilityLabel="E-mail"
        value={email}
        onChangeText={setEmail}
        onBlur={() => tocar('email')}
        mensagemErro={erroVisivel(tocados, erros, 'email')}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => senhaRef.current?.focus()}
      />

      <FormField
        ref={senhaRef}
        variante="cinza"
        icone="lock"
        placeholder={`Senha (mín. ${LIMITES.senhaMin} caracteres)`}
        accessibilityLabel="Senha"
        value={senha}
        onChangeText={setSenha}
        onBlur={() => tocar('senha')}
        mensagemErro={erroVisivel(tocados, erros, 'senha')}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => confirmacaoRef.current?.focus()}
      />
      <ForcaSenha senha={senha} />

      <FormField
        ref={confirmacaoRef}
        variante="cinza"
        icone="lock"
        placeholder="Confirme a senha"
        accessibilityLabel="Confirmar senha"
        value={confirmacao}
        onChangeText={setConfirmacao}
        onBlur={() => tocar('confirmacao')}
        mensagemErro={erroVisivel(tocados, erros, 'confirmacao')}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
        returnKeyType="go"
        onSubmitEditing={enviar}
      />

      <Checkbox marcado={aceitou} onChange={setAceitou} erro={Boolean(erroTermos)}>
        <Label style={styles.termos}>
          Li e aceito os{' '}
          <Label style={styles.link} onPress={onVerTermos} accessibilityRole="link">
            Termos de Serviço
          </Label>
        </Label>
      </Checkbox>
      {erroTermos ? (
        <Label variante="legenda" style={styles.erro}>
          {erroTermos}
        </Label>
      ) : null}

      <Button
        title="Criar conta"
        variante="entrar"
        onPress={enviar}
        carregando={carregando}
        desabilitado={carregando}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  termos: { color: cores.textoMedio, fontSize: 15 },
  link: { color: cores.link, fontWeight: '600', fontSize: 15 },
  erro: { color: cores.perigo, marginTop: espacamentos.xs },
  botao: { marginTop: espacamentos.lg },
});
