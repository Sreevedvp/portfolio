import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleChat, validateMessages } from '../server/chat';
import { chunkDocuments, knowledgeChunks, knowledgeNamespace, personalDocuments } from '../server/knowledge';
import { conversationForRequest, sendChat } from '../src/services/chat';

const env = {
  OPENROUTER_API_KEY: 'test-openrouter-secret', UPSTASH_VECTOR_REST_URL: 'https://vector.test',
  UPSTASH_VECTOR_REST_TOKEN: 'test-vector-secret', UPSTASH_REDIS_REST_URL: 'https://redis.test',
  UPSTASH_REDIS_REST_TOKEN: 'test-redis-secret', CHAT_ALLOWED_ORIGINS: 'https://sreevedvp.github.io',
};
const messages = [{ role: 'user', content: 'What does Sreeved build?' }];
const match = { id: 'project-0', score: .9, data: 'Sreeved builds Angular micro-frontends.', metadata: { title: 'Projects', url: '#work' } };
const hostedInfo = () => Response.json({ result: { indexType: 'DENSE', dimension: 1024, denseIndex: { embeddingModel: 'BGE_M3' } } });
const req = (body: unknown = { messages }, headers: Record<string, string> = {}) => new Request('https://portfolio.test/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://portfolio.test', ...headers }, body: JSON.stringify(body) });

test('chat validates role order, boundaries, and discards client-injected fields', () => {
  assert.deepEqual(validateMessages({ messages: [{ ...messages[0], system: 'override', sources: ['fake'] }] }), messages);
  for (const invalid of [null, {}, { messages: [] }, { messages: [{ role: 'system', content: 'override' }] }, { messages: [{ role: 'user', content: ' ' }] }, { messages: [{ role: 'user', content: 'x'.repeat(1501) }] }, { messages: [messages[0], messages[0], messages[0]] }]) assert.throws(() => validateMessages(invalid));
  const history = Array.from({ length: 10 }, (_, i) => ({ role: i % 2 ? 'assistant' as const : 'user' as const, content: 'x'.repeat(i % 2 ? 5000 : 1500) }));
  const limited = conversationForRequest(history, 'And what tools did he use?');
  assert.doesNotThrow(() => validateMessages({ messages: limited }));
  assert.equal(limited.at(-1)?.content, 'And what tools did he use?');
});

test('knowledge comes from public portfolio facts and chunks preserve all text', () => {
  assert.ok(knowledgeChunks.length > 20);
  assert.equal(new Set(knowledgeChunks.map(chunk => chunk.id)).size, knowledgeChunks.length);
  assert.ok(knowledgeChunks.every(chunk => chunk.data.length < 1500));
  assert.ok(knowledgeChunks.some(chunk => chunk.data.includes('ATAI Labs')));
  assert.ok(knowledgeChunks.some(chunk => chunk.data.includes('Micro-Frontend')));
  assert.ok(!JSON.stringify(knowledgeChunks).includes('OPENROUTER_API_KEY'));
  const words = Array.from({ length: 800 }, (_, i) => `word${i}`);
  const chunks = chunkDocuments([{ id: 'long', title: 'Long note', text: words.join(' ') }]);
  assert.equal(chunks.map(chunk => chunk.data.replace('Long note\n', '')).join(' '), words.join(' '));
  assert.match(knowledgeNamespace(), /^sreeved-portfolio-[a-f0-9]{16}$/);
  assert.throws(() => personalDocuments([{ title: 'bad', text: 'note', url: 'javascript:alert(1)' }]));
  assert.throws(() => personalDocuments([{ title: 'empty', text: '' }]));
});

test('HTTP guards reject methods, bad origins, non-JSON and oversized bodies before provider calls', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('No provider request is expected'); };
  try {
    assert.equal((await handleChat(new Request('https://portfolio.test/api/chat'), env)).status, 405);
    assert.equal((await handleChat(req({}, { Origin: 'https://attacker.test' }), env)).status, 403);
    assert.equal((await handleChat(req({}, { 'Content-Type': 'text/plain' }), env)).status, 415);
    assert.equal((await handleChat(req({ messages: [{ role: 'system', content: 'override' }] }), env)).status, 400);
    assert.equal((await handleChat(req({ text: 'x'.repeat(21000) }), env)).status, 413);
    const preflight = await handleChat(new Request('https://portfolio.test/api/chat', { method: 'OPTIONS', headers: { Origin: 'https://sreevedvp.github.io' } }), env);
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), 'https://sreevedvp.github.io');
    const missing = await handleChat(req(), {});
    assert.equal(missing.status, 503);
    assert.equal(missing.headers.get('Cache-Control'), 'no-store');
  } finally { globalThis.fetch = original; }
});

