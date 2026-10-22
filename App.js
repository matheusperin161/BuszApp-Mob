/**
 * App.js — só a pilha raiz + o container de navegação.
 * Abas, drawer e pilha do admin moram em src/navigation/.
 *
 * A pilha raiz depende do perfil logado: cada role só enxerga as próprias telas.
 */
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AdminStack from './src/navigation/AdminStack';
import AppDrawer from './src/navigation/AppDrawer';
import { comBotaoSair, opcoesCabecalho } from './src/navigation/opcoes';
import DriverScreen from './src/screens/DriverScreen';
import LoginScreen from './src/screens/LoginScreen';
import { cores } from './src/theme';

const Stack = createNativeStackNavigator();

function PilhaRaiz() {
  const { sessao, restaurando } = useAuth();

  if (restaurando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={opcoesCabecalho}>
      {!sessao ? (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      ) : sessao.role === 'admin' ? (
        <Stack.Screen name="Admin" component={AdminStack} options={{ headerShown: false }} />
      ) : sessao.role === 'motorista' ? (
        <Stack.Screen name="Motorista" component={DriverScreen} options={{ title: 'Motorista', ...comBotaoSair }} />
      ) : (
        <Stack.Screen name="Principal" component={AppDrawer} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <PilhaRaiz />
          <StatusBar style="dark" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
