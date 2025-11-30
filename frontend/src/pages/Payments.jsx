import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Card, Button, Modal, Form, Table } from '../components/UI';
import { paymentsAPI, billsAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Trash2, Search, Filter } from 'lucide-react';

export const Payments = () => {
  const { showNotification } = useContext(NotificationContext);
  const [payments, setPayments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');

  useEffect(() => {
    fetchPayments();
    fetchBills();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await paymentsAPI.getAll();
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      const response = await billsAPI.getAll();
      setBills(response.data.data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      await paymentsAPI.create(formData);
      showNotification('Payment recorded successfully', 'success');
      setIsModalOpen(false);
      await fetchPayments();
      await fetchBills();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error recording payment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return payments.filter((payment) => {
      const paymentId = (payment?.payment_id || '').toString();
      const amount = (payment?.amount || '').toString();
      const citizenName = (payment?.citizen_name || '').toLowerCase();
      
      const matchesSearch = paymentId.includes(searchTerm) ||
                           amount.includes(searchTerm) ||
                           citizenName.includes(searchTerm.toLowerCase());
      const matchesFilter = filterMethod === 'All' || payment?.payment_method === filterMethod;
      return matchesSearch && matchesFilter;
    });
  }, [payments, searchTerm, filterMethod]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-gray-600 text-sm">Total Payments</p>
          <p className="text-3xl font-bold text-green-600">
            ${(payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toFixed(2)}
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-gray-600 text-sm">Total Transactions</p>
          <p className="text-3xl font-bold text-blue-600">{(payments || []).length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-gray-600 text-sm">Average Payment</p>
          <p className="text-3xl font-bold text-purple-600">
            ${(payments || []).length > 0 ? ((payments || []).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0) / (payments || []).length).toFixed(2) : '0'}
          </p>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <Card>
        <div className="space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by payment ID, amount, or citizen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 items-center md:w-64">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Online">Online</option>
                <option value="Check">Check</option>
                <option value="Transfer">Transfer</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Showing {filteredPayments.length} of {payments.length} payments
          </p>
        </div>
      </Card>

      <Card>
        <Table
          headers={['Payment ID', 'Citizen', 'Bill ID', 'Amount', 'Method', 'Date']}
          rows={filteredPayments.map((payment) => {
            try {
              return {
                id: payment?.payment_id || '-',
                citizen: payment?.citizen_name || '-',
                bill: payment?.bill_id || '-',
                amount: `$${payment?.amount || 0}`,
                method: payment?.payment_method || '-',
                date: payment?.created_at ? new Date(payment.created_at).toLocaleDateString() : '-',
              };
            } catch (e) {
              console.error('Error rendering payment row:', e);
              return {
                id: '-',
                citizen: '-',
                bill: '-',
                amount: '-',
                method: '-',
                date: '-',
              };
            }
          })}
          actions={(row) => [
            <Button
              key="delete"
              variant="danger"
              size="sm"
              onClick={() => {
                // Delete functionality will be added in future
                showNotification('Delete functionality coming soon', 'info');
              }}
              className="text-sm px-2 py-1"
            >
              <Trash2 size={16} />
            </Button>,
          ]}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Payment"
      >
        <Form
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          fields={[
            {
              name: 'bill_id',
              label: 'Bill',
              type: 'select',
              options: (bills || []).map((b) => ({ value: b.bill_id, label: `Bill #${b.bill_id} - ${b.citizen_name || 'Unknown'} ($${b.amount})` })),
              required: true,
            },
            {
              name: 'amount',
              label: 'Amount',
              type: 'number',
              required: true,
              placeholder: '0.00',
            },
            {
              name: 'payment_method',
              label: 'Payment Method',
              type: 'select',
              options: [
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Cheque', label: 'Cheque' },
              ],
              required: true,
            },
          ]}
          submitLabel="Record Payment"
        />
      </Modal>
    </div>
  );
};
