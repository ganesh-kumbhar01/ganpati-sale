const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: "r3mhzlwt",
  api_key: "926378941133839",
  api_secret: "H-uywhnSGTJRz1XnlErN_JMSuH8"
});

async function test() {
  try {
    const res = await cloudinary.api.ping();
    console.log("Ping success:", res);
  } catch (error) {
    console.error("Ping error:", error);
  }
}

test();
