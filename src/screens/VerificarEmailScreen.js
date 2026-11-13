/**
 * SCREEN — VerificarEmailScreen
 * Depois do cadastro: explica a confirmação por e-mail e permite reenviar.
 */
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Icone } from '../components/atoms/Icone';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { CenteredTemplate } from '../components/templates/CenteredTemplate';
import { reenviarVerificacao } from '../services/auth';

export function VerificarEmailScreen({ navigation, route }) {
  const email = route.params?.email ?? '';
  const [reenviando, setReenviando] = useState(false);
  const [aviso, setAviso] = useState(
    route.params?.enviado === false ? null : `Enviamos o link de confirmação para ${email}.`,
  );
  const [erro, setErro] = useState(
    route.params?.enviado === false
      ? 'A conta foi criada, mas o e-mail não saiu. Toque em "Reenviar e-mail".'
      : null,
  );

  async function handleReenviar() {
    setReenviando(true);
    setErro(null);
    try {
      const resposta = await reenviarVerificacao(email);
      setAviso(resposta?.message || 'Novo link enviado.');
    } catch (e) {
      setErro(e.message);
    } finally {
      setReenviando(false);
    }
  }

  return (
    <CenteredTemplate
      destaque={<Icone nome="mail" cor="#FFFFFF" tamanho={60} />}
      titulo="Verifique seu e-mail"
      subtitulo="Falta pouco! Confirme o endereço para liberar o acesso."
      tituloForm="Confirme a conta"
      subtituloForm={
        'Abra a mensagem do BusZapp e toque em “Confirmar e-mail”. Depois é só voltar aqui e entrar. ' +
        'O link vale por 24 horas — olhe também a caixa de spam.'
      }
      rodape={
        <Button
          title="Reenviar e-mail"
          icone="send"
          variante="secundario"
          onPress={handleReenviar}
          carregando={reenviando}
          style={styles.reenviar}
        />
      }>
      <AvisoBox tipo="sucesso" mensagem={aviso} />
      <ErrorMessage mensagem={erro} />
      <Button
        title="Já confirmei, quero entrar"
        variante="entrar"
        onPress={() => navigation.replace('Login', { email })}
      />
    </CenteredTemplate>
  );
}

const styles = StyleSheet.create({
  reenviar: { alignSelf: 'stretch' },
});
