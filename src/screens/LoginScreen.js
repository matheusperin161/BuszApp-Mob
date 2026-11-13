/**
 * SCREEN — LoginScreen
 * 1. Ao abrir, confere se já há sessão (login automático).
 * 2. E-mail não confirmado → oferece reenviar o link (regra do backend).
 * 3. Entram passageiro, motorista e administrador (cada um vê as abas do seu perfil).
 */
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StatusBar, StyleSheet, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Gradiente } from '../components/atoms/Gradiente';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { LoginForm } from '../components/organisms/LoginForm';
import { CenteredTemplate } from '../components/templates/CenteredTemplate';
import { login, reenviarVerificacao, sessaoAtiva } from '../services/auth';
import { cores, espacamentos, gradientes } from '../theme';

const LOGO = require('../assets/logo.png');

export function LoginScreen({ navigation, route }) {
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [naoVerificado, setNaoVerificado] = useState(null);
  const [reenviando, setReenviando] = useState(false);
  const [aviso, setAviso] = useState(route.params?.aviso ?? null);

  useEffect(() => {
    let ativo = true;

    async function verificarSessao() {
      const temSessao = await sessaoAtiva();
      if (!ativo) return;
      if (temSessao) {
        navigation.replace('Principal');
      } else {
        setVerificandoSessao(false);
      }
    }

    verificarSessao();
    return () => {
      ativo = false;
    };
  }, [navigation]);

  async function handleLogin(email, senha, lembrar) {
    setCarregando(true);
    setErro(null);
    setAviso(null);
    setNaoVerificado(null);
    try {
      await login(email, senha, lembrar);
      navigation.replace('Principal');
    } catch (e) {
      if (e.causa === 'nao_verificado') {
        setNaoVerificado(email);
      } else {
        setErro(e.message);
      }
    } finally {
      setCarregando(false);
    }
  }

  async function handleReenviar() {
    setReenviando(true);
    try {
      const resposta = await reenviarVerificacao(naoVerificado);
      setAviso(resposta?.message || 'Novo link enviado. Confira seu e-mail.');
      setNaoVerificado(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setReenviando(false);
    }
  }

  if (verificandoSessao) {
    return (
      <View style={styles.splash}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <Gradiente {...gradientes.login} />
        <View style={styles.splashLogo}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>
        <Label style={styles.marca}>BuszApp</Label>
        <ActivityIndicator size="large" color="#FFFFFF" style={styles.spinner} />
      </View>
    );
  }

  return (
    <CenteredTemplate
      destaque={<Image source={LOGO} style={styles.logo} resizeMode="contain" />}
      titulo="Bem-vindo!"
      subtitulo="Acesse sua conta e acompanhe os ônibus de Chapecó em tempo real."
      tituloForm="Faça seu login"
      subtituloForm="Entre com suas credenciais para acessar o sistema"
      rodape={
        <Pressable onPress={() => navigation.navigate('Cadastro')} accessibilityRole="link">
          <Label style={styles.rodape}>
            Não tem conta? <Label style={styles.link}>Cadastre-se gratuitamente</Label>
          </Label>
        </Pressable>
      }>
      <AvisoBox tipo="sucesso" mensagem={aviso} />
      {naoVerificado ? (
        <AvisoBox
          tipo="alerta"
          titulo="Confirme seu e-mail"
          mensagem={`Enviamos um link para ${naoVerificado}. Abra o e-mail e toque em "Confirmar e-mail" antes de entrar.`}>
          <Button
            title="Reenviar link"
            icone="send"
            variante="secundario"
            onPress={handleReenviar}
            carregando={reenviando}
            style={styles.reenviar}
          />
        </AvisoBox>
      ) : null}
      <LoginForm
        onSubmit={handleLogin}
        onEsqueciSenha={() => navigation.navigate('EsqueciSenha')}
        carregando={carregando}
        erro={erro}
        emailInicial={route.params?.email ?? ''}
      />
    </CenteredTemplate>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.primaria },
  splashLogo: {
    width: 132,
    height: 132,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 92, height: 92 },
  marca: { color: '#FFFFFF', fontSize: 32, fontWeight: '800', marginTop: espacamentos.md },
  spinner: { marginTop: espacamentos.lg },
  reenviar: { marginTop: espacamentos.sm, minHeight: 44 },
  rodape: { color: cores.textoSecundario, textAlign: 'center', fontSize: 15, lineHeight: 22 },
  link: { color: cores.link, fontWeight: '700', fontSize: 15 },
});
