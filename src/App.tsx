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

interface LocationFromDB {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  address: string;
  placeName: string;
  timestamp: string;
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

  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showLogin, setShowLogin] = useState<boolean>(false); // Controla a exibição do formulário de login
  const [locations, setLocations] = useState<LocationFromDB[]>([]);

  // Função para salvar a localização no banco de dados
  const saveLocationToDatabase = async (locationData: LocationState) => {
    try {
      const response = await axios.post('https://site-loca-beta.vercel.app/save-location', {
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
          saveLocationToDatabase(newLocation); // Salva a localização no backend
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
    detectLocation(); // Detecta a localização sempre que o componente for montado
    if (isAdmin) {
      fetchLocationsFromDatabase(); // Se for admin, busca as localizações salvas no banco
    }
  }, [isAdmin]);

  // Função de login do admin
  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (username === 'admin' && password === 'senha123') {
      setIsAdmin(true); // Definindo que o usuário é admin
      setShowLogin(false); // Esconde o formulário de login após o login com sucesso
    } else {
      alert('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        {/* Exibe o botão de login se o usuário não estiver logado */}
        {!isAdmin && !showLogin && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setShowLogin(true)} // Exibe o formulário de login ao clicar
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Fazer Login
            </button>
          </div>
        )}

        {/* Formulário de Login */}
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
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Entrar
                </button>
              </div>
            </form>
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowLogin(false)} // Fecha o formulário de login sem logar
                className="text-blue-600 hover:text-blue-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Página de localização - Acesso público */}
        {!showLogin && !isAdmin && (
          <>
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
                          <p className="text-sm text-gray-500">Nome do Local</p>
                          <p className="font-medium text-gray-800">
                            {location.placeName || 'Carregando...'}
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
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Página Admin - Após login */}
        {isAdmin && (
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
        )}
      </div>
    </div>
  );
}

export default App;
