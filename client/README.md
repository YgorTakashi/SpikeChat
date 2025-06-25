# SpikeChat Client - Next.js

Este é o cliente do SpikeChat construído com Next.js, TypeScript e Socket.IO para chat em tempo real com suporte a chamadas de vídeo.

## Tecnologias Utilizadas

- **Next.js 14** - Framework React para produção
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Socket.IO Client** - Comunicação em tempo real
- **Jitsi Meet** - Chamadas de vídeo integradas
- **Moment.js** - Formatação de datas e horários

## Scripts Disponíveis

No diretório do projeto, você pode executar:

### `npm run dev`

Executa o aplicativo em modo de desenvolvimento na porta 3002.\
Abra [http://localhost:3002](http://localhost:3002) para visualizá-lo no navegador.

A página será recarregada automaticamente quando você fizer alterações.\
Você também pode ver erros de lint no console.

### `npm run build`

Constrói o aplicativo para produção na pasta `.next`.\
Ele agrupa corretamente o React no modo de produção e otimiza a construção para o melhor desempenho.

### `npm start`

Executa o aplicativo construído em modo de produção na porta 3002.

### `npm run lint`

Executa o linter ESLint para verificar problemas no código.

## Funcionalidades

- ✅ Chat em tempo real com Socket.IO
- ✅ Chamadas de vídeo integradas com Jitsi Meet
- ✅ Interface responsiva e moderna
- ✅ TypeScript para melhor experiência de desenvolvimento
- ✅ Roteamento automático para `/chat`
- ✅ Suporte a anexos e mensagens rich text

## Estrutura do Projeto

```
client/
├── components/          # Componentes React reutilizáveis
│   └── ChatApp.tsx     # Componente principal do chat
├── pages/              # Páginas do Next.js
│   ├── _app.tsx        # Configuração global do app
│   ├── index.tsx       # Página inicial (redireciona para /chat)
│   └── chat.tsx        # Página principal do chat
├── styles/             # Arquivos de estilo
│   └── globals.css     # Estilos globais da aplicação
├── types/              # Definições de tipos TypeScript
│   └── chat.ts         # Tipos para o sistema de chat
└── public/             # Arquivos estáticos
```

## Configuração

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Configure o servidor Socket.IO:**
   Certifique-se de que o servidor está rodando na porta 3001 (configurável em `ChatApp.tsx`)

3. **Execute o projeto:**
   ```bash
   npm run dev
   ```

## Rotas

- `/` - Redireciona automaticamente para `/chat`
- `/chat` - Página principal do chat com todas as funcionalidades

## Desenvolvimento

Este projeto usa TypeScript para tipagem estática, o que ajuda a:
- Detectar erros em tempo de compilação
- Melhorar a experiência de desenvolvimento com IntelliSense
- Facilitar refatorações e manutenção do código

Para adicionar novas funcionalidades:
1. Defina os tipos necessários em `types/`
2. Crie componentes em `components/` se necessário
3. Adicione novas páginas em `pages/` seguindo a convenção do Next.js

## Build e Deploy

Para fazer deploy da aplicação:

1. **Build da aplicação:**
   ```bash
   npm run build
   ```

2. **Executar em produção:**
   ```bash
   npm start
   ```

O Next.js otimiza automaticamente a aplicação para produção, incluindo:
- Code splitting automático
- Otimização de imagens
- Minificação de CSS e JavaScript
- Server-side rendering (SSR) quando necessário
