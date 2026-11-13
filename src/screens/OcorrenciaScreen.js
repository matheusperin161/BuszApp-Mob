/**
 * SCREEN — OcorrenciaScreen
 * Motorista avisa atraso, pane, acidente... Todos os passageiros recebem.
 */
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { IconeCaixa } from '../components/molecules/IconeCaixa';
import { OcorrenciaForm } from '../components/organisms/OcorrenciaForm';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { registrarOcorrencia } from '../services/motorista';
import { cores, espacamentos } from '../theme';

export function OcorrenciaScreen({ navigation, route }) {
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

  async function handleEnviar({ tipo, descricao }) {
    setCarregando(true);
    setErro(null);
    try {
      await registrarOcorrencia({ tipo, descricao, trajeto });
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

const styles = StyleSheet.create({
  sucesso: { alignItems: 'center', paddingVertical: espacamentos.xl },
  titulo: { marginTop: espacamentos.md, textAlign: 'center' },
  texto: { textAlign: 'center', marginTop: espacamentos.sm, color: cores.textoSecundario, fontSize: 15 },
});
