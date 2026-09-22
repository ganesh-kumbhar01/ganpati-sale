import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log("PRODUCTS:", products);

  const bookings = await prisma.booking.findMany();
  console.log("BOOKINGS:", bookings.length);
  
  const seasons = await prisma.season.findMany({
    include: {
      products: true,
      bookings: true
    }
  });

  const stockSummary = {
    total: { stock: 0, booked: 0, pickedUp: 0 },
    pop: { stock: 0, booked: 0, pickedUp: 0 },
    eco: { stock: 0, booked: 0, pickedUp: 0 }
  };

  seasons.forEach(season => {
    season.products.forEach(p => {
      stockSummary.total.stock += p.qtyPurchased;
      stockSummary.total.booked += p.qtyBooked;
      stockSummary.total.pickedUp += p.qtyPickedUp;
      
      if (p.material === 'POP') {
        stockSummary.pop.stock += p.qtyPurchased;
        stockSummary.pop.booked += p.qtyBooked;
        stockSummary.pop.pickedUp += p.qtyPickedUp;
      } else {
        stockSummary.eco.stock += p.qtyPurchased;
        stockSummary.eco.booked += p.qtyBooked;
        stockSummary.eco.pickedUp += p.qtyPickedUp;
      }
    });
  });
  console.log("STOCK SUMMARY:", stockSummary);
}

main().catch(console.error).finally(() => prisma.$disconnect());
