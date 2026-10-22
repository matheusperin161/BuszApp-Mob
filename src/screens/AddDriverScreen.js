/**
 * SCREEN — AddDriverScreen
 * Cadastrar motorista (ou editar, quando recebe route.params.id).
 * Equivalente web: static/add-driver.html
 */
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import EstadoCarga from '../components/molecules/EstadoCarga';
import DriverForm from '../components/organisms/DriverForm';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { criarMotorista, editarMotorista, obterMotorista } from '../services/admin';

export default function AddDriverScreen({ navigation, route }) {
  const id = route.params?.id;
  const [motorista, setMotorista] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = async () => {
    setErro(null);
    try {
      setMotorista(await obterMotorista(id));
    } catch (e) {
      setErro(e.message);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar motorista' : 'Novo motorista' });
    if (id) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const salvar = async (dados) => {
    if (id) await editarMotorista(id, dados);
    else await criarMotorista(dados);
    Alert.alert(id ? 'Motorista atualizado' : 'Motorista cadastrado', id ? undefined : 'O acesso ao app já pode ser usado.');
    navigation.goBack();
  };

  if (id && !motorista) {
    return (
      <ScreenTemplate>
        <EstadoCarga carregando={!erro} erro={erro} aoTentarDeNovo={carregar} />
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate>
      <DriverForm motorista={motorista} aoSalvar={salvar} />
    </ScreenTemplate>
  );
}
