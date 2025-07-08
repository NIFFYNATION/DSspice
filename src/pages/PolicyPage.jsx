import { useEffect, useState } from 'react';
import generalService from '../api/generalService';

export default function PolicyPage() {
  const [policy, setPolicy] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generalService.getPolicyAndTerms().then(res => {
      if (res.code === 200 && res.data?.policy) {
        setPolicy(res.data.policy);
      } else {
        setError(res.message || 'Failed to load policy.');
      }
      setLoading(false);
    }).catch(err => {
      setError('Failed to load policy.');
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Privacy Policy</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: policy || '<p>No policy available.</p>' }} />
      )}
    </div>
  );
} 