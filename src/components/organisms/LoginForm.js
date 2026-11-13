/**
 * ORGANISM — LoginForm
 * Estado local dos campos. Valida no blur e no submit.
 * A screen só recebe e-mail/senha/lembrar se a validação passar.
 * Visual do login do site: campos cinza com ícone, "Lembrar de mim" e
 * "Esqueceu a senha?" na mesma linha, botão "Entrar" em degradê.
 */
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Checkbox } from '../atoms/Checkbox';
import { Label } from '../atoms/Label';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { FormField } from '../molecules/FormField';
import { cores, espacamentos } from '../../theme';
import {
  erroVisivel,
  primeiroErro,
  validarEmail,
  validarSenha,
} from '../../utils/validacao';

export function LoginForm({
  onSubmit,
  onEsqueciSenha,
  carregando = false,
  erro = null,
  emailInicial = '',
}) {
  const [email, setEmail] = useState(emailInicial);
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(true);
  const [tocados, setTocados] = useState({});
  const senhaRef = useRef(null);

  const erros = {
    email: validarEmail(email),
    senha: validarSenha(senha),
  };

  function tocar(campo) {
    setTocados(atual => ({ ...atual, [campo]: true }));
  }

  function enviar() {
    setTocados({ email: true, senha: true });
    if (primeiroErro(erros) || carregando) return;
    onSubmit(email.trim().toLowerCase(), senha, lembrar);
  }

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <FormField
        variante="cinza"
        icone="mail"
        placeholder="E-mail"
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
        placeholder="Senha"
        accessibilityLabel="Senha"
        value={senha}
        onChangeText={setSenha}
        onBlur={() => tocar('senha')}
        mensagemErro={erroVisivel(tocados, erros, 'senha')}
        secureTextEntry
        autoComplete="password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={enviar}
      />

      <View style={styles.linha}>
        <Checkbox marcado={lembrar} onChange={setLembrar} rotulo="Lembrar de mim" />
        <Pressable onPress={onEsqueciSenha} hitSlop={8} accessibilityRole="link">
          <Label style={styles.link}>Esqueceu a senha?</Label>
        </Pressable>
      </View>

      <Button
        title="Entrar"
        variante="entrar"
        onPress={enviar}
        carregando={carregando}
        desabilitado={carregando}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamentos.lg,
    gap: espacamentos.sm,
  },
  link: { color: cores.link, fontWeight: '600' },
});
