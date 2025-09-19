// import pkg from 'whatsapp-web.js';
// const { Client, LocalAuth } = pkg;
// import qrcode from 'qrcode-terminal';

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: {
//     headless: false, // or false if you want to see the browser
//     args: ['--no-sandbox', '--disable-setuid-sandbox'],
//   },
// });

// client.on('qr', (qr) => {
//   console.log("📱 Scan this QR Code with your WhatsApp:");
//   qrcode.generate(qr, { small: true });
// });

// client.on('authenticated', () => {
//   console.log("🔐 Authenticated with WhatsApp.");
// });

// client.on('ready', () => {
//   console.log("✅ WhatsApp client is ready!");
//   console.log("Client Info:", client.info);  // Log the client info to check if it's properly initialized
// });

// client.on('auth_failure', msg => {
//   console.error("❌ Authentication failure:", msg);
// });

// client.on('disconnected', reason => {
//   console.warn("⚠️ Client disconnected:", reason);
// });

// client.initialize();  // Initialize after setting all event listeners




// client.on('auth_failure', msg => {
//   console.error("❌ Authentication failure:", msg);
// });

// client.on('disconnected', reason => {
//   console.warn("⚠️ Client disconnected:", reason);
// });

// client.initialize();

// // Ensure client is initialized correctly and exported
// export const getClient = () => client;
