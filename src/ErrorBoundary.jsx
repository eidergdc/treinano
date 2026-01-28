import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ERRO CAPTURADO:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-dark to-dark-lighter text-light flex items-center justify-center p-4">
          <div className="bg-dark-lighter rounded-xl p-8 max-w-2xl w-full">
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              Ops! Algo deu errado
            </h1>
            <p className="text-light-darker mb-4">
              A aplicação encontrou um erro inesperado.
            </p>

            <div className="bg-dark p-4 rounded-lg mb-4 overflow-auto max-h-96">
              <p className="text-red-400 font-mono text-sm mb-2">
                {this.state.error && this.state.error.toString()}
              </p>
              <pre className="text-xs text-light-darker overflow-auto">
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  // Limpar Service Worker
                  navigator.serviceWorker.getRegistrations().then(registrations => {
                    registrations.forEach(registration => registration.unregister());
                  });
                  // Limpar cache
                  if ('caches' in window) {
                    caches.keys().then(names => {
                      names.forEach(name => caches.delete(name));
                    });
                  }
                  // Recarregar
                  window.location.href = '/';
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Limpar Cache e Recarregar
              </button>

              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                Recarregar Página
              </button>
            </div>

            <p className="text-sm text-light-darker mt-4 text-center">
              Se o problema persistir, tente fazer logout e login novamente
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
