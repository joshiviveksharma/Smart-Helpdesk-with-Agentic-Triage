import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

interface DashboardPageProps {
  onNotification?: (notification: { message: string; type: 'success' | 'error' | 'info' }) => void;
}

interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  waitingHuman: number;
  recentTickets: Array<{
    _id: string;
    title: string;
    status: string;
    category: string;
    createdAt: string;
  }>;
}

export function DashboardPage({ onNotification }: DashboardPageProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { role } = useAuthStore();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ticketsRes, kbRes] = await Promise.all([
        api.get('/api/tickets'),
        role === 'admin' ? api.get('/api/kb') : Promise.resolve({ data: { items: [] } })
      ]);

      const tickets = ticketsRes.data.items;
      const stats: DashboardStats = {
        totalTickets: tickets.length,
        openTickets: tickets.filter((t: any) => t.status === 'open').length,
        resolvedTickets: tickets.filter((t: any) => t.status === 'resolved').length,
        waitingHuman: tickets.filter((t: any) => t.status === 'waiting_human').length,
        recentTickets: tickets.slice(0, 5)
      };

      setStats(stats);
    } catch (error) {
      onNotification?.({ message: 'Failed to fetch dashboard data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your Smart Helpdesk overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.openTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.resolvedTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Waiting Human</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.waitingHuman}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Tickets</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {stats.recentTickets.map((ticket) => (
            <div key={ticket._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{ticket.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                      ticket.status === 'waiting_human' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">{ticket.category}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
            Create New Ticket
          </button>
          {role === 'admin' && (
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium">
              Manage Knowledge Base
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
