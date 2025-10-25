import { useState, useEffect } from 'react';
import { graduationsAPI, membersAPI, beltsAPI } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const Graduations = () => {
  const [graduations, setGraduations] = useState([]);
  const [members, setMembers] = useState([]);
  const [belts, setBelts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGraduation, setEditingGraduation] = useState(null);
  const { showSuccess, showError, showConfirm } = useAlert();

  const [formData, setFormData] = useState({
    memberId: '',
    fromBeltId: '',
    toBeltId: '',
    examDate: new Date().toISOString().split('T')[0],
    examiner: '',
    result: 'pendiente',
    score: '',
    notes: ''
  });



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [graduationsRes, membersRes, beltsRes] = await Promise.all([
        graduationsAPI.getAll(),
        membersAPI.getAll({ active: true }),
        beltsAPI.getAll()
      ]);
      setGraduations(graduationsRes.data);
      setMembers(membersRes.data);
      setBelts(beltsRes.data);
    } catch (error) {
      showError('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingGraduation) {
        await graduationsAPI.update(editingGraduation.id, formData);
        showSuccess('Graduación actualizada correctamente');
      } else {
        await graduationsAPI.create(formData);
        showSuccess('Graduación registrada correctamente');
      }
      setShowForm(false);
      setEditingGraduation(null);
      resetForm();
      fetchData();
    } catch (error) {
      showError('Error al guardar la graduación');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (graduation) => {
    setEditingGraduation(graduation);
    setFormData({
      memberId: graduation.memberId,
      fromBeltId: graduation.fromBeltId,
      toBeltId: graduation.toBeltId,
      examDate: graduation.examDate,
      examiner: graduation.examiner,
      result: graduation.result,
      score: graduation.score || '',
      notes: graduation.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id, memberName) => {
    const confirmed = await showConfirm(
      `¿Eliminar la graduación de ${memberName}? Esta acción no se puede deshacer.`,
      'Eliminar graduación'
    );
    
    if (confirmed) {
      try {
        await graduationsAPI.delete(id);
        showSuccess('Graduación eliminada correctamente');
        fetchData();
      } catch (error) {
        showError('Error al eliminar la graduación');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      memberId: '',
      fromBeltId: '',
      toBeltId: '',
      examDate: new Date().toISOString().split('T')[0],
      examiner: '',
      result: 'pendiente',
      score: '',
      notes: ''
    });
  };

  const getNextBelt = (currentBeltId) => {
    const currentBelt = belts.find(b => b.id === currentBeltId);
    if (!currentBelt) return null;
    const nextBelt = belts.find(b => b.order === currentBelt.order + 1);
    return nextBelt ? nextBelt.id : currentBeltId;
  };

  if (loading && !showForm) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Sistema de Graduaciones</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          + Nueva Graduación
        </button>
      </div>

      {/* Lista de Graduaciones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Miembro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Graduación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Examen</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Examinador</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resultado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {graduations.map((graduation) => (
              <tr key={graduation.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">
                    {graduation.member.firstName} {graduation.member.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: graduation.fromBelt.color + '20', color: graduation.fromBelt.color}}>
                      {graduation.fromBelt.name}
                    </span>
                    <span>→</span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full" style={{backgroundColor: graduation.toBelt.color + '20', color: graduation.toBelt.color}}>
                      {graduation.toBelt.name}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {new Date(graduation.examDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {graduation.examiner}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    graduation.result === 'aprobado' ? 'bg-green-100 text-green-800' :
                    graduation.result === 'reprobado' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {graduation.result}
                  </span>
                  {graduation.score && (
                    <div className="text-xs text-gray-500 mt-1">
                      Puntuación: {graduation.score}/100
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEdit(graduation)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(graduation.id, `${graduation.member.firstName} ${graduation.member.lastName}`)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formulario de Graduación */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <form onSubmit={handleSave} className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingGraduation ? 'Editar Graduación' : 'Nueva Graduación'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Miembro</label>
                  <select
                    required
                    value={formData.memberId}
                    onChange={(e) => {
                      const selectedMember = members.find(m => m.id === parseInt(e.target.value));
                      setFormData({
                        ...formData, 
                        memberId: e.target.value,
                        fromBeltId: selectedMember ? selectedMember.beltId : '',
                        toBeltId: selectedMember ? getNextBelt(selectedMember.beltId) : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar miembro</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} - {member.belt?.name || 'Sin cinturón'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cinturón Actual</label>
                    <select
                      required
                      value={formData.fromBeltId}
                      onChange={(e) => setFormData({...formData, fromBeltId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      {belts.map(belt => (
                        <option key={belt.id} value={belt.id}>{belt.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo Cinturón</label>
                    <select
                      required
                      value={formData.toBeltId}
                      onChange={(e) => setFormData({...formData, toBeltId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      {belts.map(belt => (
                        <option key={belt.id} value={belt.id}>{belt.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Examen</label>
                  <input
                    type="date"
                    required
                    value={formData.examDate}
                    onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Examinador</label>
                  <input
                    type="text"
                    required
                    value={formData.examiner}
                    onChange={(e) => setFormData({...formData, examiner: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
                    <select
                      value={formData.result}
                      onChange={(e) => setFormData({...formData, result: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="reprobado">Reprobado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Puntuación (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.score}
                      onChange={(e) => setFormData({...formData, score: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingGraduation(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Graduations;