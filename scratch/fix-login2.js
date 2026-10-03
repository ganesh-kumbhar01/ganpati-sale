const fs = require('fs');
let content = fs.readFileSync('src/app/(auth)/login/page.tsx', 'utf8');

// Force isLogin to be always true
content = content.replace(/const \[isLogin, setIsLogin\] = useState\(true\);/, 'const isLogin = true;');

// Remove the toggle buttons
const toggleStart = content.indexOf('<div className="flex bg-slate-100');
const formStart = content.indexOf('<form className="space-y-4"');
if (toggleStart !== -1 && formStart !== -1) {
  content = content.substring(0, toggleStart) + content.substring(formStart);
}

// Remove the conditional rendering for registration fields
const regFieldsStart = content.indexOf('{!isLogin && (');
const regFieldsEnd = content.indexOf(')}', regFieldsStart);
if (regFieldsStart !== -1 && regFieldsEnd !== -1) {
  content = content.substring(0, regFieldsStart) + content.substring(regFieldsEnd + 2);
}

// Change button text
content = content.replace(/{loading \? <Loader2 className=\"w-5 h-5 animate-spin\" \/> : \(isLogin \? 'Sign In to Dashboard' : 'Create Free Account'\)}/, '{loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In to Dashboard"}');

fs.writeFileSync('src/app/(auth)/login/page.tsx', content, 'utf8');
console.log('Fixed');
