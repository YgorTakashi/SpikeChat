"use client"
const RoomList = () => {
  return (
    <div className="flex flex-row justify-between items-center align-middle mb-4">
      <h2 className="text-lg font-semibold">Salas:</h2>
      <button
        className="create-room-button bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-all duration-200"
        onClick={() => alert('Criar nova sala (funcionalidade em breve)')}
        title="Criar nova sala"
      >
        + Nova Sala
      </button>
    </div>
  );
};

export default RoomList;
