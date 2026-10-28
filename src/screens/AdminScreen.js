/**
 * SCREEN — AdminScreen
 * Painel administrativo: resumo, recargas, avaliações.
 * Equivalente web: static/admin.html
 *
 * Acesso aos módulos de motoristas, viagens em andamento e cartões (somente leitura).
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
        icone="🚏"
        titulo="Rotas e paradas"
        descricao="Cadastrar paradas e associá-las às linhas"
        onPress={() => navigation.navigate('Rotas')}
      />
      <MenuButton
        icone="🗺️"
        titulo="Viagens em andamento"
        descricao="Todos os ônibus em viagem em um único mapa"
        onPress={() => navigation.navigate('ViagensAtivas')}
      />
      <MenuButton
        icone="💳"
        titulo="Cartões de transporte"
        descricao="Consultar os cartões de todos os passageiros (somente leitura)"
        onPress={() => navigation.navigate('Cartoes')}
      />
    </ScreenTemplate>
  );
}
