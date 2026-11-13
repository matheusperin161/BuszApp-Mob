/**
 * App.js — só a pilha raiz + o container de navegação.
 * As abas moram em src/navigation/AppTabs.js. Cada tela desenha o próprio
 * cabeçalho em degradê (organism Cabecalho), igual ao topo do site.
 */
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ID_PILHA_RAIZ } from './src/navigation/acoes';
import { AppTabs } from './src/navigation/AppTabs';
import { AcompanhamentoScreen } from './src/screens/AcompanhamentoScreen';
import { CadastroCartaoScreen } from './src/screens/CadastroCartaoScreen';
import { EsqueciSenhaScreen } from './src/screens/EsqueciSenhaScreen';
import { ExtratoScreen } from './src/screens/ExtratoScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { NotificacoesScreen } from './src/screens/NotificacoesScreen';
import { OcorrenciaScreen } from './src/screens/OcorrenciaScreen';
import { RecargaScreen } from './src/screens/RecargaScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { VerificarEmailScreen } from './src/screens/VerificarEmailScreen';
import { cores } from './src/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={styles.raiz}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <NavigationContainer>
          <Stack.Navigator
            id={ID_PILHA_RAIZ}
            initialRouteName="Login"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: cores.fundo },
              animation: 'slide_from_right',
            }}>
            <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
            <Stack.Screen name="Cadastro" component={RegisterScreen} />
            <Stack.Screen name="VerificarEmail" component={VerificarEmailScreen} />
            <Stack.Screen name="EsqueciSenha" component={EsqueciSenhaScreen} />
            <Stack.Screen name="Principal" component={AppTabs} options={{ animation: 'fade' }} />
            <Stack.Screen name="Acompanhamento" component={AcompanhamentoScreen} />
            <Stack.Screen name="Recarga" component={RecargaScreen} />
            <Stack.Screen name="CadastroCartao" component={CadastroCartaoScreen} />
            <Stack.Screen name="Extrato" component={ExtratoScreen} />
            <Stack.Screen name="Avisos" component={NotificacoesScreen} />
            <Stack.Screen name="Config" component={SettingsScreen} />
            <Stack.Screen name="Ocorrencia" component={OcorrenciaScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
});
