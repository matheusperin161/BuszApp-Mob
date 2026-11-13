/**
 * ORGANISM — ViagemForm
 * "Selecionar rota" do painel do motorista do site, com o que o backend pede
 * para abrir uma viagem: linha, veículo e sentido. Veículos em uso ficam desabilitados.
 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Label } from '../atoms/Label';
import { Card } from '../molecules/Card';
import { ChipGrupo } from '../molecules/ChipGrupo';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { espacamentos } from '../../theme';

const ROTULO_SENTIDO = { ida: 'Ida →', volta: '← Volta' };

export function ViagemForm({ opcoes, onSubmit, carregando = false, erro = null }) {
  const [linhaId, setLinhaId] = useState(null);
  const [veiculoId, setVeiculoId] = useState(null);
  const [sentido, setSentido] = useState('ida');
  const [tentou, setTentou] = useState(false);

  const erros = {
    linha: linhaId ? null : 'Escolha a linha.',
    veiculo: veiculoId ? null : 'Escolha o veículo.',
  };

  function enviar() {
    setTentou(true);
    if (erros.linha || erros.veiculo || carregando) return;
    onSubmit({ linhaId, veiculoId, sentido });
  }

  const opcoesLinha = (opcoes?.linhas || []).map(l => ({ id: l.id, rotulo: `${l.numero} · ${l.nome}` }));
  const opcoesVeiculo = (opcoes?.veiculos || []).map(v => ({
    id: v.id,
    rotulo: `${v.plate} · ${v.model}${v.em_uso ? ' (em uso)' : ''}`,
    desabilitado: v.em_uso,
  }));
  const opcoesSentido = (opcoes?.sentidos || ['ida', 'volta']).map(s => ({
    id: s,
    rotulo: ROTULO_SENTIDO[s] ?? s,
  }));

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />
      <Card>
        <Label variante="secao" style={styles.titulo}>
          Selecionar rota
        </Label>
        <ChipGrupo
          label="Linha"
          opcoes={opcoesLinha}
          valor={linhaId}
          onChange={setLinhaId}
          vazio="Nenhuma linha ativa."
          mensagemErro={tentou ? erros.linha : null}
        />
        <ChipGrupo
          label="Veículo"
          opcoes={opcoesVeiculo}
          valor={veiculoId}
          onChange={setVeiculoId}
          vazio="Nenhum veículo ativo."
          mensagemErro={tentou ? erros.veiculo : null}
        />
        <ChipGrupo label="Sentido" opcoes={opcoesSentido} valor={sentido} onChange={setSentido} />
      </Card>
      <Button
        title="Iniciar Trajeto"
        icone="truck"
        onPress={enviar}
        carregando={carregando}
        desabilitado={!linhaId || !veiculoId}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  titulo: { marginBottom: espacamentos.md },
  botao: { minHeight: 58, marginBottom: espacamentos.md },
});
