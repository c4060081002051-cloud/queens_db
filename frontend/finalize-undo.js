import fs from 'fs';
import path from 'path';

const map = {
  // Navy to Sage
  '#172554': '#6a9570',
  '#1e3a8a': '#6a9570',
  '#1e40af': '#6a9570',
  '#1d4ed8': '#567c5c',
  '#2563eb': '#7da983',
  '#3b82f6': '#9dc6a0',
  '#bfdbfe': '#b8d8ba',
  '#dbeafe': '#cde8cf',
  '#f0f9ff': '#f5f8f5',
  
  // Orange to Sky
  '#9a3412': '#4a6f8a',
  '#c2410c': '#4a6f8a',
  '#ea580c': '#5a8faf',
  '#f97316': '#78b3ce',
  '#fb923c': '#9cc9e0',
  '#fdba74': '#9cc9e0',
  '#fed7aa': '#b9d9eb',
  '#ffedd5': '#e0f0f8',
  '#fff7ed': '#eef6fc',
};

const dir = './src/components/finance';
const files = fs.readdirSync(dir);

for (const f of files) {
  if (fullPath => fullPath.endsWith('.tsx')) { // simpler logic
    const fullPath = path.join(dir, f);
    if (!fs.statSync(fullPath).isFile() || !fullPath.endsWith('.tsx')) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    for (const [oldC, newC] of Object.entries(map)) {
      // Create a fresh RegExp explicitly in replace so there's no lastIndex sharing
      content = content.replace(new RegExp(oldC, 'ig'), newC);
    }

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log('Successfully reverted coloring in:', fullPath);
    }
  }
}

// Clean up all the scripts we generated in the active repo to keep it clean.
try { fs.unlinkSync('./colors.js'); } catch(e){}
try { fs.unlinkSync('./fix-contrast.js'); } catch(e){}
try { fs.unlinkSync('./replace-colors-deep.js'); } catch(e){}
try { fs.unlinkSync('./revert-colors.js'); } catch(e){}
try { fs.unlinkSync('./undo-finance-colors.js'); } catch(e){}

console.log('Cleanup complete.');
