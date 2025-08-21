import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';

interface TicketDetailPageProps {
  onNotification?: (notification: { message: string; type: 'success' | 'error' | 'info' }) => void;
}

export function TicketDetailPage({ onNotification }: TicketDetailPageProps) {
  const { id } = useParams();
  const [ticket, setTicket] = useState<any>(null);
  const [suggestion, setSuggestion] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchTicketData();
    }
  }, [id]);

  const fetchTicketData = async () => {
    try {
      const [ticketRes, suggestionRes, auditRes] = await Promise.all([
        api.get(`/api/tickets/${id}`),
        api.get(`/api/agent/suggestion/${id}`),
        api.get(`/api/tickets/${id}/audit`)
      ]);
      setTicket(ticketRes.data);
      setSuggestion(suggestionRes.data);
      setAudit(auditRes.data.items);
    } catch (error) {
      onNotification?.({ message: 'Failed to fetch ticket data', type: 'error' });
    }
  };

  if (!ticket) return <div>Loading...</div>;

  return (
    <div>
      <h2>Ticket: {ticket.title}</h2>
      <p>Status: {ticket.status}</p>
      <p>Category: {ticket.category}</p>
      <p>Description: {ticket.description}</p>
      
      {suggestion && (
        <div>
          <h3>Agent Suggestion</h3>
          <p>Category: {suggestion.predictedCategory}</p>
          <p>Confidence: {suggestion.confidence}</p>
          <p>Draft Reply: {suggestion.draftReply}</p>
        </div>
      )}
      
      <div>
        <h3>Audit Trail</h3>
        <ul>
          {audit.map((log) => (
            <li key={log._id}>
              {log.action} - {new Date(log.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}


