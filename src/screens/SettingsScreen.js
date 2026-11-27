/**
 * SCREEN — SettingsScreen
 * Preferências no AsyncStorage. Sobrevivem ao logout.
 */
import { useEffect, useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';

import { Button } from '../components/atoms/Button';
import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { Card } from '../components/molecules/Card';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { InfoLinha } from '../components/molecules/InfoLinha';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { API_BASE_URL } from '../services/config';
import {
  configurarNotificacoes,
  enviarAvisoLocal,
  pedirPermissaoNotificacao,
} from '../services/nativos';
import { obterPreferencias, salvarPreferencias } from '../services/preferencias';
import { espacamentos } from '../theme';
import { criarEstilos, useTema } from '../theme/tema';

const VERSAO = '1.1.0';

const APARENCIA = [
  { id: 'sistema', rotulo: 'Sistema', icone: 'monitor', descricao: 'Segue o celular' },
  { id: 'claro', rotulo: 'Claro', icone: 'sun', descricao: 'Creme e âmbar' },
  { id: 'escuro', rotulo: 'Escuro', icone: 'moon', descricao: 'Modo black' },
];

export function SettingsScreen() {
  const styles = useStyles();
  const { cores, modo, setModo } = useTema();
  const [prefs, setPrefs] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    configurarNotificacoes();
    obterPreferencias().then(setPrefs);
  }, []);

  async function mudar(id, valor) {
    setErro(null);
    setPrefs(atual => ({ ...atual, [id]: valor }));
    if (id === 'avisoSaldoBaixo' && valor) {
      const ok = await pedirPermissaoNotificacao().catch(() => false);
      if (!ok) {
        setPrefs(atual => ({ ...atual, avisoSaldoBaixo: false }));
        await salvarPreferencias({ avisoSaldoBaixo: false });
        setErro('Permissão de notificação negada. Libere nas configurações do aparelho.');
        return;
      }
    }
    await salvarPreferencias({ [id]: valor });
  }

  async function handleTeste() {
    setErro(null);
    setOcupado(true);
    try {
      await enviarAvisoLocal({
        titulo: 'BusZapp',
        corpo: 'Os avisos estão funcionando neste aparelho. 🚌',
      });
      Alert.alert('Aviso enviado', 'Veja a bandeja de notificações.');
    } catch (e) {
      setErro(e.message);
    } finally {
      setOcupado(false);
    }
  }

  const opcoes = [
    {
      id: 'avisoSaldoBaixo',
      titulo: 'Avisar saldo baixo',
      descricao: 'Notificação quando o saldo ficar abaixo de R$ 5,00.',
    },
    {
      id: 'atualizacaoAutomatica',
      titulo: 'Mapa ao vivo',
      descricao: 'Atualiza a posição dos ônibus a cada 5 segundos.',
    },
  ];

  return (
    <ScreenTemplate
      cabecalho={{ titulo: 'Configurações', subtitulo: 'Salvas neste aparelho', voltar: true }}>
      <ErrorMessage mensagem={erro} />
      <Card titulo="Aparência" icone="moon">
        <View style={styles.temas}>
          {APARENCIA.map(op => {
            const ativo = modo === op.id;
            return (
              <Pressable
                key={op.id}
                onPress={() => setModo(op.id)}
                accessibilityRole="radio"
                accessibilityState={{ selected: ativo }}
                accessibilityLabel={`Tema ${op.rotulo}`}
                style={[styles.tema, ativo && styles.temaAtivo]}>
                <Icone nome={op.icone} cor={ativo ? cores.primaria : cores.textoSecundario} tamanho={24} />
                <Label style={[styles.temaRotulo, ativo && styles.temaRotuloAtivo]}>{op.rotulo}</Label>
                <Label variante="legenda" style={styles.temaDescricao}>
                  {op.descricao}
                </Label>
              </Pressable>
            );
          })}
        </View>
      </Card>
      <Card titulo="Preferências" icone="settings">
        {opcoes.map((opcao, i) => (
          <View key={opcao.id} style={[styles.linha, i < opcoes.length - 1 && styles.divisor]}>
            <View style={styles.textos}>
              <Label style={styles.opcaoTitulo}>{opcao.titulo}</Label>
              <Label variante="legenda">{opcao.descricao}</Label>
            </View>
            <Switch
              value={Boolean(prefs?.[opcao.id])}
              onValueChange={valor => mudar(opcao.id, valor)}
              disabled={!prefs}
              trackColor={{ true: cores.primaria, false: cores.bordaNeutra }}
              thumbColor={cores.superficie}
            />
          </View>
        ))}
      </Card>

      {prefs?.avisoSaldoBaixo ? (
        <Button
          title="Testar notificação"
          icone="bell"
          variante="secundario"
          onPress={handleTeste}
          carregando={ocupado}
          style={styles.botao}
        />
      ) : null}

      <Card titulo="Sobre" icone="info">
        <InfoLinha rotulo="Versão do app" valor={VERSAO} />
        <InfoLinha rotulo="Servidor" valor={API_BASE_URL} ultima />
      </Card>
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(({ cores }) => ({
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: espacamentos.sm + 4,
  },
  divisor: { borderBottomWidth: 1, borderBottomColor: cores.cinzaClaro },
  temas: { flexDirection: 'row', gap: espacamentos.sm },
  tema: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: espacamentos.md,
    paddingHorizontal: espacamentos.xs,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: cores.bordaNeutra,
    backgroundColor: cores.fundo,
  },
  temaAtivo: { borderColor: cores.primaria, backgroundColor: cores.superficieAlt },
  temaRotulo: { fontWeight: '700', color: cores.textoMedio, marginTop: 2 },
  temaRotuloAtivo: { color: cores.texto },
  temaDescricao: { fontSize: 11, textAlign: 'center' },
  textos: { flex: 1, marginRight: espacamentos.md },
  opcaoTitulo: { fontWeight: '700', fontSize: 16 },
  botao: { marginBottom: espacamentos.md },
}));
