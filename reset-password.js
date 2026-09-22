const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function reset() {
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    const user = users[0];
    const newHash = await bcrypt.hash('123456', 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: newHash }
    });
    console.log(`Password for user ${user.email} has been reset successfully!`);
  } else {
    console.log("No users found in the database.");
  }
}

reset();
