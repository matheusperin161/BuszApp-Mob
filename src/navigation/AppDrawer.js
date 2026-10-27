/**
 * Menu lateral da área logada (equivale ao sidebar.js da versão web).
 * Uma rota (Passageiro) é outro navigator (abas). As outras são screens simples.
 *
 * Avaliar viagem entra quando RatingScreen for implementada.
 */
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';

import { useAuth } from '../contexts/AuthContext';
import ProfileScreen from '../screens/ProfileScreen';
import { cores } from '../theme';
import { opcoesCabecalho } from './opcoes';
import PassengerTabs from './PassengerTabs';

const Drawer = createDrawerNavigator();

function ConteudoMenu(props) {
  const { sair } = useAuth();
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem label="Sair" onPress={sair} />
    </DrawerContentScrollView>
  );
}

export default function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <ConteudoMenu {...props} />}
      screenOptions={{ ...opcoesCabecalho, drawerActiveTintColor: cores.primariaEscura }}
    >
      <Drawer.Screen name="Passageiro" component={PassengerTabs} options={{ title: 'BusZapp', drawerLabel: 'Início' }} />
      <Drawer.Screen name="Perfil" component={ProfileScreen} options={{ title: 'Meu perfil' }} />
    </Drawer.Navigator>
  );
}
