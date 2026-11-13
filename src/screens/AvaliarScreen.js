/**
 * SCREEN — AvaliarScreen (aba "Avaliar")
 * Avaliação da viagem, no layout do site. Pode chegar com a linha/horário
 * já escolhidos (vindo do acompanhamento).
 */
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { EstadoCarga } from '../components/molecules/EstadoCarga';
import { IconeCaixa } from '../components/molecules/IconeCaixa';
import { AvaliacaoForm } from '../components/organisms/AvaliacaoForm';
import { Cabecalho } from '../components/organisms/Cabecalho';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { irParaAba } from '../navigation/acoes';
import { enviarAvaliacao } from '../services/avaliacao';
import { listarHorarios, listarLinhas } from '../services/linhas';
import { cores, espacamentos } from '../theme';
import { hojeIso } from '../utils/formato';

export function AvaliarScreen({ navigation, route }) {
  const [linhas, setLinhas] = useState(null);
  const [linha, setLinha] = useState(route.params?.linhaNumero ?? null);
  const [horarios, setHorarios] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [erroCarga, setErroCarga] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [enviado, setEnviado] = useState(false);
  // muda quando chega uma nova linha pelo acompanhamento: recria o form já preenchido
  const [versao, setVersao] = useState(0);

  const carregarLinhas = useCallback(async () => {
    setErroCarga(null);
    try {
      const lista = await listarLinhas();
      setLinhas((lista || []).map(l => ({ numero: l.route_number, nome: l.route_name })));
    } catch (e) {
      setErroCarga(e.message);
    }
  }, []);

  useEffect(() => {
    carregarLinhas();
  }, [carregarLinhas]);

  // a aba fica montada: se o acompanhamento mandar outra linha, atualiza
  useEffect(() => {
    if (route.params?.linhaNumero) {
      setLinha(route.params.linhaNumero);
      setEnviado(false);
      setVersao(v => v + 1);
    }
  }, [route.params?.linhaNumero, route.params?.horario]);

  useEffect(() => {
    if (!linha) {
      setHorarios([]);
      return;
    }
    let ativo = true;
    setCarregandoHorarios(true);
    listarHorarios(linha)
      .then(lista => ativo && setHorarios(lista || []))
      .catch(() => ativo && setHorarios([]))
      .finally(() => ativo && setCarregandoHorarios(false));
    return () => {
      ativo = false;
    };
  }, [linha]);

  async function handleEnviar(dados) {
    const escolhida = linhas.find(l => l.numero === linha);
    setEnviando(true);
    setErro(null);
    try {
      await enviarAvaliacao({
        ...dados,
        linha: escolhida ? `${escolhida.numero} - ${escolhida.nome}` : String(linha),
        data: hojeIso(),
      });
      setEnviado(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  function novaAvaliacao() {
    setEnviado(false);
    setLinha(null);
    setVersao(v => v + 1);
  }

  if (enviado) {
    return (
      <ScreenTemplate>
        <Card style={styles.centro}>
          <IconeCaixa nome="check-circle" redondo tamanho={80} fundo={cores.sucessoFundo} cor={cores.sucesso} />
          <Label variante="titulo" style={styles.titulo}>
            Obrigado!
          </Label>
          <Label style={styles.texto}>
            Sua avaliação ajuda a melhorar o transporte público de Chapecó.
          </Label>
        </Card>
        <Button title="Voltar ao início" icone="home" onPress={() => irParaAba(navigation, 'Home')} />
        <Button title="Avaliar outra viagem" variante="secundario" onPress={novaAvaliacao} style={styles.outra} />
      </ScreenTemplate>
    );
  }

  if (!linhas) {
    return (
      <>
        <Cabecalho />
        <EstadoCarga carregando={!erroCarga} erro={erroCarga} onTentarDeNovo={carregarLinhas} />
      </>
    );
  }

  return (
    <ScreenTemplate>
      <Card style={styles.centro}>
        <IconeCaixa nome="smile" redondo tamanho={64} fundo={cores.superficieAlt} cor={cores.destaque} />
        <Label variante="titulo" style={styles.titulo}>
          Como foi sua viagem?
        </Label>
        <Label style={styles.texto}>Sua avaliação nos ajuda a melhorar continuamente o serviço</Label>
      </Card>
      <AvaliacaoForm
        key={versao}
        linhas={linhas}
        linha={linha}
        onMudarLinha={setLinha}
        horarios={horarios}
        horarioInicial={route.params?.horario ?? null}
        carregandoHorarios={carregandoHorarios}
        onSubmit={handleEnviar}
        onCancelar={() => {
          setLinha(null);
          setErro(null);
          irParaAba(navigation, 'Home');
        }}
        carregando={enviando}
        erro={erro}
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', paddingVertical: espacamentos.xl },
  titulo: { marginTop: espacamentos.md, textAlign: 'center' },
  texto: { textAlign: 'center', marginTop: espacamentos.sm, color: cores.textoSecundario, fontSize: 16, lineHeight: 23 },
  outra: { marginTop: espacamentos.sm },
});
