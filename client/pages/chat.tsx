import React from 'react'
import Head from 'next/head'
import ChatApp from '../components/ChatApp'

const ChatPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>SpikeChat - Chat em Tempo Real</title>
        <meta name="description" content="Chat em tempo real com chamadas de vídeo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ChatApp />
    </>
  )
}

export default ChatPage
