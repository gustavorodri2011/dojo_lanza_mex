import { useState, useEffect } from 'react';
import { reportsAPI, beltsAPI } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [reportType, setReportType] = useState('income');
  const [belts, setBelts] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    belt: '',
    status: ''
  });
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchBelts();
  }, []);

  const fetchBelts = async () => {
    try {
      const response = await beltsAPI.getAll();
      setBelts(response.data);
    } catch (error) {
      console.error('Error loading belts:', error);
    }
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      let response;
      const params = {};
      
      if (reportType === 'income') {
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        response = await reportsAPI.getIncomeReport(params);
      } else if (reportType === 'members') {
        if (filters.belt) params.belt = filters.belt;
        if (filters.status) params.status = filters.status;
        response = await reportsAPI.getMembersReport(params);
      } else if (reportType === 'overdue') {
        response = await reportsAPI.getOverdueReport(params);
      }

      setReportData(response.data);
      showSuccess('Reporte generado correctamente');
    } catch (error) {
      showError('Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    setLoading(true);
    try {
      let response;
      const params = {};
      
      if (reportType === 'income') {
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
        response = await reportsAPI.downloadIncomeExcel(params);
      } else if (reportType === 'members') {
        if (filters.belt) params.belt = filters.belt;
        if (filters.status) params.status = filters.status;
        response = await reportsAPI.downloadMembersExcel(params);
      } else if (reportType === 'overdue') {
        response = await reportsAPI.downloadOverdueExcel(params);
      }

      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${reportType}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess('Reporte Excel descargado correctamente');
    } catch (error) {
      showError('Error al descargar el reporte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Sistema de Reportes</h1>

      {/* Configuración del Reporte */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Configuración del Reporte</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Reporte</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="income">Reporte de Ingresos</option>
              <option value="members">Reporte de Miembros</option>
              <option value="overdue">Reporte de Pagos Atrasados</option>
            </select>
          </div>
        </div>

        {/* Filtros por tipo de reporte */}
        {reportType === 'income' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {reportType === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cinturón</label>
              <select
                value={filters.belt}
                onChange={(e) => setFilters({...filters, belt: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los cinturones</option>
                {belts.map(belt => (
                  <option key={belt.id} value={belt.id}>{belt.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Generando...' : '📊 Generar Reporte'}
          </button>
          <button
            onClick={handleDownloadExcel}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Descargando...' : '📥 Descargar Excel'}
          </button>
        </div>
      </div>

      {/* Resultados del Reporte */}
      {reportData && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Resultados del Reporte</h2>
          
          {reportType === 'income' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">${reportData.totalIncome}</div>
                  <div className="text-sm text-gray-600">Ingresos Totales</div>
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{reportData.totalPayments}</div>
                  <div className="text-sm text-gray-600">Total Pagos</div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'members' && (
            <div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded">
                  <div className="text-2xl font-bold text-blue-600">{reportData.totalMembers}</div>
                  <div className="text-sm text-gray-600">Total Miembros</div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                  <div className="text-2xl font-bold text-green-600">{reportData.activeMembers}</div>
                  <div className="text-sm text-gray-600">Miembros Activos</div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'overdue' && (
            <div>
              <div className="bg-red-50 p-3 rounded mb-4">
                <div className="text-2xl font-bold text-red-600">{reportData.totalOverdue}</div>
                <div className="text-sm text-gray-600">Miembros con Pagos Atrasados</div>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500">
            Reporte generado exitosamente. Use el botón "Descargar Excel" para obtener el archivo completo.
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;