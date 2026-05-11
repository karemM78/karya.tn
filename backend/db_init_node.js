const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function run() {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });

    console.log('Connected to Oracle XE');

    const sqlScriptPath = path.join(__dirname, 'scripts', 'init_db.sql');
    const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

    // Split script into individual statements
    // This is a naive split, it might fail on complex scripts with semicolons in strings
    // but for this init_db.sql it should be okay if we are careful.
    // However, the script has BEGIN...END blocks which contain semicolons.
    
    // Better: Use a simple regex to split by / or ; at end of line
    const statements = sqlScript.split(/\n\s*\/\s*\n|\n\s*;\s*\n/);

    for (let statement of statements) {
      statement = statement.trim();
      if (!statement) continue;

      try {
        console.log(`Executing statement: ${statement.substring(0, 50)}...`);
        await connection.execute(statement);
      } catch (err) {
        console.error(`Error executing statement: ${err.message}`);
        // Continue to next statement even if one fails (e.g. drop table fails if table doesn't exist)
      }
    }

    await connection.commit();
    console.log('Database initialized successfully');

  } catch (err) {
    console.error('Initialization failed:', err);
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error(err);
      }
    }
  }
}

run();
