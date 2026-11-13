/**
 * ORGANISM — MainMenu
 * Lista de botões grandes da Home. Recebe os itens prontos por prop,
 * então serve para qualquer menu — não só o desta tela.
 */
import { StyleSheet, View } from 'react-native';

import { MenuButton } from '../molecules/MenuButton';

export function MainMenu({ itens }) {
  return (
    <View style={styles.container}>
      {itens.map(item => (
        <MenuButton
          key={item.id}
          icone={item.icone}
          titulo={item.titulo}
          descricao={item.descricao}
          destaque={item.destaque}
          onPress={item.onPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
});
