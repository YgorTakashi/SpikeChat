import { useEffect } from 'react'
import { useRouter } from 'next/router'

const IndexPage: React.FC = () => {
  const router = useRouter()

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <p>Redirecionando para o chat...</p>
    </div>
  )
}

export default IndexPage
