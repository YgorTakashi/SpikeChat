import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import moment from 'moment';
import { JitsiMeeting } from '@jitsi/react-sdk';

const SOCKET_SERVER_URL = 'http://localhost:3001';

const ChatApp = () => {
  // Estados do componente
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomId] = useState('GENERAL');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para chamada de vídeo
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [meetingRoomName, setMeetingRoomName] = useState('');
  
  // Referências
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll automático para a última mensagem
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Configuração do Socket.IO
  useEffect(() => {
    console.log('Conectando ao servidor Socket.IO...');
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    // Event listeners do socket
    newSocket.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO');
      setConnected(true);
      setError('');
      
      // Entrar na sala
      newSocket.emit('join_room', roomId);
      
      // Buscar histórico de mensagens
      newSocket.emit('get_messages', { roomId });
    });    newSocket.on('disconnect', () => {
      console.log('Desconectado do servidor Socket.IO');
      setConnected(false);
    });

    newSocket.on('new_message', (message) => {
      console.log('Nova mensagem recebida:', message);
      setMessages(prev => {
        // Evitar mensagens duplicadas
        const exists = prev.some(msg => msg.id === message.id);
        if (exists) {
          console.log('Mensagem duplicada ignorada:', message.id);
          return prev;
        }
        
        console.log('Adicionando nova mensagem:', message.text);
        return [...prev, message].sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
      });
    });

    newSocket.on('messages_history', (data) => {
      console.log('Histórico de mensagens recebido:', data);
      setMessages(data.messages.sort((a, b) => 
        new Date(a.timestamp) - new Date(b.timestamp)
      ));
    });

    newSocket.on('message_error', (data) => {
      console.error('Erro ao enviar mensagem:', data.error);
      setError(data.error);
    });

    newSocket.on('messages_error', (data) => {
      console.error('Erro ao buscar mensagens:', data.error);
      setError(data.error);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Erro de conexão:', error);
      setError('Erro ao conectar com o servidor');
      setConnected(false);
    });

    // Event listeners para chamadas de vídeo
    newSocket.on('video_call_started', (data) => {
      console.log('Chamada de vídeo iniciada por outro usuário:', data);
      const callMessage = {
        id: `call-notification-${Date.now()}`,
        text: `📹 ${data.username || 'Alguém'} iniciou uma chamada de vídeo. Sala: ${data.meetingRoom}`,
        user: { name: 'Sistema', username: 'system' },
        timestamp: data.timestamp,
        type: 'video_call_notification'
      };
      setMessages(prev => [...prev, callMessage]);
    });

    newSocket.on('video_call_ended', (data) => {
      console.log('Chamada de vídeo encerrada:', data);
      const endCallMessage = {
        id: `call-end-notification-${Date.now()}`,
        text: `📹 Chamada de vídeo encerrada`,
        user: { name: 'Sistema', username: 'system' },
        timestamp: data.timestamp,
        type: 'video_call_end_notification'
      };
      setMessages(prev => [...prev, endCallMessage]);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('Desconectando do Socket.IO...');
      newSocket.close();
    };
  }, [roomId]);

  // Função para enviar mensagem
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !connected) return;

    setLoading(true);
    setError('');    try {
      // Enviar via Socket.IO
      if (socket) {
        socket.emit('send_message', {
          message: newMessage.trim(),
          roomId: roomId
        });
      }

      // Limpar input
      setNewMessage('');
      inputRef.current?.focus();
      
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar tempo
  const formatTime = (timestamp) => {
    return moment(timestamp).format('HH:mm');
  };

  // Funções para controlar chamada de vídeo
  const startVideoCall = () => {
    const roomName = `spikechat-${roomId}-${Date.now()}`;
    setMeetingRoomName(roomName);
    setIsVideoCallActive(true);
    
    // Notificar outros usuários sobre a chamada
    if (socket) {
      socket.emit('video_call_started', {
        roomId: roomId,
        meetingRoom: roomName,
        timestamp: new Date().toISOString()
      });
    }
    
    // Adicionar mensagem informativa no chat
    const callMessage = {
      id: `call-${Date.now()}`,
      text: `📹 Chamada de vídeo iniciada. Sala: ${roomName}`,
      user: { name: 'Sistema', username: 'system' },
      timestamp: new Date().toISOString(),
      type: 'video_call_start'
    };
    
    setMessages(prev => [...prev, callMessage]);
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
    
    // Notificar outros usuários sobre o fim da chamada
    if (socket) {
      socket.emit('video_call_ended', {
        roomId: roomId,
        meetingRoom: meetingRoomName,
        timestamp: new Date().toISOString()
      });
    }
    
    // Adicionar mensagem informativa no chat
    const endCallMessage = {
      id: `call-end-${Date.now()}`,
      text: `📹 Chamada de vídeo encerrada`,
      user: { name: 'Sistema', username: 'system' },
      timestamp: new Date().toISOString(),
      type: 'video_call_end'
    };
    
    setMessages(prev => [...prev, endCallMessage]);
    setMeetingRoomName('');
  };

  // Função para renderizar anexos
  const renderAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="message-attachments">
        {attachments.map((attachment, index) => (
          <div key={index} className="attachment" style={{ borderColor: attachment.color }}>
            {attachment.title && (
              <div className="attachment-title">
                {attachment.title_link ? (
                  <a href={attachment.title_link} target="_blank" rel="noopener noreferrer">
                    {attachment.title}
                  </a>
                ) : (
                  attachment.title
                )}
              </div>
            )}
            {attachment.text && (
              <div className="attachment-text">{attachment.text}</div>
            )}
            {attachment.image_url && (
              <img 
                src={attachment.image_url} 
                alt="Attachment" 
                style={{ maxWidth: '100%', marginTop: '8px', borderRadius: '4px' }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Função para determinar se a mensagem é própria
  const isOwnMessage = (message) => {
    // Por simplicidade, vamos considerar mensagens do tipo 'message' como de outros usuários
    // e mensagens enviadas via nossa interface como próprias
    return false; // Todas as mensagens serão exibidas como de outros usuários por enquanto
  };

  // Renderização do status de conexão
  const renderConnectionStatus = () => {
    if (connected) {
      return <div className="connection-status connected">✅ Conectado</div>;
    } else {
      return <div className="connection-status disconnected">❌ Desconectado</div>;
    }
  };
  return (
    <div className="chat-app">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <h1>💬 SpikeChat</h1>
          <div className="chat-status">
            Sala: {roomId} • {messages.length} mensagens
          </div>
        </div>
        
        <div className="header-right">
          <button
            className={`video-call-button ${isVideoCallActive ? 'active' : ''}`}
            onClick={isVideoCallActive ? endVideoCall : startVideoCall}
            disabled={!connected}
            title={isVideoCallActive ? 'Encerrar chamada de vídeo' : 'Iniciar chamada de vídeo'}
          >
            {isVideoCallActive ? '📹 Encerrar Chamada' : '📹 Chamada de Vídeo'}
          </button>
        </div>
      </div>

      {/* Status de conexão */}
      {renderConnectionStatus()}

      {/* Mensagens de erro */}
      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* Lista de mensagens */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', padding: '40px 20px' }}>
            <p>🚀 Bem-vindo ao SpikeChat!</p>
            <p>Comece uma conversa enviando uma mensagem.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${isOwnMessage(message) ? 'own' : 'other'}`}
              data-type={message.type}
            >
              <div className="message-header">
                <span className="message-user">
                  {message.user.name || message.user.username}
                </span>
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
              
              {message.text && (
                <div className="message-text">{message.text}</div>
              )}
              
              {renderAttachments(message.attachments)}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Modal de Chamada de Vídeo */}
      {isVideoCallActive && (
        <div className="video-call-modal">
          <div className="video-call-container">
            <div className="video-call-header">
              <h3>📹 Chamada de Vídeo - Sala: {meetingRoomName}</h3>
              <button 
                className="close-video-call"
                onClick={endVideoCall}
                title="Fechar chamada de vídeo"
              >
                ✕
              </button>
            </div>
            
            <div className="jitsi-container">
              <JitsiMeeting
                domain="meet.jit.si"
                roomName={meetingRoomName}
                configOverwrite={{
                  startWithAudioMuted: false,
                  startWithVideoMuted: false,
                  disableModeratorIndicator: true,
                  enableEmailInStats: false,
                  toolbarButtons: [
                    'microphone', 'camera', 'hangup',
                    'settings', 'filmstrip', 'invite',
                    'chat', 'screen'
                  ]
                }}
                interfaceConfigOverwrite={{
                  DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                  TOOLBAR_BUTTONS: [
                    'microphone', 'camera', 'hangup',
                    'settings', 'filmstrip', 'invite',
                    'chat', 'screen'
                  ]
                }}
                userInfo={{
                  displayName: `Usuário-${roomId}`,
                }}
                onApiReady={(externalApi) => {
                  console.log('Jitsi API pronta:', externalApi);
                }}
                onReadyToClose={() => {
                  console.log('Jitsi pronto para fechar');
                  endVideoCall();
                }}
                getIFrameRef={(iframeRef) => {
                  iframeRef.style.height = '400px';
                  iframeRef.style.width = '100%';
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Input de mensagem */}
      <div className="chat-input-container">
        <form onSubmit={sendMessage} className="chat-input-form">
          <textarea
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={connected ? "Digite sua mensagem..." : "Conectando..."}
            className="chat-input"
            disabled={!connected || loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!connected || loading || !newMessage.trim()}
            title="Enviar mensagem (Enter)"
          >
            {loading ? '⏳' : '🚀'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatApp;
