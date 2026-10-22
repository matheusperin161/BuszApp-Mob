/**
 * SCREEN — AdminScreen
 * Painel administrativo: resumo, recargas, avaliações.
 * Equivalente web: static/admin.html
 *
 * Nesta entrega: acesso aos módulos de motoristas e de viagens em andamento.
 */
import MenuButton from '../components/molecules/MenuButton';
import ScreenTemplate from '../components/templates/ScreenTemplate';

export default function AdminScreen({ navigation }) {
  return (
    <ScreenTemplate titulo="Painel do administrador">
      <MenuButton
        icone="🧑‍✈️"
        titulo="Motoristas"
        descricao="Cadastrar, editar, filtrar e excluir"
        onPress={() => navigation.navigate('Motoristas')}
      />
      <MenuButton
        icone="🗺️"
        titulo="Viagens em andamento"
        descricao="Todos os ônibus em viagem em um único mapa"
        onPress={() => navigation.navigate('ViagensAtivas')}
      />
    </ScreenTemplate>
  );
}
