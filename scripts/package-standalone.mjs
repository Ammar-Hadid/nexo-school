import { cp } from 'node:fs/promises';
// Next standalone output omits static assets; include them for local and Docker runtime.
await cp('.next/static', '.next/standalone/.next/static', { recursive: true });
