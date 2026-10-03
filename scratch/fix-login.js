const fs = require('fs');
let content = fs.readFileSync('src/app/(auth)/login/page.tsx', 'utf8');
content = content.replace(/const \[isLogin, setIsLogin\] = useState\(true\);/, 'const isLogin = true;');
const startIdx = content.indexOf('<div className="flex bg-slate-100');
const endStr = '</button>\r\n        </div>';
let endIdx = content.indexOf(endStr, startIdx);
if (endIdx === -1) endIdx = content.indexOf('</button>\n        </div>', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx + 26);
}
fs.writeFileSync('src/app/(auth)/login/page.tsx', content, 'utf8');
console.log('Done');
