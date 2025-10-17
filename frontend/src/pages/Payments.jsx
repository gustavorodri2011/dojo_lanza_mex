import { useState, useEffect } from 'react';
import { paymentsAPI, membersAPI } from '../services/api';
import PaymentForm from '../components/PaymentForm';
import { useAlert } from '../hooks/useAlert';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const { showSuccess, showError } = useAlert();

  const handleDownloadPDF = async (paymentId, receiptNumber) => {
    try {
      const response = await paymentsAPI.downloadReceipt(paymentId);
      
      // Crear blob y descargar
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `recibo-${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showSuccess('Recibo descargado correctamente');
    } catch (error) {
      showError('Error al generar el recibo PDF');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, membersRes] = await Promise.all([
        paymentsAPI.getAll({ memberId: selectedMember }),
        membersAPI.getAll({ active: true })
      ]);
      setPayments(paymentsRes.data);
      setMembers(membersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSave = async (paymentData) => {
    try {
      await paymentsAPI.create(paymentData);
      showSuccess('Pago registrado correctamente');
      setShowForm(false);
      fetchData();
    } catch (error) {
      showError(error.response?.data?.message || 'Error al registrar el pago');
    }
  };

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  if (loading) return <div className="text-center py-4 sm:py-8 text-sm sm:text-base">Cargando...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Pagos</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          + Registrar Pago
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          >
            <option value="">Todos los miembros</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {payments.map((payment) => (
            <div key={payment.id} className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {payment.member?.firstName} {payment.member?.lastName}
                  </div>
                  <div className="text-lg font-bold text-green-600">${payment.amount}</div>
                </div>
                <button
                  onClick={() => handleDownloadPDF(payment.id, payment.receiptNumber)}
                  className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-xs"
                >
                  📄 PDF
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>Período: {payment.monthYear}</div>
                <div>Fecha: {new Date(payment.paymentDate).toLocaleDateString()}</div>
                <div>Método: {payment.paymentMethod}</div>
                <div>Recibo: {payment.receiptNumber}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miembro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes/Año</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Pago</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {payment.member?.firstName} {payment.member?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                    ${payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {payment.monthYear}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {payment.paymentMethod}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.receiptNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDownloadPDF(payment.id, payment.receiptNumber)}
                      className="text-blue-600 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-md transition duration-200"
                    >
                      📄 PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <PaymentForm
          members={members}
          onSave={handlePaymentSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Payments;