/**
 * SCREEN — HomeScreen
 * Início do passageiro: saldo, rotas e avisos.
 * Equivalente web: static/dashboard.html / index.html
 *
 * Nesta entrega: atalho para o acompanhamento. Saldo e avisos virão com cartao.js/onibus.js.
 */
import MenuButton from '../components/molecules/MenuButton';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const { sessao } = useAuth();
  return (
    <ScreenTemplate titulo={`Olá, ${sessao?.user?.username ?? ''}`} subtitulo="O que você quer fazer?">
      <MenuButton
        icone="🗺️"
        titulo="Acompanhar ônibus"
        descricao="Veja no mapa onde está o ônibus e quando ele chega"
        onPress={() => navigation.navigate('Acompanhar')}
      />
    </ScreenTemplate>
  );
}
