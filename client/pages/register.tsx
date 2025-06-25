import React from 'react';
import Head from 'next/head';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Registro - SpikeChat</title>
        <meta name="description" content="Crie sua conta no SpikeChat" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <RegisterForm />
    </>
  );
};

export default RegisterPage;
