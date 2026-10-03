const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('src/app/(auth)', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace classNames that have bg-white dark:bg-slate-900 but lack text colors
    content = content.replace(/className="([^"]*bg-white dark:bg-slate-900[^"]*)"/g, (match, p1) => {
      if (!p1.includes('text-slate-900') && !p1.includes('dark:text-white') && !p1.includes('text-gray-900')) {
        return `className="${p1} text-slate-900 dark:text-white"`;
      }
      return match;
    });

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed text colors in:', filePath);
    }
  }
});
