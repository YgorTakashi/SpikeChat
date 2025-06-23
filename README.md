# 💬 SpikeChat - Sistema de Chat em Tempo Real

Um sistema de chat em tempo real que integra com a API REST do Rocket.Chat usando Socket.io e React.

## 🚀 Funcionalidades

- ✅ **Chat em tempo real** com Socket.io
- ✅ **Integração com Rocket.Chat API** 
- ✅ **Interface moderna** em React
- ✅ **Sincronização automática** de mensagens via polling
- ✅ **Suporte a anexos** e rich media
- ✅ **Design responsivo** para desktop e mobile

## 🏗️ Arquitetura

### Backend (Node.js + Socket.io)
- **Servidor Socket.io** na porta 3001
- **Polling automático** para novas mensagens do Rocket.Chat
- **API REST** para integração
- **Gerenciamento de salas** e usuários

### Frontend (React)
- **Interface de chat** moderna e responsiva
- **Conexão WebSocket** em tempo real
- **Exibição de anexos** e rich media
- **Notificações** de status de conexão

## 📋 Pré-requisitos

- Node.js 16+ 
- npm ou yarn
- Rocket.Chat API rodando em `http://localhost:3000`

## ⚙️ Configuração

### 1. Configurar variáveis de ambiente

Edite o arquivo `server/.env` com suas credenciais do Rocket.Chat:

```env
# Configurações do servidor
PORT=3001

# API Rocket.Chat
ROCKET_CHAT_URL=http://localhost:3000
ROCKET_CHAT_AUTH_TOKEN=pYFzBjF0Iw2iFSTwHiB2-8Xk8gXt9CVx12q7azKEXRl
ROCKET_CHAT_USER_ID=2S9cB7zj4J8GKXsK8

# Configurações do Chat
DEFAULT_ROOM_ID=GENERAL
POLLING_INTERVAL=2000
```

### 2. Instalar dependências

```bash
# Instalar todas as dependências
npm run install:all

# Ou instalar individualmente:
npm run server:install
npm run client:install
```

## 🚀 Como executar

### Modo desenvolvimento (recomendado)

```bash
# Executar servidor e cliente simultaneamente
npm run dev
```

### Executar separadamente

```bash
# Terminal 1 - Servidor
npm run server:dev

# Terminal 2 - Cliente  
npm run client:dev
```

O sistema estará disponível em:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 📡 API Endpoints

### GET `/api/health`
Verifica o status do servidor

### GET `/api/messages/:roomId?`
Busca mensagens de uma sala
- `roomId`: ID da sala (opcional, padrão: GENERAL)
- Query param `previous`: timestamp para buscar mensagens anteriores

### POST `/api/messages`
Envia uma nova mensagem
```json
{
  "message": "Texto da mensagem",
  "roomId": "GENERAL",
  "alias": "Nome do usuário",
  "emoji": ":smile:",
  "attachments": []
}
```

## 🔌 Socket.io Events

### Cliente → Servidor
- `join_room`: Entrar em uma sala
- `send_message`: Enviar mensagem
- `get_messages`: Buscar histórico

### Servidor → Cliente  
- `new_message`: Nova mensagem recebida
- `messages_history`: Histórico de mensagens
- `message_error`: Erro ao enviar mensagem

## 🎨 Interface

A interface inclui:
- **Header** com nome da sala e contador de mensagens
- **Status de conexão** visual
- **Lista de mensagens** com scroll automático
- **Suporte a anexos** (imagens, links, rich media)
- **Input de mensagem** com envio por Enter
- **Design responsivo** para mobile

## 🔧 Configuração avançada

### Personalizar polling interval
Altere `POLLING_INTERVAL` no arquivo `.env` (em millisegundos)

### Mudar sala padrão
Altere `DEFAULT_ROOM_ID` no arquivo `.env`

### CORS
O servidor está configurado para aceitar conexões de `http://localhost:3000`

## 🐛 Troubleshooting

### Erro de conexão Socket.io
- Verifique se o servidor está rodando na porta 3001
- Confirme se não há firewall bloqueando a conexão

### Mensagens não aparecem
- Verifique as credenciais do Rocket.Chat no `.env`
- Confirme se a API do Rocket.Chat está acessível
- Veja os logs do servidor para erros de polling

### Erro 401 na API
- Verifique se o `ROCKET_CHAT_AUTH_TOKEN` está correto
- Confirme se o `ROCKET_CHAT_USER_ID` é válido

## 📝 Logs

O servidor produz logs detalhados:
- Conexões Socket.io
- Polling de mensagens
- Erros de API
- Eventos de mensagens

## 🛠️ Desenvolvimento

### Estrutura do projeto
```
├── server/              # Backend Node.js
│   ├── index.js        # Servidor principal
│   ├── .env            # Variáveis de ambiente
│   └── package.json    
├── client/             # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatApp.js
│   │   ├── App.js
│   │   └── App.css
│   └── package.json
└── package.json        # Scripts principais
```

### Scripts disponíveis
- `npm run dev`: Desenvolvimento completo
- `npm run build`: Build para produção
- `npm start`: Produção
- `npm run install:all`: Instalar todas as dependências

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.
