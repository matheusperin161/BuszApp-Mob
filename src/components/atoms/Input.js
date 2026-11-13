/**
 * ATOM — Input
 * TextInput controlado pelo pai (value + onChangeText).
 * forwardRef: o form pode focar o próximo campo.
 *
 * Dois visuais, como no site:
 *   variante="cinza"  campos do login/cadastro (fundo cinza, ícone à esquerda)
 *   variante="creme"  campos das telas internas (fundo creme, borda âmbar)
 * icone: nome Feather mostrado à esquerda.
 * secureTextEntry ganha o "olho" para mostrar/ocultar a senha.
 */
import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { cores, espacamentos, raios, tipografia } from '../../theme';
import { Icone } from './Icone';

export const Input = forwardRef(function Input(
  {
    erro = false,
    variante = 'creme',
    icone,
    secureTextEntry,
    style,
    containerStyle,
    onFocus,
    onBlur,
    ...props
  },
  ref,
) {
  const [focado, setFocado] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const senha = Boolean(secureTextEntry);
  const corIcone = focado ? cores.primaria : cores.textoFraco;

  return (
    <View
      style={[
        styles.caixa,
        styles[variante],
        focado && styles.focado,
        erro && styles.comErro,
        containerStyle,
      ]}>
      {icone ? <Icone nome={icone} cor={corIcone} tamanho={20} style={styles.iconeEsq} /> : null}
      <TextInput
        ref={ref}
        placeholderTextColor={cores.textoFraco}
        {...props}
        secureTextEntry={senha && !mostrarSenha}
        style={[styles.input, style]}
        onFocus={evento => {
          setFocado(true);
          onFocus?.(evento);
        }}
        onBlur={evento => {
          setFocado(false);
          onBlur?.(evento);
        }}
      />
      {senha ? (
        <Pressable
          onPress={() => setMostrarSenha(v => !v)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
          style={styles.olho}>
          <Icone nome={mostrarSenha ? 'eye-off' : 'eye'} cor={cores.textoFraco} tamanho={20} />
        </Pressable>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  caixa: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: raios.md,
    paddingHorizontal: espacamentos.md,
  },
  creme: { backgroundColor: cores.fundo, borderColor: cores.borda },
  cinza: { backgroundColor: cores.campoCinza, borderColor: cores.campoCinzaBorda },
  focado: { borderColor: cores.bordaFoco, backgroundColor: cores.superficie },
  comErro: { borderColor: cores.perigo },
  iconeEsq: { marginRight: espacamentos.sm + 4 },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: tipografia.corpo + 1,
    color: cores.texto,
    paddingVertical: espacamentos.sm,
  },
  olho: { marginLeft: espacamentos.sm },
});
