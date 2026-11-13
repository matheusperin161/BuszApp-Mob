/**
 * ATOM — Avatar
 * Foto redonda com o aro laranja do site; sem foto, mostra o ícone de usuário.
 */
import { Image, StyleSheet, View } from 'react-native';

import { cores } from '../../theme';
import { Icone } from './Icone';

export function Avatar({ uri, nome, tamanho = 72, aro = true }) {
  const borda = aro ? Math.max(2, Math.round(tamanho / 28)) : 0;
  const forma = { width: tamanho, height: tamanho, borderRadius: tamanho / 2 };
  const interno = tamanho - borda * 2;

  return (
    <View style={[styles.aro, forma, { borderWidth: borda }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: interno, height: interno, borderRadius: interno / 2 }}
          accessibilityLabel={`Foto de ${nome ?? 'usuário'}`}
        />
      ) : (
        <Icone nome="user" cor={cores.primaria} tamanho={tamanho * 0.42} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  aro: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: cores.destaque,
    backgroundColor: cores.superficie,
    overflow: 'hidden',
  },
});
