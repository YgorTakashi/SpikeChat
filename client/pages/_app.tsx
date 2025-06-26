import type { AppProps } from 'next/app';
import { AuthProvider } from '../contexts/AuthContext';
import { RoomProvider } from '../contexts/RoomContext';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <RoomProvider>
        <Component {...pageProps} />
      </RoomProvider>
    </AuthProvider>
  );
}
