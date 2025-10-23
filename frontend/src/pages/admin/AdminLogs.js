import { useEffect, useState } from 'react';
import { Activity, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { axiosInstance } from '../../App';
import { toast } from 'sonner';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = '/admin/activity-logs?limit=200';
      if (filter) url += `&action_type=${filter}`;
      const { data } = await axiosInstance.get(url);
      setLogs(data.logs);
    } catch (error) {
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
      case 'update_status':
      case 'update_role':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'checkout':
      case 'confirm':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" data-testid="admin-logs-page">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-2">Activity Logs</h1>
          <p className="text-lg text-gray-600">Monitor system activities and user actions</p>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-6 mb-8">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === '' ? 'default' : 'outline'}
              onClick={() => setFilter('')}
              data-testid="filter-all-logs"
            >
              All Actions
            </Button>
            <Button
              variant={filter === 'create' ? 'default' : 'outline'}
              onClick={() => setFilter('create')}
              data-testid="filter-create"
            >
              Create
            </Button>
            <Button
              variant={filter === 'update' ? 'default' : 'outline'}
              onClick={() => setFilter('update')}
              data-testid="filter-update"
            >
              Update
            </Button>
            <Button
              variant={filter === 'delete' ? 'default' : 'outline'}
              onClick={() => setFilter('delete')}
              data-testid="filter-delete"
            >
              Delete
            </Button>
            <Button
              variant={filter === 'checkout' ? 'default' : 'outline'}
              onClick={() => setFilter('checkout')}
              data-testid="filter-checkout"
            >
              Checkout
            </Button>
          </div>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center" data-testid="no-logs">
            <Activity className="w-24 h-24 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No activity logs found</h2>
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200" data-testid="logs-table">
                  {logs.map((log) => (
                    <tr key={log.id} data-testid="log-row">
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {log.user_id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getActionColor(log.action_type)}`} data-testid="log-action">
                          {log.action_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium">{log.resource_type}</div>
                        <div className="text-xs text-gray-500 font-mono">{log.resource_id.substring(0, 12)}...</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <pre className="text-xs overflow-x-auto">{JSON.stringify(log.metadata, null, 2)}</pre>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
