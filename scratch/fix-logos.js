const fs = require('fs');

let contentAuth = fs.readFileSync('src/app/(auth)/layout.tsx', 'utf8');
contentAuth = contentAuth.replace(
  /<div className="w-full h-full bg-primary" style=\{\{[\s\S]*?role="img" \/>/, 
  '<img src="/sanchit-logo-transparent.png" alt="Sanchit Logo" className="w-full h-full object-contain drop-shadow-sm" />'
);
fs.writeFileSync('src/app/(auth)/layout.tsx', contentAuth, 'utf8');

let contentDash = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
contentDash = contentDash.replace(
  /<div className="w-full h-full bg-primary" style=\{\{[\s\S]*?role="img" \/>/g, 
  '<img src="/sanchit-logo-transparent.png" alt="Sanchit Logo" className="w-full h-full object-contain drop-shadow-sm" />'
);
fs.writeFileSync('src/app/dashboard/layout.tsx', contentDash, 'utf8');

console.log('Fixed logos');
