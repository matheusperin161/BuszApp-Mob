/**
 * TEMPLATE — ScreenTemplate
 * Esqueleto das telas internas: cabeçalho em degradê (organism Cabecalho),
 * título opcional da página e um corpo rolável no fundo creme do site.
 * Nenhum dado real mora aqui — só a estrutura visual.
 *   cabecalho  props do Cabecalho ({ titulo, subtitulo, voltar }); false = sem barra
 *   onRefresh  liga o "puxar para atualizar"
 * Fora das abas, deixa espaço para a barra de navegação do celular (useEspacoInferior).
 */
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { useEspacoInferior } from '../../navigation/espacoInferior';
import { Label } from '../atoms/Label';
import { Cabecalho } from '../organisms/Cabecalho';
import { cores, espacamentos } from '../../theme';

export function ScreenTemplate({
  cabecalho = {},
  titulo,
  subtitulo,
  children,
  rodape,
  onRefresh,
  refreshing = false,
}) {
  const espacoInferior = useEspacoInferior();
  return (
    <View style={styles.tela}>
      {cabecalho ? <Cabecalho {...cabecalho} /> : null}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.conteudo, { paddingBottom: styles.conteudo.paddingBottom + espacoInferior }]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[cores.primaria]}
                tintColor={cores.primaria}
              />
            ) : undefined
          }>
          {titulo ? (
            <View style={styles.cabecalhoPagina}>
              <Label variante="titulo">{titulo}</Label>
              {subtitulo ? (
                <Label style={styles.subtitulo}>{subtitulo}</Label>
              ) : null}
            </View>
          ) : null}

          {children}

          {rodape ? <View style={styles.rodape}>{rodape}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  flex: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    padding: espacamentos.md,
    paddingTop: espacamentos.lg,
    paddingBottom: espacamentos.xl,
  },
  cabecalhoPagina: { marginBottom: espacamentos.lg, paddingHorizontal: espacamentos.xs },
  subtitulo: { marginTop: espacamentos.xs, color: cores.textoSecundario, fontSize: 15 },
  rodape: { marginTop: 'auto', paddingTop: espacamentos.lg },
});
