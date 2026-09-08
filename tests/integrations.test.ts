import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseMediumFeed, plainText, mediumUrl } from '../src/services/medium.ts';
import { submitContact, validateContact } from '../src/services/contact.ts';

const message = { name: 'Example Visitor', email: 'visitor@example.com', subject: 'Project collaboration', message: 'A sufficiently detailed project inquiry for testing.' };
const feedItem = { title: 'New &amp; useful', link: 'https://medium.com/@sreevedvp/story-123?source=rss', pubDate: '2026-09-07 19:23:13', description: '<p>Hello <strong>world</strong>.</p>', categories: ['Rust'] };

test('Medium normalizes text, strips tracking, sorts newest first, and deduplicates', () => {
  const items = parseMediumFeed({ status: 'ok', items: [feedItem, { ...feedItem, link: 'https://medium.com/@sreevedvp/older', pubDate: '2026-01-01 01:00:00' }, feedItem] });
  assert.equal(items.length, 2);
  assert.equal(items[0].title, 'New & useful');
  assert.equal(items[0].url, 'https://medium.com/@sreevedvp/story-123');
  assert.equal(items[0].publishedAt, '2026-09-07T19:23:13.000Z');
  assert.equal(items[0].summary, 'Hello world .');
});
test('Medium rejects unsafe URLs and malformed items without rendering raw markup', () => {
  for (const url of ['javascript:alert(1)', 'https://medium.com.evil.test/post', 'https://medium.com@evil.test/post', 'http://medium.com/post']) assert.equal(mediumUrl(url), null);
  assert.equal(plainText('<script>alert(1)</script><p>A &#x1f680; &amp; B</p>'), 'A 🚀 & B');
  assert.throws(() => parseMediumFeed({ status: 'error', message: 'Bad feed' }));
  assert.throws(() => parseMediumFeed({ status: 'ok', items: [{ ...feedItem, pubDate: 'invalid' }] }));
  assert.deepEqual(parseMediumFeed({ status: 'ok', items: [] }), []);
});
test('Contact validates actual input lengths, email, and honeypot', () => {
  assert.equal(validateContact(message), null);
  assert.ok(validateContact({ ...message, name: ' ' }));
  assert.ok(validateContact({ ...message, email: 'wrong' }));
  assert.ok(validateContact({ ...message, message: '  short  ' }));
  assert.ok(validateContact({ ...message, message: 'x'.repeat(5001) }));
  assert.ok(validateContact({ ...message, website: 'spam.test' }));
});
test('Contact distinguishes acceptance, activation, provider rejection, and rate limiting', async () => {
  const original = globalThis.fetch;
  try {
    let sent: Record<string, string> | undefined;
    globalThis.fetch = async (_url, options) => { sent = JSON.parse(String(options?.body)); return Response.json({ success: 'true' }); };
    assert.equal((await submitContact(message)).kind, 'submitted');
    assert.equal(sent?._replyto, message.email);
    assert.equal(sent?._subject, 'Portfolio: Project collaboration');
    globalThis.fetch = async () => Response.json({ success: 'false', message: "This form needs Activation. We've sent you an email containing an Activate Form link." });
    assert.equal((await submitContact(message)).kind, 'activation');
    globalThis.fetch = async () => Response.json({ success: 'false' });
    await assert.rejects(submitContact(message), /not accepted/);
    globalThis.fetch = async () => new Response('', { status: 429 });
    await assert.rejects(submitContact(message), /Too many attempts/);
    globalThis.fetch = async () => { throw new DOMException('Aborted', 'AbortError'); };
    await assert.rejects(submitContact(message), /did not confirm/);
    globalThis.fetch = async () => { throw new TypeError('Network failed'); };
    await assert.rejects(submitContact(message), /Could not connect/);
  } finally { globalThis.fetch = original; }
});
