const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Criando ou abrindo banco de dados SQLite
const db = new sqlite3.Database('./locations.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

// Criação da tabela de localizações se não existir
db.run(`CREATE TABLE IF NOT EXISTS locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  latitude REAL,
  longitude REAL,
  country TEXT,
  city TEXT,
  address TEXT,
  placeName TEXT,
  timestamp TEXT,
  deviceInfo TEXT
)`);

// Endpoint para salvar localização
app.post("/save-location", (req, res) => {
  const { latitude, longitude, country, city, address, placeName, deviceInfo } = req.body;
  const timestamp = new Date().toISOString();

  const query = `INSERT INTO locations (latitude, longitude, country, city, address, placeName, timestamp, deviceInfo) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.run(query, [latitude, longitude, country, city, address, placeName, timestamp, deviceInfo], function (err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao salvar a localização' });
    }
    res.status(200).json({ message: 'Localização salva com sucesso!' });
  });
});

// Endpoint para obter todas as localizações
app.get("/locations", (req, res) => {
  const query = "SELECT * FROM locations ORDER BY timestamp DESC";
  
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ message: 'Erro ao buscar localizações' });
    }
    res.status(200).json(rows);
  });
});

// Endpoint para limpar todas as localizações
app.delete("/locations", (req, res) => {
  const query = "DELETE FROM locations";

  db.run(query, function (err) {
    if (err) {
      return res.status(500).json({ message: 'Erro ao limpar localizações' });
    }
    res.status(200).json({ message: 'Todas as localizações foram limpas!' });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
