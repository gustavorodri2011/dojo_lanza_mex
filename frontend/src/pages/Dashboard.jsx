import { useState, useEffect } from 'react';
import { paymentsAPI, membersAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    overdueMembers: 0,
    monthlyRevenue: 0
  });
  const [overdueMembers, setOverdueMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, overdueRes, paymentsRes] = await Promise.all([
          membersAPI.getAll(),
          paymentsAPI.getOverdue(),
          paymentsAPI.getAll({ month: new Date().getMonth() + 1, year: new Date().getFullYear() })
        ]);

        const members = membersRes.data;
        const overdue = overdueRes.data;
        const payments = paymentsRes.data;

        setStats({
          totalMembers: members.length,
          activeMembers: members.filter(m => m.isActive).length,
          overdueMembers: overdue.length,
          monthlyRevenue: payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
        });

        setOverdueMembers(overdue);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
          <div className="text-gray-600">Total Miembros</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">{stats.activeMembers}</div>
          <div className="text-gray-600">Miembros Activos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-red-600">{stats.overdueMembers}</div>
          <div className="text-gray-600">Pagos Atrasados</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">${stats.monthlyRevenue}</div>
          <div className="text-gray-600">Ingresos del Mes</div>
        </div>
      </div>

      {/* Overdue Members */}
      {overdueMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Miembros con Pagos Atrasados</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {overdueMembers.map(member => (
                <div key={member.id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <div className="font-medium">{member.firstName} {member.lastName}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </div>
                  <div className="text-red-600 font-medium">Atrasado</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;