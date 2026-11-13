/**
 * SCREEN — ProfileScreen (aba "Perfil")
 * Igual ao perfil do site: cartão com foto, nome, e-mail e selos;
 * "Informações Pessoais" (com troca de senha) e "Ações Rápidas".
 * A foto vai para o backend — é a mesma do site.
 */
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Avatar } from '../components/atoms/Avatar';
import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { Card } from '../components/molecules/Card';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { MenuButton } from '../components/molecules/MenuButton';
import { Selo } from '../components/molecules/Selo';
import { PerfilForm } from '../components/organisms/PerfilForm';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { irParaAba, voltarAoLogin } from '../navigation/acoes';
import { atualizarSessao, logout, obterSessao } from '../services/auth';
import { capturarFoto, escolherImagem } from '../services/nativos';
import { atualizarPerfil, enviarFoto, removerFoto, urlDaFoto } from '../services/usuario';
import { cores, espacamentos } from '../theme';
import { lerDataApi } from '../utils/formato';

const PERFIS = { user: 'Usuário', motorista: 'Motorista', admin: 'Administrador' };
const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

function membroDesde(texto) {
  const d = lerDataApi(texto);
  return d ? `Membro desde ${MESES[d.getMonth()]} de ${d.getFullYear()}` : null;
}

export function ProfileScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [ocupado, setOcupado] = useState(null);
  const [erroFoto, setErroFoto] = useState(null);
  const [erroForm, setErroForm] = useState(null);
  const [aviso, setAviso] = useState(null);

  useFocusEffect(
    useCallback(() => {
      obterSessao().then(setUsuario);
    }, []),
  );

  async function trocarFoto(origem) {
    setErroFoto(null);
    setOcupado('foto');
    try {
      const resultado = origem === 'camera' ? await capturarFoto() : await escolherImagem();
      if (!resultado) return;
      const resposta = await enviarFoto(resultado.uri);
      setUsuario(await atualizarSessao({ fotoUrl: resposta.profile_picture }));
    } catch (e) {
      setErroFoto(e.message);
    } finally {
      setOcupado(null);
    }
  }

  function handleFoto() {
    const opcoes = [
      { text: 'Tirar foto', onPress: () => trocarFoto('camera') },
      { text: 'Escolher da galeria', onPress: () => trocarFoto('galeria') },
    ];
    if (usuario?.fotoUrl) {
      opcoes.push({
        text: 'Remover foto',
        style: 'destructive',
        onPress: async () => {
          setOcupado('foto');
          try {
            await removerFoto();
            setUsuario(await atualizarSessao({ fotoUrl: null }));
          } catch (e) {
            setErroFoto(e.message);
          } finally {
            setOcupado(null);
          }
        },
      });
    }
    opcoes.push({ text: 'Cancelar', style: 'cancel' });
    Alert.alert('Foto do perfil', 'De onde vem a nova foto?', opcoes);
  }

  async function handleSalvar({ nome, email, senha }) {
    setOcupado('form');
    setErroForm(null);
    setAviso(null);
    try {
      const resposta = await atualizarPerfil({ nome, email, senha });
      setUsuario(await atualizarSessao({ nome: resposta.username, login: resposta.email }));
      setAviso('Dados atualizados com sucesso.');
      return true;
    } catch (e) {
      setErroForm(e.message);
      return false;
    } finally {
      setOcupado(null);
    }
  }

  function handleSair() {
    Alert.alert('Sair da conta', 'Encerrar sessão neste aparelho?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          voltarAoLogin(navigation);
        },
      },
    ]);
  }

  const motorista = usuario?.role === 'motorista';
  const admin = usuario?.role === 'admin';
  const desde = membroDesde(usuario?.criadoEm);

  return (
    <ScreenTemplate>
      <Card style={styles.topo}>
        <Pressable
          onPress={handleFoto}
          disabled={ocupado === 'foto'}
          accessibilityRole="button"
          accessibilityLabel="Trocar foto do perfil">
          <Avatar uri={urlDaFoto(usuario?.fotoUrl)} nome={usuario?.nome} tamanho={112} />
          <View style={styles.camera}>
            <Icone nome="camera" cor="#FFFFFF" tamanho={16} />
          </View>
        </Pressable>
        <Label variante="titulo" style={styles.nome} numberOfLines={1}>
          {usuario?.nome || '—'}
        </Label>
        <Label style={styles.email}>{usuario?.login}</Label>
        <View style={styles.selos}>
          <Selo icone="check-circle" texto="Verificado" tipo="verde" />
          <Selo
            icone={motorista ? 'truck' : admin ? 'key' : 'shield'}
            texto={PERFIS[usuario?.role] ?? 'Usuário'}
            tipo="ambar"
          />
        </View>
        {desde ? (
          <View style={styles.desde}>
            <Selo icone="calendar" texto={desde} tipo="cinza" />
          </View>
        ) : null}
      </Card>

      <ErrorMessage mensagem={erroFoto} />
      <AvisoBox tipo="sucesso" mensagem={aviso} />

      <Card titulo="Informações Pessoais" icone="edit-2">
        {usuario ? (
          <PerfilForm
            key={`${usuario.id}-${usuario.nome}-${usuario.login}`}
            usuario={usuario}
            onSubmit={handleSalvar}
            carregando={ocupado === 'form'}
            erro={erroForm}
          />
        ) : null}
      </Card>

      <Card titulo="Ações Rápidas" icone="zap">
        {admin ? (
          <>
            <MenuButton icone="map-pin" titulo="Mapa ao vivo" onPress={() => irParaAba(navigation, 'Mapa')} />
            <MenuButton icone="users" titulo="Cadastros" onPress={() => irParaAba(navigation, 'Cadastros')} />
            <MenuButton icone="star" titulo="Avaliações" onPress={() => irParaAba(navigation, 'AvaliacoesAdmin')} />
          </>
        ) : motorista ? (
          <MenuButton icone="truck" titulo="Painel do motorista" onPress={() => irParaAba(navigation, 'Painel')} />
        ) : (
          <>
            <MenuButton icone="credit-card" titulo="Recarregar cartão" onPress={() => irParaAba(navigation, 'Cartao')} />
            <MenuButton icone="map-pin" titulo="Rastrear ônibus" onPress={() => irParaAba(navigation, 'Mapa')} />
            <MenuButton icone="star" titulo="Avaliar viagem" onPress={() => irParaAba(navigation, 'Avaliar')} />
          </>
        )}
        <MenuButton icone="bell" titulo="Notificações" onPress={() => navigation.navigate('Avisos')} />
        <MenuButton icone="settings" titulo="Configurações" onPress={() => navigation.navigate('Config')} />
        <MenuButton icone="log-out" titulo="Sair da conta" perigo onPress={handleSair} />
      </Card>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  topo: { alignItems: 'center', paddingVertical: espacamentos.xl },
  camera: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: cores.destaque,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nome: { marginTop: espacamentos.md, fontSize: 26 },
  email: { color: cores.textoSecundario, marginTop: 2, fontSize: 16 },
  selos: { flexDirection: 'row', gap: espacamentos.sm, marginTop: espacamentos.md },
  desde: { marginTop: espacamentos.sm },
});
