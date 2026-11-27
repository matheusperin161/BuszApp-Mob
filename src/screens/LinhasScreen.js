/**
 * SCREEN — LinhasScreen (aba "Mapa")
 * "Linhas Disponíveis" do site, com busca por número ou bairro (melhoria do app).
 * Estrela = linha favorita (vai para o topo). Sem internet, mostra a última cópia
 * salva no aparelho (services/offline).
 */
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Input } from '../components/atoms/Input';
import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { Cabecalho } from '../components/organisms/Cabecalho';
import { LinhaList } from '../components/organisms/LinhaList';
import { voltarAoLogin } from '../navigation/acoes';
import { alternarFavorita, listarFavoritas, ordenarComFavoritas } from '../services/favoritas';
import { linhasComCache } from '../services/offline';
import { espacamentos } from '../theme';
import { criarEstilos } from '../theme/tema';
import { dataHora } from '../utils/formato';

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function LinhasScreen({ navigation }) {
  const styles = useStyles();
  const [linhas, setLinhas] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [erro, setErro] = useState(null);
  const [favoritas, setFavoritas] = useState([]);
  const [offlineDesde, setOfflineDesde] = useState(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [resultado, favs] = await Promise.all([linhasComCache(), listarFavoritas()]);
      setLinhas(resultado.dados || []);
      setOfflineDesde(resultado.offline ? resultado.salvoEm : null);
      setFavoritas(favs);
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
    const lista = termo
      ? linhas.filter(l =>
          [l.numero, l.nome, l.origem, l.destino].some(campo => normalizar(campo).includes(termo)),
        )
      : linhas;
    return ordenarComFavoritas(lista, favoritas);
  }, [linhas, busca, favoritas]);

  const numerosFavoritos = useMemo(() => new Set(favoritas.map(f => String(f.numero))), [favoritas]);

  const handleFavoritar = useCallback(async linha => {
    setFavoritas(await alternarFavorita(linha));
  }, []);

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
        {offlineDesde ? (
          <AvisoBox
            tipo="alerta"
            mensagem={`Sem internet: mostrando as linhas salvas em ${dataHora(offlineDesde)}.`}
          />
        ) : null}
      </View>
    ),
    [busca, styles, offlineDesde],
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
        favoritas={numerosFavoritos}
        onFavoritar={handleFavoritar}
        ListHeaderComponent={cabecalho}
      />
    </View>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  flex: { flex: 1, backgroundColor: cores.fundo },
  titulos: { marginBottom: espacamentos.md, paddingHorizontal: espacamentos.xs },
  titulo: { fontSize: 28 },
  subtitulo: { color: cores.textoSecundario, marginTop: 4, fontSize: 15 },
  busca: { marginBottom: espacamentos.lg, backgroundColor: cores.superficie },
}));
