const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
content = content.replace(/import \{([^\}]+)\} from 'lucide-react';/, function(match, p1) {
  if (p1.includes('Flame')) return match;
  return `import {${p1}, Flame} from 'lucide-react';`;
});
fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');
console.log('Fixed imports');
