// // // utils/whatsappService.js
// // import pkg from 'whatsapp-web.js';
// // import fs from 'fs';
// // const { Client, LocalAuth, MessageMedia } = pkg;

// // const whatsappClients = new Map();
// // const adminPhoneNumbers = ['919970145846', '8888888888']; // Update as needed

// // export const initWhatsAppClients = () => {
// //   adminPhoneNumbers.forEach((adminPhone) => {
// //     if (whatsappClients.has(adminPhone)) {
// //       console.log(`ℹ️ WhatsApp client already exists for admin: ${adminPhone}`);
// //       return;
// //     }

// //     console.log(`🟢 Initializing WhatsApp client for admin ${adminPhone}`);

// //     const client = new Client({
// //       authStrategy: new LocalAuth({
// //         clientId: adminPhone, // Each admin gets its own session
// //       }),
// //       puppeteer: {
// //         headless: true,
// //         args: ['--no-sandbox', '--disable-setuid-sandbox'],
// //       },
// //     });

// //     client.on('ready', () => {
// //       console.log(`✅ WhatsApp client ready for ${adminPhone}`);
// //     });

// //     client.on('authenticated', () => {
// //       console.log(`🔐 Authenticated: ${adminPhone}`);
// //     });

// //     client.on('auth_failure', (msg) => {
// //       console.error(`❌ Auth failure for ${adminPhone}:`, msg);
// //     });

// //     client.on('disconnected', (reason) => {
// //       console.log(`🔌 Disconnected (${adminPhone}):`, reason);
// //       whatsappClients.delete(adminPhone);
// //     });

// //     client.initialize();
// //     whatsappClients.set(adminPhone, client);
// //   });
// // };

// // // export const sendMessage = async (adminPhone, userPhone, messageText, filePath = null) => {
// // //   const client = whatsappClients.get(adminPhone);
// // //   if (!client) {
// // //     console.error(`❌ WhatsApp client not initialized for ${adminPhone}`);
// // //     return { success: false, error: "Client not initialized" };
// // //   }

// // //   try {
// // //     const chatId = userPhone.includes('@c.us') ? userPhone : `${userPhone}@c.us`;

// // //     await client.sendMessage(chatId, messageText);
// // //     console.log(`✅ Message sent to ${userPhone}`);

// // //     if (filePath && fs.existsSync(filePath)) {
// // //       const media = MessageMedia.fromFilePath(filePath);
// // //       await client.sendMessage(chatId, media);
// // //       console.log(`📎 Media sent to ${userPhone}`);
// // //     }

// // //     return { success: true };
// // //   } catch (err) {
// // //     console.error(`🚨 Failed to send message to ${userPhone}:`, err);
// // //     return { success: false, error: err.message };
// // //   }
// // // };

// // export const sendMessage = async (adminId, phoneNumber, message, orderData) => {
// //   try {
// //     console.log(`Sending message to ${phoneNumber}...`);

// //     const response = await axios.post('https://your-whatsapp-api.com/send', {
// //       to: phoneNumber,
// //       body: message,
// //       metadata: {
// //         orderId: orderData._id,
// //         userId: orderData.userId,
// //         adminId,
// //       },
// //     });

// //     console.log('WhatsApp message response:', response.data);
// //     return response.data;
// //   } catch (error) {
// //     console.error('Failed to send WhatsApp message:', error.response?.data || error.message);
// //   }
// // };

// // export const setupWhatsAppSocket = () => {
// //   // Optional socket logic here
// //   console.log("⚡ WhatsApp socket setup initialized.");
// // };

// // whatsappService.js
// // whatsappService.js
// import { getClient } from '../whatsapp-web.js';
// const client = getClient();


// export const sendMessage = async (userPhone, message, order = null) => {
//   try {
//     const fullPhone = userPhone.includes('@c.us') ? userPhone : `${userPhone}@c.us`;

//     const waitUntilReady = () =>
//       new Promise((resolve) => {
//         if (client.info) return resolve();
//         client.on('ready', resolve);
//       });

//     await waitUntilReady();

//     let msg = `📦 *Order Notification*\n\n${message}`;
//     if (order) {
//       msg += `\n\n🧾 Order Summary:\n- Grain: ${order.grainName}\n- Packaging: ${order.packagingSize} kg\n- Bags: ${order.numberOfBags}\n- Total Weight: ${order.totalWeight} kg\n- Status: ${order.status}`;
//     }

//     await client.sendMessage(fullPhone, msg);
//     console.log(`✅ Message sent to ${userPhone}`);
//   } catch (error) {
//     console.error(`❌ Failed to send message to ${userPhone}:`, error);
//   }
// };
