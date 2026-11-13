/**
 * @format
 */

import 'react-native-gesture-handler';
import notifee from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { tarefaDoServico } from './src/services/rastreio';

// Serviço em primeiro plano do motorista (envio da localização com a tela bloqueada).
// O Notifee exige o registro aqui, fora de qualquer componente.
notifee.registerForegroundService(tarefaDoServico);

AppRegistry.registerComponent(appName, () => App);
