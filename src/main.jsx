import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Log inicial
console.log('🚀 Aplicação iniciando...')

// Capturar erros globais
window.addEventListener('error', (event) => {
  console.error('❌ ERRO GLOBAL:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ PROMISE NÃO TRATADA:', event.reason)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <ToastContainer position="bottom-right" theme="dark" />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)