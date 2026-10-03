const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

content = content.replace(
  /Receipt , Flame\} from 'lucide-react';/,
  "Receipt , Flame, ClipboardList} from 'lucide-react';"
);

content = content.replace(
  /\{ name: 'Clearance', href: '\/dashboard\/clearance', icon: Flame \},/,
  "{ name: 'Clearance', href: '/dashboard/clearance', icon: Flame },\n  { name: 'Waitlist', href: '/dashboard/waitlist', icon: ClipboardList },"
);

fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');
console.log('Added waitlist to layout');
