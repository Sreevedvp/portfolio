import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveVectorStore, upsertKnowledge, queryKnowledge, embedTexts, ingestionError } from '../server/vector-store';
import { knowledgeNamespace } from '../server/knowledge';
import { ServiceError } from '../server/providers';

const env = { UPSTASH_VECTOR_REST_URL: 'https://vector.test', UPSTASH_VECTOR_REST_TOKEN: 'vector-secret', OPENROUTER_API_KEY: 'router-secret' };
const chunks = [{ id: 'one', data: 'Sreeved uses Angular.', metadata: { title: 'Skills' } }, { id: 'two', data: 'Sreeved uses Rust.', metadata: { title: 'Systems' } }];
const dimensions = 1536;
const vector = (value: number) => Array(dimensions).fill(value);

test('1536-dimension index without hosted embeddings uses OpenRouter for both ingestion and retrieval', async () => {
  const original = globalThis.fetch;
  const writes: { url: string; body: any }[] = [];
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith('/info')) return Response.json({ result: { indexType: 'DENSE', dimension: dimensions, denseIndex: { embeddingModel: '' } } });
    const body = JSON.parse(String(options?.body));
    writes.push({ url: String(url), body });
    if (String(url).endsWith('/embeddings')) {
      assert.equal(body.model, 'openai/text-embedding-3-small');
      assert.equal(body.dimensions, dimensions);
      assert.equal(new Headers(options?.headers).get('Authorization'), 'Bearer router-secret');
      return Response.json({ data: body.input.map((_: string, index: number) => ({ index, embedding: vector(index + 1) })).reverse() });
    }
    if (String(url).includes('/upsert/')) return Response.json({ result: 'Success' });
    return Response.json({ result: [{ id: 'one', data: chunks[0].data, metadata: chunks[0].metadata, score: .9 }] });
  };
  try {
    const store = await resolveVectorStore(env);
    assert.equal(store.mode, 'openrouter');
    await upsertKnowledge(env, store, chunks);
    const found = await queryKnowledge(env, 'What does he build?');
    assert.equal(found.length, 1);
    const upsert = writes.find(call => call.url.includes('/upsert/'))!;
    assert.equal(upsert.body[0].vector[0], 1);
    assert.equal(upsert.body[1].vector[0], 2);
    assert.equal(upsert.body[0].data, chunks[0].data);
    const query = writes.find(call => call.url.includes('/query/'))!;
    assert.ok(upsert.url.endsWith(store.namespace) && query.url.endsWith(store.namespace));
    assert.equal(query.body.vector.length, dimensions);
    assert.equal(query.body.includeData, true);
    const differentModel = await resolveVectorStore({ ...env, OPENROUTER_EMBEDDING_MODEL: 'other/model' });
    assert.notEqual(differentModel.namespace, store.namespace);
  } finally { globalThis.fetch = original; }
});

test('hosted embedding indexes keep the text APIs and existing namespace', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith('/info')) return Response.json({ result: { indexType: 'DENSE', dimension: 1024, denseIndex: { embeddingModel: 'BGE_M3' } } });
    assert.ok(String(url).includes('/upsert-data/'));
    assert.deepEqual(JSON.parse(String(options?.body)), chunks);
    return Response.json({ result: 'Success' });
  };
  try {
    const store = await resolveVectorStore(env);
    assert.equal(store.mode, 'hosted');
    assert.equal(store.namespace, knowledgeNamespace());
    await upsertKnowledge(env, store, chunks);
  } finally { globalThis.fetch = original; }
});

test('malformed embeddings fail before uploading mismatched data', async () => {
  const original = globalThis.fetch;
  const store = { mode: 'openrouter' as const, model: 'openai/text-embedding-3-small', dimension: dimensions, namespace: 'test' };
  try {
    for (const data of [[], [{ index: 0, embedding: [1, 2] }], [{ index: 1, embedding: vector(1) }], [{ index: 0, embedding: [...vector(1).slice(1), null] }]]) {
      globalThis.fetch = async () => Response.json({ data });
      await assert.rejects(embedTexts(env, store, ['text']), ServiceError);
    }
    globalThis.fetch = async () => Response.json({ result: { indexType: 'SPARSE', dimension: dimensions } });
    await assert.rejects(resolveVectorStore(env), (error: ServiceError) => !!error.hint?.includes('dense Upstash'));
    assert.match(ingestionError(new ServiceError('embeddings', 402)), /balance/);
  } finally { globalThis.fetch = original; }
});
