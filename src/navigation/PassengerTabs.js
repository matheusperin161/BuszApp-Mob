/**
 * Abas inferiores do passageiro: Início, Acompanhar e Recarga.
 * (equivale ao bottom-nav.js da versão web)
 *
 * Recarga entra quando RechargeScreen/cartao.js forem implementados.
 */
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import TrackingScreen from '../screens/TrackingScreen';
import { cores } from '../theme';

const Tabs = createBottomTabNavigator();

const icone = (emoji) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function PassengerTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primariaEscura,
        tabBarInactiveTintColor: cores.textoSuave,
      }}
    >
      <Tabs.Screen name="Início" component={HomeScreen} options={{ tabBarIcon: icone('🏠') }} />
      <Tabs.Screen name="Acompanhar" component={TrackingScreen} options={{ tabBarIcon: icone('🗺️') }} />
    </Tabs.Navigator>
  );
}
