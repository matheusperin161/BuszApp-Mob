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
 *   perigoContorno  contorno e texto vermelhos ("Excluir")
 * icone (opcional) é o nome de um ícone Feather (ver atoms/Icone).
 */
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { espacamentos, raios, tipografia } from '../../theme';
import { criarEstilos, escalarTexto, useTema } from '../../theme/tema';
import { Gradiente } from './Gradiente';
import { Icone } from './Icone';

const DEGRADE = {
  primario: 'acao',
  entrar: 'botao',
  perigo: 'perigo',
  sucesso: 'sucesso',
};

// variantes sem degradê: cor do texto vem do tema
const COR_TEXTO = {
  secundario: 'textoMedio',
  claro: 'textoMedio',
  link: 'link',
  perigoContorno: 'perigo',
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
  const styles = useStyles();
  const { cores, gradientes, escalaFonte } = useTema();
  const inativo = desabilitado || carregando;
  const degrade = DEGRADE[variante] ? gradientes[DEGRADE[variante]] : null;
  const corTexto = COR_TEXTO[variante] ? cores[COR_TEXTO[variante]] : cores.textoInverso;

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
          <Text style={escalarTexto([styles.texto, { color: corTexto }, textoStyle], escalaFonte)}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const useStyles = criarEstilos(({ cores, sombra, sombraForte }) => ({
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
  perigoContorno: {
    backgroundColor: cores.superficie,
    borderWidth: 1.5,
    borderColor: cores.perigo,
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
}));
