import { createHash } from 'node:crypto';
import { knowledgeNamespace, type KnowledgeChunk } from './knowledge.js';
import { getJson, postJson, required, serviceUrl, ServiceError, vectorCommand, type Environment } from './providers.js';

export interface VectorStore { mode: 'hosted' | 'openrouter'; model: string; dimension: number; namespace: string }

export async function resolveVectorStore(env: Environment): Promise<VectorStore> {
  const { result } = await getJson<{ result?: { indexType?: string; dimension?: number; denseIndex?: { dimension?: number; embeddingModel?: string } } }>(
    `${serviceUrl(env, 'UPSTASH_VECTOR_REST_URL')}/info`, required(env, 'UPSTASH_VECTOR_REST_TOKEN'), 'vector-info',
  );
  const dimension = result?.denseIndex?.dimension ?? result?.dimension;
  if (result?.indexType !== 'DENSE' || !Number.isSafeInteger(dimension) || dimension! < 1) {
    throw new ServiceError('vector-info', undefined, 'This chatbot requires a dense Upstash Vector index. Check the configured index URL.');
  }
  const hostedModel = result.denseIndex?.embeddingModel?.trim();
  if (hostedModel) return { mode: 'hosted', model: hostedModel, dimension: dimension!, namespace: knowledgeNamespace(env.RAG_NAMESPACE) };
  const model = env.OPENROUTER_EMBEDDING_MODEL?.trim() || 'openai/text-embedding-3-small';
  // Different embedding models must never share a namespace, even with equal dimensions.
  const fingerprint = createHash('sha256').update(JSON.stringify({ model, dimension })).digest('hex').slice(0, 10);
  return { mode: 'openrouter', model, dimension: dimension!, namespace: `${knowledgeNamespace(env.RAG_NAMESPACE)}-emb-${fingerprint}` };
}

export async function embedTexts(env: Environment, store: VectorStore, input: string[]): Promise<number[][]> {
  const result = await postJson<{ data?: { index: number; embedding: number[] }[] }>(
    'https://openrouter.ai/api/v1/embeddings', required(env, 'OPENROUTER_API_KEY'),
    { model: store.model, input, dimensions: store.dimension, encoding_format: 'float' }, 'embeddings', 20000,
  );
  const data = result.data;
  if (!Array.isArray(data) || data.length !== input.length) throw new ServiceError('embeddings', undefined, 'The embedding provider returned an incomplete batch. Retry ingestion.');
  const ordered = [...data].sort((a, b) => a.index - b.index);
  if (ordered.some((item, index) => item.index !== index || !Array.isArray(item.embedding) ||
      item.embedding.length !== store.dimension || !item.embedding.every(value => typeof value === 'number' && Number.isFinite(value)))) {
    throw new ServiceError('embeddings', undefined, 'Embedding dimensions or values do not match the Upstash index. Choose an embedding model that supports the index dimensions.');
  }
  return ordered.map(item => item.embedding);
}

export async function upsertKnowledge(env: Environment, store: VectorStore, chunks: KnowledgeChunk[]): Promise<void> {
  if (!chunks.length) return;
  const vectors = store.mode === 'openrouter' ? await embedTexts(env, store, chunks.map(chunk => chunk.data)) : undefined;
  const payload = chunks.map((chunk, index) => ({ ...chunk, ...(vectors ? { vector: vectors[index] } : {}) }));
  const result = await vectorCommand(env, vectors ? 'upsert' : 'upsert-data', store.namespace, payload);
  if (result !== 'Success') throw new ServiceError('vector');
}

export async function queryKnowledge(env: Environment, query: string): Promise<unknown[]> {
  const store = await resolveVectorStore(env);
  const vector = store.mode === 'openrouter' ? (await embedTexts(env, store, [query]))[0] : undefined;
  return vectorCommand<unknown[]>(env, vector ? 'query' : 'query-data', store.namespace, {
    ...(vector ? { vector } : { data: query }), topK: 6, includeMetadata: true, includeData: true,
  });
}

export function ingestionError(error: unknown): string {
  if (!(error instanceof ServiceError)) return 'Ingestion failed. Check the knowledge files and configuration.';
  const heading = `Ingestion failed (${error.service}${error.status ? `, HTTP ${error.status}` : ''}).`;
  if (error.hint) return `${heading} ${error.hint}`;
  if (error.status === 401 || error.status === 403) return `${heading} Check the credentials for this service. Ingestion needs the Upstash read/write token, not the read-only token.`;
  if (error.status === 402) return `${heading} Check your OpenRouter balance and API-key spending limit.`;
  if (error.service === 'embeddings') return `${heading} Check that OPENROUTER_EMBEDDING_MODEL is available and supports the index dimensions. Both ingestion and Vercel must use the same model.`;
  if (error.service === 'configuration') return `${heading} Set the required credentials in .env.local (including OPENROUTER_API_KEY for an index without hosted embeddings).`;
  return `${heading} Check the Upstash index configuration, service availability, and read/write token. No credentials were logged.`;
}
