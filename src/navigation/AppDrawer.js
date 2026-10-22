/**
 * Menu lateral da área logada (equivale ao sidebar.js da versão web).
 * Uma rota (Passageiro) é outro navigator (abas). As outras são screens simples.
 *
 * Meu perfil e Avaliar viagem entram quando ProfileScreen/RatingScreen forem implementadas.
 */
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';

import { useAuth } from '../contexts/AuthContext';
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
    </Drawer.Navigator>
  );
}
