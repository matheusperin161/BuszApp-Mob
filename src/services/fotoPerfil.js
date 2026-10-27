/**
 * SERVICE — fotoPerfil
 * Foto de perfil tirada com a câmera, guardada só no aparelho (pasta de documentos do app,
 * que o sistema não limpa, ao contrário do cache onde a câmera deixa o arquivo).
 *
 * Um arquivo por usuário; o nome leva o horário para a <Image> não mostrar a foto antiga
 * do cache. O id entra no nome só com caracteres seguros (sem "../" para sair da pasta).
 */
import { Directory, File, Paths } from 'expo-file-system';

import { lerJSON, remover, salvarJSON } from './storage';

const chave = (usuarioId) => `foto_perfil:${usuarioId}`;
const idSeguro = (usuarioId) => String(usuarioId).replace(/[^a-zA-Z0-9_-]/g, '');

function pasta() {
  const dir = new Directory(Paths.document, 'perfil');
  if (!dir.exists) dir.create({ idempotent: true });
  return dir;
}

function apagar(uri) {
  if (!uri) return;
  try {
    const arquivo = new File(uri);
    if (arquivo.exists) arquivo.delete();
  } catch {
    // arquivo já não existe
  }
}

/** URI da foto salva ou null (se o arquivo sumiu, esquece a referência). */
export async function lerFoto(usuarioId) {
  const uri = await lerJSON(chave(usuarioId));
  if (!uri) return null;
  if (new File(uri).exists) return uri;
  await remover(chave(usuarioId));
  return null;
}

/** Copia a foto temporária da câmera para a pasta do app e troca a anterior. */
export async function salvarFoto(usuarioId, uriTemporaria) {
  const anterior = await lerJSON(chave(usuarioId));
  const destino = new File(pasta(), `foto_${idSeguro(usuarioId)}_${Date.now()}.jpg`);
  const origem = new File(uriTemporaria);
  await origem.copy(destino);
  apagar(uriTemporaria);
  await salvarJSON(chave(usuarioId), destino.uri);
  if (anterior !== destino.uri) apagar(anterior);
  return destino.uri;
}

export async function removerFoto(usuarioId) {
  apagar(await lerJSON(chave(usuarioId)));
  await remover(chave(usuarioId));
}
