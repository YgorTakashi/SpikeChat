# 🧪 Testes da API SpikeChat

## Testando com curl

### 1. Verificar status do servidor
```bash
curl http://localhost:3001/api/health
```

### 2. Buscar mensagens
```bash
curl http://localhost:3001/api/messages/GENERAL
```

### 3. Enviar mensagem
```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from SpikeChat API!",
    "roomId": "GENERAL",
    "alias": "Test User",
    "emoji": ":rocket:"
  }'
```

### 4. Enviar mensagem com anexos
```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Check out this cool attachment!",
    "roomId": "GENERAL",
    "alias": "SpikeChat Bot",
    "emoji": ":attachment:",
    "attachments": [
      {
        "color": "#764FA5",
        "title": "SpikeChat Test",
        "text": "This is a test attachment from SpikeChat API",
        "title_link": "https://github.com"
      }
    ]
  }'
```

## Testando com Postman

### Coleção Postman

Importe esta coleção no Postman:

```json
{
  "info": {
    "name": "SpikeChat API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/health",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "health"]
        }
      }
    },
    {
      "name": "Get Messages",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:3001/api/messages/GENERAL",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "messages", "GENERAL"]
        }
      }
    },
    {
      "name": "Send Message",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"message\": \"Hello from Postman!\",\n  \"roomId\": \"GENERAL\",\n  \"alias\": \"Postman User\",\n  \"emoji\": \": memo:\"\n}"
        },
        "url": {
          "raw": "http://localhost:3001/api/messages",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3001",
          "path": ["api", "messages"]
        }
      }
    }
  ]
}
```

## Testando Socket.io

### Cliente Node.js simples

```javascript
const io = require('socket.io-client');

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to SpikeChat server');
  
  // Entrar na sala
  socket.emit('join_room', 'GENERAL');
  
  // Buscar mensagens
  socket.emit('get_messages', { roomId: 'GENERAL' });
  
  // Enviar mensagem
  socket.emit('send_message', {
    message: 'Hello from Socket.io client!',
    roomId: 'GENERAL',
    alias: 'Socket Test User'
  });
});

socket.on('new_message', (message) => {
  console.log('New message:', message);
});

socket.on('messages_history', (data) => {
  console.log('Messages history:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
```

## Monitoramento

### Logs do servidor
Os logs incluem:
- Conexões Socket.io
- Polling de mensagens
- Erros de API
- Status de envio de mensagens

### Debug no navegador
No console do navegador:
```javascript
// Verificar conexão Socket.io
window.io = io; // Se disponível globalmente

// Logs detalhados
localStorage.debug = 'socket.io-client:*';
```

## Solução de problemas

### Erro 500 na API
- Verifique se o Rocket.Chat está rodando
- Confirme as credenciais no arquivo .env

### Socket.io não conecta
- Verifique se o servidor está na porta 3001
- Confirme se não há bloqueio de CORS

### Mensagens não aparecem
- Verifique se o polling está ativo (logs do servidor)
- Confirme se a sala existe no Rocket.Chat
