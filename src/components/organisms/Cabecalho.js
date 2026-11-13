/**
 * ORGANISM — Cabecalho
 * A barra em degradê do topo do site, com a mesma lógica:
 *   - tela principal: "BuszApp" (+ subtítulo opcional, ex. "Painel do Motorista")
 *   - tela interna: seta de voltar + título + subtítulo
 *   - à direita: sino (com bolinha vermelha se há aviso novo) e atalho do perfil
 * Usa a navegação diretamente para não obrigar toda tela a repassar callbacks.
 */
import { useCallback, useState } from 'react';
import { Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gradiente } from '../atoms/Gradiente';
import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { irParaAba } from '../../navigation/acoes';
import { contarNaoVistas } from '../../services/notificacoes';
import { cores, espacamentos, gradientes } from '../../theme';

function BotaoIcone({ nome, onPress, rotulo, bolinha = false }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      style={({ pressed }) => [styles.botao, pressed && styles.pressionado]}>
      <Icone nome={nome} cor={cores.textoInverso} tamanho={23} />
      {bolinha ? <View style={styles.bolinha} /> : null}
    </Pressable>
  );
}

export function Cabecalho({ titulo, subtitulo, voltar = false, direita, semAcoes = false }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [novos, setNovos] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (semAcoes) return undefined;
      let ativo = true;
      contarNaoVistas()
        .then(n => ativo && setNovos(n))
        .catch(() => {});
      return () => {
        ativo = false;
      };
    }, [semAcoes]),
  );

  return (
    <View style={[styles.barra, { paddingTop: insets.top + espacamentos.sm }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Gradiente cores={gradientes.marca.cores} angulo={90} />

      {voltar ? (
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={styles.voltar}>
          <Icone nome="arrow-left" cor={cores.textoInverso} tamanho={24} />
        </Pressable>
      ) : null}

      <View style={styles.textos}>
        <Label style={[styles.titulo, !voltar && !titulo && styles.marca]} numberOfLines={1}>
          {titulo || 'BuszApp'}
        </Label>
        {subtitulo ? (
          <Label style={styles.subtitulo} numberOfLines={1}>
            {subtitulo}
          </Label>
        ) : null}
      </View>

      {direita}
      {semAcoes ? null : (
        <View style={styles.acoes}>
          <BotaoIcone
            nome="bell"
            rotulo={novos ? `Avisos, ${novos} novos` : 'Avisos'}
            bolinha={novos > 0}
            onPress={() => navigation.navigate('Avisos')}
          />
          <BotaoIcone nome="user" rotulo="Meu perfil" onPress={() => irParaAba(navigation, 'Perfil')} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: espacamentos.md,
    paddingBottom: espacamentos.sm + 4,
    minHeight: 60,
    overflow: 'hidden',
    backgroundColor: cores.primaria, // cor sólida por baixo do degradê (e para a sombra do Android)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 2,
  },
  voltar: { marginRight: espacamentos.sm + 4 },
  textos: { flex: 1 },
  titulo: { color: cores.textoInverso, fontWeight: '800', fontSize: 20 },
  marca: { fontSize: 23, letterSpacing: -0.3 },
  subtitulo: { color: 'rgba(255,255,255,0.92)', fontSize: 13, marginTop: -1 },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: espacamentos.md + 4 },
  botao: { padding: 4 },
  pressionado: { opacity: 0.7 },
  bolinha: {
    position: 'absolute',
    top: 2,
    right: 3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: cores.perigo,
    borderWidth: 1.5,
    borderColor: cores.primaria,
  },
});
