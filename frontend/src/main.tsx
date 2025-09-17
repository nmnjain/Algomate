
  import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppRouter } from './components/Router.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import './index.css'
import { Toaster } from './components/ui/sonner.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
      <Toaster />
    </AuthProvider>
  </React.StrictMode>,
)

  