import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface SettingsPageProps {
  onNotification?: (notification: { message: string; type: 'success' | 'error' | 'info' }) => void;
}

export function SettingsPage({ onNotification }: SettingsPageProps) {
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.78);
  const [slaHours, setSlaHours] = useState(24);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/api/config');
      const config = res.data;
      setAutoCloseEnabled(config.autoCloseEnabled);
      setConfidenceThreshold(config.confidenceThreshold);
      setSlaHours(config.slaHours);
    } catch (error) {
      onNotification?.({ message: 'Failed to fetch configuration', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/config', {
        autoCloseEnabled,
        confidenceThreshold,
        slaHours
      });
      onNotification?.({ message: 'Configuration updated successfully!', type: 'success' });
    } catch (error) {
      onNotification?.({ message: 'Failed to update configuration', type: 'error' });
    }
  };

  return (
    <div>
      <h2>System Configuration</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            <input
              type="checkbox"
              checked={autoCloseEnabled}
              onChange={(e) => setAutoCloseEnabled(e.target.checked)}
            />
            Enable Auto-Close
          </label>
        </div>
        <div>
          <label>
            Confidence Threshold:
            <input
              type="number"
              min="0"
              max="1"
              step="0.01"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
            />
          </label>
        </div>
        <div>
          <label>
            SLA Hours:
            <input
              type="number"
              min="1"
              value={slaHours}
              onChange={(e) => setSlaHours(parseInt(e.target.value))}
            />
          </label>
        </div>
        <button type="submit">Save Configuration</button>
      </form>
    </div>
  );
}


