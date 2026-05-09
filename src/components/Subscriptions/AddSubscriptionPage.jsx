import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SubscriptionForm from './SubscriptionForm';
import { useSubscriptions } from '../../hooks/useSubscriptions';

export default function AddSubscriptionPage() {
  const navigate = useNavigate();
  const { addSubscription, error } = useSubscriptions();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await addSubscription(formData);
      navigate('/subscriptions');
    } catch (err) {
      setSubmitError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/subscriptions')}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">New Subscription</h1>
          <p className="text-slate-400 text-sm mt-1">Assign a membership plan to a member</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        {(error || submitError) && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error || submitError}
          </div>
        )}
        
        <SubscriptionForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
