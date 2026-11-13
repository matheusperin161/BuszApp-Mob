/**
 * ORGANISM — OcorrenciaForm
 * Tipo da ocorrência (grade de 4 blocos com ícone) + descrição.
 * Os passageiros recebem um aviso.
 */
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Label } from '../atoms/Label';
import { Card } from '../molecules/Card';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { IconeCaixa } from '../molecules/IconeCaixa';
import { TextAreaField } from '../molecules/TextAreaField';
import { TIPOS_OCORRENCIA } from '../../services/motorista';
import { cores, espacamentos, raios } from '../../theme';
import { LIMITES } from '../../utils/validacao';

export function OcorrenciaForm({ onSubmit, carregando = false, erro = null }) {
  const [tipo, setTipo] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [tentou, setTentou] = useState(false);

  const erros = {
    tipo: tipo ? null : 'Escolha o tipo.',
    descricao: tipo === 'outro' && !descricao.trim() ? 'Descreva o que aconteceu.' : null,
  };

  function enviar() {
    setTentou(true);
    if (erros.tipo || erros.descricao || carregando) return;
    onSubmit({ tipo, descricao: descricao.trim() });
  }

  return (
    <View style={styles.container}>
      <ErrorMessage mensagem={erro} />
      <Card titulo="O que aconteceu?" icone="alert-triangle">
        <View style={styles.grade}>
          {TIPOS_OCORRENCIA.map(t => {
            const ativo = t.id === tipo;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTipo(t.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: ativo }}
                style={[styles.opcao, ativo && styles.opcaoAtiva]}>
                <IconeCaixa
                  nome={t.icone}
                  tamanho={44}
                  degrade={ativo}
                  fundo={cores.superficieAlt}
                  cor={cores.primariaEscura}
                />
                <Label style={[styles.opcaoTexto, ativo && styles.opcaoTextoAtivo]}>{t.rotulo}</Label>
              </Pressable>
            );
          })}
        </View>
        {tentou && erros.tipo ? (
          <Label variante="legenda" style={styles.erro}>
            {erros.tipo}
          </Label>
        ) : null}
      </Card>
      <Card titulo="Detalhes" icone="message-circle">
        <TextAreaField
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Detalhes para os passageiros (ex.: atraso de 15 min na Av. Getúlio Vargas)"
          max={LIMITES.textoMax}
          mensagemErro={tentou ? erros.descricao : null}
        />
      </Card>
      <Button title="Avisar passageiros" icone="send" onPress={enviar} carregando={carregando} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  grade: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: espacamentos.sm + 4 },
  opcao: {
    width: '48%',
    alignItems: 'center',
    gap: espacamentos.sm,
    paddingVertical: espacamentos.md,
    borderRadius: raios.lg,
    borderWidth: 1.5,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  opcaoAtiva: { borderColor: cores.destaque, backgroundColor: '#FFF7ED' },
  opcaoTexto: { fontWeight: '600', color: cores.textoMedio },
  opcaoTextoAtivo: { color: cores.primariaTexto },
  erro: { color: cores.perigo, marginTop: espacamentos.sm },
});
