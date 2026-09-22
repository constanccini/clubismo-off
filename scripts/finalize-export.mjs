import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

if (!existsSync(resolve('out/index.html'))) throw new Error('A exportação não gerou a capa do blog.');
// Only a build-time placeholder, never a published article. Real slugs cannot
// contain underscores, so this cleanup cannot remove editorial content.
rmSync(resolve('out/materia/__empty__'), { recursive: true, force: true });
