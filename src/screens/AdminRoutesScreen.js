/**
 * SCREEN — AdminRoutesScreen
 * Gerenciar rotas e paradas.
 * Equivalente web: static/admin-rotas.html
 */
import MenuButton from '../components/molecules/MenuButton';
import ScreenTemplate from '../components/templates/ScreenTemplate';

export default function AdminRoutesScreen({ navigation }) {
  return (
    <ScreenTemplate titulo="Rotas e paradas">
      <MenuButton
        icone="🚏"
        titulo="Paradas"
        descricao="Cadastrar, editar, desativar e reativar"
        onPress={() => navigation.navigate('Paradas')}
      />
      <MenuButton
        icone="🔀"
        titulo="Paradas por linha"
        descricao="Associar paradas a uma linha, com sentido e ordem"
        onPress={() => navigation.navigate('ParadasLinha')}
      />
    </ScreenTemplate>
  );
}
