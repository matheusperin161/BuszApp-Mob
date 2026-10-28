/**
 * SCREEN — AddStopScreen
 * Cadastrar parada (ou editar, quando recebe route.params.id).
 * Equivalente web: static/admin-rotas.html (formulário de parada)
 */
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import EstadoCarga from '../components/molecules/EstadoCarga';
import StopForm from '../components/organisms/StopForm';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { criarParada, editarParada, obterParada } from '../services/paradas';

export default function AddStopScreen({ navigation, route }) {
  const id = route.params?.id;
  const [parada, setParada] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = async () => {
    setErro(null);
    try {
      setParada(await obterParada(id));
    } catch (e) {
      setErro(e.message);
    }
  };

  useEffect(() => {
    navigation.setOptions({ title: id ? 'Editar parada' : 'Nova parada' });
    if (id) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const salvar = async (dados) => {
    if (id) await editarParada(id, dados);
    else await criarParada(dados);
    Alert.alert(id ? 'Parada atualizada' : 'Parada cadastrada');
    navigation.goBack();
  };

  if (id && !parada) {
    return (
      <ScreenTemplate>
        <EstadoCarga carregando={!erro} erro={erro} aoTentarDeNovo={carregar} />
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate>
      <StopForm parada={parada} aoSalvar={salvar} />
    </ScreenTemplate>
  );
}
