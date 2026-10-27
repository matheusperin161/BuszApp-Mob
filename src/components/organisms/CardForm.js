/**
 * ORGANISM — CardForm
 * Cadastro de cartão de transporte pelo número (CA06.1). Só o número é enviado:
 * saldo e status são definidos por quem guarda o cartão (CA06.2, CA06.5).
 * Número repetido (409) só quem guarda sabe — vem como erro geral.
 */
import { useState } from 'react';

import Button from '../atoms/Button';
import ErrorMessage from '../molecules/ErrorMessage';
import FormField from '../molecules/FormField';
import { mascaraCartao } from '../../utils/formatacao';
import { numeroCartao, somenteDigitos } from '../../utils/validacao';

export default function CardForm({ aoCadastrar }) {
  const [numero, setNumero] = useState('');
  const [erro, setErro] = useState(null);
  const [erroGeral, setErroGeral] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const cadastrar = async () => {
    const invalido = numeroCartao(numero);
    setErro(invalido);
    if (invalido) return;
    setErroGeral(null);
    setSalvando(true);
    try {
      await aoCadastrar(somenteDigitos(numero));
      setNumero('');
    } catch (e) {
      setErroGeral(e.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <>
      <ErrorMessage mensagem={erroGeral} />
      <FormField
        rotulo="Número do cartão"
        obrigatorio
        value={numero}
        onChangeText={(texto) => setNumero(mascaraCartao(texto))}
        erro={erro}
        keyboardType="number-pad"
        placeholder="0000 0000 0000"
        autoComplete="off"
        autoCorrect={false}
        onSubmitEditing={cadastrar}
      />
      <Button titulo="Cadastrar cartão" onPress={cadastrar} carregando={salvando} />
    </>
  );
}
