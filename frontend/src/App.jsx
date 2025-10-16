function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🥋 Dojo Manager
          </h1>
          <p className="text-gray-600 mb-6">
            Sistema de Gestión de Cuotas
          </p>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105">
              Gestionar Miembros
            </button>
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105">
              Registrar Pagos
            </button>
            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 transform hover:scale-105">
              Ver Reportes
            </button>
          </div>
          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-700">
              ✅ <span className="font-semibold text-green-600">Tailwind CSS configurado correctamente</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Si ves este diseño con colores y estilos, Tailwind está funcionando!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
