const sqlite3 = require('sqlite3').verbose();

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('./locations.db', (err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.message);
  } else {
    console.log("Conectado ao banco de dados SQLite");
  }
});

// Criar a tabela de localizações (caso ainda não exista)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      latitude REAL,
      longitude REAL,
      country TEXT,
      city TEXT,
      address TEXT,
      placeName TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
