const oracledb = require('oracledb');
require('dotenv').config();

// Auto-commit by default for simple CRUD, but we can manage transactions manually when needed
oracledb.autoCommit = true;

// Set outFormat to OBJECT so we get JSON-like results instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// Fetch CLOBs as strings to avoid circular structure errors when serializing to JSON
oracledb.fetchAsString = [ oracledb.CLOB ];

let pool;

const initialize = async () => {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMax: 10,
      poolMin: 2,
      poolIncrement: 1,
      poolTimeout: 60
    });
    console.log('Oracle Connection Pool initialized');
  } catch (err) {
    console.error('Error initializing Oracle Pool:', err.message);
    throw err;
  }
};

const close = async () => {
  try {
    await pool.close();
    console.log('Oracle Connection Pool closed');
  } catch (err) {
    console.error('Error closing Oracle Pool:', err.message);
  }
};

const execute = async (sql, binds = [], options = {}) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const result = await connection.execute(sql, binds, options);
    return result;
  } catch (err) {
    console.error('Database execution error:', err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err.message);
      }
    }
  }
};

// Function for multi-statement transactions
const doTransaction = async (operation) => {
  let connection;
  try {
    connection = await pool.getConnection();
    // Disable autoCommit for transaction
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Transaction error:', err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.close();
    }
  }
};

module.exports = {
  initialize,
  close,
  execute,
  doTransaction,
  oracledb
};
