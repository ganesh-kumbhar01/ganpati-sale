const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

// Add Megaphone to import
content = content.replace(
  /ClipboardList\} from 'lucide-react';/,
  "ClipboardList, Megaphone} from 'lucide-react';"
);

// Add Broadcast to navigation
content = content.replace(
  /\{ name: 'Waitlist', href: '\/dashboard\/waitlist', icon: ClipboardList \},/,
  "{ name: 'Waitlist', href: '/dashboard/waitlist', icon: ClipboardList },\n  { name: 'Broadcast', href: '/dashboard/broadcast', icon: Megaphone },"
);

fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');
console.log('Added Broadcast to layout');
