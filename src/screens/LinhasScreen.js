/**
 * SCREEN — LinhasScreen (aba "Mapa")
 * "Linhas Disponíveis" do site, com busca por número ou bairro (melhoria do app).
 */
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Input } from '../components/atoms/Input';
import { Label } from '../components/atoms/Label';
import { Cabecalho } from '../components/organisms/Cabecalho';
import { LinhaList } from '../components/organisms/LinhaList';
import { voltarAoLogin } from '../navigation/acoes';
import { carregarLinhasCompletas } from '../services/linhas';
import { cores, espacamentos } from '../theme';

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function LinhasScreen({ navigation }) {
  const [linhas, setLinhas] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setLinhas(await carregarLinhasCompletas());
    } catch (e) {
      if (e.status === 401) {
        voltarAoLogin(navigation);
        return;
      }
      setErro(e.message);
    } finally {
      setCarregando(false);
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return linhas;
    return linhas.filter(l =>
      [l.numero, l.nome, l.origem, l.destino].some(campo => normalizar(campo).includes(termo)),
    );
  }, [linhas, busca]);

  const handleAbrir = useCallback(
    linha => navigation.navigate('Acompanhamento', { linha }),
    [navigation],
  );

  const cabecalho = useMemo(
    () => (
      <View>
        <View style={styles.titulos}>
          <Label variante="titulo" style={styles.titulo}>
            Linhas Disponíveis
          </Label>
          <Label style={styles.subtitulo}>Selecione uma linha para ver os horários e o mapa</Label>
        </View>
        <Input
          icone="search"
          placeholder="Buscar linha, bairro ou número"
          value={busca}
          onChangeText={setBusca}
          autoCorrect={false}
          returnKeyType="search"
          containerStyle={styles.busca}
        />
      </View>
    ),
    [busca],
  );

  return (
    <View style={styles.flex}>
      <Cabecalho titulo="Acompanhamento" subtitulo="Rastreie em tempo real" />
      <LinhaList
        linhas={filtradas}
        carregando={carregando}
        erro={erro}
        onTentarDeNovo={() => {
          setCarregando(true);
          carregar();
        }}
        refreshing={refreshing}
        onRefresh={() => {
          setRefreshing(true);
          carregar();
        }}
        onAbrir={handleAbrir}
        ListHeaderComponent={cabecalho}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: cores.fundo },
  titulos: { marginBottom: espacamentos.md, paddingHorizontal: espacamentos.xs },
  titulo: { fontSize: 28 },
  subtitulo: { color: cores.textoSecundario, marginTop: 4, fontSize: 15 },
  busca: { marginBottom: espacamentos.lg, backgroundColor: cores.superficie },
});
