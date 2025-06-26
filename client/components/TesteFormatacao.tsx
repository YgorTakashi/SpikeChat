import React,{useState}from'react';

// Este arquivo está propositalmente mal formatado
// Salve o arquivo e veja a formatação automática acontecer!

const TesteFormatacao=()=>{
const[contador,setContador]=useState(0);
const[nome,setNome]=useState('');

const incrementar=()=>{
setContador(contador+1);
};

const decrementar=()=>{
if(contador>0){
setContador(contador-1);
}
};

return(
<div className="p-4 bg-gray-100 min-h-screen">
<div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
<h1 className="text-2xl font-bold mb-4">Teste de Formatação</h1>

<div className="mb-4">
<label className="block text-sm font-medium text-gray-700 mb-2">
Nome:
</label>
<input
type="text"
value={nome}
onChange={(e)=>setNome(e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="Digite seu nome"
/>
</div>

<div className="mb-4">
<p className="text-lg">Contador: {contador}</p>
<div className="flex gap-2 mt-2">
<button
onClick={incrementar}
className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
>
+
</button>
<button
onClick={decrementar}
className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
>
-
</button>
</div>
</div>

{nome&&<p className="text-green-600">Olá, {nome}!</p>}
</div>
</div>
);
};

export default TesteFormatacao;
