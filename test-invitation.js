// Test script for invitation links
// Usage: node test-invitation.js <token>

const token = process.argv[2];

if (!token) {
  console.log("Usage: node test-invitation.js <token>");
  console.log("Example: node test-invitation.js abc123");
  process.exit(1);
}

const webLink = `http://localhost:3000/invite?token=${token}`;
const deepLink = `finsangmart://accept-invitation?token=${token}`;

console.log("🔗 Invitation Links for Testing:");
console.log("");
console.log("🌐 Web Link (Clickable in messaging apps):");
console.log(webLink);
console.log("");
console.log("📱 Deep Link (For direct app opening):");
console.log(deepLink);
console.log("");
console.log("📋 Testing Instructions:");
console.log(
  "1. Start your Next.js admin panel: cd finsang-next-admin && npm run dev"
);
console.log("2. Copy the web link and share it via WhatsApp/Telegram/Email");
console.log("3. When clicked, it will open the beautiful invitation page");
console.log(
  '4. Click "Open FinsangMart App" to launch your app with deep link'
);
console.log(
  "5. Make sure your Expo development server is running (npx expo start)"
);
console.log("");
console.log("💡 For production, change the URL in teamApi.ts to:");
console.log("https://finsang.in/invite?token=${token}");
