/**
 * SCREEN — AdminGeralScreen (aba "Geral" do administrador)
 * Resumo do painel do admin do site: ônibus em rota, motoristas, frota,
 * linhas, recargas e avaliações. Toque num número para abrir o detalhe.
 */
import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Label } from '../components/atoms/Label';
import { AvisoBox } from '../components/molecules/AvisoBox';
import { Card } from '../components/molecules/Card';
import { ErrorMessage } from '../components/molecules/ErrorMessage';
import { StatCard } from '../components/molecules/StatCard';
import { TransacaoItem } from '../components/molecules/TransacaoItem';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { voltarAoLogin } from '../navigation/acoes';
import {
  avaliacoes,
  motoristas,
  onibusEmRotaContagem,
  resumoRecargas,
  rotas,
  transacoes,
  veiculos,
} from '../services/admin';
import { obterSessao } from '../services/auth';
import { cores, espacamentos } from '../theme';
import { dinheiro } from '../utils/formato';

function media(lista, campo) {
  const notas = lista.map(r => Number(r[campo])).filter(n => n > 0);
  return notas.length ? notas.reduce((a, b) => a + b, 0) / notas.length : null;
}

export function AdminGeralScreen({ navigation }) {
  const [dados, setDados] = useState(null);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const [sessao, emRota, mot, vei, rot, tx, ava] = await Promise.all([
        obterSessao(),
        onibusEmRotaContagem().catch(() => ({ count: null })),
        motoristas(),
        veiculos(),
        rotas(),
        transacoes().catch(() => []),
        avaliacoes().catch(() => []),
      ]);
      setNome(sessao?.nome?.split(' ')[0] ?? '');
      setDados({
        emRota: emRota?.count,
        motoristasAtivos: mot.filter(m => m.status === 'ativo').length,
        motoristas: mot.length,
        frotaAtiva: vei.filter(v => v.status === 'ativo').length,
        frota: vei.length,
        linhasAtivas: rot.filter(r => r.active).length,
        linhas: rot.length,
        recargas: resumoRecargas(tx),
        avaliacoes: ava.length,
        mediaGeral: media(ava, 'overall_rating'),
      });
    } catch (e) {
      if (e.status === 401) {
        voltarAoLogin(navigation);
        return;
      }
      setErro(e.status === 403 ? 'Esta conta não tem permissão de administrador.' : e.message);
    } finally {
      setRefreshing(false);
    }
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const d = dados;
  const r = d?.recargas;

  return (
    <ScreenTemplate
      cabecalho={{ subtitulo: 'Painel do Administrador' }}
      titulo={nome ? `Olá, ${nome}` : 'Painel do Administrador'}
      subtitulo="Acompanhe a operação do transporte em tempo real"
      onRefresh={() => {
        setRefreshing(true);
        carregar();
      }}
      refreshing={refreshing}>
      <ErrorMessage mensagem={erro} />

      <View style={styles.grade}>
        <StatCard
          icone="navigation"
          valor={d ? String(d.emRota ?? '—') : '…'}
          rotulo="Ônibus em rota"
          fundo={cores.sucessoFundo}
          cor={cores.sucesso}
          onPress={() => navigation.navigate('Mapa')}
        />
        <StatCard
          icone="users"
          valor={d ? `${d.motoristasAtivos}/${d.motoristas}` : '…'}
          rotulo="Motoristas ativos"
          fundo={cores.infoFundo}
          cor={cores.info}
          onPress={() => navigation.navigate('Cadastros', { aba: 'motoristas' })}
        />
        <StatCard
          icone="truck"
          valor={d ? `${d.frotaAtiva}/${d.frota}` : '…'}
          rotulo="Veículos ativos"
          fundo={cores.superficieAlt}
          cor={cores.primariaEscura}
          onPress={() => navigation.navigate('Cadastros', { aba: 'frota' })}
        />
        <StatCard
          icone="map"
          valor={d ? `${d.linhasAtivas}/${d.linhas}` : '…'}
          rotulo="Linhas ativas"
          fundo={cores.roxoFundo}
          cor={cores.roxo}
          onPress={() => navigation.navigate('Cadastros', { aba: 'rotas' })}
        />
      </View>

      <Card titulo="Recargas" icone="bar-chart-2">
        <View style={styles.numeros}>
          <View style={styles.numero}>
            <Label variante="secao" style={styles.numeroRotulo}>
              Total
            </Label>
            <Label style={styles.numeroValor}>{r ? r.quantidade : '…'}</Label>
          </View>
          <View style={styles.numero}>
            <Label variante="secao" style={styles.numeroRotulo}>
              Valor
            </Label>
            <Label style={styles.numeroValor} adjustsFontSizeToFit numberOfLines={1}>
              {r ? dinheiro(r.valor) : '…'}
            </Label>
          </View>
          <View style={styles.numero}>
            <Label variante="secao" style={styles.numeroRotulo}>
              Hoje
            </Label>
            <Label style={styles.numeroValor} adjustsFontSizeToFit numberOfLines={1}>
              {r ? dinheiro(r.hojeValor) : '…'}
            </Label>
          </View>
        </View>
        {r?.ultimas?.length ? (
          r.ultimas.map((t, i) => (
            <TransacaoItem
              key={t.id}
              transacao={{ ...t, description: `${t.username ?? 'Usuário'} · ${t.description ?? 'Recarga'}` }}
              ultima={i === r.ultimas.length - 1}
            />
          ))
        ) : (
          <Label variante="legenda">{r ? 'Nenhuma recarga ainda.' : 'Carregando...'}</Label>
        )}
      </Card>

      <Card
        titulo="Avaliações"
        icone="star"
        acao="Ver todas"
        onAcao={() => navigation.navigate('AvaliacoesAdmin')}
        onPress={() => navigation.navigate('AvaliacoesAdmin')}>
        <View style={styles.numeros}>
          <View style={styles.numero}>
            <Label variante="secao" style={styles.numeroRotulo}>
              Média geral
            </Label>
            <Label style={styles.numeroValor}>
              {d?.mediaGeral != null ? `${d.mediaGeral.toFixed(1).replace('.', ',')} ★` : '—'}
            </Label>
          </View>
          <View style={styles.numero}>
            <Label variante="secao" style={styles.numeroRotulo}>
              Recebidas
            </Label>
            <Label style={styles.numeroValor}>{d ? d.avaliacoes : '…'}</Label>
          </View>
        </View>
      </Card>

      <AvisoBox
        tipo="info"
        mensagem="Para cadastrar ou editar motoristas, veículos, linhas e paradas, use o painel do administrador no site."
      />
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  grade: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: espacamentos.md,
    marginBottom: espacamentos.lg,
  },
  numeros: { flexDirection: 'row', gap: espacamentos.md, marginBottom: espacamentos.sm },
  numero: { flex: 1 },
  numeroRotulo: { fontSize: 10, letterSpacing: 1.2 },
  numeroValor: { fontSize: 20, fontWeight: '800', color: cores.texto, marginTop: 2 },
});
