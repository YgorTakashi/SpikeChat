
"use client"
import { useEffect, useState } from "react";
import { Room, User } from "../types/chat";
import { useRoom } from "../contexts/RoomContext";

const RoomList = () => {
  const { currentRoomId, setCurrentRoom } = useRoom();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newRoomName, setNewRoomName] = useState<string>('');

  useEffect(() => {
    // Simulação de carregamento de salas
    const fetchRooms = async () => {
      try {
        // Simulando uma chamada de API para buscar salas
        const response = await fetch('http://localhost:3001/api/list-rooms'); // Ajuste a URL conforme necessário
        if (!response.ok) {
          throw new Error('Erro ao buscar salas');
        }
        const data = await response.json();
        setRooms(data.rooms || []); // Supondo que a resposta tenha um campo 'rooms'
      } catch (error) {
        console.error('Erro ao carregar salas:', error);
        // Em caso de erro, vamos mostrar algumas salas mockadas
        setRooms([
          {
            _id: 'GENERAL',
            name: 'general',
            usersCount: 1,
            ts: new Date().toISOString(),
            t: 'c',
            usernames: [],
            msgs: 0,
            _updatedAt: new Date().toISOString(),
            u: { _id: 'system', username: 'system', name: 'System' },
            default: true
          }
        ]);
      }
    }
    fetchRooms();
  }, []);

  useEffect(() => {
    // Se o modal estiver aberto, faz uma busca de usuários para selecionar e começar uma dm
    if (isModalOpen) {
      const fetchUsers = async () => {
        try {
          // Simulando uma chamada de API para buscar usuários
          const response = await fetch('http://localhost:3001/api/list-users'); // Ajuste a URL conforme necessário
          if (!response.ok) {
            throw new Error('Erro ao buscar usuários');
          }
          const data = await response.json();
          setUsers(data.users || []);
          console.log('Usuários carregados:', data.users);
        } catch (error) {
          console.error('Erro ao carregar usuários:', error);
        }
      };
      fetchUsers();
    }
  }, [isModalOpen]);

  const handleRoomSelect = (room: Room) => {
    setCurrentRoom(room._id, room.name);
  };

  const handleUserSelect = (user: User) => {
    // Criar ou entrar em uma sala de DM com o usuário selecionado
    // O ID da sala de DM geralmente é uma combinação dos IDs dos usuários
    const dmRoomId = `dm-${user._id}`;
    setCurrentRoom(dmRoomId, `DM com ${user.name}`);
    setIsModalOpen(false);
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    
    try {
      // Aqui você faria a chamada para criar a sala
      const response = await fetch('http://localhost:3001/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newRoomName.trim() }),
      });
      
      if (response.ok) {
        const newRoom = await response.json();
        setRooms(prev => [...prev, newRoom]);
        setNewRoomName('');
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Erro ao criar sala:', error);
    }
  };

  return (
    <>
      <div className="flex flex-row justify-between items-center align-middle mb-4">
        <h2 className="text-lg font-semibold">Salas:</h2>
        <button
          className="create-room-button bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-200"
          onClick={() => setIsModalOpen(true)}
          title="Nova conversa"
        >
          + Nova Conversa
        </button>
      </div>
      <div className="room-list bg-gray-100 p-4 rounded shadow-md">
        {rooms.length > 0 ? (
          <ul className="space-y-2">
            {rooms.map((room) => (
              <li 
                key={room._id} 
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 border ${
                  currentRoomId === room._id 
                    ? 'bg-blue-100 border-blue-300 shadow-md' 
                    : 'bg-white border-gray-200 hover:border-blue-200'
                }`}
                onClick={() => handleRoomSelect(room)}
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">{room.name}</span>
                  <span className="text-xs text-gray-600">
                    {room.usersCount} usuário{room.usersCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma sala disponível.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[400px] max-h-[500px] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Nova Conversa</h3>
            
            {/* Criar nova sala */}
            <div className="mb-6">
              <h4 className="text-md font-medium mb-2">Criar Nova Sala</h4>
              <input
                type="text"
                placeholder="Nome da sala"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRoom();
                  }
                }}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
                onClick={handleCreateRoom}
                disabled={!newRoomName.trim()}
              >
                Criar Sala
              </button>
            </div>

            {/* Selecionar usuário para DM */}
            <div className="mb-4">
              <h4 className="text-md font-medium mb-2">Iniciar Mensagem Direta</h4>
              {users.length > 0 ? (
                <ul className="space-y-2 max-h-[200px] overflow-y-auto">
                  {users.map((user) => (
                    <li 
                      key={user._id}
                      className="p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-50 border border-gray-200 hover:border-blue-200"
                      onClick={() => handleUserSelect(user)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-800">{user.name}</span>
                        <span className="text-xs text-gray-600">@{user.username}</span>
                        <span className={`text-xs ${user.status === 'online' ? 'text-green-600' : 'text-gray-500'}`}>
                          {user.status === 'online' ? '🟢 Online' : '⚫ Offline'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Carregando usuários...</p>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => {
                  setIsModalOpen(false);
                  setNewRoomName('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomList;
