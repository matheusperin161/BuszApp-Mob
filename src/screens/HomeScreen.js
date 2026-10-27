/**
 * SCREEN — HomeScreen
 * Início do passageiro: saldo, rotas e avisos.
 * Equivalente web: static/dashboard.html / index.html
 *
 * Nesta entrega: atalhos para o acompanhamento e para o cartão (com o saldo em R$).
 * Avisos virão com onibus.js.
 */
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import MenuButton from '../components/molecules/MenuButton';
import ScreenTemplate from '../components/templates/ScreenTemplate';
import { useAuth } from '../contexts/AuthContext';
import { meusCartoes } from '../services/cartao';
import { moeda } from '../utils/formatacao';

function resumoCartoes(cartoes) {
  if (!cartoes) return 'Saldo e cadastro do cartão de transporte';
  const ativos = cartoes.filter((c) => c.status === 'ativo');
  if (!ativos.length) return cartoes.length ? 'Nenhum cartão ativo' : 'Cadastre seu cartão de transporte';
  return `Saldo: ${moeda(ativos.reduce((total, c) => total + c.saldo, 0))}`;
}

export default function HomeScreen({ navigation }) {
  const { sessao } = useAuth();
  const [cartoes, setCartoes] = useState(null);

  useFocusEffect(
    useCallback(() => {
      meusCartoes()
        .then(setCartoes)
        .catch(() => setCartoes(null));
    }, []),
  );

  return (
    <ScreenTemplate titulo={`Olá, ${sessao?.user?.username ?? ''}`} subtitulo="O que você quer fazer?">
      <MenuButton
        icone="🗺️"
        titulo="Acompanhar ônibus"
        descricao="Veja no mapa onde está o ônibus e quando ele chega"
        onPress={() => navigation.navigate('Acompanhar')}
      />
      <MenuButton
        icone="💳"
        titulo="Meu cartão"
        descricao={resumoCartoes(cartoes)}
        onPress={() => navigation.navigate('Cartão')}
      />
    </ScreenTemplate>
  );
}
