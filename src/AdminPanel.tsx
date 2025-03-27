import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LocationFromDB {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  address: string;
  placeName: string;
  timestamp: string;
}

const AdminPanel = () => {
  const [locations, setLocations] = useState<LocationFromDB[]>([]);

  // Função para obter todas as localizações salvas
  const fetchLocationsFromDatabase = async () => {
    try {
      const response = await axios.get('https://site-loca-beta.vercel.app/locations');
      setLocations(response.data);
    } catch (error) {
      console.error('Erro ao buscar localizações salvas:', error);
    }
  };

  useEffect(() => {
    fetchLocationsFromDatabase(); // Carrega as localizações quando o componente for montado
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Administração de Localizações</h1>
      <p>Bem-vindo ao painel de administração. Aqui você pode ver todas as localizações salvas.</p>

      {/* Exibe as localizações salvas */}
      <div className="space-y-4">
        {locations.length > 0 ? (
          locations.map((loc, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <p>
                <strong>{loc.city || 'Cidade não disponível'}</strong>,{' '}
                {loc.country || 'País não disponível'}
              </p>
              <p>{loc.address || 'Endereço não disponível'}</p>
              <p>{loc.placeName || 'Nome do lugar não disponível'}</p>
              <p>
                {loc.latitude ? loc.latitude.toFixed(6) : 'Latitude não disponível'}°,
                {loc.longitude ? loc.longitude.toFixed(6) : 'Longitude não disponível'}°
              </p>
              <p>
                <small>{new Date(loc.timestamp).toLocaleString()}</small>
              </p>
            </div>
          ))
        ) : (
          <p>Sem localizações salvas ainda.</p>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
