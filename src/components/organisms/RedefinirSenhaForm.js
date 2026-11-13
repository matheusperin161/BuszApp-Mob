/**
 * ORGANISM — RedefinirSenhaForm
 * Etapa 2 do "Esqueci minha senha": código de 6 dígitos + nova senha.
 */
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { FormField } from '../molecules/FormField';
import { espacamentos } from '../../theme';
import {
  LIMITES,
  erroVisivel,
  primeiroErro,
  validarCodigo,
  validarConfirmacaoSenha,
  validarSenha,
} from '../../utils/validacao';

export function RedefinirSenhaForm({ onSubmit, carregando = false, erro = null }) {
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [tocados, setTocados] = useState({});
  const senhaRef = useRef(null);
  const confirmacaoRef = useRef(null);

  const erros = {
    codigo: validarCodigo(codigo),
    senha: validarSenha(senha, { minima: true }),
    confirmacao: validarConfirmacaoSenha(senha, confirmacao),
  };

  function tocar(campo) {
    setTocados(atual => ({ ...atual, [campo]: true }));
  }

  function enviar() {
    setTocados({ codigo: true, senha: true, confirmacao: true });
    if (primeiroErro(erros) || carregando) return;
    onSubmit({ codigo: codigo.trim(), senha, confirmacao });
  }

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <FormField
        variante="cinza"
        icone="key"
        accessibilityLabel="Código recebido"
        placeholder="000000"
        value={codigo}
        onChangeText={texto => setCodigo(texto.replace(/\D/g, '').slice(0, LIMITES.codigoDigitos))}
        onBlur={() => tocar('codigo')}
        mensagemErro={erroVisivel(tocados, erros, 'codigo')}
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={LIMITES.codigoDigitos}
        style={styles.codigo}
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => senhaRef.current?.focus()}
      />

      <FormField
        ref={senhaRef}
        variante="cinza"
        icone="lock"
        accessibilityLabel="Nova senha"
        placeholder={`Nova senha (mín. ${LIMITES.senhaMin} caracteres)`}
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

      <FormField
        ref={confirmacaoRef}
        variante="cinza"
        icone="lock"
        accessibilityLabel="Confirmar nova senha"
        placeholder="Repita a senha"
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

      <Button
        title="Salvar nova senha"
        variante="entrar"
        onPress={enviar}
        carregando={carregando}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  codigo: { fontSize: 22, letterSpacing: 8, fontWeight: '700' },
  botao: { marginTop: espacamentos.sm },
});
