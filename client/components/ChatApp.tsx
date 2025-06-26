import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import io, { Socket } from 'socket.io-client';
import moment from 'moment';
import { useAuth } from '../contexts/AuthContext';
import { useRoom } from '../contexts/RoomContext';
import { Message, VideoCallData } from '../types/chat';
import RoomList from './RoomList';

// Importação dinâmica do JitsiMeeting para evitar problemas de SSR
const JitsiMeeting = dynamic(
  () => import('@jitsi/react-sdk').then(mod => mod.JitsiMeeting),
  { ssr: false }
);

const SOCKET_SERVER_URL = 'http://localhost:3001';

const ChatApp: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentRoomId, currentRoomName } = useRoom();
  const router = useRouter();

  // Estados do componente
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Estados para chamada de vídeo
  const [isVideoCallActive, setIsVideoCallActive] = useState<boolean>(false);
  const [meetingRoomName, setMeetingRoomName] = useState<string>('');

  // Referências
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Verificar se o componente está montado
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll automático para a última mensagem
  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Configuração do Socket.IO
  useEffect(() => {
    if (!currentRoomId) {
      console.log('Nenhuma sala selecionada');
      setConnected(false);
      setMessages([]);
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }
    
    console.log('Conectando ao servidor Socket.IO...');
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
    });

    // Event listeners do socket
    newSocket.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO');
      setConnected(true);
      setError('');

      // Entrar na sala
      newSocket.emit('join_room', currentRoomId);

      // Buscar histórico de mensagens
      newSocket.emit('get_messages', { roomId: currentRoomId });
    });

    newSocket.on('disconnect', () => {
      console.log('Desconectado do servidor Socket.IO');
      setConnected(false);
    });

    newSocket.on('new_message', (message: Message) => {
      console.log('Nova mensagem recebida:', message);
      setMessages((prev: Message[]) => {
        // Evitar mensagens duplicadas
        const exists = prev.some((msg: Message) => msg.id === message.id);
        if (exists) {
          console.log('Mensagem duplicada ignorada:', message.id);
          return prev;
        }

        console.log('Adicionando nova mensagem:', message.text);
        return [...prev, message].sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    });

    newSocket.on('messages_history', (data: { messages: Message[] }) => {
      console.log('Histórico de mensagens recebido:', data);
      setMessages(
        data.messages.sort(
          (a, b) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        )
      );
    });

    newSocket.on('message_error', (data: { error: string }) => {
      console.error('Erro ao enviar mensagem:', data.error);
      setError(data.error);
    });

    newSocket.on('messages_error', (data: { error: string }) => {
      console.error('Erro ao buscar mensagens:', data.error);
      setError(data.error);
    });

    newSocket.on('connect_error', (error: Error) => {
      console.error('Erro de conexão:', error);
      setError('Erro ao conectar com o servidor');
      setConnected(false);
    });

    // Event listeners para chamadas de vídeo
    newSocket.on('video_call_started', (data: VideoCallData) => {
      console.log('Chamada de vídeo iniciada por outro usuário:', data);
      const callMessage: Message = {
        id: `call-notification-${Date.now()}`,
        text: `📹 ${data.username || 'Alguém'} iniciou uma chamada de vídeo. Sala: ${data.meetingRoom}`,
        user: { name: 'Sistema', username: 'system' },
        timestamp: data.timestamp,
        type: 'video_call_notification',
      };
      setMessages((prev: Message[]) => [...prev, callMessage]);
    });

    newSocket.on('video_call_ended', (data: VideoCallData) => {
      console.log('Chamada de vídeo encerrada:', data);
      const endCallMessage: Message = {
        id: `call-end-notification-${Date.now()}`,
        text: `📹 Chamada de vídeo encerrada`,
        user: { name: 'Sistema', username: 'system' },
        timestamp: data.timestamp,
        type: 'video_call_end_notification',
      };
      setMessages((prev: Message[]) => [...prev, endCallMessage]);
    });

    setSocket(newSocket);

    // Cleanup
    return () => {
      console.log('Desconectando do Socket.IO...');
      newSocket.close();
    };
  }, [currentRoomId]);

  // Função para enviar mensagem
  const sendMessage = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!newMessage.trim() || !connected || !currentRoomId) return;

    setLoading(true);
    setError('');

    try {
      // Enviar via Socket.IO
      if (socket) {
        const messageData = {
          message: newMessage.trim(),
          roomId: currentRoomId,
          userId: user?.id,
          authToken: user?.token
        };
        console.log('Enviando mensagem com dados:', messageData);
        socket.emit('send_message', messageData);
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
  const formatTime = (timestamp: string): string => {
    return moment(timestamp).format('HH:mm');
  };

  // Funções para controlar chamada de vídeo
  const startVideoCall = (): void => {
    const roomName = `spikechat-${currentRoomId}-${Date.now()}`;
    setMeetingRoomName(roomName);
    setIsVideoCallActive(true);

    // Notificar outros usuários sobre a chamada
    if (socket) {
      socket.emit('video_call_started', {
        roomId: currentRoomId,
        meetingRoom: roomName,
        timestamp: new Date().toISOString(),
      });
    }

    // Adicionar mensagem informativa no chat
    const callMessage: Message = {
      id: `call-${Date.now()}`,
      text: `📹 Chamada de vídeo iniciada. Sala: ${roomName}`,
      user: { name: 'Sistema', username: 'system' },
      timestamp: new Date().toISOString(),
      type: 'video_call_start',
    };

    setMessages((prev: Message[]) => [...prev, callMessage]);
  };

  const endVideoCall = (): void => {
    setIsVideoCallActive(false);

    // Notificar outros usuários sobre o fim da chamada
    if (socket) {
      socket.emit('video_call_ended', {
        roomId: currentRoomId,
        meetingRoom: meetingRoomName,
        timestamp: new Date().toISOString(),
      });
    }

    // Adicionar mensagem informativa no chat
    const endCallMessage: Message = {
      id: `call-end-${Date.now()}`,
      text: `📹 Chamada de vídeo encerrada`,
      user: { name: 'Sistema', username: 'system' },
      timestamp: new Date().toISOString(),
      type: 'video_call_end',
    };

    setMessages((prev: Message[]) => [...prev, endCallMessage]);
    setMeetingRoomName('');
  };

  // Função para renderizar anexos
  const renderAttachments = (
    attachments?: Message['attachments']
  ): React.ReactElement | null => {
    if (!attachments || attachments.length === 0) return null;

    return (
      <div className="message-attachments">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="attachment"
            style={{ borderColor: attachment.color }}
          >
            {attachment.title && (
              <div className="attachment-title">
                {attachment.title_link ? (
                  <a
                    href={attachment.title_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
                style={{
                  maxWidth: '100%',
                  marginTop: '8px',
                  borderRadius: '4px',
                }}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Função para determinar se a mensagem é própria
  const isOwnMessage = (message: Message): boolean => {
    // Por simplicidade, vamos considerar mensagens do tipo 'message' como de outros usuários
    // e mensagens enviadas via nossa interface como próprias
    return false; // Todas as mensagens serão exibidas como de outros usuários por enquanto
  };

  // Função para logout
  const handleLogout = (): void => {
    if (socket) {
      socket.disconnect();
    }
    logout();
    router.push('/login');
  };

  // Renderização do status de conexão
  const renderConnectionStatus = (): React.ReactElement => {
    if (connected) {
      return <div className="connection-status connected">✅ Conectado</div>;
    } else {
      return (
        <div className="connection-status disconnected">❌ Desconectado</div>
      );
    }
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && connected && !loading && currentRoomId) {
        // Criar um evento sintético simples
        const syntheticEvent = {
          preventDefault: () => {},
        } as React.FormEvent<HTMLFormElement>;
        sendMessage(syntheticEvent);
      }
    }
  };

  return (
    <div className="chat-app w-full">
      {/* Header */}
      <div className="chat-header w-full">
        <div className="header-left">
          <h1 className="text-2xl font-semibold mb-0">💬 SpikeChat</h1>
          <div className="chat-status">
            Sala: {currentRoomName || 'Nenhuma sala selecionada'} • {messages.length} mensagens
          </div>
          {user && <div className="user-info">Bem-vindo</div>}
        </div>

        <div className="header-right">
          <button
            className={`video-call-button ${isVideoCallActive ? 'active' : ''} transition-all duration-300 hover:scale-105`}
            onClick={isVideoCallActive ? endVideoCall : startVideoCall}
            disabled={!connected || !currentRoomId}
            title={
              isVideoCallActive
                ? 'Encerrar chamada de vídeo'
                : 'Iniciar chamada de vídeo'
            }
          >
            {isVideoCallActive ? '📹 Encerrar Chamada' : '📹 Chamada de Vídeo'}
          </button>
          <button
            className="logout-button transition-all duration-300 hover:scale-105"
            onClick={handleLogout}
            title="Logout"
          >
            🚪 Sair
          </button>
        </div>
      </div>

      <div className="flex flex-row w-full h-full">
        <div className="sidebar w-64 bg-gray-100 border-r border-gray-200 p-4">
          <RoomList />
        </div>
        <div className="flex-1 flex flex-col h-full">
          {/* Status de conexão */}
          {renderConnectionStatus()}

          {/* Mensagens de erro */}
          {error && <div className="error-message">⚠️ {error}</div>}

          {/* Lista de mensagens */}
          <div className="chat-messages scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
            {!currentRoomId ? (
              <div className="text-center text-gray-600 py-10 px-5">
                <p className="text-2xl mb-2">👈 Selecione uma sala</p>
                <p className="text-base">
                  Escolha uma sala da lista ao lado para começar a conversar.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-600 py-10 px-5">
                <p className="text-2xl mb-2">🚀 Bem-vindo ao SpikeChat!</p>
                <p className="text-base">
                  Comece uma conversa enviando uma mensagem.
                </p>
              </div>
            ) : (
              messages.map(message => (
                <div
                  key={message.id}
                  className={`message ${isOwnMessage(message) ? 'own' : 'other'} transition-all duration-300 hover:shadow-md`}
                  data-type={message.type}
                >
                  <div className="message-header">
                    <span className="message-user font-semibold">
                      {message.user.name || message.user.username}
                    </span>
                    <span className="message-time text-xs opacity-75">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>

                  {message.text && (
                    <div className="message-text leading-relaxed">
                      {message.text}
                    </div>
                  )}

                  {renderAttachments(message.attachments)}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Modal de Chamada de Vídeo */}
          {isVideoCallActive && (
            <div className="video-call-modal backdrop-blur-sm">
              <div className="video-call-container shadow-2xl">
                <div className="video-call-header">
                  <h3 className="text-base font-semibold m-0">
                    📹 Chamada de Vídeo - Sala: {meetingRoomName}
                  </h3>
                  <button
                    className="close-video-call hover:bg-white hover:bg-opacity-30 transition-all duration-200"
                    onClick={endVideoCall}
                    title="Fechar chamada de vídeo"
                  >
                    ✕
                  </button>
                </div>

                <div className="jitsi-container">
                  {isMounted && (
                    <JitsiMeeting
                      domain="meet.jit.si"
                      roomName={meetingRoomName}
                      configOverwrite={{
                        startWithAudioMuted: false,
                        startWithVideoMuted: false,
                        disableModeratorIndicator: true,
                        enableEmailInStats: false,
                        toolbarButtons: [
                          'microphone',
                          'camera',
                          'hangup',
                          'settings',
                          'filmstrip',
                          'invite',
                          'chat',
                          'screen',
                        ],
                      }}
                      interfaceConfigOverwrite={{
                        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                        TOOLBAR_BUTTONS: [
                          'microphone',
                          'camera',
                          'hangup',
                          'settings',
                          'filmstrip',
                          'invite',
                          'chat',
                          'screen',
                        ],
                      }}
                      userInfo={{
                        displayName:`Usuário-${currentRoomId}`,
                        email:
                          `usuario-${currentRoomId}@spikechat.local`,
                      }}
                      onApiReady={(externalApi: any) => {
                        console.log('Jitsi API pronta:', externalApi);
                      }}
                      onReadyToClose={() => {
                        console.log('Jitsi pronto para fechar');
                        endVideoCall();
                      }}
                      getIFrameRef={(parentNode: HTMLDivElement) => {
                        if (parentNode) {
                          parentNode.style.height = '400px';
                          parentNode.style.width = '100%';
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Input de mensagem */}
          <div className="chat-input-container border-t border-gray-200">
            <form onSubmit={sendMessage} className="chat-input-form">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder={
                  !currentRoomId 
                    ? 'Selecione uma sala primeiro...'
                    : connected 
                    ? 'Digite sua mensagem...' 
                    : 'Conectando...'
                }
                className="chat-input focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={!connected || loading || !currentRoomId}
                onKeyPress={handleKeyPress}
              />
              <button
                type="submit"
                className="send-button shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!connected || loading || !newMessage.trim() || !currentRoomId}
                title="Enviar mensagem (Enter)"
              >
                {loading ? '⏳' : '🚀'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
