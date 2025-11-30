import React, { useEffect, useState, useContext } from 'react';
import { Card, Button, Modal, Form, Table, Badge } from '../components/UI';
import { wasteAPI, areasAPI, citizensAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Trash, Recycle } from 'lucide-react';

export const Waste = () => {
  const { showNotification } = useContext(NotificationContext);
  const [wastes, setWastes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchWastes(), fetchAreas(), fetchCitizens()]).finally(() => setLoading(false));
  }, []);

  const fetchWastes = async () => {
    try {
      const response = await wasteAPI.getAll();
      setWastes(response.data.data || []);
    } catch (error) {
      showNotification('Error fetching waste records', 'error');
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await areasAPI.getAll();
      setAreas(response.data.data || []);
    } catch (error) {
      console.error('Error fetching areas:', error);
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
        await wasteAPI.update(editingId, formData);
        showNotification('Waste record updated successfully', 'success');
      } else {
        await wasteAPI.create(formData);
        showNotification('Waste record created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingId(null);
      await fetchWastes();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error saving waste record', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this waste record?')) {
      try {
        await wasteAPI.delete(id);
        showNotification('Waste record deleted successfully', 'success');
        await fetchWastes();
      } catch (error) {
        showNotification(error.response?.data?.error || 'Error deleting waste record', 'error');
      }
    }
  };

  const handleEdit = (waste) => {
    setEditingId(waste.waste_id);
    setIsModalOpen(true);
  };

  const getAreaName = (areaId) => {
    const area = areas.find((a) => a.area_id == areaId);
    return area ? area.area_name : '-';
  };

  const getWasteTypeIcon = (type) => {
    if (type === 'Recyclable') return '♻️';
    if (type === 'Organic') return '🌱';
    if (type === 'Hazardous') return '⚠️';
    return '🗑️';
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading waste records...</div>;

  const totalWaste = wastes.reduce((sum, w) => sum + parseFloat(w.quantity || 0), 0);
  const totalRecords = wastes.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Waste Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Record Waste
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Waste Collected</p>
              <p className="text-3xl font-bold text-green-600">{totalWaste.toFixed(2)} kg</p>
            </div>
            <Recycle className="text-green-400" size={40} />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Records</p>
              <p className="text-3xl font-bold text-blue-600">{totalRecords}</p>
            </div>
            <Trash className="text-blue-400" size={40} />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <p className="text-gray-600 text-sm">Avg Weight/Record</p>
          <p className="text-3xl font-bold text-orange-600">
            {totalRecords > 0 ? (totalWaste / totalRecords).toFixed(2) : '0'} kg
          </p>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Waste Records</h3>
        </div>
        <Table
          headers={['Waste ID', 'Type', 'Area', 'Quantity (kg)', 'Collection Date', 'Status']}
          rows={wastes.map((waste) => ({
            id: waste.waste_id,
            type: `${getWasteTypeIcon(waste.waste_type)} ${waste.waste_type}`,
            area: getAreaName(waste.area_id),
            quantity: waste.quantity || '0',
            date: new Date(waste.collection_date).toLocaleDateString(),
            status: waste.status || 'Pending',
          }))}
          actions={(row) => [
            <Button
              key="edit"
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(wastes.find((w) => w.waste_id == row.id))}
            >
              <Edit size={16} />
            </Button>,
            <Button
              key="delete"
              variant="danger"
              size="sm"
              onClick={() => handleDelete(row.id)}
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
        title={editingId ? 'Edit Waste Record' : 'Record New Waste'}
      >
        <Form
          key={editingId || 'new'}
          fields={[
            {
              name: 'waste_type',
              label: 'Waste Type',
              type: 'select',
              options: [
                { value: 'Organic', label: '🌱 Organic' },
                { value: 'Recyclable', label: '♻️ Recyclable' },
                { value: 'Hazardous', label: '⚠️ Hazardous' },
                { value: 'General', label: '🗑️ General' },
              ],
              value: editingId ? wastes.find((w) => w.waste_id === editingId)?.waste_type || '' : '',
              required: true,
            },
            {
              name: 'citizen_id',
              label: 'Citizen',
              type: 'select',
              options: citizens.map((c) => ({ value: c.citizen_id, label: c.name })),
              value: editingId ? wastes.find((w) => w.waste_id === editingId)?.citizen_id || '' : '',
              required: true,
            },
            {
              name: 'area_id',
              label: 'Area',
              type: 'select',
              options: areas.map((a) => ({ value: a.area_id, label: a.area_name })),
              value: editingId ? wastes.find((w) => w.waste_id === editingId)?.area_id || '' : '',
              required: true,
            },
            {
              name: 'quantity',
              label: 'Quantity (kg)',
              type: 'number',
              value: editingId ? wastes.find((w) => w.waste_id === editingId)?.quantity || '' : '',
              required: true,
              step: '0.01',
            },
            {
              name: 'collection_date',
              label: 'Collection Date',
              type: 'date',
              value: editingId ? wastes.find((w) => w.waste_id === editingId)?.collection_date || '' : '',
              required: true,
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'Pending', label: 'Pending' },
                { value: 'Collected', label: 'Collected' },
                { value: 'Processed', label: 'Processed' },
              ],
              value: editingId ? wastes.find((w) => w.waste_id === editingId)?.status || 'Pending' : 'Pending',
              required: true,
            },
          ]}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel={editingId ? 'Update' : 'Record'}
        />
      </Modal>
    </div>
  );
};
