import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

const filesToPatch = [
  {
    path: path.join(rootDir, 'node_modules', 'html2canvas', 'dist', 'html2canvas.js'),
    target: /if\s*\(\s*typeof\s+colorFunction\s*===\s*'undefined'\s*\)\s*\{\s*throw\s+new\s+Error\("Attempting\s+to\s+parse\s+an\s+unsupported\s+color\s+function\s+\\""\s*\+\s*value\.name\s*\+\s*"\\""\);\s*\}/g,
    replacement: `if (typeof colorFunction === 'undefined') { return COLORS.TRANSPARENT; }`
  },
  {
    path: path.join(rootDir, 'node_modules', 'html2canvas', 'dist', 'html2canvas.esm.js'),
    target: /if\s*\(\s*typeof\s+colorFunction\s*===\s*'undefined'\s*\)\s*\{\s*throw\s+new\s+Error\("Attempting\s+to\s+parse\s+an\s+unsupported\s+color\s+function\s+\\""\s*\+\s*value\.name\s*\+\s*"\\""\);\s*\}/g,
    replacement: `if (typeof colorFunction === 'undefined') { return COLORS.TRANSPARENT; }`
  },
  {
    path: path.join(rootDir, 'node_modules', 'html2canvas', 'dist', 'html2canvas.min.js'),
    target: /Attempting\s+to\s+parse\s+an\s+unsupported\s+color\s+function/g,
    // Note: minified version is harder to regex safely, but we can catch the throw and replace it if we find it
    replacement: `Unsupported color function`
  },
  {
    path: path.join(rootDir, 'node_modules', 'html2canvas', 'dist', 'lib', 'css', 'types', 'color.js'),
    target: /if\s*\(\s*typeof\s+colorFunction\s*===\s*'undefined'\s*\)\s*\{\s*throw\s+new\s+Error\("Attempting\s+to\s+parse\s+an\s+unsupported\s+color\s+function\s+\\""\s*\+\s*value\.name\s*\+\s*"\\""\);\s*\}/g,
    replacement: `if (typeof colorFunction === 'undefined') { return exports.COLORS.TRANSPARENT; }`
  }
];

console.log('[EasyInvoice Patch] Running html2canvas OKLCH color crash patch...');

filesToPatch.forEach(file => {
  if (!fs.existsSync(file.path)) {
    console.log(`[EasyInvoice Patch] File not found: ${path.relative(rootDir, file.path)} - skipping`);
    return;
  }

  try {
    let content = fs.readFileSync(file.path, 'utf8');
    
    // For minified file, we need a custom search and replace because of minification
    if (file.path.endsWith('.min.js')) {
      // Find the minified throw in html2canvas.min.js:
      // It looks like: throw new Error("Attempting to parse an unsupported color function \""+e.name+"\"")
      const minifiedRegex = /throw\s+new\s+Error\("Attempting\s+to\s+parse\s+an\s+unsupported\s+color\s+function\s+\\""\s*\+\s*[a-zA-Z0-9_$]+\.name\s*\+\s*"\\""\)/g;
      if (minifiedRegex.test(content)) {
        content = content.replace(minifiedRegex, 'return 0'); // COLORS.TRANSPARENT is 0 in minified packed representation
        fs.writeFileSync(file.path, content, 'utf8');
        console.log(`[EasyInvoice Patch] Patched minified file successfully: ${path.relative(rootDir, file.path)}`);
      } else {
        console.log(`[EasyInvoice Patch] Minified pattern not found in: ${path.relative(rootDir, file.path)}`);
      }
      return;
    }

    if (file.target.test(content)) {
      content = content.replace(file.target, file.replacement);
      fs.writeFileSync(file.path, content, 'utf8');
      console.log(`[EasyInvoice Patch] Patched successfully: ${path.relative(rootDir, file.path)}`);
    } else {
      console.log(`[EasyInvoice Patch] Pattern not found in: ${path.relative(rootDir, file.path)} (already patched?)`);
    }
  } catch (err) {
    console.error(`[EasyInvoice Patch] Failed to patch file: ${file.path}`, err);
  }
});
