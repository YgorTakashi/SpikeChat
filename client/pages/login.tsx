import React from 'react';
import Head from 'next/head';
import LoginForm from '../components/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Login - SpikeChat</title>
        <meta name="description" content="Faça login no SpikeChat" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LoginForm />
    </>
  );
};

export default LoginPage;
