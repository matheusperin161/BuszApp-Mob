/**
 * SCREEN — DriversScreen
 * Listagem de motoristas do admin: busca por nome/CPF e filtro de status (CA02.7),
 * alerta de CNH vencida (CA02.5) e exclusão com o motivo da recusa (CA02.6).
 * Equivalente web: static/add-driver.html (lista)
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import Label from '../components/atoms/Label';
import DriverItem from '../components/molecules/DriverItem';
import EstadoCarga from '../components/molecules/EstadoCarga';
import OptionChips from '../components/molecules/OptionChips';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { ajustesLista, chavePorId } from '../constants/lista';
import { excluirMotorista, listarMotoristas } from '../services/admin';
import { espacos } from '../theme';

const FILTROS = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'ativo', rotulo: 'Ativos' },
  { valor: 'afastado', rotulo: 'Afastados' },
  { valor: 'inativo', rotulo: 'Inativos' },
];

export default function DriversScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [status, setStatus] = useState('');
  const [motoristas, setMotoristas] = useState(null);
  const [erro, setErro] = useState(null);

  // Espera o usuário parar de digitar antes de consultar
  useEffect(() => {
    const id = setTimeout(() => setTermo(busca.trim()), 400);
    return () => clearTimeout(id);
  }, [busca]);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setMotoristas(await listarMotoristas({ status, q: termo }));
    } catch (e) {
      setErro(e.message);
    }
  }, [status, termo]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const confirmarExclusao = (motorista) => {
    Alert.alert('Excluir motorista', `Excluir ${motorista.nome}? O acesso ao app também será removido.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirMotorista(motorista.id);
            carregar();
          } catch (e) {
            Alert.alert('Não foi possível excluir', e.message);
          }
        },
      },
    ]);
  };

  return (
    <ScreenTemplate rolavel={false}>
      <Input
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar por nome ou CPF"
        accessibilityLabel="Buscar por nome ou CPF"
        autoCorrect={false}
      />
      <OptionChips opcoes={FILTROS} valor={status} aoMudar={setStatus} style={styles.filtros} />
      <Button titulo="+ Novo motorista" onPress={() => navigation.navigate('FormMotorista')} style={styles.novo} />
      {motoristas && !erro ? (
        <Label variante="legenda" style={styles.contagem}>
          {motoristas.length} motorista(s) · toque para editar, segure para excluir
        </Label>
      ) : null}
      <View style={styles.lista}>
        <FlatList
          {...ajustesLista}
          data={motoristas ?? []}
          keyExtractor={chavePorId}
          renderItem={({ item }) => (
            <DriverItem
              motorista={item}
              onPress={() => navigation.navigate('FormMotorista', { id: item.id })}
              onLongPress={() => confirmarExclusao(item)}
            />
          )}
          ListEmptyComponent={
            <EstadoCarga
              carregando={!motoristas && !erro}
              erro={erro}
              vazio={Boolean(motoristas)}
              mensagemVazia="Nenhum motorista encontrado."
              aoTentarDeNovo={carregar}
            />
          }
        />
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  filtros: { marginVertical: espacos.md },
  novo: { marginBottom: espacos.md },
  contagem: { marginBottom: espacos.sm },
  lista: { flex: 1 },
});
