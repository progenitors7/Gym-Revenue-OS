import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PaymentForm from './PaymentForm';
import { usePayments } from '../../hooks/usePayments';

export default function AddPaymentPage() {
  const navigate = useNavigate();
  const { addPayment, error } = usePayments();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Ensure empty strings are null for optional foreign keys
      const dataToSubmit = {
        ...formData,
        subscription_id: formData.subscription_id || null
      };
      await addPayment(dataToSubmit);
      navigate('/payments');
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
          onClick={() => navigate('/payments')}
          className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Record Payment</h1>
          <p className="text-slate-400 text-sm mt-1">Log a new payment from a member</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
        {(error || submitError) && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">
            {error || submitError}
          </div>
        )}
        
        <PaymentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  );
}
