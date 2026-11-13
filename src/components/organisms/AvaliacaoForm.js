/**
 * ORGANISM — AvaliacaoForm
 * Mesmo formulário da tela Avaliar do site, bloco a bloco:
 *   Avaliação Geral (obrigatória) · grade 2×2 (Pontualidade, Limpeza, Conforto, Motorista)
 *   · linha e horário da viagem · comentário · Enviar / Cancelar.
 * A screen carrega as linhas e os horários; o form só controla o que o usuário escolheu.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { Card } from '../molecules/Card';
import { ChipGrupo } from '../molecules/ChipGrupo';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { EstrelasCampo } from '../molecules/EstrelasCampo';
import { TextAreaField } from '../molecules/TextAreaField';
import { cores, espacamentos, raios, sombra } from '../../theme';
import { LIMITES } from '../../utils/validacao';

// "atendimento" é o campo service_rating do backend; o site chama de "Motorista"
const CRITERIOS = [
  { id: 'pontualidade', rotulo: 'Pontualidade', icone: 'clock' },
  { id: 'limpeza', rotulo: 'Limpeza', icone: 'shield' },
  { id: 'conforto', rotulo: 'Conforto', icone: 'heart' },
  { id: 'atendimento', rotulo: 'Motorista', icone: 'user' },
];

const NOTAS_VAZIAS = { geral: 0, pontualidade: 0, limpeza: 0, conforto: 0, atendimento: 0 };

export function AvaliacaoForm({
  linhas,
  linha,
  onMudarLinha,
  horarios,
  horarioInicial = null,
  carregandoHorarios = false,
  onSubmit,
  onCancelar,
  carregando = false,
  erro = null,
}) {
  const [horario, setHorario] = useState(horarioInicial);
  const [notas, setNotas] = useState(NOTAS_VAZIAS);
  const [comentario, setComentario] = useState('');
  const [tentou, setTentou] = useState(false);

  const erros = {
    linha: linha ? null : 'Escolha a linha.',
    geral: notas.geral ? null : 'Dê uma nota geral de 1 a 5.',
    comentario:
      comentario.trim().length > LIMITES.textoMax
        ? `Máximo de ${LIMITES.textoMax} caracteres.`
        : null,
  };

  function nota(campo, valor) {
    setNotas(atual => ({ ...atual, [campo]: valor }));
  }

  function enviar() {
    setTentou(true);
    if (Object.values(erros).some(Boolean) || carregando) return;
    onSubmit({ ...notas, horario, comentario: comentario.trim() });
  }

  function cancelar() {
    setNotas(NOTAS_VAZIAS);
    setComentario('');
    setHorario(null);
    setTentou(false);
    onCancelar?.();
  }

  const opcoesLinha = (linhas || []).map(l => ({ id: l.numero, rotulo: `${l.numero} · ${l.nome}` }));
  const opcoesHorario = (horarios || []).map(h => ({ id: h.departure_time, rotulo: h.departure_time }));

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <Card titulo="Avaliação Geral" icone="award" obrigatorio>
        <EstrelasCampo
          rotulo="Avaliação geral"
          valor={notas.geral}
          onChange={v => nota('geral', v)}
          grande
          dica="Toque nas estrelas para avaliar"
          mensagemErro={tentou ? erros.geral : null}
        />
      </Card>

      <View style={styles.grade}>
        {CRITERIOS.map(c => (
          <View key={c.id} style={styles.criterio}>
            <View style={styles.criterioTopo}>
              <Icone nome={c.icone} cor={cores.primaria} tamanho={18} />
              <Label style={styles.criterioRotulo}>{c.rotulo}</Label>
            </View>
            <EstrelasCampo rotulo={c.rotulo} valor={notas[c.id]} onChange={v => nota(c.id, v)} />
          </View>
        ))}
      </View>

      <Card titulo="Sobre a viagem" icone="navigation">
        <ChipGrupo
          label="Linha"
          opcoes={opcoesLinha}
          valor={linha}
          onChange={valor => {
            setHorario(null);
            onMudarLinha(valor);
          }}
          horizontal
          vazio="Nenhuma linha cadastrada."
          mensagemErro={tentou ? erros.linha : null}
        />
        <ChipGrupo
          label={carregandoHorarios ? 'Horário de saída (carregando...)' : 'Horário de saída (opcional)'}
          opcoes={opcoesHorario}
          valor={horario}
          onChange={valor => setHorario(valor === horario ? null : valor)}
          horizontal
          vazio={linha ? 'Sem horários para esta linha.' : 'Selecione a linha primeiro.'}
        />
      </Card>

      <Card titulo="Comentários (opcional)" icone="message-circle">
        <TextAreaField
          value={comentario}
          onChangeText={setComentario}
          placeholder="Conte mais sobre sua experiência..."
          max={LIMITES.textoMax}
          mensagemErro={tentou ? erros.comentario : null}
        />
      </Card>

      <Button title="Enviar Avaliação" icone="send" onPress={enviar} carregando={carregando} />
      <Button title="Cancelar" variante="secundario" onPress={cancelar} style={styles.cancelar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: espacamentos.md,
    marginBottom: espacamentos.md,
  },
  criterio: {
    width: '48.3%',
    backgroundColor: cores.superficie,
    borderRadius: raios.xl,
    paddingVertical: espacamentos.md,
    paddingHorizontal: espacamentos.sm,
    ...sombra,
  },
  criterioTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: espacamentos.sm,
    paddingHorizontal: espacamentos.xs,
  },
  criterioRotulo: { fontWeight: '700', fontSize: 15 },
  cancelar: { marginTop: espacamentos.sm },
});
