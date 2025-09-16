import fs from 'node:fs/promises';
import path from 'node:path';

import fg from 'fast-glob';

async function run() {
  // pega todos os *.schema.ts dentro de src/database
  const files = await fg(['src/**/*.schema.ts'], { absolute: false });

  // monta exports relativos a partir de src/database/schemas
  const lines = files.sort().map((p) => {
    const noExt = p.replace(/\.ts$/, '');
    const rel = path.relative('src/database/schemas', noExt).replace(/\\/g, '/');
    return `export * from "./${rel}";`;
  });

  const header = `/* AUTO-GERADO: NÃO EDITAR MANUALMENTE
   * Rode: pnpm gen:schema-barrel
   */\n`;

  await fs.mkdir('src/database/schemas', { recursive: true });
  await fs.writeFile('src/database/schemas/index.ts', header + lines.join('\n') + '\n');
}

run().catch((e) => {
  console.error('❌ Erro ao gerar barrel de schemas:', e);
  process.exit(1);
});
