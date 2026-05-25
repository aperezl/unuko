import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// El Alguacil comprueba las reglas básicas antes de permitir un commit
const files = readdirSync('src', { recursive: true }) as string[];
let errors = 0;

console.log("👮 Analizando cumplimiento de la Constitución...");

files.forEach(file => {
  if (!file.endsWith('.ts')) return;

  const content = readFileSync(join('src', file), 'utf-8');

  // Regla 1: Prohibición de 'any'
  if (content.includes(': any') || content.includes('as any')) {
    console.error(`❌ ERROR: Uso de 'any' detectado en ${file}. Esto viola el Artículo II.`);
    errors++;
  }

  // Regla 2: Uso de validación nativa de Elysia
  if (content.includes('import') && content.includes('elysia') && !content.includes(' t ')) {
    if (content.includes('validate') || content.includes('schema')) {
      console.warn(`⚠️ ADVERTENCIA: ${file} parece usar validación externa. Prioriza 't' de Elysia.`);
    }
  }
});

if (errors > 0) {
  console.log(`\n🚨 El Tribunal ha fallado: ${errors} violaciones graves.`);
  process.exit(1);
} else {
  console.log("\n✅ Código validado por el Alguacil. Proceda.");
  process.exit(0);
}