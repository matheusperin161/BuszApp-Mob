/**
 * ORGANISM — TrajetoForm
 * Igual ao Painel do Motorista do site:
 *   1. "Selecionar rota": a linha num seletor com busca
 *   2. "Escolha seu horário": aparece depois da linha; cada horário é um ônibus
 *   3. "Iniciar Trajeto": libera quando o horário é escolhido
 * O horário importa: é por ele que o passageiro acompanha (site e app).
 */
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { Card } from '../molecules/Card';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { HorarioItem } from '../molecules/HorarioItem';
import { corDaLinha } from '../molecules/LinhaItem';
import { SeletorBusca } from '../molecules/SeletorBusca';
import { cores, espacamentos } from '../../theme';

export function TrajetoForm({
  linhas,
  linhaId,
  onMudarLinha,
  horarios,
  carregandoLinhas = false,
  carregandoHorarios = false,
  onSubmit,
  carregando = false,
  erro = null,
}) {
  const [horarioId, setHorarioId] = useState(null);
  const horario = (horarios || []).find(h => h.id === horarioId) ?? null;

  const opcoesLinha = (linhas || []).map(l => ({
    id: l.id,
    marcador: l.numero,
    rotulo: l.nome,
    detalhe: l.origem && l.destino ? `${l.origem} → ${l.destino}` : undefined,
  }));

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />

      <Card>
        <Label variante="secao" style={styles.titulo}>
          Selecionar rota
        </Label>
        <SeletorBusca
          label="Linha"
          titulo="Escolha a linha"
          placeholder="Selecione uma rota..."
          opcoes={opcoesLinha}
          valor={linhaId}
          onChange={id => {
            setHorarioId(null);
            onMudarLinha(id);
          }}
          carregando={carregandoLinhas}
          corMarcador={item => corDaLinha(item.marcador)}
          vazio="Nenhuma linha encontrada."
        />
      </Card>

      {linhaId ? (
        <Card>
          <Label variante="secao" style={styles.titulo}>
            Escolha seu horário
          </Label>
          {carregandoHorarios ? (
            <View style={styles.vazio}>
              <ActivityIndicator color={cores.primaria} />
              <Label variante="legenda">Carregando horários...</Label>
            </View>
          ) : horarios?.length ? (
            horarios.map(h => (
              <HorarioItem
                key={h.id}
                horario={h}
                selecionado={h.id === horarioId}
                onPress={item => setHorarioId(item.id)}
              />
            ))
          ) : (
            <View style={styles.vazio}>
              <Icone nome="clock" cor={cores.textoFraco} tamanho={34} />
              <Label variante="legenda">Nenhum horário disponível para esta linha.</Label>
            </View>
          )}
        </Card>
      ) : null}

      <Button
        title={horario ? `Iniciar Trajeto · ${horario.departure_time}` : 'Iniciar Trajeto'}
        icone="truck"
        onPress={() => horario && onSubmit(horario)}
        carregando={carregando}
        desabilitado={!horario}
        style={styles.botao}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  titulo: { marginBottom: espacamentos.md },
  vazio: { alignItems: 'center', gap: espacamentos.sm, paddingVertical: espacamentos.lg },
  botao: { minHeight: 58, marginBottom: espacamentos.md },
});
