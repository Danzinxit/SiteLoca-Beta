import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, Globe2 } from 'lucide-react';
import axios from 'axios';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  city: string | null;
  address: string | null;
  placeName: string | null;
  error: string | null;
  loading: boolean;
}

function App() {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    country: null,
    city: null,
    address: null,
    placeName: null,
    error: null,
    loading: false,
  });

  const [allLocations, setAllLocations] = useState<LocationState[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Função para salvar a localização no banco de dados
  const saveLocationToDatabase = async (locationData: LocationState) => {
    try {
      const response = await axios.post('http://localhost:5000/save-location', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        country: locationData.country,
        city: locationData.city,
        address: locationData.address,
        placeName: locationData.placeName,
      });
      console.log('Localização salva:', response.data);
    } catch (error) {
      console.error('Erro ao salvar a localização no banco de dados:', error);
    }
  };

  // Função para pegar detalhes da localização
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

  // Função para lidar com a detecção da localização
  const detectLocation = () => {
    setLocation((prev) => ({ ...prev, loading: true }));

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const details = await getLocationDetails(
            position.coords.latitude,
            position.coords.longitude
          );

          const newLocation = {
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
          saveLocationToDatabase(newLocation); // Salva a localização no banco de dados
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

  // Detectar localização na montagem do componente
  useEffect(() => {
    if (isLoggedIn) {
      detectLocation(); // Detecta a localização quando o componente é montado
    }
  }, [isLoggedIn]);

  // Função de login com usuário e senha (usando admin fixo)
  const handleLogin = () => {
    // Usuário e senha fixos para exemplo
    if (username === 'admin' && password === 'senha123') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Usuário ou senha inválidos');
    }
  };

  // Se o usuário não estiver logado, exibe a tela de login
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-6">Login</h2>
          <div className="flex flex-col space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuário
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {loginError && (
              <p className="text-sm text-red-600 mt-2 text-center">{loginError}</p>
            )}

            <button
              onClick={handleLogin}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none"
            >
              Entrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-indigo-100 p-3 rounded-full">
            <MapPin className="w-8 h-8 text-indigo-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Sua Localização</h1>

        <div className="space-y-6">
          {location.loading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              <p className="text-gray-600">Detectando sua localização...</p>
            </div>
          ) : location.error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-center">{location.error}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Globe2 className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">País</p>
                      <p className="font-medium text-gray-800">
                        {location.country || 'Carregando...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Cidade</p>
                      <p className="font-medium text-gray-800">
                        {location.city || 'Carregando...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Endereço</p>
                      <p className="font-medium text-gray-800">
                        {location.address || 'Carregando...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-sm text-gray-500">Nome do Local</p>
                      <p className="font-medium text-gray-800">
                        {location.placeName || 'Carregando...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Exibe outras informações da localização... */}
              </div>

              <h2 className="text-xl text-gray-800 mt-8">Outras Localizações:</h2>
              {allLocations.length > 0 ? (
                allLocations.map((loc, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 mt-2">
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
                  </div>
                ))
              ) : (
                <p className="text-gray-600">Nenhuma localização salva encontrada.</p>
              )}
            </>
          )}

          {/* Botão para limpar as informações */}
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setLocation({ latitude: null, longitude: null, country: null, city: null, address: null, placeName: null, error: null, loading: false })}
              className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
