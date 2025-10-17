import { useState } from 'react';
import { useAlert } from '../hooks/useAlert';
import { alertsAPI } from '../services/api';

const Alerts = () => {
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    enabled: false
  });
  const { showSuccess, showError, showConfirm } = useAlert();

  const handleSendOverdueAlerts = async () => {
    const confirmed = await showConfirm(
      'Se enviarán emails a todos los miembros con pagos atrasados del mes actual. ¿Continuar?',
      'Enviar alertas de pagos atrasados'
    );

    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await alertsAPI.sendOverdueAlerts();
      const { totalOverdue, sent, failed, noEmail } = response.data;
      
      showSuccess(
        `Alertas procesadas: ${sent} enviadas, ${failed} fallidas, ${noEmail} sin email de ${totalOverdue} miembros atrasados`
      );
    } catch (error) {
      showError(error.response?.data?.message || 'Error al enviar alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureAlerts = async () => {
    setLoading(true);
    try {
      const response = await alertsAPI.scheduleAlerts({ enabled: alertConfig.enabled });
      showSuccess(response.data.message);
    } catch (error) {
      showError('Error al configurar alertas automáticas');
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmailConnection = async () => {
    setLoading(true);
    try {
      const response = await alertsAPI.testEmailConnection();
      if (response.data.success) {
        showSuccess('Conexión SMTP exitosa - El servidor de email está funcionando correctamente');
      } else {
        showError(`Error en conexión SMTP: ${response.data.message}`);
      }
    } catch (error) {
      showError('Error al probar conexión SMTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sistema de Alertas</h1>

      {/* Envío manual de alertas */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Envío Manual de Alertas</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Envía recordatorios por email a todos los miembros que tienen pagos atrasados del mes actual.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleSendOverdueAlerts}
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Enviando...' : '📧 Enviar Alertas de Pagos Atrasados'}
          </button>
          
          <button
            onClick={handleTestEmailConnection}
            disabled={loading}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Probando...' : '🔧 Probar Conexión SMTP'}
          </button>
        </div>
      </div>

      {/* Configuración de alertas automáticas */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Alertas Automáticas</h2>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Sistema de recordatorios automáticos con horarios predefinidos.
        </p>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="enableAlerts"
              checked={alertConfig.enabled}
              onChange={(e) => setAlertConfig({...alertConfig, enabled: e.target.checked})}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="enableAlerts" className="text-sm sm:text-base text-gray-700 font-medium">
              Activar alertas automáticas
            </label>
          </div>

          <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">⏰ Horarios programados:</h3>
            <ul className="text-xs sm:text-sm text-blue-700 space-y-1">
              <li>• Diario a las 9:00 AM - Revisión de pagos atrasados</li>
              <li>• Viernes a las 10:00 AM - Recordatorio semanal</li>
            </ul>
          </div>

          <button
            onClick={handleConfigureAlerts}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition duration-200 disabled:opacity-50 text-sm sm:text-base"
          >
            {loading ? 'Guardando...' : alertConfig.enabled ? 'Activar Sistema Automático' : 'Desactivar Sistema Automático'}
          </button>
        </div>
      </div>

      {/* Información sobre configuración de email */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">📋 Configuración de Email</h3>
        <p className="text-sm sm:text-base text-blue-700 mb-3">
          Para que las alertas funcionen correctamente, asegúrate de configurar las variables de entorno de email:
        </p>
        <ul className="text-blue-700 text-xs sm:text-sm space-y-1">
          <li>• <code className="bg-blue-100 px-1 rounded text-xs">EMAIL_HOST</code> - Servidor SMTP (ej: smtp.gmail.com)</li>
          <li>• <code className="bg-blue-100 px-1 rounded text-xs">EMAIL_PORT</code> - Puerto SMTP (ej: 587)</li>
          <li>• <code className="bg-blue-100 px-1 rounded text-xs">EMAIL_USER</code> - Usuario de email</li>
          <li>• <code className="bg-blue-100 px-1 rounded text-xs">EMAIL_PASS</code> - Contraseña de aplicación</li>
        </ul>
      </div>
    </div>
  );
};

export default Alerts;