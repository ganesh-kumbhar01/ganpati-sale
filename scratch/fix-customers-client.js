const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/customers/CustomersClient.tsx', 'utf8');

// Fix the WhatsApp function
content = content.replace(
  /const handleSendWhatsApp = \(customer: any\) => \{\s+const text = `[^`]+`;/,
  `const handleSendWhatsApp = (customer: any) => {
      const text = \`नमस्कार \${customer.name} जी! 🙏\`;`
);

// Fix the dY"z prefix
content = content.replace(
  /<span>dY"z \{viewCustomer\.mobile\}<\/span>/,
  `<span>{viewCustomer.mobile}</span>`
);

fs.writeFileSync('src/app/dashboard/customers/CustomersClient.tsx', content, 'utf8');
console.log('Fixed CustomersClient.tsx');
