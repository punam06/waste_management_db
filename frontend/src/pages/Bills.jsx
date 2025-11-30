import React, { useEffect, useState, useContext, useMemo } from 'react';
import { Card, Button, Modal, Form, Table, Badge } from '../components/UI';
import { billsAPI, citizensAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Search, Filter, DollarSign, FileText, TrendingUp } from 'lucide-react';

export const Bills = () => {
  const { showNotification } = useContext(NotificationContext);
  const [bills, setBills] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchBills();
    fetchCitizens();
  }, []);

  const fetchBills = async () => {
    try {
      const response = await billsAPI.getAll();
      setBills(response.data.data || []);
    } catch (error) {
      showNotification('Error fetching bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCitizens = async () => {
    try {
      const response = await citizensAPI.getAll();
      setCitizens(response.data.data || []);
    } catch (error) {
      console.error('Error fetching citizens:', error);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await billsAPI.updateStatus(editingId, formData.status);
        showNotification('Bill updated successfully', 'success');
      } else {
        await billsAPI.create(formData);
        showNotification('Bill created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingId(null);
      await fetchBills();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error saving bill', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await billsAPI.delete(id);
        showNotification('Bill deleted successfully', 'success');
        await fetchBills();
      } catch (error) {
        showNotification(error.response?.data?.error || 'Error deleting bill', 'error');
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'Paid': 'success',
      'Pending': 'warning',
      'Overdue': 'danger',
    };
    return <Badge variant={variants[status] || 'primary'}>{status}</Badge>;
  };

  const getCitizenName = (citizenId) => {
    const citizen = citizens.find((c) => c.citizen_id == citizenId);
    return citizen ? citizen.name : '-';
  };

  // Filter and search bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const citizenName = getCitizenName(bill.citizen_id).toLowerCase();
      const matchesSearch = citizenName.includes(searchTerm.toLowerCase()) ||
                           bill.bill_id.toString().includes(searchTerm) ||
                           bill.amount.toString().includes(searchTerm);
      const matchesFilter = filterStatus === 'All' || bill.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [bills, searchTerm, filterStatus, citizens]);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  // Calculate summary statistics
  const totalBills = bills.length;
  const totalAmount = bills.reduce((sum, bill) => sum + (parseFloat(bill.amount) || 0), 0);
  const paidBills = bills.filter((b) => b.status === 'Paid').length;
  const pendingBills = bills.filter((b) => b.status === 'Pending').length;
  const overdueBills = bills.filter((b) => b.status === 'Overdue').length;
  const collectionRate = totalBills > 0 ? ((paidBills / totalBills) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Bills</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Bill
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bills</p>
              <p className="text-3xl font-bold text-blue-600">{totalBills}</p>
            </div>
            <FileText className="text-blue-400" size={40} />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Amount</p>
              <p className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
            </div>
            <DollarSign className="text-green-400" size={40} />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div>
            <p className="text-gray-600 text-sm">Collection Status</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm">Paid: {paidBills}</span>
                <span className="text-lg font-bold text-green-600">{collectionRate}%</span>
              </div>
              <div className="text-sm text-gray-600">Pending: {pendingBills} | Overdue: {overdueBills}</div>
            </div>
          </div>
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
                placeholder="Search by citizen name or bill ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2 items-center md:w-64">
              <Filter size={20} className="text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Showing {filteredBills.length} of {bills.length} bills
          </p>
        </div>
      </Card>

      <Card>
        <Table
          headers={['Bill ID', 'Citizen', 'Amount', 'Status', 'Due Date']}
          rows={filteredBills.map((bill) => ({
            id: bill.bill_id,
            citizen: getCitizenName(bill.citizen_id),
            amount: `$${bill.amount}`,
            status: getStatusBadge(bill.status),
            due: new Date(bill.due_date).toLocaleDateString(),
          }))}
          actions={(row) => [
            <Button
              key="edit"
              variant="secondary"
              size="sm"
              onClick={() => {
                setEditingId(row.id);
                setIsModalOpen(true);
              }}
              className="text-sm px-2 py-1"
            >
              <Edit size={16} />
            </Button>,
            <Button
              key="delete"
              variant="danger"
              size="sm"
              onClick={() => handleDelete(row.id)}
              className="text-sm px-2 py-1"
            >
              <Trash2 size={16} />
            </Button>,
          ]}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title={editingId ? 'Edit Bill' : 'Add New Bill'}
      >
        <Form
          key={editingId || 'new'}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          fields={[
            {
              name: 'citizen_id',
              label: 'Citizen',
              type: 'select',
              options: citizens.map((c) => ({ value: c.citizen_id, label: c.name })),
              required: true,
              value: editingId
                ? bills.find((b) => b.bill_id === editingId)?.citizen_id || ''
                : '',
            },
            {
              name: 'amount',
              label: 'Amount',
              type: 'number',
              required: true,
              value: editingId
                ? bills.find((b) => b.bill_id === editingId)?.amount || ''
                : '',
            },
            {
              name: 'due_date',
              label: 'Due Date',
              type: 'date',
              required: true,
              value: editingId
                ? bills.find((b) => b.bill_id === editingId)?.due_date || ''
                : '',
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'Pending', label: 'Pending' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Overdue', label: 'Overdue' },
              ],
              required: true,
              value: editingId ? bills.find((b) => b.bill_id === editingId)?.status || '' : '',
            },
          ]}
          submitLabel={editingId ? 'Update Bill' : 'Create Bill'}
        />
      </Modal>
    </div>
  );
};
