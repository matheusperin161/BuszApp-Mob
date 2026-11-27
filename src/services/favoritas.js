/**
 * SERVICE — linhas favoritas (estrela na lista de linhas e no acompanhamento).
 * Ficam no aparelho, junto das preferências; aparecem primeiro na lista e
 * como atalho na tela inicial.
 */
import { obterPreferencias, salvarPreferencias } from './preferencias';

export async function listarFavoritas() {
  return (await obterPreferencias()).favoritas || [];
}

export function eFavorita(favoritas, numero) {
  return favoritas.some(f => String(f.numero) === String(numero));
}

/** marca ou desmarca; devolve a lista nova */
export async function alternarFavorita(linha) {
  const atuais = await listarFavoritas();
  const proximas = eFavorita(atuais, linha.numero)
    ? atuais.filter(f => String(f.numero) !== String(linha.numero))
    : [...atuais, { numero: String(linha.numero), nome: linha.nome }];
  await salvarPreferencias({ favoritas: proximas });
  return proximas;
}

/** favoritas primeiro (na ordem em que foram marcadas), depois as demais */
export function ordenarComFavoritas(linhas, favoritas) {
  const ordem = new Map(favoritas.map((f, i) => [String(f.numero), i]));
  return [...linhas].sort((a, b) => {
    const fa = ordem.has(String(a.numero)) ? ordem.get(String(a.numero)) : Infinity;
    const fb = ordem.has(String(b.numero)) ? ordem.get(String(b.numero)) : Infinity;
    return fa - fb;
  });
}
