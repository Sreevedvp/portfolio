import { handleChat } from '../server/chat';

// Vercel Node.js Web Handler. Secrets are read only inside the server function.
export default { fetch: (request: Request) => handleChat(request) };
