/**
 * Incrementa o patch em `package.json` (ex.: 0.1.0 → 0.1.1) e alinha a raiz em `package-lock.json`.
 * Uso: `npm run release:bump-patch` (na pasta hostlogic-site)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const lockPath = path.join(root, 'package-lock.json');

function bumpPatch(semver) {
  const s = String(semver || '').trim();
  const parts = s.split('.').map((x) => parseInt(String(x).replace(/[^\d]/g, ''), 10));
  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n) || n < 0)) {
    throw new Error(`Semver inválido: "${semver}"`);
  }
  parts[2] += 1;
  return parts.slice(0, 3).join('.');
}

const pkgRaw = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgRaw);
const prev = String(pkg.version || '0.0.0').trim();
const next = bumpPatch(prev);
pkg.version = next;
fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

if (fs.existsSync(lockPath)) {
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  lock.version = next;
  if (lock.packages && lock.packages['']) {
    lock.packages[''].version = next;
  }
  fs.writeFileSync(lockPath, `${JSON.stringify(lock, null, 2)}\n`);
}

console.log(`[hostlogic-site] Versão: ${prev} → ${next}`);
