const fs = require('fs');

let contentAuth = fs.readFileSync('src/app/(auth)/layout.tsx', 'utf8');
contentAuth = contentAuth.replace(
  /<img src="\/sanchit-logo-transparent\.png" alt="Sanchit Logo" className="w-full h-full object-contain drop-shadow-sm" \/>/g,
  '<div className="w-full h-full bg-[#b8baff]" style={{ WebkitMaskImage: \'url(/sanchit-logo-transparent.png)\', WebkitMaskSize: \'contain\', WebkitMaskRepeat: \'no-repeat\', WebkitMaskPosition: \'center\', maskImage: \'url(/sanchit-logo-transparent.png)\', maskSize: \'contain\', maskRepeat: \'no-repeat\', maskPosition: \'center\' }} aria-label="Sanchit Logo" role="img" />'
);
// Also change the text color to match if they want? They only said "logo colour to b8baff". But in previous prompts they said "name k colour and logo k colur same rakho".
// Let's change the text color to #b8baff as well.
contentAuth = contentAuth.replace(/text-\[#555aa8\]/g, 'text-[#b8baff]');
fs.writeFileSync('src/app/(auth)/layout.tsx', contentAuth, 'utf8');

let contentDash = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
contentDash = contentDash.replace(
  /<img src="\/sanchit-logo-transparent\.png" alt="Sanchit Logo" className="w-full h-full object-contain drop-shadow-sm" \/>/g,
  '<div className="w-full h-full bg-[#b8baff]" style={{ WebkitMaskImage: \'url(/sanchit-logo-transparent.png)\', WebkitMaskSize: \'contain\', WebkitMaskRepeat: \'no-repeat\', WebkitMaskPosition: \'center\', maskImage: \'url(/sanchit-logo-transparent.png)\', maskSize: \'contain\', maskRepeat: \'no-repeat\', maskPosition: \'center\' }} aria-label="Sanchit Logo" role="img" />'
);
// Also change the text color to #b8baff
contentDash = contentDash.replace(/text-\[#555aa8\]/g, 'text-[#b8baff]');
fs.writeFileSync('src/app/dashboard/layout.tsx', contentDash, 'utf8');

console.log('Applied mask image trick with #b8baff');
