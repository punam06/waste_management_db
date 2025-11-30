import React, { useEffect, useState, useContext } from 'react';
import { Card, Button, Modal, Form, Table } from '../components/UI';
import { binsAPI, areasAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Edit, Trash2, AlertCircle, CheckCircle, Zap } from 'lucide-react';

export const Bins = () => {
  const { showNotification } = useContext(NotificationContext);
  const [bins, setBins] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingFillLevel, setEditingFillLevel] = useState(null);
  const [isFillModalOpen, setIsFillModalOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchBins(), fetchAreas()]).finally(() => setLoading(false));
  }, []);

  const fetchBins = async () => {
    try {
      const response = await binsAPI.getAll();
      setBins(response.data.data || []);
    } catch (error) {
      showNotification('Error fetching bins', 'error');
      console.error('Error:', error);
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
        await binsAPI.update(editingId, formData);
        showNotification('Bin updated successfully', 'success');
      } else {
        await binsAPI.create(formData);
        showNotification('Bin created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingId(null);
      await fetchBins();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error saving bin', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFillLevel = async () => {
    if (!editingFillLevel || editingFillLevel.fillLevel === null) {
      showNotification('Please enter a fill level', 'error');
      return;
    }

    try {
      await binsAPI.updateFillLevel(editingFillLevel.id, editingFillLevel.fillLevel);
      showNotification('Fill level updated successfully', 'success');
      setIsFillModalOpen(false);
      setEditingFillLevel(null);
      await fetchBins();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error updating fill level', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bin?')) {
      try {
        await binsAPI.delete(id);
        showNotification('Bin deleted successfully', 'success');
        await fetchBins();
      } catch (error) {
        showNotification(error.response?.data?.error || 'Error deleting bin', 'error');
      }
    }
  };

  const handleEdit = (bin) => {
    setEditingId(bin.bin_id);
    setIsModalOpen(true);
  };

  const handleFillLevelClick = (bin) => {
    setEditingFillLevel({ id: bin.bin_id, fillLevel: bin.fill_level });
    setIsFillModalOpen(true);
  };

  const getAreaName = (areaId) => {
    const area = areas.find((a) => a.area_id == areaId);
    return area ? area.area_name : '-';
  };

  const getFillStatusIcon = (fillLevel) => {
    if (fillLevel >= 80) return <AlertCircle className="text-red-500" size={20} />;
    if (fillLevel >= 50) return <AlertCircle className="text-yellow-500" size={20} />;
    return <CheckCircle className="text-green-500" size={20} />;
  };

  const getFillStatusColor = (fillLevel) => {
    if (fillLevel >= 80) return 'bg-red-100 text-red-800';
    if (fillLevel >= 50) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getFillStatusLabel = (fillLevel) => {
    if (fillLevel >= 80) return 'Critical';
    if (fillLevel >= 50) return 'Warning';
    return 'Normal';
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading bins...</div>;

  const totalBins = bins.length;
  const fillableBins = bins.filter((b) => b.fill_level < 100).length;
  const criticalBins = bins.filter((b) => b.fill_level >= 80).length;
  const avgFillLevel = totalBins > 0 ? (bins.reduce((sum, b) => sum + (b.fill_level || 0), 0) / totalBins).toFixed(2) : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Waste Bins</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Bin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bins</p>
              <p className="text-3xl font-bold text-blue-600">{totalBins}</p>
            </div>
            <Zap className="text-blue-400" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available</p>
              <p className="text-3xl font-bold text-green-600">{fillableBins}</p>
            </div>
            <CheckCircle className="text-green-400" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Critical</p>
              <p className="text-3xl font-bold text-red-600">{criticalBins}</p>
            </div>
            <AlertCircle className="text-red-400" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-gray-600 text-sm">Avg Fill Level</p>
          <p className="text-3xl font-bold text-purple-600">{avgFillLevel}%</p>
        </Card>
      </div>

      <Card>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Bins Status</h3>
        </div>
        <Table
          headers={['Bin ID', 'Area', 'Location', 'Capacity', 'Fill Level', 'Status']}
          rows={bins.map((bin) => ({
            id: bin.bin_id,
            area: getAreaName(bin.area_id),
            location: bin.location || '-',
            capacity: (bin.capacity || 0) + ' L',
            fillLevel: (bin.fill_level || 0) + '%',
            status: getFillStatusLabel(bin.fill_level || 0),
          }))}
          actions={(row) => [
            <button
              key="fill"
              onClick={() => handleFillLevelClick(bins.find((b) => b.bin_id == row.id))}
              className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              title="Update Fill Level"
            >
              Fill
            </button>,
            <Button
              key="edit"
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(bins.find((b) => b.bin_id == row.id))}
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
        title={editingId ? 'Edit Bin' : 'Add New Bin'}
      >
        <Form
          key={editingId || 'new'}
          fields={[
            {
              name: 'area_id',
              label: 'Area',
              type: 'select',
              options: areas.map((a) => ({ value: a.area_id, label: a.area_name })),
              value: editingId ? bins.find((b) => b.bin_id === editingId)?.area_id || '' : '',
              required: true,
            },
            {
              name: 'location',
              label: 'Location',
              type: 'text',
              value: editingId ? bins.find((b) => b.bin_id === editingId)?.location || '' : '',
              required: false,
              placeholder: 'e.g., Main Street, Park entrance',
            },
            {
              name: 'capacity',
              label: 'Capacity (Liters)',
              type: 'number',
              value: editingId ? bins.find((b) => b.bin_id === editingId)?.capacity || 100 : 100,
              required: false,
              step: '1',
              min: '10',
            },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' },
                { value: 'Maintenance', label: 'Maintenance' },
              ],
              value: editingId ? bins.find((b) => b.bin_id === editingId)?.status || 'Active' : 'Active',
              required: true,
            },
            {
              name: 'fill_level',
              label: 'Fill Level (%)',
              type: 'number',
              value: editingId ? bins.find((b) => b.bin_id === editingId)?.fill_level || 0 : 0,
              required: false,
              step: '1',
              min: '0',
              max: '100',
            },
            {
              name: 'sensor',
              label: 'Sensor ID (Optional)',
              type: 'text',
              value: editingId ? bins.find((b) => b.bin_id === editingId)?.sensor || '' : '',
              required: false,
            },
          ]}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          submitLabel={editingId ? 'Update' : 'Create'}
        />
      </Modal>

      <Modal
        isOpen={isFillModalOpen}
        onClose={() => {
          setIsFillModalOpen(false);
          setEditingFillLevel(null);
        }}
        title="Update Fill Level"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fill Level (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={editingFillLevel?.fillLevel ?? ''}
              onChange={(e) =>
                setEditingFillLevel({ ...editingFillLevel, fillLevel: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleUpdateFillLevel}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Update
            </button>
            <button
              onClick={() => {
                setIsFillModalOpen(false);
                setEditingFillLevel(null);
              }}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
