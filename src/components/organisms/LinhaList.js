/**
 * ORGANISM — LinhaList
 * Lista virtualizada de linhas. Ver listas_renderizacao_desempenho.md
 */
import { useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { extrairChave, listaVirtualizada } from '../../constants/lista';
import { useEspacoInferior } from '../../navigation/espacoInferior';
import { espacamentos } from '../../theme';
import { Label } from '../atoms/Label';
import { EstadoCarga } from '../molecules/EstadoCarga';
import { LinhaItem } from '../molecules/LinhaItem';

export function LinhaList({
  linhas,
  carregando,
  erro,
  onTentarDeNovo,
  onRefresh,
  refreshing,
  onAbrir,
  ListHeaderComponent,
}) {
  const espacoInferior = useEspacoInferior();
  const renderItem = useCallback(
    ({ item }) => <LinhaItem linha={item} onPress={onAbrir} />,
    [onAbrir],
  );

  const semDados = !linhas || linhas.length === 0;
  if ((carregando && semDados) || (erro && semDados)) {
    return (
      <EstadoCarga carregando={carregando && !erro} erro={erro} onTentarDeNovo={onTentarDeNovo} />
    );
  }

  return (
    <FlatList
      data={linhas}
      keyExtractor={extrairChave}
      renderItem={renderItem}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={
        <Label variante="legenda" style={styles.vazio}>
          Nenhuma linha encontrada.
        </Label>
      }
      contentContainerStyle={[styles.lista, { paddingBottom: styles.lista.paddingBottom + espacoInferior }]}
      refreshing={refreshing}
      onRefresh={onRefresh}
      keyboardShouldPersistTaps="handled"
      {...listaVirtualizada}
    />
  );
}

const styles = StyleSheet.create({
  lista: { padding: espacamentos.md, paddingTop: espacamentos.lg, paddingBottom: espacamentos.xl },
  vazio: { textAlign: 'center', marginTop: espacamentos.lg },
});
