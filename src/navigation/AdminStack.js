/**
 * Pilha do administrador: painel, rotas, motoristas, veículos e cartões.
 * Só é montada para role 'admin' (App.js) — os outros perfis nem têm essas telas (CA02.1).
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddDriverScreen from '../screens/AddDriverScreen';
import AddStopScreen from '../screens/AddStopScreen';
import AdminCardsScreen from '../screens/AdminCardsScreen';
import AdminRoutesScreen from '../screens/AdminRoutesScreen';
import AdminScreen from '../screens/AdminScreen';
import AdminTripsScreen from '../screens/AdminTripsScreen';
import AssociateStopScreen from '../screens/AssociateStopScreen';
import DriversScreen from '../screens/DriversScreen';
import RouteStopsScreen from '../screens/RouteStopsScreen';
import StopsScreen from '../screens/StopsScreen';
import { comBotaoSair, opcoesCabecalho } from './opcoes';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={opcoesCabecalho}>
      <Stack.Screen name="Painel" component={AdminScreen} options={{ title: 'Admin', ...comBotaoSair }} />
      <Stack.Screen name="Motoristas" component={DriversScreen} />
      <Stack.Screen name="FormMotorista" component={AddDriverScreen} options={{ title: 'Motorista' }} />
      <Stack.Screen name="ViagensAtivas" component={AdminTripsScreen} options={{ title: 'Viagens em andamento' }} />
      <Stack.Screen name="Cartoes" component={AdminCardsScreen} options={{ title: 'Cartões de transporte' }} />
      <Stack.Screen name="Rotas" component={AdminRoutesScreen} options={{ title: 'Rotas e paradas' }} />
      <Stack.Screen name="Paradas" component={StopsScreen} />
      <Stack.Screen name="FormParada" component={AddStopScreen} options={{ title: 'Parada' }} />
      <Stack.Screen name="ParadasLinha" component={RouteStopsScreen} options={{ title: 'Paradas da linha' }} />
      <Stack.Screen name="FormParadaLinha" component={AssociateStopScreen} options={{ title: 'Associar parada' }} />
    </Stack.Navigator>
  );
}
