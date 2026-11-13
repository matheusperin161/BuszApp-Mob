/**
 * MOLECULE — MenuButton
 * Uma linha de "Ações Rápidas" do perfil do site: ícone num quadradinho
 * âmbar claro + texto. perigo=true pinta de vermelho ("Sair da conta").
 */
import { Pressable, StyleSheet, View } from 'react-native';

import { Icone } from '../atoms/Icone';
import { Label } from '../atoms/Label';
import { IconeCaixa } from './IconeCaixa';
import { cores, espacamentos, raios } from '../../theme';

export function MenuButton({ icone, titulo, descricao, onPress, perigo = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={titulo}
      style={({ pressed }) => [styles.container, pressed && styles.pressionado]}>
      <IconeCaixa
        nome={icone}
        tamanho={44}
        fundo={perigo ? cores.perigoFundo : cores.superficieAlt}
        cor={perigo ? cores.perigo : cores.primariaEscura}
      />
      <View style={styles.textos}>
        <Label style={[styles.titulo, perigo && styles.tituloPerigo]}>{titulo}</Label>
        {descricao ? <Label variante="legenda">{descricao}</Label> : null}
      </View>
      {perigo ? null : <Icone nome="chevron-right" cor={cores.textoFraco} tamanho={18} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacamentos.md,
    paddingVertical: espacamentos.sm,
    paddingHorizontal: espacamentos.xs,
    borderRadius: raios.md,
  },
  pressionado: { backgroundColor: cores.fundo },
  textos: { flex: 1 },
  titulo: { fontSize: 16, color: cores.textoMedio, fontWeight: '500' },
  tituloPerigo: { color: cores.perigo },
});
