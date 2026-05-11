const oracledb = require('oracledb');
require('dotenv').config({ path: '../.env' });

async function run() {
    let connection;
    try {
        connection = await oracledb.getConnection({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            connectString: process.env.DB_CONNECT_STRING
        });

        console.log('Connected to Oracle');

        const sql = `
            CREATE TABLE PROPERTY_COMMENTS (
                ID VARCHAR2(36) PRIMARY KEY,
                PROPERTY_ID VARCHAR2(36) NOT NULL,
                USER_ID VARCHAR2(36) NOT NULL,
                RATING NUMBER(1) DEFAULT 0,
                CONTENT CLOB,
                CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT FK_COMM_PROP FOREIGN KEY (PROPERTY_ID) REFERENCES PROPERTIES(ID) ON DELETE CASCADE,
                CONSTRAINT FK_COMM_USER FOREIGN KEY (USER_ID) REFERENCES USERS(ID) ON DELETE CASCADE
            )
        `;

        await connection.execute(sql);
        console.log('PROPERTY_COMMENTS table created successfully');

    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

run();
