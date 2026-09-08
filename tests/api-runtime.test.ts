import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';

test('compiled Vercel entry loads in plain Node without Vite or a TypeScript loader', () => {
  const output = mkdtempSync(path.join(tmpdir(), 'portfolio-api-runtime-'));
  try {
    const program = ts.createProgram([path.resolve('api/chat.ts')], {
      target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      rootDir: process.cwd(), outDir: output, resolveJsonModule: true,
      esModuleInterop: true, skipLibCheck: true, isolatedModules: true,
    });
    const diagnostics = ts.getPreEmitDiagnostics(program);
    assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: name => name, getCurrentDirectory: () => process.cwd(), getNewLine: () => '\n',
    }));
    assert.equal(program.emit().emitSkipped, false);
    writeFileSync(path.join(output, 'package.json'), JSON.stringify({ type: 'module' }));
    const entry = pathToFileURL(path.join(output, 'api/chat.js')).href;
    const result = spawnSync(process.execPath, ['--input-type=module', '--eval', `
      import assert from 'node:assert/strict';
      globalThis.fetch = async () => { throw new Error('No provider requests are expected'); };
      const { default: api } = await import(${JSON.stringify(entry)});
      const response = await api.fetch(new Request('https://portfolio.test/api/chat'));
      assert.equal(response.status, 405);
      assert.match(response.headers.get('Content-Type'), /application\\/json/);
      const missingConfig = await api.fetch(new Request('https://portfolio.test/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'Tell me about Sreeved' }] }),
      }));
      assert.equal(missingConfig.status, 503);
      console.log('Compiled API handles requests successfully.');
    `], { encoding: 'utf8', timeout: 15000, env: { PATH: process.env.PATH } });
    assert.equal(result.status, 0, result.stderr || result.error?.message);
    assert.match(result.stdout, /handles requests successfully/);
  } finally { rmSync(output, { recursive: true, force: true }); }
});
