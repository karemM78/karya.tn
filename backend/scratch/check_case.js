const db = require('../db/connection');

async function checkCase() {
  await db.initialize();
  const users = await db.execute('SELECT ID FROM USERS FETCH FIRST 1 ROWS ONLY');
  if (users.rows.length > 0) {
    const id = users.rows[0].ID;
    console.log(`User ID: "${id}"`);
    console.log(`Uppercase: "${id.toUpperCase()}"`);
    console.log(`Lowercase: "${id.toLowerCase()}"`);
    console.log(`Are they same? ${id === id.toLowerCase()}`);
  }
  
  const messages = await db.execute('SELECT SENDER_ID, RECIPIENT_ID FROM MESSAGES FETCH FIRST 1 ROWS ONLY');
  if (messages.rows.length > 0) {
    console.log(`Sender ID: "${messages.rows[0].SENDER_ID}"`);
    console.log(`Recipient ID: "${messages.rows[0].RECIPIENT_ID}"`);
  }
  
  process.exit();
}

checkCase();
