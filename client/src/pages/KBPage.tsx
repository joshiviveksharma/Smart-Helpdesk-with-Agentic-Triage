import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface KBPageProps {
  onNotification?: (notification: { message: string; type: 'success' | 'error' | 'info' }) => void;
}

type Article = { _id: string; title: string; body: string; tags: string[]; status: string };

export function KBPage({ onNotification }: KBPageProps) {
  const [items, setItems] = useState<Article[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [status, setStatus] = useState('draft');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await api.get('/api/kb');
      setItems(res.data.items);
    } catch (error) {
      onNotification?.({ message: 'Failed to fetch articles', type: 'error' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/kb', { title, body, tags: tags.split(',').map(t => t.trim()), status });
      setTitle('');
      setBody('');
      setTags('');
      setStatus('draft');
      fetchArticles();
      onNotification?.({ message: 'Article created successfully!', type: 'success' });
    } catch (error) {
      onNotification?.({ message: 'Failed to create article', type: 'error' });
    }
  };

  return (
    <div>
      <h2>Knowledge Base Management</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Body" value={body} onChange={(e) => setBody(e.target.value)} required />
        <input placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
        <button type="submit">Create</button>
      </form>
      <ul>
        {items.map((article) => (
          <li key={article._id}>
            {article.title} - {article.status}
          </li>
        ))}
      </ul>
    </div>
  );
}


