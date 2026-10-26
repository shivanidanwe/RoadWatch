import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { TeamMember } from '../../types';
import { INITIAL_TEAM_MEMBERS } from '../../mock/team';
import {
  Users,
  PlusCircle,
  Mail,
  Phone,
  Shield,
  Briefcase,
  MapPin,
  CheckCircle2,
  Clock,
  Edit,
  UserCheck
} from 'lucide-react';

export const TeamPage: React.FC = () => {
  const { addToast } = useApp();

  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM_MEMBERS);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add form fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('+91 ');
  const [formRole, setFormRole] = useState<TeamMember['role']>('Field Inspector');
  const [formDept, setFormDept] = useState('Pavement Quality & NDT Wing');
  const [formWard, setFormWard] = useState('Ward 4 - North Zone');

  const filteredTeam = team.filter(m => {
    if (roleFilter !== 'ALL' && m.role !== roleFilter) return false;
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      addToast('warning', 'Missing Details', 'Name and email are mandatory.');
      return;
    }

    const newMember: TeamMember = {
      id: `USR-${String(team.length + 1).padStart(3, '0')}`,
      name: formName,
      email: formEmail,
      phone: formPhone,
      role: formRole,
      department: formDept,
      activeAssignmentsCount: 1,
      completedTasksCount: 0,
      status: 'Active',
      wardCoverage: [formWard],
    };

    setTeam([...team, newMember]);
    setShowAddModal(false);
    setFormName('');
    setFormEmail('');
    addToast('success', 'Member Added', `${newMember.name} registered to municipal roster.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Engineering Workforce &amp; Field Teams"
        subtitle="Manage municipal road maintenance crews, certified pavement quality inspectors, and workload allocation."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-[#172033] border border-slate-200">
            {team.length} Active Personnel
          </span>
        }
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </button>
        }
      />

      {/* Role Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2 text-xs">
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            roleFilter === 'ALL' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#64748B] hover:bg-slate-100'
          }`}
        >
          All Roster ({team.length})
        </button>
        <button
          onClick={() => setRoleFilter('Field Inspector')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            roleFilter === 'Field Inspector' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#64748B] hover:bg-slate-100'
          }`}
        >
          Field Inspectors
        </button>
        <button
          onClick={() => setRoleFilter('Maintenance Supervisor')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            roleFilter === 'Maintenance Supervisor' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#64748B] hover:bg-slate-100'
          }`}
        >
          Maintenance Supervisors
        </button>
        <button
          onClick={() => setRoleFilter('Chief Road Engineer')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            roleFilter === 'Chief Road Engineer' ? 'bg-blue-600 text-white shadow-xs' : 'text-[#64748B] hover:bg-slate-100'
          }`}
        >
          Engineers &amp; Leadership
        </button>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTeam.map(member => (
          <div
            key={member.id}
            className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center ring-2 ring-blue-100">
                    {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#172033]">{member.name}</h3>
                    <p className="text-[11px] text-blue-700 font-semibold">{member.role}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    member.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : member.status === 'In Field'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="text-xs text-[#64748B] space-y-1.5 pt-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span className="truncate">{member.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline truncate">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#94A3B8]" />
                  <span>{member.phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">Ward Coverage</span>
                <div className="flex flex-wrap gap-1">
                  {member.wardCoverage.map((w, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-slate-100 rounded text-slate-700 border">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Workload Stats */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Active Tasks</span>
                <p className="text-sm font-bold text-[#172033] mt-0.5">{member.activeAssignmentsCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                <span className="text-[10px] text-[#64748B] uppercase font-bold">Completed</span>
                <p className="text-sm font-bold text-emerald-700 mt-0.5">{member.completedTasksCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-[#E2E8F0] max-w-md w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="text-sm font-bold text-[#172033]">Add Engineering Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#94A3B8] hover:text-[#172033]">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#172033] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Er. Vikram Sen"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="name@roadwatch.gov"
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Role Title</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as any)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg bg-white"
                  >
                    <option value="Field Inspector">Field Inspector</option>
                    <option value="Maintenance Supervisor">Maintenance Supervisor</option>
                    <option value="Chief Road Engineer">Chief Road Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Municipal Administrator">Municipal Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#172033] mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Department</label>
                <input
                  type="text"
                  value={formDept}
                  onChange={e => setFormDept(e.target.value)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1">Primary Ward Jurisdiction</label>
                <input
                  type="text"
                  value={formWard}
                  onChange={e => setFormWard(e.target.value)}
                  className="w-full p-2 border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 border border-[#E2E8F0] rounded-lg font-medium text-[#64748B] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-xs"
                >
                  Register Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
