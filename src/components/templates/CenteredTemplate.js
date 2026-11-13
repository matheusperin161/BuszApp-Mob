/**
 * TEMPLATE — CenteredTemplate
 * Layout das telas de entrada (login, cadastro, recuperar senha), copiado do site:
 * fundo em degradê âmbar e um cartão branco com o topo em degradê
 * (ícone num quadrado translúcido + título + subtítulo) e o formulário embaixo.
 *   destaque     elemento do quadrado (logo ou ícone)
 *   titulo/subtitulo         textos brancos do topo
 *   tituloForm/subtituloForm textos acima do formulário
 */
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gradiente } from '../atoms/Gradiente';
import { Label } from '../atoms/Label';
import { cores, espacamentos, gradientes, raios } from '../../theme';

export function CenteredTemplate({
  destaque,
  titulo,
  subtitulo,
  tituloForm,
  subtituloForm,
  children,
  rodape,
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.tela}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Gradiente {...gradientes.fundoLogin} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.conteudo,
            { paddingTop: insets.top + espacamentos.md, paddingBottom: insets.bottom + espacamentos.md },
          ]}
          keyboardShouldPersistTaps="handled">
          <View style={styles.cartao}>
            <View style={styles.topo}>
              <Gradiente {...gradientes.login} />
              {destaque ? <View style={styles.quadrado}>{destaque}</View> : null}
              {titulo ? <Label style={styles.titulo}>{titulo}</Label> : null}
              {subtitulo ? <Label style={styles.subtitulo}>{subtitulo}</Label> : null}
            </View>
            <View style={styles.corpo}>
              {tituloForm ? (
                <Label variante="titulo" style={styles.tituloForm}>
                  {tituloForm}
                </Label>
              ) : null}
              {subtituloForm ? <Label style={styles.subtituloForm}>{subtituloForm}</Label> : null}
              {children}
              {rodape ? <View style={styles.rodape}>{rodape}</View> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.primariaEscura },
  flex: { flex: 1 },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: espacamentos.md,
  },
  cartao: {
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  topo: {
    backgroundColor: '#EAB308',
    alignItems: 'center',
    paddingTop: espacamentos.xl,
    paddingBottom: espacamentos.xl,
    paddingHorizontal: espacamentos.lg,
  },
  quadrado: {
    width: 120,
    height: 120,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: espacamentos.lg,
  },
  titulo: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', textAlign: 'center' },
  subtitulo: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: espacamentos.sm,
    paddingHorizontal: espacamentos.sm,
  },
  corpo: { paddingHorizontal: espacamentos.lg + 4, paddingTop: espacamentos.xl, paddingBottom: espacamentos.lg + 4 },
  tituloForm: { fontSize: 26 },
  subtituloForm: {
    color: cores.textoSecundario,
    marginTop: espacamentos.xs,
    marginBottom: espacamentos.lg,
    lineHeight: 21,
  },
  rodape: { marginTop: espacamentos.lg, alignItems: 'center' },
});
