/**
 * Fila persistente das posições da viagem (CA08.7).
 *
 * Toda posição entra primeiro na fila (gravada no aparelho) e só sai dela
 * depois que o servidor confirma o recebimento. Sem rede, a fila cresce;
 * quando a conexão volta, é enviada em lotes na ordem em que foi registrada.
 *
 * Armazenamento e envio são injetados para a lógica poder ser testada sem o app.
 */

const TAMANHO_LOTE = 500; // máximo aceito pelo backend por requisição
const LIMITE_FILA = 20_000; // ~55 h de viagem a cada 10 s; acima disso descarta as mais antigas

export function chaveFila(viagemId) {
  return `fila_posicoes:${viagemId}`;
}

/**
 * @param {object} opcoes
 * @param {number} opcoes.viagemId
 * @param {{lerJSON: Function, salvarJSON: Function, remover: Function}} opcoes.armazenamento
 * @param {(viagemId: number, lote: object[]) => Promise} opcoes.enviar
 */
export function criarFilaPosicoes({ viagemId, armazenamento, enviar, tamanhoLote = TAMANHO_LOTE, limite = LIMITE_FILA }) {
  const chave = chaveFila(viagemId);
  let corrente = Promise.resolve();

  // Serializa as operações: um envio em andamento não pode perder posições adicionadas no meio
  const emSerie = (operacao) => {
    const resultado = corrente.then(operacao);
    corrente = resultado.catch(() => {});
    return resultado;
  };

  const ler = () => armazenamento.lerJSON(chave, []);

  return {
    adicionar: (posicao) =>
      emSerie(async () => {
        const fila = await ler();
        fila.push(posicao);
        await armazenamento.salvarJSON(chave, fila.length > limite ? fila.slice(-limite) : fila);
      }),

    pendentes: () => emSerie(async () => (await ler()).length),

    /**
     * Envia tudo o que estiver na fila.
     * @returns {{enviadas: number, pendentes: number, semConexao?: boolean, encerrada?: boolean, erro?: Error}}
     */
    enviarPendentes: () =>
      emSerie(async () => {
        let fila = await ler();
        let enviadas = 0;
        while (fila.length) {
          const lote = fila.slice(0, tamanhoLote);
          try {
            await enviar(viagemId, lote);
          } catch (erro) {
            // Viagem finalizada/inexistente no servidor: as posições não têm mais destino
            if (erro.status === 404 || erro.status === 409) {
              await armazenamento.remover(chave);
              return { enviadas, pendentes: 0, encerrada: true, erro };
            }
            return { enviadas, pendentes: fila.length, semConexao: !erro.status, erro };
          }
          enviadas += lote.length;
          fila = fila.slice(lote.length);
          await armazenamento.salvarJSON(chave, fila);
        }
        await armazenamento.remover(chave);
        return { enviadas, pendentes: 0 };
      }),

    descartar: () => emSerie(() => armazenamento.remover(chave)),
  };
}
