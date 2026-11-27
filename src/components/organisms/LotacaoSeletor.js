/**
 * ORGANISM — LotacaoSeletor
 * Três botões grandes para o motorista informar a lotação (vazio · cheio · lotado).
 * Os passageiros veem no acompanhamento da linha, antes de embarcar.
 */
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { Card } from '../molecules/Card';
import { useToast } from './Toast';
import { LOTACOES, informarLotacao } from '../../services/motorista';
import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';

const ICONES = { vazio: 'smile', cheio: 'users', lotado: 'alert-circle' };

export function LotacaoSeletor({ valorInicial = null }) {
  const styles = useStyles();
  const { cores } = useTema();
  const toast = useToast();
  const [valor, setValor] = useState(valorInicial);
  const [enviando, setEnviando] = useState(null);

  async function escolher(id) {
    if (enviando) return;
    const anterior = valor;
    setValor(id);
    setEnviando(id);
    try {
      await informarLotacao(id);
      toast.mostrar('Lotação atualizada para os passageiros');
    } catch (e) {
      setValor(anterior);
      toast.mostrar(e.message, 'erro');
    } finally {
      setEnviando(null);
    }
  }

  return (
    <Card titulo="Lotação do ônibus" icone="users">
      <View style={styles.linha}>
        {LOTACOES.map(l => {
          const ativo = valor === l.id;
          const cor = cores[l.cor];
          return (
            <Pressable
              key={l.id}
              onPress={() => escolher(l.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo, busy: enviando === l.id }}
              accessibilityLabel={`Lotação ${l.rotulo}: ${l.descricao}`}
              style={({ pressed }) => [
                styles.opcao,
                ativo && { borderColor: cor, backgroundColor: cor },
                pressed && styles.pressionado,
              ]}>
              <Icone nome={ICONES[l.id]} cor={ativo ? '#FFFFFF' : cor} tamanho={26} />
              <Label style={[styles.rotulo, ativo && styles.rotuloAtivo]}>{l.rotulo}</Label>
              <Label variante="legenda" style={[styles.descricao, ativo && styles.rotuloAtivo]}>
                {l.descricao}
              </Label>
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  linha: { flexDirection: 'row', gap: espacamentos.sm },
  opcao: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: espacamentos.md,
    borderRadius: raios.lg,
    borderWidth: 2,
    borderColor: cores.bordaNeutra,
    backgroundColor: cores.fundo,
  },
  pressionado: { opacity: 0.8 },
  rotulo: { fontWeight: '800', fontSize: 16, color: cores.texto },
  rotuloAtivo: { color: '#FFFFFF' },
  descricao: { fontSize: 11, textAlign: 'center' },
}));
