/**
 * ORGANISM — LoginForm
 * Formulário de login completo.
 */
import { useState } from 'react';

import Button from '../atoms/Button';
import ErrorMessage from '../molecules/ErrorMessage';
import FormField from '../molecules/FormField';
import { email as validarEmail, obrigatorio } from '../../utils/validacao';

export default function LoginForm({ aoEntrar }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const enviar = async () => {
    const novos = { email: validarEmail(email), senha: obrigatorio(senha, 'Senha') };
    setErros(novos);
    if (novos.email || novos.senha) return;
    setErroGeral(null);
    setCarregando(true);
    try {
      await aoEntrar(email, senha);
    } catch (erro) {
      setErroGeral(erro.message);
      setCarregando(false);
    }
  };

  return (
    <>
      <ErrorMessage mensagem={erroGeral} />
      <FormField
        rotulo="E-mail"
        value={email}
        onChangeText={setEmail}
        erro={erros.email}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="username"
      />
      <FormField
        rotulo="Senha"
        value={senha}
        onChangeText={setSenha}
        erro={erros.senha}
        secureTextEntry
        textContentType="password"
        onSubmitEditing={enviar}
      />
      <Button titulo="Entrar" onPress={enviar} carregando={carregando} />
    </>
  );
}
