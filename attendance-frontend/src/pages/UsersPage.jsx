import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { UserPlus, Search } from 'lucide-react'
import { userService } from '../services/userService'
import { getErrorMessage } from '../utils/helpers'
import DataTable from '../components/common/DataTable'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Card from '../components/common/Card'
import { RoleBadge } from '../components/common/Badge'
import { FormField, Input, Select } from '../components/common/FormField'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [search, setSearch] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const load = async () => {
    setLoading(true)
    try {
      const data = await userService.listUsers()
      setUsers(data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onCreate = async (formData) => {
    setCreating(true)
    try {
      await userService.createUser({
        ...formData,
        department_id: formData.department_id ? Number(formData.department_id) : null,
      })
      toast.success('User created successfully')
      reset()
      setShowModal(false)
      load()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  )

  const columns = [
    { key: 'name',  label: 'Name', render: (v) => <strong style={{ color: 'var(--text-primary)' }}>{v}</strong> },
    { key: 'email', label: 'Email' },
    { key: 'role',  label: 'Role',  render: (v) => <RoleBadge role={v} /> },
    { key: 'department_id', label: 'Dept ID', render: (v) => v ?? '—' },
    { key: 'is_active', label: 'Status', render: (v) => (
      <span style={{ color: v ? 'var(--success)' : 'var(--danger)', fontSize: 12, fontWeight: 600 }}>
        {v ? '● Active' : '○ Inactive'}
      </span>
    )},
  ]

  const roleStats = ['admin', 'teacher', 'student', 'dept_head'].map(role => ({
    role, count: users.filter(u => u.role === role).length,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.4s ease' }}>
      {/* Summary chips */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {roleStats.map(({ role, count }) => count > 0 && (
          <div key={role} style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)', padding: '10px 18px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <RoleBadge role={role} />
            <span style={{ fontSize: '20px', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{count}</span>
          </div>
        ))}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>
            All Users <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '14px' }}>({filtered.length})</span>
          </h3>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users..."
                style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
                  padding: '8px 14px 8px 32px', fontSize: '13px', outline: 'none', width: 220,
                }}
              />
            </div>
            <Button onClick={() => setShowModal(true)} size="sm">
              <UserPlus size={14} /> Add User
            </Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} loading={loading} emptyMessage="No users found" />
      </Card>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset() }} title="Create New User">
        <form onSubmit={handleSubmit(onCreate)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FormField label="Full Name" required error={errors.name?.message}>
            <Input register={register('name', { required: 'Name is required' })} placeholder="e.g. Rohan Sharma" error={errors.name} />
          </FormField>
          <FormField label="Email Address" required error={errors.email?.message}>
            <Input type="email" register={register('email', { required: 'Email is required' })} placeholder="user@university.edu" error={errors.email} />
          </FormField>
          <FormField label="Password" required error={errors.password?.message}>
            <Input type="password" register={register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })} placeholder="••••••••" error={errors.password} />
          </FormField>
          <FormField label="Role" required error={errors.role?.message}>
            <Select register={register('role', { required: 'Role is required' })} error={errors.role}>
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="dept_head">Dept Head</option>
              <option value="admin">Admin</option>
            </Select>
          </FormField>
          <FormField label="Department ID">
            <Input type="number" register={register('department_id')} placeholder="e.g. 1" />
          </FormField>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="ghost" onClick={() => { setShowModal(false); reset() }} type="button">Cancel</Button>
            <Button type="submit" loading={creating}>Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
