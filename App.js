/**
 * App.js — só a pilha raiz + o container de navegação.
 * As abas moram em src/navigation/AppTabs.js. Cada tela desenha o próprio
 * cabeçalho em degradê (organism Cabecalho), igual ao topo do site.
 */
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ID_PILHA_RAIZ } from './src/navigation/acoes';
import { ToastProvider } from './src/components/organisms/Toast';
import { AppTabs } from './src/navigation/AppTabs';
import { AcompanhamentoScreen } from './src/screens/AcompanhamentoScreen';
import { AdminLinhaFormScreen } from './src/screens/AdminLinhaFormScreen';
import { AdminMotoristaFormScreen } from './src/screens/AdminMotoristaFormScreen';
import { AdminParadaFormScreen } from './src/screens/AdminParadaFormScreen';
import { AdminParadasScreen } from './src/screens/AdminParadasScreen';
import { AdminVeiculoFormScreen } from './src/screens/AdminVeiculoFormScreen';
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
import { TemaProvider, useTema } from './src/theme/tema';

const Stack = createNativeStackNavigator();

/** pilha raiz; lê o tema para o fundo das transições e o tema da navegação */
function Navegacao() {
  const { cores, escuro } = useTema();
  const base = escuro ? DarkTheme : DefaultTheme;
  const temaNavegacao = {
    ...base,
    colors: { ...base.colors, background: cores.fundo, card: cores.superficie, primary: cores.primaria },
  };
  return (
    <NavigationContainer theme={temaNavegacao}>
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
        {/* cadastros do administrador */}
        <Stack.Screen name="AdminMotorista" component={AdminMotoristaFormScreen} />
        <Stack.Screen name="AdminVeiculo" component={AdminVeiculoFormScreen} />
        <Stack.Screen name="AdminLinhaNova" component={AdminLinhaFormScreen} />
        <Stack.Screen name="AdminParadas" component={AdminParadasScreen} />
        <Stack.Screen name="AdminParada" component={AdminParadaFormScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.raiz}>
      <SafeAreaProvider>
        <TemaProvider>
          <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
          <ToastProvider>
            <Navegacao />
          </ToastProvider>
        </TemaProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  raiz: { flex: 1 },
});
