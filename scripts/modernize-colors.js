const fs = require('fs');
const path = require('path');

// Color replacement mapping: Replace chocolatey/faded colors with ultra-luxury Obsidian, Royal Ruby & Liquid Gold
const replacements = [
  // 1. Chocolate / Muddy Dark Backgrounds & Maroons -> Modern Obsidian / Eclipse Navy / Royal Ruby
  { from: /#2C060D/gi, to: '#0B0F19' },
  { from: /#20040A/gi, to: '#090D16' },
  { from: /#1A0307/gi, to: '#05070D' },
  { from: /#1F0408/gi, to: '#070A12' },
  { from: /#3B0A13/gi, to: '#0F172A' },
  { from: /#4A0E17/gi, to: '#0F172A' }, // Text/headers in chocolate -> Clean deep obsidian slate
  { from: /#5A121E/gi, to: '#1E293B' },
  { from: /#7E1929/gi, to: '#E11D48' }, // Buttons/accents in faded maroon -> Vibrant Royal Ruby
  { from: /#8B1E2F/gi, to: '#BE123C' }, // Hover accents -> Deep Royal Crimson
  { from: /#2D1810/gi, to: '#0F172A' }, // Muddy body text -> Crisp Midnight Slate
  { from: /#4E0D19/gi, to: '#1E293B' },
  { from: /#FDFBF7/gi, to: '#F8FAFC' }, // Faded beige -> Crystal Pearl Slate
  { from: /#F8F6F0/gi, to: '#F1F5F9' },
  { from: /#FAF8F5/gi, to: '#F8FAFC' },
  { from: /#FDF6E2/gi, to: '#FEF3C7' }, // Soft champagne gold light
  { from: /#EBE5D8/gi, to: '#E2E8F0' }, // Dull border -> Crisp Modern Slate border
];

function processDir(dir) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist'].includes(file)) {
        processDir(fullPath);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      replacements.forEach(r => {
        if (r.from.test(content)) {
          content = content.replace(r.from, r.to);
          changed = true;
        }
      });
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated modern colors in:', fullPath);
      }
    }
  });
}

processDir('./src');
console.log('✅ All chocolatey colors successfully transformed into modern luxury palette.');
