/**
 * ORGANISM — OcorrenciaForm
 * Tipo da ocorrência (grade de 4 blocos com ícone) + descrição + foto opcional.
 * Os passageiros recebem um aviso; o admin vê a foto e o local no mapa.
 */
import { useState } from 'react';
import { Image, Pressable, View } from 'react-native';

import { Button } from '../atoms/Button';
import { Label } from '../atoms/Label';
import { Card } from '../molecules/Card';
import { ErrorMessage } from '../molecules/ErrorMessage';
import { IconeCaixa } from '../molecules/IconeCaixa';
import { TextAreaField } from '../molecules/TextAreaField';
import { TIPOS_OCORRENCIA } from '../../services/motorista';
import { capturarFoto, escolherImagem } from '../../services/nativos';
import { espacamentos, raios } from '../../theme';
import { criarEstilos, useTema } from '../../theme/tema';
import { LIMITES } from '../../utils/validacao';

export function OcorrenciaForm({ onSubmit, carregando = false, erro = null }) {
  const styles = useStyles();
  const { cores } = useTema();
  const [tipo, setTipo] = useState(null);
  const [descricao, setDescricao] = useState('');
  const [tentou, setTentou] = useState(false);
  const [foto, setFoto] = useState(null);
  const [erroFoto, setErroFoto] = useState(null);

  async function pegarFoto(origem) {
    setErroFoto(null);
    try {
      const escolhida = origem === 'camera' ? await capturarFoto({ traseira: true }) : await escolherImagem();
      if (escolhida) setFoto(escolhida);
    } catch (e) {
      setErroFoto(e.message);
    }
  }

  const erros = {
    tipo: tipo ? null : 'Escolha o tipo.',
    descricao: tipo === 'outro' && !descricao.trim() ? 'Descreva o que aconteceu.' : null,
  };

  function enviar() {
    setTentou(true);
    if (erros.tipo || erros.descricao || carregando) return;
    onSubmit({ tipo, descricao: descricao.trim(), foto: foto?.uri ?? null });
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
      <Card titulo="Foto (opcional)" icone="camera">
        {foto ? (
          <View>
            <Image source={{ uri: foto.uri }} style={styles.foto} accessibilityLabel="Foto da ocorrência" />
            <Button title="Tirar outra" icone="x" variante="secundario" onPress={() => setFoto(null)} style={styles.semMargem} />
          </View>
        ) : (
          <View style={styles.botoesFoto}>
            <Button title="Câmera" icone="camera" variante="secundario" onPress={() => pegarFoto('camera')} style={styles.botaoFoto} />
            <Button title="Galeria" icone="layout" variante="secundario" onPress={() => pegarFoto('galeria')} style={styles.botaoFoto} />
          </View>
        )}
        <ErrorMessage mensagem={erroFoto} />
        <Label variante="legenda" style={styles.legendaFoto}>
          O local é enviado junto, pelo GPS. A foto ajuda o administrador a entender o problema.
        </Label>
      </Card>
      <Button title="Avisar passageiros" icone="send" onPress={enviar} carregando={carregando} />
    </View>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
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
  opcaoAtiva: { borderColor: cores.destaque, backgroundColor: cores.realce },
  opcaoTexto: { fontWeight: '600', color: cores.textoMedio },
  opcaoTextoAtivo: { color: cores.primariaTexto },
  erro: { color: cores.perigo, marginTop: espacamentos.sm },
  foto: { width: '100%', height: 200, borderRadius: raios.lg, marginBottom: espacamentos.sm, backgroundColor: cores.cinzaClaro },
  botoesFoto: { flexDirection: 'row', gap: espacamentos.sm },
  botaoFoto: { flex: 1, marginBottom: 0 },
  semMargem: { marginBottom: 0 },
  legendaFoto: { marginTop: espacamentos.sm },
}));
