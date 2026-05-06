// Ensures CNAME is copied to dist/ after build
import { copyFileSync } from 'fs';
import { join } from 'path';

const src = join('public', 'CNAME');
const dest = join('dist', 'CNAME');

try {
  copyFileSync(src, dest);
  console.log('CNAME copied to dist/');
} catch (e) {
  console.error('Failed to copy CNAME:', e);
  process.exit(1);
}
