/**
 * Abas inferiores da área logada — uma barra por perfil, como no site:
 *   passageiro    → Início · Mapa · Recarga · Avaliar · Perfil
 *   motorista     → Painel · Perfil
 *   administrador → Geral · Mapa · Cadastros · Avaliações · Perfil
 * createBottomTabNavigator é uma factory: chama a função, recebe { Navigator, Screen }.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone } from '../components/atoms/Icone';
import { AdminAvaliacoesScreen } from '../screens/AdminAvaliacoesScreen';
import { AdminCadastrosScreen } from '../screens/AdminCadastrosScreen';
import { AdminGeralScreen } from '../screens/AdminGeralScreen';
import { AdminMapaScreen } from '../screens/AdminMapaScreen';
import { AvaliarScreen } from '../screens/AvaliarScreen';
import { CartaoScreen } from '../screens/CartaoScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LinhasScreen } from '../screens/LinhasScreen';
import { MotoristaScreen } from '../screens/MotoristaScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { logout, obterSessao, PERFIS_DO_APP } from '../services/auth';
import { cores } from '../theme';
import { voltarAoLogin } from './acoes';

const Tabs = createBottomTabNavigator();

function icone(nome) {
  return ({ color }) => <Icone nome={nome} cor={color} tamanho={24} />;
}

export function AppTabs({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let ativo = true;
    obterSessao().then(async sessao => {
      if (!ativo) return;
      if (!sessao || !PERFIS_DO_APP.includes(sessao.role)) {
        await logout();
        voltarAoLogin(navigation);
        return;
      }
      setUsuario(sessao);
    });
    return () => {
      ativo = false;
    };
  }, [navigation]);

  if (!usuario) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  const opcoes = {
    headerShown: false,
    tabBarActiveTintColor: cores.primariaEscura,
    tabBarInactiveTintColor: cores.textoSecundario,
    tabBarStyle: {
      backgroundColor: cores.superficie,
      borderTopColor: cores.borda,
      borderTopWidth: 1,
      height: 66 + insets.bottom,
    },
    tabBarItemStyle: { paddingTop: 6, paddingBottom: 6 },
    tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    sceneStyle: { backgroundColor: cores.fundo },
  };

  if (usuario.role === 'admin') {
    return (
      <Tabs.Navigator screenOptions={opcoes}>
        <Tabs.Screen name="Geral" component={AdminGeralScreen} options={{ title: 'Geral', tabBarIcon: icone('layout') }} />
        <Tabs.Screen name="Mapa" component={AdminMapaScreen} options={{ title: 'Mapa', tabBarIcon: icone('map-pin') }} />
        <Tabs.Screen
          name="Cadastros"
          component={AdminCadastrosScreen}
          options={{ title: 'Cadastros', tabBarIcon: icone('users') }}
        />
        <Tabs.Screen
          name="AvaliacoesAdmin"
          component={AdminAvaliacoesScreen}
          options={{ title: 'Avaliações', tabBarIcon: icone('star') }}
        />
        <Tabs.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil', tabBarIcon: icone('user') }} />
      </Tabs.Navigator>
    );
  }

  if (usuario.role === 'motorista') {
    return (
      <Tabs.Navigator screenOptions={opcoes}>
        <Tabs.Screen
          name="Painel"
          component={MotoristaScreen}
          options={{ title: 'Painel', tabBarIcon: icone('truck') }}
        />
        <Tabs.Screen
          name="Perfil"
          component={ProfileScreen}
          options={{ title: 'Perfil', tabBarIcon: icone('user') }}
        />
      </Tabs.Navigator>
    );
  }

  return (
    <Tabs.Navigator screenOptions={opcoes}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Início', tabBarIcon: icone('home') }} />
      <Tabs.Screen name="Mapa" component={LinhasScreen} options={{ title: 'Mapa', tabBarIcon: icone('map-pin') }} />
      <Tabs.Screen
        name="Cartao"
        component={CartaoScreen}
        options={{ title: 'Recarga', tabBarIcon: icone('credit-card') }}
      />
      <Tabs.Screen name="Avaliar" component={AvaliarScreen} options={{ title: 'Avaliar', tabBarIcon: icone('star') }} />
      <Tabs.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Perfil', tabBarIcon: icone('user') }} />
    </Tabs.Navigator>
  );
}

const styles = StyleSheet.create({
  carregando: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo },
});
