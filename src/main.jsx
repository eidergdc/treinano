import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Mostrar tela de carregamento imediatamente
const root = document.getElementById('root')
root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#1a1a2e;color:white;font-family:Arial;font-size:24px;">🔄 Carregando Treinano...</div>'

// Log inicial
console.log('🚀 Aplicação iniciando...')
console.log('📍 Versão:', new Date().toISOString())

// Capturar erros globais
window.addEventListener('error', (event) => {
  console.error('❌ ERRO GLOBAL:', event.error)
  root.innerHTML = `<div style="padding:20px;background:#ef4444;color:white;font-family:Arial;">
    <h1>❌ Erro Fatal</h1>
    <p>${event.error?.message || 'Erro desconhecido'}</p>
    <button onclick="location.reload()" style="padding:10px 20px;margin:10px 0;font-size:16px;">Recarregar</button>
    <button onclick="location.href='/emergency.html'" style="padding:10px 20px;font-size:16px;">Modo Emergência</button>
  </div>`
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ PROMISE NÃO TRATADA:', event.reason)
})

try {
  console.log('📦 Criando React Root...')
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ErrorBoundary>
        <BrowserRouter>
          <App />
          <ToastContainer position="bottom-right" theme="dark" />
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  )
  console.log('✅ React Root criado com sucesso!')
} catch (error) {
  console.error('❌ ERRO AO CRIAR REACT ROOT:', error)
  root.innerHTML = `<div style="padding:20px;background:#ef4444;color:white;font-family:Arial;">
    <h1>❌ Erro ao Iniciar</h1>
    <p>${error.message}</p>
    <pre style="background:rgba(0,0,0,0.3);padding:10px;overflow:auto;">${error.stack}</pre>
    <button onclick="location.reload()" style="padding:10px 20px;margin:10px 0;font-size:16px;">Recarregar</button>
  </div>`
}