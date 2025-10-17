import { useState, useEffect } from 'react';
import { membersAPI } from '../services/api';
import MemberForm from '../components/MemberForm';
import { useAlert } from '../hooks/useAlert';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [search, setSearch] = useState('');
  const { showSuccess, showError, showConfirm } = useAlert();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll({ search });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (memberData) => {
    try {
      if (editingMember) {
        await membersAPI.update(editingMember.id, memberData);
        showSuccess('Miembro actualizado correctamente');
      } else {
        await membersAPI.create(memberData);
        showSuccess('Miembro creado correctamente');
      }
      setShowForm(false);
      setEditingMember(null);
      fetchMembers();
    } catch (error) {
      showError(error.response?.data?.message || 'Error al guardar el miembro');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleDelete = async (id, memberName) => {
    const confirmed = await showConfirm(
      `Esta acción no se puede deshacer. Se eliminará el miembro "${memberName}" y todos sus datos.`,
      '¿Eliminar miembro?'
    );
    
    if (confirmed) {
      try {
        await membersAPI.delete(id);
        showSuccess('Miembro eliminado correctamente');
        fetchMembers();
      } catch (error) {
        showError(error.response?.data?.message || 'Error al eliminar el miembro');
      }
    }
  };

  const filteredMembers = members.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center py-4 sm:py-8 text-sm sm:text-base">Cargando...</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Miembros</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          + Nuevo Miembro
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b">
          <input
            type="text"
            placeholder="Buscar miembros..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {filteredMembers.map((member) => (
            <div key={member.id} className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="text-xs text-gray-500">{member.email}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {member.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {member.belt}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="text-blue-600 hover:text-blue-900 text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
                    className="text-red-600 hover:text-red-900 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cinturón</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Ingreso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {member.belt}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(member.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(member.id, `${member.firstName} ${member.lastName}`)}
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
      </div>

      {showForm && (
        <MemberForm
          member={editingMember}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}
    </div>
  );
};

export default Members;