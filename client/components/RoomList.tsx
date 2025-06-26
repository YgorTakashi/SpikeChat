
"use client"
import { useEffect, useState } from "react";
import { Room } from "../types/chat";

const RoomList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);

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
      }
    }
    fetchRooms();
  }, []);

  return (
    <>
      <div className="flex flex-row justify-between items-center align-middle mb-4">
        <h2 className="text-lg font-semibold">Salas:</h2>
        <button
          className="create-room-button bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-200"
          onClick={() => setIsModalOpen(true)}
          title="Criar nova sala"
        >
          + Nova Sala
        </button>
      </div>
      <div className="room-list bg-gray-100 p-4 rounded shadow-md">
        {rooms.length > 0 ? (
          <ul className="list-disc pl-5">
            {rooms.map((room) => (
              <li key={room._id} className="mb-2">
                <span className="font-medium">{room.name}</span>
                <span className="text-sm text-gray-600 ml-2">
                  ({room.usersCount} usuário{room.usersCount !== 1 ? 's' : ''})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Nenhuma sala disponível.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[300px]">
            <h3 className="text-lg font-semibold mb-4">Criar Nova Sala</h3>
            {/* Adicione aqui o formulário ou conteúdo do modal */}
            <button
              className="mt-4 bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              onClick={() => setIsModalOpen(false)}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RoomList;
