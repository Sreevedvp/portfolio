export interface ContactMessage { name: string; email: string; subject: string; message: string; website?: string; }
export type ContactResult = { kind: 'submitted' | 'activation'; message: string };
export const CONTACT_ENDPOINT = 'https://formsubmit.co/ajax/sreevedvp@gmail.com';
export function validateContact(input: ContactMessage): string | null {
  if (input.website) return 'Please leave the website field empty.';
  if (input.name.trim().length < 2 || input.name.trim().length > 100) return 'Enter your name (2–100 characters).';
  if (input.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) return 'Enter a valid email address.';
  if (input.subject.length > 120) return 'Choose a shorter subject.';
  if (input.message.trim().length < 10 || input.message.trim().length > 5000) return 'Write a message between 10 and 5,000 characters.';
  return null;
}
export async function submitContact(input: ContactMessage): Promise<ContactResult> {
  const invalid = validateContact(input);
  if (invalid) throw new Error(invalid);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(CONTACT_ENDPOINT, {
      method: 'POST', signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ name: input.name.trim(), email: input.email.trim(), message: input.message.trim(), topic: input.subject, _subject: `Portfolio: ${input.subject}`, _replyto: input.email.trim(), _template: 'table', _url: 'https://sreevedvp.github.io/portfolio/', _honey: input.website || '' }),
    });
    if (response.status === 429) throw new Error('Too many attempts. Please wait a few minutes before trying again.');
    if (!response.ok) throw new Error('The message service is unavailable. Your message is still here; try again or email me directly.');
    const data = await response.json();
    if (typeof data.message === 'string' && /activat|confirm.*email/i.test(data.message)) return { kind: 'activation', message: 'The contact inbox is awaiting activation. Please email me directly for now.' };
    if (data.success !== true && data.success !== 'true') throw new Error('Your submission was not accepted. Please try again or email me directly.');
    return { kind: 'submitted', message: 'Your message was submitted. Thanks for reaching out!' };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('The service did not confirm your submission in time. Your message is still here. Please check before retrying to avoid a duplicate.');
    if (error instanceof TypeError) throw new Error('Could not connect to the message service. Check your connection, or email me directly.');
    throw error;
  } finally { clearTimeout(timer); }
}
