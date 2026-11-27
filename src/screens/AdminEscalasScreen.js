/**
 * SCREEN — AdminEscalasScreen
 * Escala dos motoristas por semana: escolhe o dia, vê os turnos e toca para
 * editar. "Novo turno" abre o formulário já com o dia escolhido.
 * O motorista vê a própria escala no painel dele (Minha escala).
 */
import { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '../components/atoms/Button';
import { Icone } from '../components/atoms/Icone';
import { Label } from '../components/atoms/Label';
import { ChipGrupo } from '../components/molecules/ChipGrupo';
import { EstadoCarga } from '../components/molecules/EstadoCarga';
import { RegistroItem } from '../components/molecules/RegistroItem';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { escalas as listarEscalas } from '../services/admin';
import { espacamentos } from '../theme';
import { criarEstilos, useTema } from '../theme/tema';
import { isoLocal, rotuloDoDia, somarDias } from '../utils/formato';

export function AdminEscalasScreen({ navigation }) {
  const styles = useStyles();
  const { cores } = useTema();
  const hoje = isoLocal(new Date());
  const [inicio, setInicio] = useState(hoje);
  const [dia, setDia] = useState(hoje);
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState(null);

  const fim = somarDias(inicio, 6);
  const carregar = useCallback(async () => {
    setErro(null);
    try {
      setLista(await listarEscalas(inicio, fim));
    } catch (e) {
      setErro(e.message);
    }
  }, [inicio, fim]);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar]),
  );

  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => somarDias(inicio, i)), [inicio]);
  const porDia = useMemo(() => {
    const mapa = {};
    (lista || []).forEach(e => {
      mapa[e.data] = (mapa[e.data] || 0) + 1;
    });
    return mapa;
  }, [lista]);
  const doDia = (lista || []).filter(e => e.data === dia);

  function mudarSemana(delta) {
    const novo = somarDias(inicio, delta * 7);
    setInicio(novo);
    setDia(novo);
    setLista(null);
  }

  return (
    <ScreenTemplate cabecalho={{ titulo: 'Escala', subtitulo: 'Turnos dos motoristas', voltar: true }}>
      <View style={styles.semana}>
        <Pressable onPress={() => mudarSemana(-1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Semana anterior">
          <Icone nome="arrow-left" cor={cores.primariaTexto} />
        </Pressable>
        <Label style={styles.semanaTexto}>
          {rotuloDoDia(inicio)} a {rotuloDoDia(fim)}
        </Label>
        <Pressable onPress={() => mudarSemana(1)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Próxima semana">
          <Icone nome="arrow-right" cor={cores.primariaTexto} />
        </Pressable>
      </View>
      <ChipGrupo
        opcoes={dias.map(d => ({ id: d, rotulo: porDia[d] ? `${rotuloDoDia(d)} · ${porDia[d]}` : rotuloDoDia(d) }))}
        valor={dia}
        onChange={setDia}
        horizontal
      />
      <Button
        title="Novo turno"
        icone="plus"
        onPress={() => navigation.navigate('AdminEscala', { data: dia })}
        style={styles.novo}
      />
      {lista == null || erro ? (
        <View style={styles.estado}>
          <EstadoCarga carregando={!erro} erro={erro} onTentarDeNovo={carregar} />
        </View>
      ) : doDia.length ? (
        doDia.map(e => (
          <RegistroItem
            key={e.id}
            icone="user"
            titulo={e.motorista_nome}
            linhas={[`${e.inicio} – ${e.fim}`, [e.linha ? `Linha ${e.linha}` : null, e.observacao].filter(Boolean).join(' · ')]}
            onPress={() => navigation.navigate('AdminEscala', { escala: e })}
          />
        ))
      ) : (
        <Label variante="legenda" style={styles.vazio}>
          Nenhum turno em {rotuloDoDia(dia).toLowerCase()}. Toque em “Novo turno”.
        </Label>
      )}
    </ScreenTemplate>
  );
}

const useStyles = criarEstilos(() => ({
  semana: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: espacamentos.sm,
    paddingHorizontal: espacamentos.xs,
  },
  semanaTexto: { fontWeight: '700' },
  novo: { marginTop: espacamentos.sm, marginBottom: espacamentos.md },
  estado: { minHeight: 200 },
  vazio: { textAlign: 'center', marginTop: espacamentos.lg },
}));