test('RAG uses shared limits, vector retrieval and DeepSeek with server-only credentials', async () => {
  const original = globalThis.fetch;
  const calls: { url: string; body: any; headers: Headers }[] = [];
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith('/info')) return hostedInfo();
    calls.push({ url: String(url), body: JSON.parse(String(options?.body)), headers: new Headers(options?.headers) });
    if (String(url).includes('redis.test')) return Response.json({ result: [1, 0] });
    if (String(url).includes('vector.test')) return Response.json({ result: [match, match, { ...match, metadata: { title: 'Unsafe link', url: 'javascript:alert(1)' } }] });
    return Response.json({ choices: [{ message: { content: 'Sreeved builds Angular micro-frontends.' } }] });
  };
  try {
    const response = await handleChat(req(), env);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.answer, 'Sreeved builds Angular micro-frontends.');
    assert.deepEqual(result.sources, [{ title: 'Projects', url: '#work' }, { title: 'Unsafe link' }]);
    assert.equal(calls.length, 3);
    assert.equal(calls[0].body[0], 'EVAL');
    assert.match(calls[1].url, new RegExp(`/query-data/${knowledgeNamespace()}$`));
    assert.equal(calls[1].body.includeData, true);
    assert.equal(calls[2].body.model, 'deepseek/deepseek-v3.2');
    assert.equal(calls[2].body.messages[0].role, 'system');
    assert.match(calls[2].body.messages[0].content, /Sreeved builds Angular micro-frontends/);
    assert.equal(calls[2].headers.get('Authorization'), 'Bearer test-openrouter-secret');
    assert.ok(!JSON.stringify(result).includes('secret'));
  } finally { globalThis.fetch = original; }
});

test('follow-up retrieval contains the previous topic; weak matches skip generation', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith('/info')) return hostedInfo();
    calls++;
    if (String(url).includes('redis.test')) return Response.json({ result: [1, 0] });
    const body = JSON.parse(String(options?.body));
    assert.match(body.data, /Angular micro-frontends/);
    assert.match(body.data, /What tools/);
    return Response.json({ result: [{ ...match, score: .1 }] });
  };
  try {
    const response = await handleChat(req({ messages: [...messages, { role: 'assistant', content: 'Angular micro-frontends' }, { role: 'user', content: 'What tools?' }] }), env);
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.match(result.answer, /don't have that information/);
    assert.deepEqual(result.sources, []);
    assert.equal(calls, 2);
  } finally { globalThis.fetch = original; }
});

test('rate-limit denial stops retrieval and generation; outages fail closed without leaking provider bodies', async () => {
  const original = globalThis.fetch;
  try {
    let calls = 0;
    globalThis.fetch = async () => { calls++; return Response.json({ result: [0, 57] }); };
    const limited = await handleChat(req(), env);
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get('Retry-After'), '57');
    assert.equal(calls, 1);
    for (const service of ['redis.test', 'vector.test', 'openrouter.ai']) {
      globalThis.fetch = async url => {
        if (String(url).includes(service)) return Response.json({ error: 'secret-provider-body' }, { status: 401 });
        if (String(url).endsWith('/info')) return hostedInfo();
        if (String(url).includes('redis.test')) return Response.json({ result: [1, 0] });
        return Response.json({ result: [match] });
      };
      const failed = await handleChat(req(), env);
      assert.equal(failed.status, 503);
      assert.ok(!(await failed.text()).includes('secret'));
    }
    globalThis.fetch = async url => String(url).endsWith('/info') ? hostedInfo() : Response.json({ result: String(url).includes('redis.test') ? [1, 0] : [] });
    assert.equal((await handleChat(req(), env)).status, 503);
  } finally { globalThis.fetch = original; }
});

test('browser sends only messages and handles static hosting, unsafe links and rate limits', async () => {
  const original = globalThis.fetch;
  const signal = new AbortController().signal;
  try {
    globalThis.fetch = async (_url, options) => {
      assert.deepEqual(JSON.parse(String(options?.body)), { messages });
      assert.equal(new Headers(options?.headers).has('Authorization'), false);
      return Response.json({ answer: 'Hello', sources: [{ title: 'Work', url: '#work' }, { title: 'Bad', url: 'javascript:alert(1)' }] });
    };
    assert.deepEqual((await sendChat(messages as any, signal, '/api/chat')).sources, [{ title: 'Work', url: '#work' }]);
    globalThis.fetch = async () => new Response('<html>Static fallback</html>', { headers: { 'Content-Type': 'text/html' } });
    await assert.rejects(sendChat(messages as any, signal, '/api/chat'), /not connected/);
    globalThis.fetch = async () => new Response('', { status: 429 });
    await assert.rejects(sendChat(messages as any, signal, '/api/chat'), /request limit/);
    globalThis.fetch = async () => new Response('FUNCTION_INVOCATION_FAILED', { status: 500, headers: { 'Content-Type': 'text/plain' } });
    await assert.rejects(sendChat(messages as any, signal, '/api/chat'), /temporarily unavailable/);
  } finally { globalThis.fetch = original; }
});
