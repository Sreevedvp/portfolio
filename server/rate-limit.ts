import { createHmac } from 'node:crypto';
import { Environment, postJson, required, serviceUrl, ServiceError } from './providers';

// One atomic decision for both limits, shared by every serverless instance.
const limitScript = `
local minute = tonumber(redis.call('GET', KEYS[1]) or '0')
local day = tonumber(redis.call('GET', KEYS[2]) or '0')
if minute >= tonumber(ARGV[1]) then return {0, math.max(1, redis.call('TTL', KEYS[1]))} end
if day >= tonumber(ARGV[2]) then return {0, math.max(1, redis.call('TTL', KEYS[2]))} end
local m = redis.call('INCR', KEYS[1])
if m == 1 then redis.call('EXPIRE', KEYS[1], 60) end
local d = redis.call('INCR', KEYS[2])
if d == 1 then redis.call('EXPIRE', KEYS[2], 86400) end
return {1, 0}`;

export function positiveLimit(value: string | undefined, fallback: number): number {
  const number = Number(value ?? fallback);
  if (!Number.isSafeInteger(number) || number < 1) throw new ServiceError('configuration');
  return number;
}

export async function rateLimit(request: Request, env: Environment): Promise<{ allowed: boolean; retryAfter: number }> {
  // Vercel overwrites this header. Never trust a client-supplied IP header locally.
  const ip = env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown' : 'local';
  const token = required(env, 'UPSTASH_REDIS_REST_TOKEN');
  const identity = createHmac('sha256', token).update(ip).digest('hex');
  const prefix = env.RAG_NAMESPACE || 'sreeved-portfolio';
  const { result } = await postJson<{ result: [number, number] }>(serviceUrl(env, 'UPSTASH_REDIS_REST_URL'), token, [
    'EVAL', limitScript, 2, `${prefix}:chat:visitor:${identity}`, `${prefix}:chat:daily`,
    positiveLimit(env.CHAT_REQUESTS_PER_MINUTE, 10), positiveLimit(env.CHAT_DAILY_REQUEST_LIMIT, 200),
  ], 'rate-limit', 5000);
  if (!Array.isArray(result) || ![0, 1].includes(result[0]) || !Number.isFinite(result[1])) throw new ServiceError('rate-limit');
  return { allowed: result[0] === 1, retryAfter: Math.max(1, result[1]) };
}
