/**
 * SCREEN — RouteStopsScreen
 * Paradas de uma linha, por sentido, na ordem do trajeto (CA05.2/CA05.4);
 * remover reordena as demais automaticamente no servidor (CA05.3).
 * Equivalente web: static/admin-rotas.html (paradas da linha)
 */
import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import Button from '../components/atoms/Button';
import Label from '../components/atoms/Label';
import EstadoCarga from '../components/molecules/EstadoCarga';
import OptionChips from '../components/molecules/OptionChips';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { ajustesLista, chavePorId } from '../constants/lista';
import { paradasDaLinha, removerAssociacao } from '../services/paradas';
import { listarLinhas } from '../services/rastreamento';
import { minutos } from '../utils/formatacao';
import { cores, espacos, raios } from '../theme';

const SENTIDOS = [
  { valor: 'ida', rotulo: 'Ida' },
  { valor: 'volta', rotulo: 'Volta' },
];

export default function RouteStopsScreen({ navigation }) {
  const [linhas, setLinhas] = useState(null);
  const [erroLinhas, setErroLinhas] = useState(null);
  const [linhaId, setLinhaId] = useState(null);
  const [sentido, setSentido] = useState('ida');
  const [paradas, setParadas] = useState(null);
  const [erro, setErro] = useState(null);

  const carregarLinhas = useCallback(async () => {
    setErroLinhas(null);
    try {
      const lista = await listarLinhas();
      setLinhas(lista);
      setLinhaId((atual) => atual ?? lista[0]?.id ?? null);
    } catch (e) {
      setErroLinhas(e.message);
    }
  }, []);

  const carregarParadas = useCallback(async () => {
    if (!linhaId) return;
    setErro(null);
    try {
      setParadas(await paradasDaLinha(linhaId, sentido));
    } catch (e) {
      setErro(e.message);
    }
  }, [linhaId, sentido]);

  useFocusEffect(
    useCallback(() => {
      carregarLinhas();
    }, [carregarLinhas]),
  );

  useFocusEffect(
    useCallback(() => {
      carregarParadas();
    }, [carregarParadas]),
  );

  const confirmarRemocao = (associacao) => {
    Alert.alert('Remover parada da linha', `Remover ${associacao.parada.nome} deste sentido?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            await removerAssociacao(linhaId, associacao.id);
            carregarParadas();
          } catch (e) {
            Alert.alert('Não foi possível remover', e.message);
          }
        },
      },
    ]);
  };

  if (!linhas) {
    return (
      <ScreenTemplate titulo="Paradas da linha">
        <EstadoCarga carregando={!erroLinhas} erro={erroLinhas} aoTentarDeNovo={carregarLinhas} />
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate titulo="Paradas da linha" rolavel={false}>
      <OptionChips
        opcoes={linhas.map((l) => ({ valor: l.id, rotulo: `${l.numero} — ${l.nome}` }))}
        valor={linhaId}
        aoMudar={setLinhaId}
        style={styles.linhas}
      />
      <OptionChips opcoes={SENTIDOS} valor={sentido} aoMudar={setSentido} style={styles.sentido} />
      <Button
        titulo="+ Associar parada"
        onPress={() => navigation.navigate('FormParadaLinha', { linhaId, sentido })}
        style={styles.novo}
      />
      <View style={styles.lista}>
        <FlatList
          {...ajustesLista}
          data={paradas ?? []}
          keyExtractor={chavePorId}
          renderItem={({ item, index }) => (
            <Pressable onLongPress={() => confirmarRemocao(item)} style={styles.item}>
              <Label variante="subtitulo">
                {item.ordem}. {item.parada.nome}
              </Label>
              {index < paradas.length - 1 ? (
                <Label variante="legenda">{minutos(item.tempo_estimado_minutos)} até a próxima</Label>
              ) : null}
            </Pressable>
          )}
          ListEmptyComponent={
            <EstadoCarga
              carregando={!paradas && !erro}
              erro={erro}
              vazio={Boolean(paradas)}
              mensagemVazia="Nenhuma parada associada a este sentido."
              aoTentarDeNovo={carregarParadas}
            />
          }
        />
      </View>
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  linhas: { marginBottom: espacos.sm },
  sentido: { marginBottom: espacos.md },
  novo: { marginBottom: espacos.md },
  lista: { flex: 1 },
  item: {
    padding: espacos.md,
    marginBottom: espacos.sm,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
});
