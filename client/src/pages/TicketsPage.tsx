import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

interface TicketsPageProps {
  onNotification?: (notification: { message: string; type: 'success' | 'error' | 'info' }) => void;
}

type Ticket = { _id: string; title: string; status: string; category: string; createdAt: string };

export function TicketsPage({ onNotification }: TicketsPageProps) {
  const [items, setItems] = useState<Ticket[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/api/tickets', { params: { mine: 'true' } });
      setItems(res.data.items);
    } catch (error) {
      onNotification?.({ message: 'Failed to fetch tickets', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/api/tickets', { title, description });
      setItems([res.data, ...items]);
      setTitle('');
      setDescription('');
      onNotification?.({ message: 'Ticket created successfully!', type: 'success' });
    } catch (error) {
      onNotification?.({ message: 'Failed to create ticket', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'waiting_human': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'billing': return 'bg-purple-100 text-purple-800';
      case 'tech': return 'bg-blue-100 text-blue-800';
      case 'shipping': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Ticket</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of your issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed description of your issue"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Ticket'}
          </button>
        </form>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Tickets</h2>
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tickets yet. Create your first ticket above!</p>
        ) : (
          <div className="space-y-4">
            {items.map((ticket) => (
              <div key={ticket._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Link 
                      to={`/tickets/${ticket._id}`}
                      className="text-lg font-medium text-blue-600 hover:text-blue-800"
                    >
                      {ticket.title}
                    </Link>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(ticket.category)}`}>
                        {ticket.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link 
                    to={`/tickets/${ticket._id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


