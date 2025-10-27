import { useState, useEffect } from 'react';
import { classesAPI, membersAPI } from '../services/api';
import { useAlert } from '../hooks/useAlert';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendances, setAttendances] = useState([]);
  const { showSuccess, showError, showConfirm } = useAlert();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructor: '',
    dayOfWeek: 'lunes',
    startTime: '',
    endTime: '',
    maxCapacity: 20,
    beltLevel: 'todos',
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [classesRes, membersRes] = await Promise.all([
        classesAPI.getAll(),
        membersAPI.getAll({ active: true })
      ]);
      setClasses(classesRes.data);
      setMembers(membersRes.data);
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
      if (editingClass) {
        await classesAPI.update(editingClass.id, formData);
        showSuccess('Clase actualizada correctamente');
      } else {
        await classesAPI.create(formData);
        showSuccess('Clase creada correctamente');
      }
      setShowForm(false);
      setEditingClass(null);
      resetForm();
      fetchData();
    } catch (error) {
      showError('Error al guardar la clase');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setFormData({
      name: classItem.name,
      description: classItem.description || '',
      instructor: classItem.instructor,
      dayOfWeek: classItem.dayOfWeek,
      startTime: classItem.startTime,
      endTime: classItem.endTime,
      maxCapacity: classItem.maxCapacity,
      beltLevel: classItem.beltLevel,
      isActive: classItem.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id, className) => {
    const confirmed = await showConfirm(
      `¿Eliminar la clase "${className}"? Esta acción no se puede deshacer.`,
      'Eliminar clase'
    );
    
    if (confirmed) {
      try {
        await classesAPI.delete(id);
        showSuccess('Clase eliminada correctamente');
        fetchData();
      } catch (error) {
        showError('Error al eliminar la clase');
      }
    }
  };

  const handleAttendance = async (classItem) => {
    setSelectedClass(classItem);
    setShowAttendance(true);
    
    try {
      const response = await classesAPI.getAttendance({
        classId: classItem.id,
        date: attendanceDate
      });
      
      const existingAttendances = response.data;
      const memberAttendances = members.map(member => {
        const existing = existingAttendances.find(att => att.memberId === member.id);
        return {
          memberId: member.id,
          memberName: `${member.firstName} ${member.lastName}`,
          status: existing ? existing.status : 'ausente',
          notes: existing ? existing.notes : ''
        };
      });
      
      setAttendances(memberAttendances);
    } catch (error) {
      showError('Error al cargar asistencia');
    }
  };

  const handleSaveAttendance = async () => {
    try {
      await classesAPI.recordAttendance({
        classId: selectedClass.id,
        attendanceDate,
        attendances: attendances.filter(att => att.status === 'presente')
      });
      showSuccess('Asistencia guardada correctamente');
      setShowAttendance(false);
    } catch (error) {
      showError('Error al guardar asistencia');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      instructor: '',
      dayOfWeek: 'lunes',
      startTime: '',
      endTime: '',
      maxCapacity: 20,
      beltLevel: 'todos',
      isActive: true
    });
  };

  const dayNames = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miércoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sábado',
    domingo: 'Domingo'
  };

  if (loading && !showForm && !showAttendance) {
    return <div className="text-center py-4 sm:py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Gestión de Clases</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm sm:text-base"
        >
          + Nueva Clase
        </button>
      </div>

      {/* Lista de Clases */}
      <div className="bg-white rounded-lg shadow">
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clase</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacidad</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{classItem.name}</div>
                    <div className="text-sm text-gray-500">{dayNames[classItem.dayOfWeek]}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {classItem.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {classItem.startTime} - {classItem.endTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {classItem.beltLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {classItem.maxCapacity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleAttendance(classItem)}
                      className="text-green-600 hover:text-green-900"
                    >
                      Asistencia
                    </button>
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(classItem.id, classItem.name)}
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

        {/* Mobile Card View */}
        <div className="block sm:hidden">
          {classes.map((classItem) => (
            <div key={classItem.id} className="border-b border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900 text-sm">{classItem.name}</div>
                  <div className="text-xs text-gray-500">{classItem.instructor}</div>
                </div>
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {classItem.beltLevel}
                </span>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {dayNames[classItem.dayOfWeek]} • {classItem.startTime} - {classItem.endTime}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAttendance(classItem)}
                  className="text-green-600 hover:text-green-900 text-xs"
                >
                  Asistencia
                </button>
                <button
                  onClick={() => handleEdit(classItem)}
                  className="text-blue-600 hover:text-blue-900 text-xs"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(classItem.id, classItem.name)}
                  className="text-red-600 hover:text-red-900 text-xs"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de Clase */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto my-4">
            <form onSubmit={handleSave} className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingClass ? 'Editar Clase' : 'Nueva Clase'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
                  <input
                    type="text"
                    required
                    value={formData.instructor}
                    onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                    <select
                      value={formData.dayOfWeek}
                      onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(dayNames).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
                    <select
                      value={formData.beltLevel}
                      onChange={(e) => setFormData({...formData, beltLevel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="todos">Todos</option>
                      <option value="principiante">Principiante</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="avanzado">Avanzado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                    <input
                      type="time"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                    <input
                      type="time"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacidad Máxima</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({...formData, maxCapacity: parseInt(e.target.value)})}
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
                    setEditingClass(null);
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

      {/* Modal de Asistencia */}
      {showAttendance && selectedClass && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-screen overflow-y-auto my-4">
            <div className="p-4 sm:p-6">
              <h2 className="text-lg font-semibold mb-4">
                Asistencia - {selectedClass.name}
              </h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {attendances.map((attendance, index) => (
                  <div key={attendance.memberId} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{attendance.memberName}</span>
                    <div className="flex space-x-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`attendance-${attendance.memberId}`}
                          value="presente"
                          checked={attendance.status === 'presente'}
                          onChange={(e) => {
                            const newAttendances = [...attendances];
                            newAttendances[index].status = e.target.value;
                            setAttendances(newAttendances);
                          }}
                          className="mr-1"
                        />
                        <span className="text-xs text-green-600">Presente</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`attendance-${attendance.memberId}`}
                          value="ausente"
                          checked={attendance.status === 'ausente'}
                          onChange={(e) => {
                            const newAttendances = [...attendances];
                            newAttendances[index].status = e.target.value;
                            setAttendances(newAttendances);
                          }}
                          className="mr-1"
                        />
                        <span className="text-xs text-red-600">Ausente</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleSaveAttendance}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                >
                  Guardar Asistencia
                </button>
                <button
                  onClick={() => setShowAttendance(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Classes;