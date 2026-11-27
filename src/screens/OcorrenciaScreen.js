/**
 * SCREEN — OcorrenciaScreen
 * Motorista avisa atraso, pane, acidente... Todos os passageiros recebem.
 */
import { useState } from 'react';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { IconeCaixa } from '../components/molecules/IconeCaixa';
import { OcorrenciaForm } from '../components/organisms/OcorrenciaForm';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { enviarFotoOcorrencia, registrarOcorrencia } from '../services/motorista';
import { obterPosicao } from '../services/nativos';
import { estadoAtual } from '../services/rastreio';
import { espacamentos } from '../theme';
import { criarEstilos, useTema } from '../theme/tema';

export function OcorrenciaScreen({ navigation, route }) {
  const styles = useStyles();
  const { cores } = useTema();
  const trajeto = route.params?.trajeto ?? null;
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const cabecalho = {
    titulo: 'Registrar ocorrência',
    subtitulo: trajeto
      ? `Linha ${trajeto.linha?.numero} · ${trajeto.horario?.departure_time} — Ônibus ${trajeto.horario?.bus_number}`
      : 'Avise os passageiros',
    voltar: true,
  };

  const [avisoFoto, setAvisoFoto] = useState(null);

  async function handleEnviar({ tipo, descricao, foto }) {
    setCarregando(true);
    setErro(null);
    try {
      // local: a última posição do trajeto ou, se não tiver, o GPS agora
      const posicao = estadoAtual().ultima ?? (await obterPosicao().catch(() => null));
      const resposta = await registrarOcorrencia({ tipo, descricao, trajeto, posicao });
      if (foto && resposta?.incident?.id) {
        await enviarFotoOcorrencia(resposta.incident.id, foto).catch(e =>
          setAvisoFoto(`A ocorrência foi registrada, mas a foto não subiu: ${e.message}`),
        );
      }
      setEnviado(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  if (enviado) {
    return (
      <ScreenTemplate
        cabecalho={cabecalho}
        rodape={<Button title="Voltar ao trajeto" icone="arrow-left" onPress={() => navigation.goBack()} />}>
        <Card style={styles.sucesso}>
          <IconeCaixa nome="radio" redondo tamanho={80} fundo={cores.sucessoFundo} cor={cores.sucesso} />
          <Label variante="titulo" style={styles.titulo}>
            Passageiros avisados
          </Label>
          <Label style={styles.texto}>
            A ocorrência foi registrada e aparece nos avisos do app e do site.
          </Label>
          {avisoFoto ? (
            <Label variante="legenda" style={styles.texto}>
              {avisoFoto}
            </Label>
          ) : null}
        </Card>
      </ScreenTemplate>
    );
  }

  return (
    <ScreenTemplate cabecalho={cabecalho}>
      <OcorrenciaForm onSubmit={handleEnviar} carregando={carregando} erro={erro} />
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  sucesso: { alignItems: 'center', paddingVertical: espacamentos.xl },
  titulo: { marginTop: espacamentos.md, textAlign: 'center' },
  texto: { textAlign: 'center', marginTop: espacamentos.sm, color: cores.textoSecundario, fontSize: 15 },
}));
