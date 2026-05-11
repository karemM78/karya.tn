const db = require('./db/connection');
require('dotenv').config();

async function test() {
  try {
    await db.initialize();
    console.log('Testing connection with: SELECT 1 FROM dual');
    const result = await db.execute('SELECT 1 as TEST FROM dual');
    console.log('Result:', result.rows);
    if (result.rows[0].TEST === 1) {
      console.log('Connection test PASSED!');
    } else {
      console.log('Connection test FAILED (unexpected result)');
    }
  } catch (err) {
    console.error('Connection test FAILED:', err.message);
  } finally {
    await db.close();
  }
}

test();
