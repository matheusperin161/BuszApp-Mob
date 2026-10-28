/**
 * SCREEN — StopsScreen
 * Listagem de paradas do admin: busca por nome/endereço e filtro de status.
 * Desativar é bloqueado quando a parada está em uso por linha ativa (CA05.5).
 * Equivalente web: static/admin-rotas.html (lista de paradas)
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Button from '../components/atoms/Button';
import Input from '../components/atoms/Input';
import Label from '../components/atoms/Label';
import EstadoCarga from '../components/molecules/EstadoCarga';
import OptionChips from '../components/molecules/OptionChips';
import StopItem from '../components/molecules/StopItem';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { ajustesLista, chavePorId } from '../constants/lista';
import { desativarParada, listarParadas, reativarParada } from '../services/paradas';
import { espacos } from '../theme';

const FILTROS = [
  { valor: '', rotulo: 'Todas' },
  { valor: 'ativa', rotulo: 'Ativas' },
  { valor: 'inativa', rotulo: 'Inativas' },
];

export default function StopsScreen({ navigation }) {
  const [busca, setBusca] = useState('');
  const [termo, setTermo] = useState('');
  const [status, setStatus] = useState('');
  const [paradas, setParadas] = useState(null);
  const [erro, setErro] = useState(null);

  // Espera o usuário parar de digitar antes de consultar
  useEffect(() => {
    const id = setTimeout(() => setTermo(busca.trim()), 400);
    return () => clearTimeout(id);
  }, [busca]);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setParadas(await listarParadas({ status, q: termo }));
    } catch (e) {
      setErro(e.message);
    }
  }, [status, termo]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const confirmarAlteracaoStatus = (parada) => {
    const desativando = parada.ativa;
    Alert.alert(
      desativando ? 'Desativar parada' : 'Reativar parada',
      `${desativando ? 'Desativar' : 'Reativar'} ${parada.nome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: desativando ? 'Desativar' : 'Reativar',
          style: desativando ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await (desativando ? desativarParada(parada.id) : reativarParada(parada.id));
              carregar();
            } catch (e) {
              // 409: em uso por linha(s) ativa(s), o servidor lista quais (CA05.5)
              const linhas = e.dados?.linhas?.map((l) => l.nome).join(', ');
              Alert.alert(
                `Não foi possível ${desativando ? 'desativar' : 'reativar'}`,
                linhas ? `Em uso pelas linhas: ${linhas}` : e.message,
              );
            }
          },
        },
      ],
    );
  };

  return (
    <ScreenTemplate rolavel={false}>
      <Input
        value={busca}
        onChangeText={setBusca}
        placeholder="Buscar por nome ou endereço"
        accessibilityLabel="Buscar por nome ou endereço"
        autoCorrect={false}
      />
      <OptionChips opcoes={FILTROS} valor={status} aoMudar={setStatus} style={styles.filtros} />
      <Button titulo="+ Nova parada" onPress={() => navigation.navigate('FormParada')} style={styles.novo} />
      {paradas && !erro ? (
        <Label variante="legenda" style={styles.contagem}>
          {paradas.length} parada(s) · toque para editar, segure para desativar/reativar
        </Label>
      ) : null}
      <View style={styles.lista}>
        <FlatList
          {...ajustesLista}
          data={paradas ?? []}
          keyExtractor={chavePorId}
          renderItem={({ item }) => (
            <StopItem
              parada={item}
              onPress={() => navigation.navigate('FormParada', { id: item.id })}
              onLongPress={() => confirmarAlteracaoStatus(item)}
            />
          )}
          ListEmptyComponent={
            <EstadoCarga
              carregando={!paradas && !erro}
              erro={erro}
              vazio={Boolean(paradas)}
              mensagemVazia="Nenhuma parada encontrada."
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
