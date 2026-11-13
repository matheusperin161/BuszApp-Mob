/**
 * SCREEN — EsqueciSenhaScreen
 * Mesmo fluxo do site: e-mail → código de 6 dígitos (15 min) → nova senha.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { FormField } from '../components/molecules/FormField';
import { RedefinirSenhaForm } from '../components/organisms/RedefinirSenhaForm';
import { CenteredTemplate } from '../components/templates/CenteredTemplate';
import { redefinirSenha, solicitarCodigo, verificarCodigo } from '../services/auth';
import { cores, espacamentos } from '../theme';
import { validarEmail } from '../utils/validacao';

export function EsqueciSenhaScreen({ navigation }) {
  const [etapa, setEtapa] = useState('email');
  const [email, setEmail] = useState('');
  const [tocado, setTocado] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [aviso, setAviso] = useState(null);

  const erroEmail = validarEmail(email);

  async function handlePedirCodigo() {
    setTocado(true);
    if (erroEmail || carregando) return;
    setCarregando(true);
    setErro(null);
    try {
      await solicitarCodigo(email.trim().toLowerCase());
      setAviso('Se o e-mail estiver cadastrado, o código chega em instantes. Ele vale por 15 minutos.');
      setEtapa('codigo');
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  async function handleRedefinir({ codigo, senha, confirmacao }) {
    const emailLimpo = email.trim().toLowerCase();
    setCarregando(true);
    setErro(null);
    try {
      await verificarCodigo(emailLimpo, codigo);
      await redefinirSenha({ email: emailLimpo, codigo, senha, confirmacao });
      navigation.replace('Login', {
        email: emailLimpo,
        aviso: 'Senha alterada! Entre com a nova senha.',
      });
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <CenteredTemplate
      destaque={<Icone nome="key" cor="#FFFFFF" tamanho={60} />}
      titulo="Esqueceu a senha?"
      subtitulo="Sem problemas! Vamos te ajudar a recuperar o acesso."
      tituloForm={etapa === 'email' ? 'Recuperar senha' : 'Nova senha'}
      subtituloForm={
        etapa === 'email'
          ? 'Informe o e-mail da sua conta para receber um código de 6 dígitos.'
          : `Digite o código enviado para ${email.trim()} e escolha a nova senha.`
      }
      rodape={
        etapa === 'codigo' ? (
          <Pressable
            onPress={() => {
              setEtapa('email');
              setAviso(null);
              setErro(null);
            }}
            accessibilityRole="link">
            <Label style={styles.link}>Não recebi / trocar e-mail</Label>
          </Pressable>
        ) : (
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="link" style={styles.voltar}>
            <Icone nome="arrow-left" cor={cores.textoSecundario} tamanho={18} />
            <Label style={styles.voltarTexto}>Voltar para o login</Label>
          </Pressable>
        )
      }>
      <AvisoBox tipo="info" mensagem={etapa === 'codigo' ? aviso : null} />
      {etapa === 'email' ? (
        <View>
          <ErrorMessage mensagem={erro} />
          <FormField
            variante="cinza"
            icone="mail"
            accessibilityLabel="E-mail"
            placeholder="seu@email.com"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTocado(true)}
            mensagemErro={tocado ? erroEmail : null}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={handlePedirCodigo}
          />
          <Button
            title="Enviar código"
            icone="send"
            variante="entrar"
            onPress={handlePedirCodigo}
            carregando={carregando}
          />
        </View>
      ) : (
        <RedefinirSenhaForm onSubmit={handleRedefinir} carregando={carregando} erro={erro} />
      )}
    </CenteredTemplate>
  );
}

const styles = StyleSheet.create({
  link: { color: cores.link, fontWeight: '700', fontSize: 15 },
  voltar: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  voltarTexto: { color: cores.textoSecundario, fontSize: 15 },
});
