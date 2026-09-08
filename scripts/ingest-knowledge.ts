import { config } from 'dotenv';
import { knowledgeChunks, knowledgeNamespace } from '../server/knowledge';
import { resolveVectorStore, upsertKnowledge, ingestionError } from '../server/vector-store';

config({ path: '.env.local', quiet: true });
config({ path: '.env', quiet: true });
const namespace = knowledgeNamespace(process.env.RAG_NAMESPACE);

if (process.argv.includes('--dry-run')) {
  console.log(JSON.stringify({ baseNamespace: namespace, note: 'The final namespace is resolved from the index and embedding model during ingestion.', chunks: knowledgeChunks.length, titles: [...new Set(knowledgeChunks.map(chunk => chunk.metadata.title))] }, null, 2));
} else {
  try {
    const store = await resolveVectorStore(process.env);
    console.log(`Embedding mode: ${store.mode}; dimensions: ${store.dimension}.`);
    for (let offset = 0; offset < knowledgeChunks.length; offset += 20) {
      await upsertKnowledge(process.env, store, knowledgeChunks.slice(offset, offset + 20));
    }
    console.log(`Uploaded ${knowledgeChunks.length} chunks to ${store.namespace}. Upstash may take a moment to index them. Deploy this same source revision to use this namespace.`);
  } catch (error) {
    console.error(ingestionError(error));
    process.exitCode = 1;
  }
}
