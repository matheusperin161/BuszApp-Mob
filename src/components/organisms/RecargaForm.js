/**
 * ORGANISM — RecargaForm
 * Valor (atalhos ou digitado) + forma de pagamento.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { ChipGrupo } from '../molecules/ChipGrupo';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { FormField } from '../molecules/FormField';
import { FORMAS_PAGAMENTO, VALORES_RECARGA } from '../../constants/cartao';
import { espacamentos } from '../../theme';
import { dinheiro } from '../../utils/formato';
import { lerValor, validarValorRecarga } from '../../utils/validacao';

const OUTRO = 'outro';

export function RecargaForm({ onSubmit, carregando = false, erro = null }) {
  const [atalho, setAtalho] = useState(VALORES_RECARGA[1]);
  const [digitado, setDigitado] = useState('');
  const [forma, setForma] = useState('pix');
  const [tentou, setTentou] = useState(false);

  const valorTexto = atalho === OUTRO ? digitado : String(atalho);
  const erroValor = validarValorRecarga(valorTexto);
  const valor = lerValor(valorTexto);

  const opcoesValor = [
    ...VALORES_RECARGA.map(v => ({ id: v, rotulo: dinheiro(v) })),
    { id: OUTRO, rotulo: 'Outro valor' },
  ];
  const opcoesForma = FORMAS_PAGAMENTO.map(f => ({ id: f.id, rotulo: f.rotulo }));

  function enviar() {
    setTentou(true);
    if (erroValor || carregando) return;
    onSubmit({ valor, forma });
  }

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <ChipGrupo label="Quanto recarregar" opcoes={opcoesValor} valor={atalho} onChange={setAtalho} />

      {atalho === OUTRO ? (
        <FormField
          label="Valor (R$)"
          placeholder="Ex.: 35,00"
          value={digitado}
          onChangeText={texto => setDigitado(texto.replace(/[^\d,.]/g, ''))}
          keyboardType="decimal-pad"
          mensagemErro={tentou ? erroValor : null}
          autoFocus
        />
      ) : null}

      <ChipGrupo label="Forma de pagamento" opcoes={opcoesForma} valor={forma} onChange={setForma} />

      <Button
        title={erroValor ? 'Recarregar' : `Recarregar ${dinheiro(valor)}`}
        icone="refresh-cw"
        onPress={enviar}
        carregando={carregando}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  botao: { marginTop: espacamentos.sm },
});
