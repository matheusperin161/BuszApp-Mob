/**
 * Abas inferiores do passageiro: Início, Acompanhar e Cartão.
 * (equivale ao bottom-nav.js da versão web)
 */
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from '../screens/HomeScreen';
import RechargeScreen from '../screens/RechargeScreen';
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
      <Tabs.Screen name="Cartão" component={RechargeScreen} options={{ tabBarIcon: icone('💳') }} />
    </Tabs.Navigator>
  );
}
