import { useState, useEffect } from 'react';
import { membersAPI, qrAPI } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const MemberQR = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll({ active: true });
      setMembers(response.data);
    } catch (error) {
      showError('Error al cargar miembros');
    }
  };

  const generateQR = async () => {
    if (!selectedMember) {
      showError('Selecciona un miembro');
      return;
    }

    setLoading(true);
    try {
      const response = await qrAPI.generateMemberQR(selectedMember);
      setQrCode(response.data);
      showSuccess('QR generado correctamente');
    } catch (error) {
      showError('Error al generar QR');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;

    const link = document.createElement('a');
    link.download = `QR_${qrCode.member.firstName}_${qrCode.member.lastName}.png`;
    link.href = qrCode.qrCode;
    link.click();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Generar QR de Miembros</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Seleccionar Miembro</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Miembro</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar miembro...</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName} - {member.belt?.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateQR}
              disabled={loading || !selectedMember}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-semibold disabled:opacity-50"
            >
              {loading ? 'Generando...' : '🔄 Generar QR'}
            </button>
          </div>
        </div>

        {qrCode && (
          <div className="border-t pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                QR Code - {qrCode.member.firstName} {qrCode.member.lastName}
              </h3>
              
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img 
                  src={qrCode.qrCode} 
                  alt="QR Code" 
                  className="w-64 h-64 mx-auto"
                />
              </div>
              
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">
                  Cinturón: {qrCode.member.belt || 'Sin cinturón'}
                </p>
                
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={downloadQR}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold"
                  >
                    📥 Descargar QR
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-semibold"
                  >
                    🖨️ Imprimir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">💡 Instrucciones</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Cada miembro tiene un QR único para check-in</li>
          <li>• El QR se puede imprimir o enviar digitalmente</li>
          <li>• Usar en la página "QR Check-in" para registrar asistencia</li>
          <li>• El QR incluye validaciones de seguridad</li>
        </ul>
      </div>
    </div>
  );
};

export default MemberQR;