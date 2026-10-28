/**
 * ORGANISM — StopForm
 * Cadastro/edição de parada (CA05.1): nome, endereço e coordenadas válidas.
 */
import { useState } from 'react';

import Button from '../atoms/Button';
import ErrorMessage from '../molecules/ErrorMessage';
import FormField from '../molecules/FormField';
import * as v from '../../utils/validacao';

function estadoInicial(p) {
  return {
    nome: p?.nome ?? '',
    endereco: p?.endereco ?? '',
    latitude: p?.latitude != null ? String(p.latitude) : '',
    longitude: p?.longitude != null ? String(p.longitude) : '',
  };
}

export default function StopForm({ parada, aoSalvar }) {
  const edicao = Boolean(parada);
  const [campos, setCampos] = useState(() => estadoInicial(parada));
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const alterar = (nome) => (texto) => setCampos((c) => ({ ...c, [nome]: texto }));

  const validar = () => {
    const e = {
      nome: v.obrigatorio(campos.nome, 'Nome'),
      endereco: v.obrigatorio(campos.endereco, 'Endereço'),
      latitude: v.obrigatorio(campos.latitude, 'Latitude') || v.latitude(campos.latitude),
      longitude: v.obrigatorio(campos.longitude, 'Longitude') || v.longitude(campos.longitude),
    };
    setErros(e);
    return !Object.values(e).some(Boolean);
  };

  const salvar = async () => {
    if (!validar()) return;
    setErroGeral(null);
    setSalvando(true);
    try {
      await aoSalvar({
        ...campos,
        latitude: Number(campos.latitude),
        longitude: Number(campos.longitude),
      });
    } catch (erro) {
      setErroGeral(erro.message);
      setSalvando(false);
    }
  };

  return (
    <>
      <ErrorMessage mensagem={erroGeral} />
      <FormField rotulo="Nome" obrigatorio value={campos.nome} onChangeText={alterar('nome')} erro={erros.nome} />
      <FormField
        rotulo="Endereço"
        obrigatorio
        value={campos.endereco}
        onChangeText={alterar('endereco')}
        erro={erros.endereco}
      />
      <FormField
        rotulo="Latitude"
        obrigatorio
        value={campos.latitude}
        onChangeText={alterar('latitude')}
        erro={erros.latitude}
        keyboardType="numbers-and-punctuation"
        placeholder="-27.0964"
      />
      <FormField
        rotulo="Longitude"
        obrigatorio
        value={campos.longitude}
        onChangeText={alterar('longitude')}
        erro={erros.longitude}
        keyboardType="numbers-and-punctuation"
        placeholder="-52.6182"
      />
      <Button titulo={edicao ? 'Salvar alterações' : 'Cadastrar parada'} onPress={salvar} carregando={salvando} />
    </>
  );
}
