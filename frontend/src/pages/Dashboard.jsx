import { useState, useEffect } from 'react';
import { statsAPI, paymentsAPI } from '../services/api';
import RevenueChart from '../components/charts/RevenueChart';
import BeltChart from '../components/charts/BeltChart';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    overdueMembers: 0,
    monthlyRevenue: 0
  });
  const [overdueMembers, setOverdueMembers] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [beltDistribution, setBeltDistribution] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, overdueRes, revenueRes, beltRes] = await Promise.all([
          statsAPI.getDashboardStats(),
          paymentsAPI.getOverdue(),
          statsAPI.getMonthlyRevenue(),
          statsAPI.getBeltDistribution()
        ]);

        setStats(statsRes.data);
        setOverdueMembers(overdueRes.data);
        setMonthlyRevenue(revenueRes.data);
        setBeltDistribution(beltRes.data);
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
      <div className="flex justify-center items-center h-32 sm:h-64">
        <div className="text-base sm:text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalMembers}</div>
          <div className="text-sm sm:text-base text-gray-600">Total Miembros</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.activeMembers}</div>
          <div className="text-sm sm:text-base text-gray-600">Miembros Activos</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.overdueMembers}</div>
          <div className="text-sm sm:text-base text-gray-600">Pagos Atrasados</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="text-xl sm:text-2xl font-bold text-purple-600">${stats.monthlyRevenue}</div>
          <div className="text-sm sm:text-base text-gray-600">Ingresos del Mes</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="h-64 sm:h-80">
            <RevenueChart data={monthlyRevenue} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="h-64 sm:h-80">
            <BeltChart data={beltDistribution} />
          </div>
        </div>
      </div>

      {/* Overdue Members */}
      {overdueMembers.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Miembros con Pagos Atrasados</h2>
          </div>
          <div className="p-4 sm:p-6">
            <div className="space-y-3">
              {overdueMembers.map(member => (
                <div key={member.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 bg-red-50 rounded space-y-1 sm:space-y-0">
                  <div>
                    <div className="font-medium text-sm sm:text-base">{member.firstName} {member.lastName}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{member.email}</div>
                  </div>
                  <div className="text-red-600 font-medium text-sm sm:text-base">Atrasado</div>
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