/**
 * Pilha do administrador: painel, rotas, motoristas e veículos.
 * Só é montada para role 'admin' (App.js) — os outros perfis nem têm essas telas (CA02.1).
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddDriverScreen from '../screens/AddDriverScreen';
import AdminScreen from '../screens/AdminScreen';
import AdminTripsScreen from '../screens/AdminTripsScreen';
import DriversScreen from '../screens/DriversScreen';
import { comBotaoSair, opcoesCabecalho } from './opcoes';

const Stack = createNativeStackNavigator();

export default function AdminStack() {
  return (
    <Stack.Navigator screenOptions={opcoesCabecalho}>
      <Stack.Screen name="Painel" component={AdminScreen} options={{ title: 'Admin', ...comBotaoSair }} />
      <Stack.Screen name="Motoristas" component={DriversScreen} />
      <Stack.Screen name="FormMotorista" component={AddDriverScreen} options={{ title: 'Motorista' }} />
      <Stack.Screen name="ViagensAtivas" component={AdminTripsScreen} options={{ title: 'Viagens em andamento' }} />
    </Stack.Navigator>
  );
}
