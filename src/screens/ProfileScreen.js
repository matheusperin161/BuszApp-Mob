/**
 * SCREEN — ProfileScreen
 * Dados do usuário e foto de perfil.
 * Equivalente web: static/profile.html
 *
 * Foto tirada com a câmera (permissão pedida só ao tocar em "Tirar foto") e guardada
 * só no aparelho (fotoPerfil.js). Também mostra a situação das permissões do app
 * e leva às configurações; ao voltar de lá, a lista se atualiza sozinha.
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert, AppState, Image, Linking, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import Badge from '../components/atoms/Badge';
import Button from '../components/atoms/Button';
import Label from '../components/atoms/Label';
import ErrorMessage from '../components/molecules/ErrorMessage';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { useAuth } from '../contexts/AuthContext';
import { lerFoto, removerFoto, salvarFoto } from '../services/fotoPerfil';
import { consultarPermissoes, verificarCamera } from '../services/permissoes';
import { cores, espacos, raios } from '../theme';

const PERMISSOES = [
  { chave: 'camera', rotulo: 'Câmera', uso: 'Foto de perfil' },
  { chave: 'localizacao', rotulo: 'Localização', uso: 'Envio da posição do ônibus (motorista)' },
  { chave: 'notificacoes', rotulo: 'Notificações', uso: 'Avisos do cartão de transporte' },
];
const TOM = { permitida: 'sucesso', negada: 'perigo', pendente: 'neutro', indisponivel: 'aviso' };
const TEXTO = { permitida: 'Permitida', negada: 'Negada', pendente: 'Não solicitada', indisponivel: 'Indisponível' };
const PAPEL = { user: 'Passageiro', admin: 'Administrador', motorista: 'Motorista' };

export default function ProfileScreen() {
  const { sessao } = useAuth();
  const usuarioId = sessao?.user?.id;
  const [foto, setFoto] = useState(null);
  const [permissoes, setPermissoes] = useState(null);
  const [erro, setErro] = useState(null);
  const [processando, setProcessando] = useState(false);

  const atualizarPermissoes = useCallback(async () => {
    try {
      setPermissoes(await consultarPermissoes());
    } catch {
      setPermissoes(null);
    }
  }, []);

  useEffect(() => {
    if (usuarioId != null) lerFoto(usuarioId).then(setFoto).catch(() => setFoto(null));
    atualizarPermissoes();
  }, [usuarioId, atualizarPermissoes]);

  // Voltando das configurações: reavalia as permissões
  useEffect(() => {
    const assinatura = AppState.addEventListener('change', (estado) => {
      if (estado === 'active') atualizarPermissoes();
    });
    return () => assinatura.remove();
  }, [atualizarPermissoes]);

  const tirarFoto = async () => {
    setErro(null);
    setProcessando(true);
    try {
      const motivo = await verificarCamera();
      await atualizarPermissoes();
      if (motivo) {
        setErro(motivo);
        return;
      }
      // exif: false — a foto não carrega metadados (como localização) para dentro do app
      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        exif: false,
      });
      if (resultado.canceled || !resultado.assets?.length) return;
      setFoto(await salvarFoto(usuarioId, resultado.assets[0].uri));
    } catch (e) {
      setErro(`Não foi possível salvar a foto. ${e.message ?? ''}`.trim());
    } finally {
      setProcessando(false);
    }
  };

  const confirmarRemocao = () => {
    Alert.alert('Remover foto', 'Apagar a foto de perfil deste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await removerFoto(usuarioId);
          setFoto(null);
        },
      },
    ]);
  };

  const { username, email } = sessao?.user ?? {};

  return (
    <ScreenTemplate titulo="Meu perfil">
      <View style={styles.cabecalho}>
        {foto ? (
          <Image source={{ uri: foto }} style={styles.foto} accessibilityLabel="Foto de perfil" />
        ) : (
          <View style={[styles.foto, styles.semFoto]}>
            <Text style={styles.inicial}>{(username ?? '?').slice(0, 1).toUpperCase()}</Text>
          </View>
        )}
        <Label variante="subtitulo">{username}</Label>
        {email ? <Label variante="legenda">{email}</Label> : null}
        <Badge texto={PAPEL[sessao?.role] ?? sessao?.role} tom="info" style={styles.papel} />
      </View>

      <ErrorMessage mensagem={erro} />
      <Button
        titulo={foto ? 'Trocar foto' : 'Tirar foto'}
        onPress={tirarFoto}
        carregando={processando}
        desabilitado={usuarioId == null}
      />
      {foto ? <Button titulo="Remover foto" variante="secundario" onPress={confirmarRemocao} style={styles.botao} /> : null}

      <Label variante="subtitulo" style={styles.secao}>
        Permissões do app
      </Label>
      {PERMISSOES.map(({ chave, rotulo, uso }) => (
        <View key={chave} style={styles.permissao}>
          <View style={styles.permissaoTexto}>
            <Label>{rotulo}</Label>
            <Label variante="legenda">{uso}</Label>
          </View>
          {permissoes ? <Badge texto={TEXTO[permissoes[chave]]} tom={TOM[permissoes[chave]]} /> : null}
        </View>
      ))}
      <Button
        titulo="Abrir configurações"
        variante="secundario"
        onPress={() => Linking.openSettings()}
        style={styles.botao}
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  cabecalho: { alignItems: 'center', gap: espacos.xs, marginBottom: espacos.lg },
  foto: { width: 120, height: 120, borderRadius: 60, marginBottom: espacos.sm },
  semFoto: { backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  inicial: { fontSize: 48, fontWeight: '800', color: cores.textoInverso },
  papel: { alignSelf: 'center', marginTop: espacos.xs },
  botao: { marginTop: espacos.sm },
  secao: { marginTop: espacos.xl, marginBottom: espacos.sm },
  permissao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    padding: espacos.md,
    marginBottom: espacos.sm,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  permissaoTexto: { flex: 1 },
});
