import { handleChat } from '../server/chat.js';

// Vercel Node.js Web Handler. Secrets are read only inside the server function.
export default { fetch: (request: Request) => handleChat(request) };
