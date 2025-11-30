import React, { useEffect, useState, useContext } from 'react';
import { Card, Modal, Form } from '../components/UI';
import { areasAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const Areas = () => {
  const { showNotification } = useContext(NotificationContext);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      console.log('Fetching areas...');
      const response = await areasAPI.getAll();
      console.log('Full API Response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      
      // API returns { success: true, data: [...] }
      let areasData = [];
      if (response.data && response.data.data) {
        console.log('Extracting from response.data.data');
        areasData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        console.log('Response.data is already an array');
        areasData = response.data;
      } else if (Array.isArray(response.data?.data)) {
        console.log('Extracting array from response.data.data');
        areasData = response.data.data;
      }
      
      console.log('Extracted areas data:', areasData);
      console.log('Areas count:', areasData.length);
      
      const validAreas = Array.isArray(areasData) ? areasData : [];
      console.log('Setting areas state with:', validAreas);
      setAreas(validAreas);
    } catch (error) {
      console.error('Error fetching areas:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      showNotification('Error fetching areas', 'error');
      setAreas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    console.log('Submitting form data:', formData);
    setIsSubmitting(true);
    try {
      if (editingId) {
        const response = await areasAPI.update(editingId, formData);
        console.log('Update response:', response);
        showNotification('Area updated successfully', 'success');
      } else {
        const response = await areasAPI.create(formData);
        console.log('Create response:', response);
        showNotification('Area created successfully', 'success');
      }
      
      // Close modal immediately
      setIsModalOpen(false);
      setEditingId(null);
      
      // Small delay to ensure database write is complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Fetch fresh data immediately after successful creation/update
      console.log('Calling fetchAreas after create/update...');
      await fetchAreas();
      console.log('Areas fetched successfully after creation/update');
    } catch (error) {
      console.error('Submit error:', error);
      showNotification(error.response?.data?.error || 'Error saving area', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (areaId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this area? This action cannot be undone.');
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      console.log('Deleting area:', areaId);
      const response = await areasAPI.delete(areaId);
      console.log('Delete response:', response);
      
      if (response.data && response.data.success) {
        showNotification('Area deleted successfully!', 'success');
        // Small delay to ensure database write is complete
        await new Promise(resolve => setTimeout(resolve, 500));
        // Refresh the list
        await fetchAreas();
      } else {
        showNotification(response.data?.error || 'Failed to delete area', 'error');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification(error.response?.data?.error || error.message || 'Error deleting area', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (area) => {
    setEditingId(area.area_id);
    setIsModalOpen(true);
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Areas</h1>
        <button
          type="button"
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <Plus size={20} />
          Add Area
        </button>
      </div>

      <Card>
        {areas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No areas found. Create one to get started!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Area ID</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Description</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Created At</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {areas.map((area) => (
                  <tr key={area.area_id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">{area.area_id}</td>
                    <td className="px-6 py-4 font-medium">{area.area_name}</td>
                    <td className="px-6 py-4">{area.description || '-'}</td>
                    <td className="px-6 py-4">{new Date(area.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(area)}
                        disabled={deleting}
                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed px-3 py-2 rounded text-sm flex items-center gap-1"
                        title="Edit this area"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(area.area_id)}
                        disabled={deleting}
                        className="bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed px-3 py-2 rounded text-sm flex items-center gap-1"
                        title="Delete this area"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title={editingId ? 'Edit Area' : 'Add New Area'}
      >
        <Form
          key={`${isModalOpen}-${editingId}`}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          fields={[
            {
              name: 'area_name',
              label: 'Area Name',
              placeholder: 'e.g., Downtown',
              required: true,
              value: editingId
                ? areas.find((a) => a.area_id === editingId)?.area_name || ''
                : '',
            },
            {
              name: 'description',
              label: 'Description',
              type: 'textarea',
              placeholder: 'Area description...',
              value: editingId
                ? areas.find((a) => a.area_id === editingId)?.description || ''
                : '',
            },
          ]}
          submitLabel={editingId ? 'Update Area' : 'Create Area'}
        />
      </Modal>
    </div>
  );
};
