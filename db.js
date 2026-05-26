const mysql = require('mysql2/promise');

const dbStatus = {
  connected: false,
  message: 'Database connection has not been attempted yet'
};

let pool;

const getMysqlConfig = () => ({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'excellenceos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
});

const createSchema = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      streak INT NOT NULL DEFAULT 0,
      last_active DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
      category VARCHAR(120) NOT NULL DEFAULT 'General',
      deadline DATETIME NULL,
      completed TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_tasks_user_created (user_id, created_at),
      CONSTRAINT fk_tasks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notes (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL DEFAULT 'Untitled Note',
      content LONGTEXT NOT NULL,
      folder VARCHAR(120) NOT NULL DEFAULT 'General',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_notes_user_updated (user_id, updated_at),
      CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS analytics (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      activity_date DATE NOT NULL,
      study_minutes INT NOT NULL DEFAULT 0,
      tasks_completed INT NOT NULL DEFAULT 0,
      pomodoros_completed INT NOT NULL DEFAULT 0,
      ai_generations_count INT NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uniq_analytics_user_date (user_id, activity_date),
      CONSTRAINT fk_analytics_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      deck_name VARCHAR(255) NOT NULL,
      cards JSON NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_flashcards_user_created (user_id, created_at),
      CONSTRAINT fk_flashcards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
      questions JSON NOT NULL,
      score INT NOT NULL DEFAULT 0,
      max_score INT NOT NULL DEFAULT 0,
      taken TINYINT(1) NOT NULL DEFAULT 0,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_quizzes_user_created (user_id, created_at),
      CONSTRAINT fk_quizzes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

const connectDB = async () => {
  try {
    const mysqlConfig = getMysqlConfig();
    const bootstrap = await mysql.createConnection({
      host: mysqlConfig.host,
      port: mysqlConfig.port,
      user: mysqlConfig.user,
      password: mysqlConfig.password,
    });

    await bootstrap.query(`CREATE DATABASE IF NOT EXISTS \`${mysqlConfig.database}\``);
    await bootstrap.end();

    pool = mysql.createPool(mysqlConfig);
    await pool.query('SELECT 1');
    await createSchema();

    dbStatus.connected = true;
    dbStatus.message = `Connected to MySQL database ${mysqlConfig.database}`;
    console.log(dbStatus.message);
  } catch (error) {
    dbStatus.connected = false;
    dbStatus.message = error.message;
    console.error(`MySQL Connection Error: ${error.message}`);
    console.log('Ensure MySQL is running and MYSQL_* values in server/.env are correct');
  }

  return dbStatus;
};

const getPool = () => {
  if (!pool || !dbStatus.connected) {
    throw new Error(`Database is not connected: ${dbStatus.message}`);
  }

  return pool;
};

const query = async (sql, params = []) => {
  const [rows] = await getPool().execute(sql, params);
  return rows;
};

module.exports = { connectDB, dbStatus, getPool, query };
