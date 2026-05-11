const db = require('../db/connection');

async function checkMessages() {
  try {
    console.log('--- MESSAGES TABLE ---');
    const result = await db.execute('SELECT * FROM MESSAGES ORDER BY CREATED_AT DESC');
    console.log(`Total messages: ${result.rows.length}`);
    result.rows.forEach(row => {
      console.log(`ID: ${row.ID}, From: ${row.SENDER_ID}, To: ${row.RECIPIENT_ID}, Content: ${row.CONTENT}`);
    });
    
    console.log('\n--- USERS TABLE ---');
    const users = await db.execute('SELECT ID, NAME, EMAIL FROM USERS');
    users.rows.forEach(u => {
      console.log(`ID: ${u.ID}, Name: ${u.NAME}, Email: ${u.EMAIL}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

async function run() {
  await db.initialize();
  await checkMessages();
}

run();
