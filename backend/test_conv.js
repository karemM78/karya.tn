const messageRepository = require('./repositories/messageRepository');
const db = require('./db/connection');

async function test() {
  await db.initialize();
  const user1 = 'e8a57b4d-5838-4f7e-b859-d3e60d56d97b'; // karem
  const user2 = '06d3a32d-99d1-459f-836c-424835fa6890'; // mohammed
  
  console.log(`Fetching conversation between ${user1} and ${user2}...`);
  const messages = await messageRepository.findConversation(user1, user2);
  console.log(`Found ${messages.length} messages.`);
  
  messages.forEach(m => {
    console.log(`- From ${m.SENDER_NAME}: ${m.CONTENT} (ID: ${m.ID})`);
  });
  
  process.exit();
}

test();
