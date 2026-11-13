/**
 * SCREEN — RegisterScreen
 * Cria a conta e leva para "Verifique seu e-mail" (o backend só libera
 * o login depois que o link de confirmação é aberto).
 * Cadastro pelo app é sempre de passageiro; motorista é cadastrado pelo admin no site.
 */
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { RegisterForm } from '../components/organisms/RegisterForm';
import { TermosModal } from '../components/organisms/TermosModal';
import { CenteredTemplate } from '../components/templates/CenteredTemplate';
import { registrar } from '../services/auth';
import { cores, espacamentos } from '../theme';

export function RegisterScreen({ navigation }) {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [termos, setTermos] = useState(false);

  async function handleRegistro(dados) {
    setCarregando(true);
    setErro(null);
    try {
      const resposta = await registrar(dados);
      navigation.replace('VerificarEmail', {
        email: dados.login,
        enviado: resposta?.email_sent !== false,
      });
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <CenteredTemplate
      destaque={<Icone nome="user-plus" cor="#FFFFFF" tamanho={64} />}
      titulo="Crie sua conta"
      subtitulo="Acompanhe os ônibus, recarregue o cartão e avalie suas viagens."
      tituloForm="Cadastro"
      subtituloForm="Preencha os campos para criar sua conta"
      rodape={
        <>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="link">
            <Label style={styles.rodape}>
              Já tem conta? <Label style={styles.link}>Faça login</Label>
            </Label>
          </Pressable>
        </>
      }>
      <RegisterForm
        onSubmit={handleRegistro}
        onVerTermos={() => setTermos(true)}
        carregando={carregando}
        erro={erro}
      />
      <TermosModal visivel={termos} onFechar={() => setTermos(false)} />
    </CenteredTemplate>
  );
}

const styles = StyleSheet.create({
  rodape: { color: cores.textoSecundario, textAlign: 'center', fontSize: 15, marginTop: espacamentos.xs },
  link: { color: cores.link, fontWeight: '700', fontSize: 15 },
});
