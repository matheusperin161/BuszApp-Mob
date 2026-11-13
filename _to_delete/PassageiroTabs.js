/**
 * Abas inferiores do passageiro: Início, Linhas, Cartão e Avisos.
 * createBottomTabNavigator é uma factory: chama a função, recebe { Navigator, Screen }.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { CartaoScreen } from '../screens/CartaoScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { LinhasScreen } from '../screens/LinhasScreen';
import { NotificacoesScreen } from '../screens/NotificacoesScreen';
import { cores } from '../theme';

const Tabs = createBottomTabNavigator();

function icone(emoji) {
  return ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.55 }}>{emoji}</Text>;
}

export function PassageiroTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primariaTexto,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda },
        tabBarLabelStyle: { fontWeight: '600' },
      }}>
      <Tabs.Screen name="Home" component={HomeScreen} options={{ title: 'Início', tabBarIcon: icone('🏠') }} />
      <Tabs.Screen name="Linhas" component={LinhasScreen} options={{ title: 'Linhas', tabBarIcon: icone('🚌') }} />
      <Tabs.Screen name="Cartao" component={CartaoScreen} options={{ title: 'Cartão', tabBarIcon: icone('💳') }} />
      <Tabs.Screen name="Avisos" component={NotificacoesScreen} options={{ title: 'Avisos', tabBarIcon: icone('🔔') }} />
    </Tabs.Navigator>
  );
}
