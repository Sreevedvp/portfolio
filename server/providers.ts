export type Environment = Record<string, string | undefined>;

export class ServiceError extends Error {
  constructor(public service: string, public status?: number, public hint?: string) { super(`${service} request failed`); }
}

export function required(env: Environment, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new ServiceError('configuration');
  return value;
}

export function serviceUrl(env: Environment, name: string): string {
  const url = new URL(required(env, name));
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) throw new ServiceError('configuration');
  return url.toString().replace(/\/$/, '');
}

export async function postJson<T>(url: string, token: string, body: unknown, service: string, timeout = 10000): Promise<T> {
  return requestJson(url, token, service, { method: 'POST', body: JSON.stringify(body) }, timeout);
}

export async function getJson<T>(url: string, token: string, service: string, timeout = 5000): Promise<T> {
  return requestJson(url, token, service, { method: 'GET' }, timeout);
}

async function requestJson<T>(url: string, token: string, service: string, options: RequestInit, timeout: number): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(timeout), redirect: 'error',
    });
    if (!response.ok) throw new ServiceError(service, response.status);
    const result = await response.json();
    if (!result || result.error) throw new ServiceError(service);
    return result as T;
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(service);
  }
}

export async function vectorCommand<T>(env: Environment, command: string, namespace: string, body: unknown): Promise<T> {
  const response = await postJson<{ result: T }>(`${serviceUrl(env, 'UPSTASH_VECTOR_REST_URL')}/${command}/${encodeURIComponent(namespace)}`, required(env, 'UPSTASH_VECTOR_REST_TOKEN'), body, 'vector');
  if (response.result === undefined) throw new ServiceError('vector');
  return response.result;
}
