/**
 * Menu lateral da área logada.
 * O conteúdo muda conforme o perfil gravado na sessão:
 *   passageiro/admin → abas (Início, Linhas, Cartão, Avisos) + Avaliar
 *   motorista        → Minha viagem + Ocorrência
 * Perfil e Configurações aparecem para todos.
 */
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

import { Avatar } from '../components/atoms/Avatar';
import { Label } from '../components/atoms/Label';
import { AvaliarScreen } from '../screens/AvaliarScreen';
import { MotoristaScreen } from '../screens/MotoristaScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { logout, obterSessao } from '../services/auth';
import { urlDaFoto } from '../services/usuario';
import { cores, espacamentos } from '../theme';
import { voltarAoLogin } from './acoes';
import { opcoesCabecalho } from './opcoes';
import { PassageiroTabs } from './PassageiroTabs';

const Drawer = createDrawerNavigator();

function ConteudoMenu({ usuario, ...props }) {
  function handleSair() {
    Alert.alert('Sair', 'Encerrar sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          await logout();
          voltarAoLogin(props.navigation);
        },
      },
    ]);
  }

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.cabecalho}>
        <Avatar uri={urlDaFoto(usuario?.fotoUrl)} nome={usuario?.nome} tamanho={64} />
        <Label variante="subtitulo" style={styles.nome}>
          {usuario?.nome}
        </Label>
        <Label variante="legenda">{usuario?.login}</Label>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem label="Sair" labelStyle={styles.sair} onPress={handleSair} />
    </DrawerContentScrollView>
  );
}

export function AppDrawer() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    obterSessao().then(setUsuario);
  }, []);

  if (!usuario) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  const motorista = usuario.role === 'motorista';

  return (
    <Drawer.Navigator
      drawerContent={props => <ConteudoMenu usuario={usuario} {...props} />}
      screenOptions={{
        ...opcoesCabecalho,
        drawerActiveTintColor: cores.primariaTexto,
        drawerActiveBackgroundColor: cores.superficieAlt,
      }}>
      {motorista ? (
        <Drawer.Screen
          name="Viagem"
          component={MotoristaScreen}
          options={{ title: 'Minha viagem', drawerLabel: '🚍  Minha viagem' }}
        />
      ) : (
        <>
          <Drawer.Screen
            name="Inicio"
            component={PassageiroTabs}
            options={{ title: 'BusZapp', drawerLabel: '🏠  Início' }}
          />
          <Drawer.Screen
            name="AvaliarMenu"
            component={AvaliarScreen}
            options={{ title: 'Avaliar viagem', drawerLabel: '⭐  Avaliar viagem' }}
          />
        </>
      )}
      <Drawer.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{ title: 'Meu perfil', drawerLabel: '👤  Meu perfil' }}
      />
      <Drawer.Screen
        name="Config"
        component={SettingsScreen}
        options={{ title: 'Configurações', drawerLabel: '⚙️  Configurações' }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo },
  cabecalho: {
    paddingHorizontal: espacamentos.lg,
    paddingVertical: espacamentos.lg,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    marginBottom: espacamentos.sm,
  },
  nome: { marginTop: espacamentos.sm },
  sair: { color: cores.perigo, fontWeight: '600' },
});
