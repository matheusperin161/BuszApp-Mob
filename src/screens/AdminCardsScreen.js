/**
 * SCREEN — AdminCardsScreen
 * Cartões de transporte de todos os usuários, somente leitura (CA06.7), com filtro de status.
 * Equivalente web: static/admin.html (seção de recargas)
 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Label from '../components/atoms/Label';
import EstadoCarga from '../components/molecules/EstadoCarga';
import OptionChips from '../components/molecules/OptionChips';
import BalanceCard from '../components/organisms/BalanceCard';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { ajustesLista, chavePorId } from '../constants/lista';
import { listarTodosCartoes } from '../services/cartao';
import { espacos } from '../theme';

const FILTROS = [
  { valor: '', rotulo: 'Todos' },
  { valor: 'ativo', rotulo: 'Ativos' },
  { valor: 'bloqueado', rotulo: 'Bloqueados' },
  { valor: 'cancelado', rotulo: 'Cancelados' },
];

export default function AdminCardsScreen() {
  const [status, setStatus] = useState('');
  const [cartoes, setCartoes] = useState(null);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setCartoes(await listarTodosCartoes({ status }));
    } catch (e) {
      setErro(e.message);
    }
  }, [status]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  return (
    <ScreenTemplate rolavel={false}>
      <OptionChips opcoes={FILTROS} valor={status} aoMudar={setStatus} style={styles.filtros} />
      {cartoes && !erro ? (
        <Label variante="legenda" style={styles.contagem}>
          {cartoes.length} cartão(ões) · somente leitura
        </Label>
      ) : null}
      <View style={styles.lista}>
        <FlatList
          {...ajustesLista}
          data={cartoes ?? []}
          keyExtractor={chavePorId}
          renderItem={({ item }) => <BalanceCard cartao={item} mostrarDono />}
          ListEmptyComponent={
            <EstadoCarga
              carregando={!cartoes && !erro}
              erro={erro}
              vazio={Boolean(cartoes)}
              mensagemVazia="Nenhum cartão encontrado."
              aoTentarDeNovo={carregar}
            />
          }
        />
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  filtros: { marginBottom: espacos.md },
  contagem: { marginBottom: espacos.sm },
  lista: { flex: 1 },
});
