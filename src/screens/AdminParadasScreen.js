/**
 * SCREEN — AdminParadasScreen
 * Paradas de uma linha, na ordem em que o ônibus passa: mapa com o trajeto e a
 * lista para incluir, editar, excluir e mudar a ordem (↑ ↓).
 *   params.rota = { id, route_name, titulo? }
 */
import { useCallback, useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '../components/atoms/Button';
import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { EstadoCarga } from '../components/molecules/EstadoCarga';
import { MapaLinha } from '../components/organisms/MapaLinha';
import { useToast } from '../components/organisms/Toast';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { excluirParada, nomeDaRota, paradasDaRota, trocarOrdem } from '../services/admin';
import { espacamentos, raios } from '../theme';
import { criarEstilos, useTema } from '../theme/tema';

export function AdminParadasScreen({ navigation, route }) {
  const styles = useStyles();
  const { cores } = useTema();
  const toast = useToast();
  const rota = route.params.rota;
  const [paradas, setParadas] = useState(null);
  const [erro, setErro] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const lista = await paradasDaRota(rota.id);
      setParadas([...lista].sort((a, b) => a.order - b.order));
    } catch (e) {
      setErro(e.message);
    } finally {
      setRefreshing(false);
    }
  }, [rota.id]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  async function mover(indice, direcao) {
    const outro = indice + direcao;
    if (ocupado || outro < 0 || outro >= paradas.length) return;
    const a = paradas[indice];
    const b = paradas[outro];
    // otimista: troca na tela já, e desfaz se o servidor recusar
    const anterior = paradas;
    const nova = [...paradas];
    nova[indice] = { ...b, order: a.order };
    nova[outro] = { ...a, order: b.order };
    setParadas(nova);
    setOcupado(true);
    try {
      // ordens iguais (cadastro antigo) não trocariam nada: usa a posição na lista
      const ordemA = a.order === b.order ? indice + 1 : a.order;
      const ordemB = a.order === b.order ? outro + 1 : b.order;
      await trocarOrdem(rota.id, { ...a, order: ordemA }, { ...b, order: ordemB });
    } catch (e) {
      setParadas(anterior);
      toast.mostrar(e.message, 'erro');
    } finally {
      setOcupado(false);
    }
  }

  function confirmarExclusao(parada) {
    Alert.alert('Excluir parada', `Tirar "${parada.name}" desta linha?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setOcupado(true);
          try {
            await excluirParada(rota.id, parada.id);
            setParadas(lista => lista.filter(p => p.id !== parada.id));
            toast.mostrar('Parada excluída');
          } catch (e) {
            toast.mostrar(e.message, 'erro');
          } finally {
            setOcupado(false);
          }
        },
      },
    ]);
  }

  function abrirForm(parada) {
    navigation.navigate('AdminParada', { rotaId: rota.id, parada, paradas });
  }

  const titulo = rota.titulo ?? nomeDaRota(rota);

  return (
    <ScreenTemplate
      cabecalho={{ titulo: 'Paradas', subtitulo: titulo, voltar: true }}
      onRefresh={() => {
        setRefreshing(true);
        carregar();
      }}
      refreshing={refreshing}>
      {paradas == null || erro ? (
        <View style={styles.estado}>
          <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={carregar} />
        </View>
      ) : (
        <>
          <MapaLinha paradas={paradas} enquadrar altura={240} style={styles.mapa} />

          <Card
            titulo={`${paradas.length} ${paradas.length === 1 ? 'parada' : 'paradas'}`}
            icone="map-pin"
            acao="+ Nova"
            onAcao={() => abrirForm(null)}>
            {paradas.length ? (
              paradas.map((p, i) => {
                const ponta = i === 0 ? 'Origem' : i === paradas.length - 1 ? 'Destino' : null;
                return (
                  <View key={p.id} style={[styles.item, i > 0 && styles.divisor]}>
                    <View style={[styles.numero, ponta && styles.numeroPonta]}>
                      <Label style={[styles.numeroTexto, ponta && styles.numeroTextoPonta]}>{i + 1}</Label>
                    </View>
                    <Pressable style={styles.textos} onPress={() => abrirForm(p)} accessibilityRole="button">
                      <Label style={styles.nome} numberOfLines={2}>
                        {p.name}
                      </Label>
                      <Label variante="legenda">
                        {[ponta, p.tempo_ate_proxima_min ? `${p.tempo_ate_proxima_min} min até a próxima` : null]
                          .filter(Boolean)
                          .join(' · ') || 'Toque para editar'}
                      </Label>
                    </Pressable>
                    <View style={styles.acoes}>
                      <BotaoIcone
                        nome="arrow-up"
                        rotulo="Subir"
                        desabilitado={i === 0 || ocupado}
                        onPress={() => mover(i, -1)}
                        cor={cores.textoMedio}
                      />
                      <BotaoIcone
                        nome="arrow-down"
                        rotulo="Descer"
                        desabilitado={i === paradas.length - 1 || ocupado}
                        onPress={() => mover(i, 1)}
                        cor={cores.textoMedio}
                      />
                      <BotaoIcone
                        nome="trash-2"
                        rotulo="Excluir"
                        desabilitado={ocupado}
                        onPress={() => confirmarExclusao(p)}
                        cor={cores.perigo}
                      />
                    </View>
                  </View>
                );
              })
            ) : (
              <Label variante="legenda" style={styles.vazio}>
                Nenhuma parada ainda. Comece pela origem.
              </Label>
            )}
          </Card>

          <Button title="Incluir parada" icone="plus" onPress={() => abrirForm(null)} />
          <Label variante="legenda" style={styles.nota}>
            Use as setas para acertar a ordem em que o ônibus passa. A previsão de chegada do passageiro
            segue essa ordem.
          </Label>
        </>
      )}
    </ScreenTemplate>
  );
}

function BotaoIcone({ nome, rotulo, onPress, desabilitado, cor }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={onPress}
      disabled={desabilitado}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado, desabilitado && styles.botaoOff]}>
      <Icone nome={nome} tamanho={17} cor={cor} />
    </Pressable>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  estado: { minHeight: 240 },
  mapa: { marginBottom: espacamentos.md },
  item: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm + 2, paddingVertical: espacamentos.sm + 2 },
  divisor: { borderTopWidth: 1, borderTopColor: cores.bordaSuave },
  numero: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.cinzaClaro,
  },
  numeroPonta: { backgroundColor: cores.primaria },
  numeroTexto: { fontWeight: '800', fontSize: 13, color: cores.textoMedio },
  numeroTextoPonta: { color: cores.textoInverso },
  textos: { flex: 1 },
  nome: { fontWeight: '700' },
  acoes: { flexDirection: 'row', gap: 4 },
  botao: {
    width: 34,
    height: 34,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.cinzaClaro,
  },
  botaoPressionado: { opacity: 0.6 },
  botaoOff: { opacity: 0.3 },
  vazio: { textAlign: 'center', paddingVertical: espacamentos.md },
  nota: { textAlign: 'center', marginTop: espacamentos.sm },
}));
