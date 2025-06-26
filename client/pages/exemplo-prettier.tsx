import React from 'react';

// Este arquivo será automaticamente formatado pelo Prettier ao salvar
const ExemploPrettier: React.FC = () => {
  // Código propositalmente mal formatado para demonstrar o Prettier
  const dados=[1,2,3,4,5];
  const objeto={nome:'Teste',idade:25,ativo:true};

  const funcaoMalFormatada=(param:string)=>{
  if(param==='teste'){return 'Sucesso';}
  else{return 'Falha';}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🎨 Prettier Funcionando
        </h1>
        
        <div className="space-y-3">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded">
            ✅ Formatação automática ativa
          </div>
          
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded">
            📝 Código padronizado
          </div>
          
          <div className="bg-purple-100 border border-purple-400 text-purple-700 px-4 py-2 rounded">
            🚀 Salve e veja a mágica!
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm text-gray-600">
            Dados: {dados.join(', ')}
          </p>
          <p className="text-sm text-gray-600">
            Nome: {objeto.nome}
          </p>
          <p className="text-sm text-gray-600">
            Resultado: {funcaoMalFormatada('teste')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExemploPrettier;
