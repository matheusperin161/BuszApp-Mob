/**
 * @format
 */

import 'react-native-gesture-handler';
import notifee, { EventType } from '@notifee/react-native';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { ID_NOTIFICACAO_AVISO, tarefaDoAviso, tratarAcaoDaNotificacao } from './src/services/avisoChegada';
import { tarefaDoServico } from './src/services/rastreio';

// Serviço em primeiro plano (o Notifee exige o registro aqui, fora dos componentes).
// Um só serviço para dois usos, escolhido pela notificação que o ligou:
//   aviso de chegada do passageiro  ou  envio da localização do motorista.
notifee.registerForegroundService(notificacao =>
  notificacao?.id === ID_NOTIFICACAO_AVISO ? tarefaDoAviso() : tarefaDoServico(),
);

// botão "Cancelar aviso" com o app fechado
notifee.onBackgroundEvent(async evento => {
  await tratarAcaoDaNotificacao(evento, EventType);
});

AppRegistry.registerComponent(appName, () => App);
