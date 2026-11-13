/**
 * MOLECULE — SeletorBusca
 * O <select> do site com um campo de busca junto:
 * o campo mostra a opção escolhida; ao tocar, abre a lista com a busca no topo.
 *   opcoes: [{ id, rotulo, detalhe?, marcador? }]   marcador = texto do círculo (nº da linha)
 */
import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icone } from '../atoms/Icone';
import { Input } from '../atoms/Input';
import { Label } from '../atoms/Label';
import { cores, espacamentos, raios } from '../../theme';

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function SeletorBusca({
  label,
  placeholder = 'Selecione...',
  titulo,
  opcoes,
  valor,
  onChange,
  carregando = false,
  desabilitado = false,
  corMarcador,
  mensagemErro,
  vazio = 'Nada encontrado.',
}) {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState('');
  const insets = useSafeAreaInsets();
  const escolhida = opcoes.find(o => o.id === valor) ?? null;

  const filtradas = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return opcoes;
    return opcoes.filter(o => normalizar(`${o.marcador ?? ''} ${o.rotulo} ${o.detalhe ?? ''}`).includes(termo));
  }, [opcoes, busca]);

  function fechar() {
    setAberto(false);
    setBusca('');
  }

  function escolher(opcao) {
    onChange(opcao.id);
    fechar();
  }

  return (
    <View style={styles.container}>
      {label ? (
        <Label style={styles.label}>{label}</Label>
      ) : null}
      <Pressable
        onPress={() => setAberto(true)}
        disabled={desabilitado || carregando}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        style={({ pressed }) => [
          styles.campo,
          mensagemErro && styles.campoErro,
          pressed && styles.pressionado,
          (desabilitado || carregando) && styles.inativo,
        ]}>
        <Icone nome="search" cor={cores.textoFraco} tamanho={18} />
        <Label style={[styles.valor, !escolhida && styles.placeholder]} numberOfLines={1}>
          {carregando ? 'Carregando...' : escolhida ? `${escolhida.marcador ? `${escolhida.marcador} — ` : ''}${escolhida.rotulo}` : placeholder}
        </Label>
        <Icone nome="chevron-down" cor={cores.primaria} tamanho={20} />
      </Pressable>
      {mensagemErro ? (
        <Label variante="legenda" style={styles.erro}>
          {mensagemErro}
        </Label>
      ) : null}

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={fechar}>
        <Pressable style={styles.fundo} onPress={fechar} accessibilityLabel="Fechar lista">
          <Pressable
            style={[styles.folha, { paddingBottom: insets.bottom + espacamentos.md }]}
            onPress={() => {}}>
            <View style={styles.alca} />
            <View style={styles.topo}>
              <Label variante="subtitulo" style={styles.flex}>
                {titulo ?? label}
              </Label>
              <Pressable onPress={fechar} hitSlop={10} accessibilityLabel="Fechar">
                <Icone nome="x" cor={cores.textoSecundario} />
              </Pressable>
            </View>
            <Input
              icone="search"
              placeholder="Buscar por número ou nome"
              value={busca}
              onChangeText={setBusca}
              autoCorrect={false}
              autoFocus
              returnKeyType="search"
              containerStyle={styles.busca}
            />
            <FlatList
              data={filtradas}
              keyExtractor={o => String(o.id)}
              keyboardShouldPersistTaps="handled"
              style={styles.lista}
              ListEmptyComponent={
                <Label variante="legenda" style={styles.vazio}>
                  {vazio}
                </Label>
              }
              renderItem={({ item }) => {
                const ativo = item.id === valor;
                return (
                  <Pressable
                    onPress={() => escolher(item)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: ativo }}
                    style={({ pressed }) => [styles.opcao, ativo && styles.opcaoAtiva, pressed && styles.pressionado]}>
                    {item.marcador ? (
                      <View style={[styles.marcador, { backgroundColor: corMarcador?.(item) ?? cores.primaria }]}>
                        <Label style={styles.marcadorTexto} adjustsFontSizeToFit numberOfLines={1}>
                          {item.marcador}
                        </Label>
                      </View>
                    ) : null}
                    <View style={styles.flex}>
                      <Label style={styles.opcaoTexto} numberOfLines={1}>
                        {item.rotulo}
                      </Label>
                      {item.detalhe ? (
                        <Label variante="legenda" numberOfLines={1}>
                          {item.detalhe}
                        </Label>
                      ) : null}
                    </View>
                    {ativo ? <Icone nome="check" cor={cores.primaria} /> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: espacamentos.sm },
  label: { marginBottom: espacamentos.sm, fontWeight: '600', color: cores.textoMedio },
  campo: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.sm + 2,
    backgroundColor: cores.superficieAlt,
    borderWidth: 1.5,
    borderColor: cores.borda,
    borderRadius: raios.lg,
    paddingHorizontal: espacamentos.md,
  },
  campoErro: { borderColor: cores.perigo },
  pressionado: { opacity: 0.8 },
  inativo: { opacity: 0.55 },
  valor: { flex: 1, fontSize: 16, color: cores.texto },
  placeholder: { color: cores.textoSecundario },
  erro: { color: cores.perigo, marginTop: espacamentos.xs },
  fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  folha: {
    backgroundColor: cores.superficie,
    borderTopLeftRadius: raios.xl,
    borderTopRightRadius: raios.xl,
    paddingHorizontal: espacamentos.lg,
    paddingTop: espacamentos.sm,
    maxHeight: '80%',
  },
  alca: {
    alignSelf: 'center',
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: cores.bordaNeutra,
    marginBottom: espacamentos.md,
  },
  topo: { flexDirection: 'row', alignItems: 'center', marginBottom: espacamentos.md },
  flex: { flex: 1 },
  busca: { marginBottom: espacamentos.sm },
  lista: { flexGrow: 0 },
  vazio: { textAlign: 'center', paddingVertical: espacamentos.lg },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    paddingVertical: espacamentos.sm + 4,
    paddingHorizontal: espacamentos.sm,
    borderRadius: raios.md,
  },
  opcaoAtiva: { backgroundColor: cores.fundo },
  marcador: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  marcadorTexto: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  opcaoTexto: { fontSize: 16, fontWeight: '600' },
});
