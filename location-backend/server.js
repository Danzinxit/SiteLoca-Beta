// Backend - server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Banco de dados simulado
let locationData = [];

// Endpoint para salvar localização
app.post("/save-location", (req, res) => {
  const { latitude, longitude, country, city, address, placeName } = req.body;

  // Salva os dados de localização
  locationData.push({
    latitude,
    longitude,
    country,
    city,
    address,
    placeName,
    timestamp: new Date().toISOString()
  });

  res.status(200).json({ message: "Localização salva com sucesso!" });
});

// Endpoint para obter todas as localizações
app.get("/locations", (req, res) => {
  res.status(200).json(locationData);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
