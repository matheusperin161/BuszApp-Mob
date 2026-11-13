/**
 * SCREEN — CadastroCartaoScreen
 * "Cadastrar Cartão" da tela Recarga: número, titular e tipo.
 * O backend aceita um cartão por usuário.
 */
import { useCallback, useEffect, useState } from 'react';

import { Card } from '../components/molecules/Card';
import { CartaoForm } from '../components/organisms/CartaoForm';
import { ScreenTemplate } from '../components/templates/ScreenTemplate';
import { obterSessao } from '../services/auth';
import { cadastrarCartao } from '../services/cartao';
import { irParaAba } from '../navigation/acoes';
import { cores } from '../theme';

export function CadastroCartaoScreen({ navigation }) {
  const [usuario, setUsuario] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    obterSessao().then(setUsuario);
  }, []);

  const handleCadastrar = useCallback(
    async dados => {
      setSalvando(true);
      setErro(null);
      try {
        await cadastrarCartao(dados);
        irParaAba(navigation, 'Cartao', { aviso: 'Cartão cadastrado! Agora é só recarregar.' });
      } catch (e) {
        setErro(e.message);
      } finally {
        setSalvando(false);
      }
    },
    [navigation],
  );

  return (
    <ScreenTemplate cabecalho={{ titulo: 'Cadastrar Cartão', subtitulo: 'Vincule seu cartão de transporte', voltar: true }}>
      <Card titulo="Dados do cartão" icone="credit-card" corIcone={cores.roxo}>
        {usuario ? (
          <CartaoForm
            onSubmit={handleCadastrar}
            carregando={salvando}
            erro={erro}
            titularInicial={usuario.nome ?? ''}
          />
        ) : null}
      </Card>
    </ScreenTemplate>
  );
}


