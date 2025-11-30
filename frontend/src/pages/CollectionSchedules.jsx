import React, { useEffect, useState, useContext } from 'react';
import { Card, Button, Modal, Form, Table } from '../components/UI';
import { schedulesAPI, areasAPI } from '../services/api';
import { NotificationContext } from '../context/NotificationContext';
import { Plus, Edit, Trash2 } from 'lucide-react';

export const CollectionSchedules = () => {
  const { showNotification } = useContext(NotificationContext);
  const [schedules, setSchedules] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, areasRes] = await Promise.all([
        schedulesAPI.getAll(),
        areasAPI.getAll(),
      ]);
      setSchedules(schedulesRes.data.data || []);
      setAreas(areasRes.data.data || []);
    } catch (error) {
      showNotification('Error fetching schedules', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await schedulesAPI.update(editingId, formData);
        showNotification('Schedule updated successfully', 'success');
      } else {
        await schedulesAPI.create(formData);
        showNotification('Schedule created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingId(null);
      await fetchData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Error saving schedule', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (schedule) => {
    setEditingId(schedule.schedule_id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await schedulesAPI.delete(id);
        showNotification('Schedule deleted successfully', 'success');
        await fetchData();
      } catch (error) {
        showNotification(error.response?.data?.error || 'Error deleting schedule', 'error');
      }
    }
  };

  const getAreaName = (areaId) => {
    const area = areas.find((a) => a.area_id == areaId);
    return area ? area.area_name : 'N/A';
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Collection Schedules</h1>
        <Button
          variant="primary"
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Create Schedule
        </Button>
      </div>

      <Card>
        <Table
          headers={['Schedule ID', 'Area', 'Date', 'Created At']}
          rows={schedules.map((schedule) => ({
            id: schedule.schedule_id,
            area: getAreaName(schedule.area_id),
            date: new Date(schedule.schedule_date).toLocaleDateString(),
            created: new Date(schedule.created_at).toLocaleDateString(),
          }))}
          actions={(row) => {
            const schedule = schedules.find((s) => s.schedule_id === row.id);
            return [
              <Button
                key="edit"
                variant="secondary"
                size="sm"
                onClick={() => handleEdit(schedule)}
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
            ];
          }}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
        }}
        title={editingId ? 'Edit Schedule' : 'Create New Schedule'}
      >
        <Form
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
          fields={[
            {
              name: 'area_id',
              label: 'Area',
              type: 'select',
              options: areas.map((area) => ({
                value: area.area_id,
                label: area.area_name,
              })),
              value: editingId ? schedules.find((s) => s.schedule_id === editingId)?.area_id || '' : '',
              required: true,
            },
            {
              name: 'schedule_date',
              label: 'Schedule Date',
              type: 'date',
              value: editingId ? schedules.find((s) => s.schedule_id === editingId)?.schedule_date || '' : '',
              required: true,
            },
          ]}
          submitLabel={editingId ? 'Update Schedule' : 'Create Schedule'}
        />
      </Modal>
    </div>
  );
};
