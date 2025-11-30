import React, { useEffect, useState, useContext } from 'react';
import { Card, Button, Modal, Form, Table } from '../components/UI';
import { centersAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const RecyclingCenters = () => {
  const { showNotification } = useContext(NotificationContext);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const response = await centersAPI.getAll();
      setCenters(response.data.data || []);
    } catch (error) {
      showNotification('Error fetching recycling centers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await centersAPI.update(editingId, formData);
        showNotification('Recycling center updated successfully', 'success');
      } else {
        await centersAPI.create(formData);
        showNotification('Recycling center created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingId(null);
      await fetchCenters();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error saving recycling center', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await centersAPI.delete(id);
        showNotification('Recycling center deleted successfully', 'success');
        await fetchCenters();
      } catch (error) {
        showNotification(error.response?.data?.error || 'Error deleting recycling center', 'error');
      }
    }
  };

  const handleEdit = (center) => {
    setEditingId(center.center_id);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Recycling Centers</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Center
        </Button>
      </div>

      <Card>
        <Table
          headers={['Center ID', 'Location', 'Capacity (kg)', 'Operating Hours', 'Created At']}
          rows={centers.map((center) => ({
            id: center.center_id,
            location: center.location,
            capacity: center.capacity,
            hours: center.operating_hours || '-',
            created: new Date(center.created_at).toLocaleDateString(),
          }))}
          actions={(row) => [
            <Button
              key="edit"
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(centers.find((c) => c.center_id == row.id))}
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
        title={editingId ? 'Edit Recycling Center' : 'Add New Recycling Center'}
      >
        <Form
          key={editingId || 'new'}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          fields={[
            {
              name: 'location',
              label: 'Location',
              placeholder: 'e.g., 123 Recycling Ave',
              required: true,
              value: editingId
                ? centers.find((c) => c.center_id === editingId)?.location || ''
                : '',
            },
            {
              name: 'capacity',
              label: 'Capacity (kg)',
              type: 'number',
              placeholder: 'e.g., 5000',
              required: true,
              value: editingId
                ? centers.find((c) => c.center_id === editingId)?.capacity || ''
                : '',
            },
            {
              name: 'operating_hours',
              label: 'Operating Hours',
              placeholder: 'e.g., 9:00 AM - 5:00 PM',
              value: editingId
                ? centers.find((c) => c.center_id === editingId)?.operating_hours || ''
                : '',
            },
          ]}
          submitLabel={editingId ? 'Update Center' : 'Create Center'}
        />
      </Modal>
    </div>
  );
};
