import React, { useEffect, useState, useContext } from 'react';
import { Card, Button, Modal, Form, Table, Badge } from '../components/UI';
import { citizensAPI, areasAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Phone, Mail } from 'lucide-react';

export const Citizens = () => {
  const { showNotification } = useContext(NotificationContext);
  const [citizens, setCitizens] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchCitizens(), fetchAreas()]).finally(() => setLoading(false));
  }, []);

  const fetchCitizens = async () => {
    try {
      const response = await citizensAPI.getAll();
      setCitizens(response.data.data || []);
    } catch (error) {
      showNotification('Error fetching citizens', 'error');
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

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await citizensAPI.update(editingId, formData);
        showNotification('Citizen updated successfully', 'success');
      } else {
        await citizensAPI.create(formData);
        showNotification('Citizen added successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingId(null);
      await fetchCitizens();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error saving citizen', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this citizen?')) {
      try {
        await citizensAPI.delete(id);
        showNotification('Citizen deleted successfully', 'success');
        await fetchCitizens();
      } catch (error) {
        showNotification(error.response?.data?.error || 'Error deleting citizen', 'error');
      }
    }
  };

  const handleEdit = (citizen) => {
    setEditingId(citizen.citizen_id);
    setIsModalOpen(true);
  };

  const getAreaName = (areaId) => {
    const area = areas.find((a) => a.area_id == areaId);
    return area ? area.area_name : '-';
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading citizens...</div>;

  const totalCitizens = citizens.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Citizens</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Citizen
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-gray-600 text-sm">Total Citizens</p>
          <p className="text-3xl font-bold text-blue-600">{totalCitizens}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-gray-600 text-sm">Active Areas</p>
          <p className="text-3xl font-bold text-green-600">{areas.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-gray-600 text-sm">Avg Citizens/Area</p>
          <p className="text-3xl font-bold text-purple-600">
            {areas.length > 0 ? (totalCitizens / areas.length).toFixed(1) : '0'}
          </p>
        </Card>
      </div>

      <Card>
        <Table
          headers={['Citizen ID', 'Name', 'Address', 'Contact', 'Area']}
          rows={citizens.map((citizen) => ({
            id: citizen.citizen_id,
            name: citizen.name,
            address: citizen.address || '-',
            contact: citizen.contact || '-',
            area: getAreaName(citizen.area_id),
          }))}
          actions={(row) => [
            <Button
              key="edit"
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(citizens.find((c) => c.citizen_id == row.id))}
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
        title={editingId ? 'Edit Citizen' : 'Add New Citizen'}
      >
        <Form
          key={editingId || 'new'}
          fields={[
            {
              name: 'name',
              label: 'Full Name',
              type: 'text',
              required: true,
              value: editingId
                ? citizens.find((c) => c.citizen_id === editingId)?.name || ''
                : '',
            },
            {
              name: 'address',
              label: 'Address',
              type: 'text',
              required: true,
              value: editingId
                ? citizens.find((c) => c.citizen_id === editingId)?.address || ''
                : '',
            },
            {
              name: 'contact',
              label: 'Contact Number',
              type: 'tel',
              required: false,
              value: editingId
                ? citizens.find((c) => c.citizen_id === editingId)?.contact || ''
                : '',
            },
            {
              name: 'area_id',
              label: 'Area',
              type: 'select',
              options: areas.map((a) => ({ value: a.area_id, label: a.area_name })),
              required: true,
              value: editingId
                ? citizens.find((c) => c.citizen_id === editingId)?.area_id || ''
                : '',
            },
          ]}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel={editingId ? 'Update' : 'Add'}
        />
      </Modal>
    </div>
  );
};
