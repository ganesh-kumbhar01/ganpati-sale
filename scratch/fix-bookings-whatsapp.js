const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/bookings/BookingsClient.tsx', 'utf8');

content = content.replace(
  /const text = `[^`]+?`;\s+const mobile = formData\.customerMobile\.replace\(\/\\D\/g,''\);/g,
  `const text = \`नमस्कार \${formData.customerName} जी! 🙏\\n\\nआपकी गणेश मूर्ति की बुकिंग सफलतापूर्वक कन्फर्म हो गई है! 🎉\\nयह रहा आपकी बुकिंग का विवरण:\\n\\nमूर्ती का नाम: \${selectedProd?.name || ''} (Qty: \${payload.quantity})\\nकुल राशि: ₹\${payload.totalPrice}\\nजमा राशि (Advance): ₹\${payload.advanceAmount}\\nबाकी राशि (Balance): ₹\${payload.totalPrice - payload.advanceAmount}\\n\\nधन्यवाद!\`;
          const mobile = formData.customerMobile.replace(/\\D/g,'');`
);

content = content.replace(
  /const text = `[^`]+?`;\s+const mobile = booking\.customer\?\.mobile\.replace\(\/\\D\/g,''\);/g,
  `const text = \`नमस्कार \${booking.customer?.name} जी! 🙏\\n\\nआपकी गणेश मूर्ति की बुकिंग सफलतापूर्वक कन्फर्म हो गई है! 🎉\\nयह रहा आपकी बुकिंग का विवरण:\\n\\nमूर्ती का नाम: \${booking.product?.name} (Qty: \${booking.quantity})\\nकुल राशि: ₹\${booking.totalPrice}\\nजमा राशि (Advance): ₹\${booking.advanceAmount}\\nबाकी राशि (Balance): ₹\${booking.balanceAmount}\\n\\nधन्यवाद!\`;
      const mobile = booking.customer?.mobile.replace(/\\D/g,'');`
);

fs.writeFileSync('src/app/dashboard/bookings/BookingsClient.tsx', content, 'utf8');
console.log('Fixed BookingsClient.tsx WhatsApp messages');
