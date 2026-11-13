/**
 * ATOM — Button
 * Menor unidade clicável do app. Não conhece regra de negócio:
 * recebe um título e um onPress, e só sabe se desenhar.
 *
 * Variantes (as mesmas do site):
 *   primario   degradê âmbar → laranja, texto branco ("Entrar", "Salvar")
 *   secundario contorno cinza, fundo branco ("Cancelar")
 *   claro      fundo cinza-claro, sem borda
 *   perigo     degradê vermelho ("Finalizar viagem")
 *   sucesso    degradê verde ("Iniciar trajeto")
 *   link       só o texto em âmbar
 * icone (opcional) é o nome de um ícone Feather (ver atoms/Icone).
 */
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { cores, espacamentos, gradientes, raios, sombraForte, tipografia } from '../../theme';
import { Gradiente } from './Gradiente';
import { Icone } from './Icone';

const DEGRADE = {
  primario: gradientes.acao,
  entrar: gradientes.botao,
  perigo: gradientes.perigo,
  sucesso: gradientes.sucesso,
};

const COR_TEXTO = {
  secundario: cores.textoMedio,
  claro: cores.textoMedio,
  link: cores.link,
};

export function Button({
  title,
  onPress,
  variante = 'primario',
  icone,
  carregando = false,
  desabilitado = false,
  style,
  textoStyle,
}) {
  const inativo = desabilitado || carregando;
  const degrade = DEGRADE[variante];
  const corTexto = COR_TEXTO[variante] ?? cores.textoInverso;

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.base,
        styles[variante],
        degrade && !inativo && styles.comSombra,
        pressed && !inativo && styles.pressionado,
        inativo && styles.inativo,
        style,
      ]}>
      {degrade ? <Gradiente {...degrade} /> : null}
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <View style={styles.linha}>
          {icone ? <Icone nome={icone} cor={corTexto} tamanho={19} /> : null}
          <Text style={[styles.texto, { color: corTexto }, textoStyle]}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    paddingHorizontal: espacamentos.lg,
    borderRadius: raios.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  comSombra: { ...sombraForte, shadowOpacity: 0.2, elevation: 3 },
  // cor sólida por baixo do degradê: aparece se o SVG demorar e dá corpo à sombra do Android
  primario: { backgroundColor: '#F97316' },
  entrar: { backgroundColor: '#F59E0B' },
  perigo: { backgroundColor: '#DC2626' },
  sucesso: { backgroundColor: '#16A34A' },
  secundario: {
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.bordaNeutra,
  },
  claro: { backgroundColor: cores.cinzaClaro },
  link: { minHeight: 36, paddingHorizontal: 0, backgroundColor: 'transparent' },
  pressionado: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  inativo: { opacity: 0.5 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.sm },
  texto: {
    fontSize: tipografia.corpo + 1,
    fontWeight: '700',
    textAlign: 'center',
  },
});
