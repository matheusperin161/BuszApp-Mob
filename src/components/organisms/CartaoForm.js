/**
 * ORGANISM — CartaoForm
 * Cadastro do cartão de transporte: número, titular e tipo.
 * O backend permite um cartão por usuário.
 */
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { ChipGrupo } from '../molecules/ChipGrupo';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { FormField } from '../molecules/FormField';
import { TIPOS_CARTAO } from '../../constants/cartao';
import { espacamentos } from '../../theme';
import {
  LIMITES,
  erroVisivel,
  primeiroErro,
  validarNome,
  validarNumeroCartao,
} from '../../utils/validacao';

export function CartaoForm({ onSubmit, carregando = false, erro = null, titularInicial = '' }) {
  const [numero, setNumero] = useState('');
  const [titular, setTitular] = useState(titularInicial);
  const [tipo, setTipo] = useState(null);
  const [tocados, setTocados] = useState({});
  const titularRef = useRef(null);

  const erros = {
    numero: validarNumeroCartao(numero),
    titular: validarNome(titular),
    tipo: tipo ? null : 'Escolha o tipo do cartão.',
  };

  function tocar(campo) {
    setTocados(atual => ({ ...atual, [campo]: true }));
  }

  function enviar() {
    setTocados({ numero: true, titular: true, tipo: true });
    if (primeiroErro(erros) || carregando) return;
    onSubmit({ numero: numero.replace(/\D/g, ''), titular: titular.trim(), tipo });
  }

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <FormField
        label="Número do cartão"
        placeholder="Números impressos no cartão"
        value={numero}
        onChangeText={texto => setNumero(texto.replace(/\D/g, '').slice(0, LIMITES.cartaoMax))}
        onBlur={() => tocar('numero')}
        mensagemErro={erroVisivel(tocados, erros, 'numero')}
        keyboardType="number-pad"
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => titularRef.current?.focus()}
      />

      <FormField
        ref={titularRef}
        label="Nome do titular"
        placeholder="Como está no cartão"
        value={titular}
        onChangeText={setTitular}
        onBlur={() => tocar('titular')}
        mensagemErro={erroVisivel(tocados, erros, 'titular')}
        autoCapitalize="words"
        returnKeyType="done"
      />

      <ChipGrupo
        label="Tipo do cartão"
        opcoes={TIPOS_CARTAO}
        valor={tipo}
        onChange={valor => {
          setTipo(valor);
          tocar('tipo');
        }}
        mensagemErro={erroVisivel(tocados, erros, 'tipo')}
      />

      <Button title="Cadastrar cartão" icone="check" onPress={enviar} carregando={carregando} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: espacamentos.md },
});
