import React, { useEffect, useState, useContext } from 'react';
import { Card, Button, Modal, Form, Table } from '../components/UI';
import { crewAPI, areasAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Edit, Trash2, Users, MapPin, BarChart3 } from 'lucide-react';

export const Crew = () => {
  const { showNotification } = useContext(NotificationContext);
  const [crew, setCrew] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [crewRes, areasRes] = await Promise.all([
        crewAPI.getAll(),
        areasAPI.getAll(),
      ]);
      setCrew(crewRes.data.data || []);
      setAreas(areasRes.data.data || []);
    } catch (error) {
      showNotification('Error fetching crew', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await crewAPI.update(editingId, formData);
        showNotification('Crew member updated successfully', 'success');
      } else {
        await crewAPI.create(formData);
        showNotification('Crew member created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingId(null);
      await fetchData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error saving crew member', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await crewAPI.delete(id);
        showNotification('Crew member deleted successfully', 'success');
        await fetchData();
      } catch (error) {
        showNotification(error.response?.data?.error || 'Error deleting crew member', 'error');
      }
    }
  };

  const handleEdit = (crewMember) => {
    setEditingId(crewMember.crew_id);
    setIsModalOpen(true);
  };

  const getAreaName = (areaId) => {
    const area = areas.find((a) => a.area_id == areaId);
    return area ? area.area_name : 'N/A';
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  const totalCrew = crew.length;
  const crewByArea = crew.reduce((acc, member) => {
    const areaName = getAreaName(member.area_id);
    acc[areaName] = (acc[areaName] || 0) + 1;
    return acc;
  }, {});
  const largestArea = Object.keys(crewByArea).length > 0 ? Object.entries(crewByArea).reduce((a, b) => (a[1] > b[1] ? a : b))[0] : 'N/A';
  const crewInLargestArea = crewByArea[largestArea] || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Crew Management</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add Crew Member
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Crew Members</p>
              <p className="text-3xl font-bold text-blue-600">{totalCrew}</p>
            </div>
            <Users className="text-blue-400" size={40} />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Areas</p>
              <p className="text-3xl font-bold text-green-600">{Object.keys(crewByArea).length}</p>
            </div>
            <MapPin className="text-green-400" size={40} />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div>
            <p className="text-gray-600 text-sm">Largest Team</p>
            <p className="text-2xl font-bold text-purple-600">{largestArea}</p>
            <p className="text-sm text-gray-500 mt-1">{crewInLargestArea} members</p>
          </div>
        </Card>
      </div>

      <Card>
        <Table
          headers={['Crew ID', 'Name', 'Contact', 'Area', 'Created At']}
          rows={crew.map((crewMember) => ({
            id: crewMember.crew_id,
            name: crewMember.crew_name,
            contact: crewMember.contact || '-',
            area: getAreaName(crewMember.area_id),
            created: new Date(crewMember.created_at).toLocaleDateString(),
          }))}
          actions={(row) => [
            <Button
              key="edit"
              variant="secondary"
              size="sm"
              onClick={() => handleEdit(crew.find((c) => c.crew_id == row.id))}
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
        title={editingId ? 'Edit Crew Member' : 'Add New Crew Member'}
      >
        <Form
          key={editingId || 'new'}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          fields={[
            {
              name: 'crew_name',
              label: 'Crew Member Name',
              placeholder: 'e.g., John Smith',
              required: true,
              value: editingId
                ? crew.find((c) => c.crew_id === editingId)?.crew_name || ''
                : '',
            },
            {
              name: 'contact',
              label: 'Contact Number',
              placeholder: 'e.g., +1-555-0123',
              value: editingId
                ? crew.find((c) => c.crew_id === editingId)?.contact || ''
                : '',
            },
            {
              name: 'area_id',
              label: 'Assigned Area',
              type: 'select',
              options: areas.map((area) => ({
                value: area.area_id,
                label: area.area_name,
              })),
              required: true,
              value: editingId
                ? crew.find((c) => c.crew_id === editingId)?.area_id || ''
                : '',
            },
          ]}
          submitLabel={editingId ? 'Update Crew Member' : 'Create Crew Member'}
        />
      </Modal>
    </div>
  );
};
