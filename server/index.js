const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configurações da API Rocket.Chat
const ROCKET_CHAT_CONFIG = {
  baseURL: process.env.ROCKET_CHAT_URL,
  headers: {
    'x-Auth-Token': process.env.ROCKET_CHAT_AUTH_TOKEN,
    'x-User-Id': process.env.ROCKET_CHAT_USER_ID,
    'Content-Type': 'application/json'
  }
};

// Classe para gerenciar a integração com Rocket.Chat
class RocketChatService {
  constructor() {
    // Começar com timestamp atual para pegar apenas mensagens novas
    this.lastTimestamp = Date.now();
    this.isPolling = false;
    this.initialLoad = true;
  }
  // Buscar mensagens do Rocket.Chat
  async getMessages(roomId = process.env.DEFAULT_ROOM_ID, previous = null) {
    try {
      const url = `${ROCKET_CHAT_CONFIG.baseURL}/api/v1/chat.syncMessages`;
      const searchTimestamp = previous || (Date.now() - (24 * 60 * 60 * 1000)); // 24 horas atrás por padrão
      
      const params = {
        roomId,
        next: searchTimestamp,
        type: 'UPDATED'
      };
      console.log(searchTimestamp)
      console.log(`Buscando mensagens para sala ${roomId} desde ${new Date(parseInt(searchTimestamp))}`);

      const response = await axios.get(url, {
        headers: ROCKET_CHAT_CONFIG.headers,
        params
      });

      if (response.data.success && response.data.result.updated.length > 0) {
        console.log(`Encontradas ${response.data.result.updated.length} mensagens`);
        
        // Só atualizar o timestamp se não foi passado um valor específico
        if (!previous && response.data.result.cursor && response.data.result.cursor.next) {
          this.lastTimestamp = response.data.result.cursor.next;
        }
        
        return response.data.result.updated;
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error.response?.data || error.message);
      return [];
    }
  }
  // Enviar mensagem para o Rocket.Chat
  async sendMessage(messageData) {
    try {
      const url = `${ROCKET_CHAT_CONFIG.baseURL}/api/v1/chat.sendMessage`;
      
      const message = {
        rid: messageData.roomId || process.env.DEFAULT_ROOM_ID,
        msg: messageData.message
      };

      // Adicionar campos opcionais apenas se fornecidos e válidos
      if (messageData.alias) {
        message.alias = messageData.alias;
      }
      
      if (messageData.emoji) {
        message.emoji = messageData.emoji;
      }
      
      if (messageData.avatar && messageData.avatar.startsWith('http')) {
        message.avatar = messageData.avatar;
      }
      
      if (messageData.attachments && Array.isArray(messageData.attachments)) {
        message.attachments = messageData.attachments.filter(att => {
          // Filtrar anexos com URLs inválidas
          if (att.title_link && !att.title_link.startsWith('http')) {
            delete att.title_link;
          }
          if (att.image_url && !att.image_url.startsWith('http')) {
            delete att.image_url;
          }
          return true;
        });
      }

      const response = await axios.post(url, {
        message
      }, {
        headers: ROCKET_CHAT_CONFIG.headers
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error.response?.data || error.message);
      throw error;
    }
  }

  // Registrar usuário no Rocket.Chat
  async registerUser(username, name, email, password) {
    try {
      const url = `${ROCKET_CHAT_CONFIG.baseURL}/api/v1/users.create`;
      const response = await axios.post(
          url, 
          {
            username,
            name,
            email,
            password,
          }, 
          {
            headers: ROCKET_CHAT_CONFIG.headers
          }
        )

      console.log('Response success:', response.data.success);
      console.log(`Usuário ${username} registrado com sucesso`);
      return response;
    } catch (error) {
      console.error('Erro ao registrar usuário: ', error.response?.data || error.message);
      throw error;
      
    }
  }

  async loginUser(username, password) {
    try {
      const url = `${ROCKET_CHAT_CONFIG.baseURL}/api/v1/login`;

      if (!username || !password) {
        throw new Error('Username e password são obrigatórios para login');
      }

      const response = await axios.post(url, {
            email: username,
            password
          },
        );

      console.log(`Usuário ${username} logado com sucesso`);
      return response;
    } catch (error) {
      console.error('Erro ao fazer login:', error.response?.data || error.message);
      throw error;
    }
  }

  // Iniciar polling para novas mensagens
  startPolling(io) {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('Iniciando polling para novas mensagens...');    const poll = async () => {
      try {
        const messages = await this.getMessages();
        
        if (messages.length > 0) {
          console.log(`Encontradas ${messages.length} novas mensagens`);
          
          // Emitir mensagens para todos os clientes conectados
          messages.forEach(message => {
            io.emit('new_message', this.formatMessage(message));
          });
          
          // Atualizar timestamp apenas se não for o carregamento inicial
          if (!this.initialLoad) {
            const latestMessage = messages[messages.length - 1];
            if (latestMessage._updatedAt) {
              this.lastTimestamp = new Date(latestMessage._updatedAt).getTime();
            }
          } else {
            // Após o primeiro carregamento, usar timestamp atual
            this.initialLoad = false;
            this.lastTimestamp = Date.now();
          }
        }
      } catch (error) {
        console.error('Erro no polling:', error.message);
      }

      // Agendar próximo polling
      setTimeout(poll, parseInt(process.env.POLLING_INTERVAL) || 2000);
    };

    poll();
  }

  // Formatar mensagem para o frontend
  formatMessage(message) {
    return {
      id: message._id,
      text: message.msg,
      user: {
        id: message.u._id,
        username: message.u.username,
        name: message.u.name
      },
      timestamp: message.ts,
      roomId: message.rid,
      attachments: message.attachments || [],
      alias: message.alias || '',
      type: message.t || 'message'
    };
  }
}

const rocketChatService = new RocketChatService();

// Rotas da API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/messages/:roomId?', async (req, res) => {
  try {
    const roomId = req.params.roomId || process.env.DEFAULT_ROOM_ID;
    const previous = req.query.previous;
    
    // Se não há previous, buscar mensagens das últimas 24 horas
    const searchTimestamp = previous || (Date.now() - (24 * 60 * 60 * 1000));
    
    const messages = await rocketChatService.getMessages(roomId, searchTimestamp);
    const formattedMessages = messages.map(msg => rocketChatService.formatMessage(msg));
    
    res.json({
      success: true,
      messages: formattedMessages,
      count: formattedMessages.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { message, roomId, alias, emoji, avatar, attachments } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

    const result = await rocketChatService.sendMessage({
      message,
      roomId,
      alias,
      emoji,
      avatar,
      attachments
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }
    const user = await rocketChatService.registerUser(
      username,
      name,
      email,
      password
    )

    if(!user) {
      return res.status(400).json({
        success: false,
        error: 'Erro ao registrar usuário'
      });
    }


    const dataTokens = await rocketChatService.loginUser(username, password);
    if (!dataTokens) {
      return res.status(400).json({
        success: false,
        error: 'Erro ao fazer login após registro, tente fazer login manualmente'
      });
    }
    console.log(dataTokens)

    res.json({
      success: true,
      data: {
        authToken:dataTokens.data.data.authToken,
        userId: dataTokens.data.data.userId,
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
    
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, email,password } = req.body;
    console.log(req.body)
    if ((!username && !email) || !password) {
      throw new Error('E-mail e password são obrigatórios para login');
    }
    const dataTokens = await rocketChatService.loginUser(username ?? email, password);
    if (!dataTokens) {
      return res.status(400).json({
        success: false,
        error: 'Erro ao fazer login, verifique suas credenciais'
      });
    }

    console.log(dataTokens.data.data)
    res.json({
      success: true,
      data: {
        authToken: dataTokens.data.data.authToken,
        userId: dataTokens.data.data.userId,
      }
    });
  } catch (error) {
    console.error('Erro no login:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


// Gerenciamento de conexões Socket.IO
io.on('connection', (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  // Entrar em uma sala específica
  socket.on('join_room', (roomId) => {
    socket.join(roomId || process.env.DEFAULT_ROOM_ID);
    console.log(`Cliente ${socket.id} entrou na sala: ${roomId}`);
  });

  // Enviar mensagem via socket
  socket.on('send_message', async (data) => {
    try {
      console.log('Mensagem recebida via socket:', data);
      
      // Enviar para o Rocket.Chat
      await rocketChatService.sendMessage(data);
      
      // A mensagem será propagada via polling automático
      console.log('Mensagem enviada para Rocket.Chat');
    } catch (error) {
      console.error('Erro ao enviar mensagem via socket:', error.message);
      socket.emit('message_error', { error: error.message });
    }
  });

  // Buscar histórico de mensagens
  socket.on('get_messages', async (data) => {
    try {
      const { roomId, previous } = data;
      const messages = await rocketChatService.getMessages(roomId, previous);
      const formattedMessages = messages.map(msg => rocketChatService.formatMessage(msg));
      
      socket.emit('messages_history', {
        messages: formattedMessages,
        roomId: roomId || process.env.DEFAULT_ROOM_ID
      });
    } catch (error) {
      console.error('Erro ao buscar histórico:', error.message);
      socket.emit('messages_error', { error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Iniciar o polling quando o servidor iniciar
rocketChatService.startPolling(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Servidor SpikeChat rodando na porta ${PORT}`);
  console.log(`📡 Socket.IO configurado para CORS com origem: http://localhost:3000`);
  console.log(`🔄 Polling ativo para Rocket.Chat API: ${process.env.ROCKET_CHAT_URL}`);
});

module.exports = { app, server, io };
