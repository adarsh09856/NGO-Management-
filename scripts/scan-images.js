const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (['node_modules', '.git', 'dist'].includes(file)) return;
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.sql')) {
      const content = fs.readFileSync(file, 'utf8');
      const matches = content.match(/https?:\/\/[^\s'"\`\<\>)]+/g);
      if (matches) {
        const imgMatches = matches.filter(m => m.includes('unsplash') || m.includes('.jpg') || m.includes('.png'));
        if (imgMatches.length > 0) {
          results.push({ file, imgMatches });
        }
      }
    }
  });
  return results;
}

const res = walk('.');
res.forEach(r => {
  console.log('FILE:', r.file);
  r.imgMatches.forEach(img => console.log('   ->', img));
});
