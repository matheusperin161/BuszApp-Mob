/**
 * SCREEN — AdminCadastrosScreen (aba "Cadastros" do administrador)
 * As abas Motoristas · Frota · Rotas · Cartões do painel do site, com busca.
 * Nas rotas dá para ativar/desativar a linha (linha inativa some para o motorista).
 * Criar e editar cadastros continua no painel do site.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Switch, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Input } from '../components/atoms/Input';
import { Label } from '../components/atoms/Label';
import { EstadoCarga } from '../components/molecules/EstadoCarga';
import { RegistroItem } from '../components/molecules/RegistroItem';
import { Segmentos } from '../components/molecules/Segmentos';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { rotuloTipoCartao } from '../constants/cartao';
import { voltarAoLogin } from '../navigation/acoes';
import { ativarRota, cartoes, motoristas, nomeDaRota, rotas, veiculos } from '../services/admin';
import { cores, espacamentos } from '../theme';
import { dataCurta, dinheiro, mascararCartao } from '../utils/formato';

const ABAS = [
  { id: 'motoristas', rotulo: 'Motoristas', icone: 'users' },
  { id: 'frota', rotulo: 'Frota', icone: 'truck' },
  { id: 'rotas', rotulo: 'Rotas', icone: 'map' },
  { id: 'cartoes', rotulo: 'Cartões', icone: 'credit-card' },
];

const CARREGAR = { motoristas, frota: veiculos, rotas, cartoes };

const SELO_STATUS = {
  ativo: { texto: 'Ativo', tipo: 'verde' },
  afastado: { texto: 'Afastado', tipo: 'ambar' },
  inativo: { texto: 'Inativo', tipo: 'cinza' },
  manutencao: { texto: 'Manutenção', tipo: 'vermelho' },
};

const PLACEHOLDER = {
  motoristas: 'Buscar por nome ou CPF…',
  frota: 'Buscar por placa ou modelo…',
  rotas: 'Buscar linha ou parada…',
  cartoes: 'Buscar por usuário, e-mail ou número…',
};

function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function textoBusca(aba, item) {
  if (aba === 'motoristas') return `${item.nome} ${item.cpf} ${item.email} ${item.code}`;
  if (aba === 'frota') return `${item.plate} ${item.model} ${item.brand} ${item.driver_name} ${item.bus_line}`;
  if (aba === 'rotas') return `${nomeDaRota(item)} ${(item.stops || []).map(s => s.name).join(' ')}`;
  return `${item.username} ${item.email} ${item.card_number} ${item.card_holder}`;
}

export function AdminCadastrosScreen({ navigation, route }) {
  const [aba, setAba] = useState(route.params?.aba ?? 'motoristas');
  const [dados, setDados] = useState({});
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [salvandoRota, setSalvandoRota] = useState(null);

  // atalhos do "Geral" abrem direto a aba certa
  useEffect(() => {
    if (route.params?.aba) setAba(route.params.aba);
  }, [route.params?.aba]);

  const carregar = useCallback(
    async qual => {
      setErro(null);
      try {
        const lista = await CARREGAR[qual]();
        setDados(atual => ({ ...atual, [qual]: lista }));
      } catch (e) {
        if (e.status === 401) {
          voltarAoLogin(navigation);
          return;
        }
        setErro(e.message);
      } finally {
        setRefreshing(false);
      }
    },
    [navigation],
  );

  useFocusEffect(
    useCallback(() => {
      carregar(aba);
    }, [carregar, aba]),
  );

  const lista = dados[aba];
  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!lista) return null;
    return termo ? lista.filter(i => normalizar(textoBusca(aba, i)).includes(termo)) : lista;
  }, [lista, busca, aba]);

  async function alternarRota(rota, ativa) {
    setSalvandoRota(rota.id);
    try {
      await ativarRota(rota.id, ativa);
      setDados(atual => ({
        ...atual,
        rotas: atual.rotas.map(r => (r.id === rota.id ? { ...r, active: ativa } : r)),
      }));
    } catch (e) {
      Alert.alert('Não foi possível alterar', e.message);
    } finally {
      setSalvandoRota(null);
    }
  }

  function renderItem(item) {
    if (aba === 'motoristas') {
      return (
        <RegistroItem
          key={item.id}
          icone="user"
          titulo={item.nome}
          linhas={[
            [item.code, item.bus_line].filter(Boolean).join(' · ') || item.email,
            item.cnh_validade
              ? `CNH ${item.cnh_categoria ?? ''} até ${dataCurta(item.cnh_validade)}${item.cnh_vencida ? ' — VENCIDA' : ''}`
              : null,
          ]}
          selo={SELO_STATUS[item.status] ?? { texto: item.status, tipo: 'cinza' }}
        />
      );
    }
    if (aba === 'frota') {
      return (
        <RegistroItem
          key={item.id}
          icone="truck"
          titulo={`${item.plate} · ${item.model}`}
          linhas={[
            [item.brand, item.year, item.capacity ? `${item.capacity} lugares` : null].filter(Boolean).join(' · '),
            item.driver_name ? `Motorista: ${item.driver_name}` : item.bus_line,
          ]}
          selo={SELO_STATUS[item.status] ?? { texto: item.status, tipo: 'cinza' }}
        />
      );
    }
    if (aba === 'rotas') {
      return (
        <RegistroItem
          key={item.id}
          icone="map"
          titulo={nomeDaRota(item)}
          linhas={[
            `${item.stop_count ?? (item.stops || []).length} paradas`,
            [item.driver?.name, item.vehicle?.plate].filter(Boolean).join(' · ') || null,
          ]}
          direita={
            <View style={styles.chave}>
              <Switch
                value={Boolean(item.active)}
                onValueChange={v => alternarRota(item, v)}
                disabled={salvandoRota === item.id}
                trackColor={{ true: cores.primaria, false: cores.bordaNeutra }}
                thumbColor={cores.superficie}
                accessibilityLabel={`${nomeDaRota(item)} ${item.active ? 'ativa' : 'inativa'}`}
              />
              <Label variante="legenda">{item.active ? 'Ativa' : 'Inativa'}</Label>
            </View>
          }
        />
      );
    }
    return (
      <RegistroItem
        key={item.id}
        icone="credit-card"
        titulo={item.username}
        linhas={[
          item.card_number
            ? `${rotuloTipoCartao(item.card_type)} · ${mascararCartao(item.card_number)}`
            : 'Sem cartão cadastrado',
          item.email,
        ]}
        direita={<Label style={styles.saldo}>{dinheiro(item.card_balance)}</Label>}
      />
    );
  }

  return (
    <ScreenTemplate
      cabecalho={{ titulo: 'Cadastros', subtitulo: 'Motoristas, frota, rotas e cartões' }}
      onRefresh={() => {
        setRefreshing(true);
        carregar(aba);
      }}
      refreshing={refreshing}>
      <Segmentos
        opcoes={ABAS}
        valor={aba}
        onChange={id => {
          setAba(id);
          setBusca('');
        }}
      />
      <Input
        icone="search"
        placeholder={PLACEHOLDER[aba]}
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        containerStyle={styles.busca}
      />
      {filtrados == null || erro ? (
        <View style={styles.estado}>
          <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={() => carregar(aba)} />
        </View>
      ) : (
        <>
          <Label variante="legenda" style={styles.contagem}>
            {filtrados.length} {filtrados.length === 1 ? 'registro' : 'registros'}
          </Label>
          {filtrados.length ? (
            filtrados.map(renderItem)
          ) : (
            <Label variante="legenda" style={styles.vazio}>
              Nada encontrado.
            </Label>
          )}
        </>
      )}
    </ScreenTemplate>
  );
}

const styles = StyleSheet.create({
  busca: { marginBottom: espacamentos.md, backgroundColor: cores.superficie },
  estado: { minHeight: 200 },
  contagem: { marginBottom: espacamentos.sm, paddingHorizontal: espacamentos.xs },
  vazio: { textAlign: 'center', marginTop: espacamentos.lg },
  chave: { alignItems: 'center' },
  saldo: { fontWeight: '800', color: cores.sucesso },
});
