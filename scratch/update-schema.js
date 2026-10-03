const fs = require('fs');

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

const demandModel = `
model Demand {
  id            String    @id @default(cuid())
  seasonId      String
  productId     String
  customerName  String?
  customerPhone String?
  notes         String?
  createdAt     DateTime  @default(now())

  season        Season    @relation(fields: [seasonId], references: [id], onDelete: Cascade)
  product       Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
}
`;

schema = schema + '\n' + demandModel;

schema = schema.replace(/expenses      Expense\[\]/g, 'expenses      Expense[]\n  demands       Demand[]');
schema = schema.replace(/bookings      Booking\[\]/g, 'bookings      Booking[]\n  demands       Demand[]');

fs.writeFileSync('prisma/schema.prisma', schema);
console.log('Schema updated');
