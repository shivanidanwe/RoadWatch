import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../../components/common/PageHeader';
import { TeamMember } from '../../types';
import { INITIAL_TEAM_MEMBERS } from '../../mock/team';
import {
  PlusCircle,
  Mail,
  Phone,
  Briefcase,
  X
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
  const [formDept, setFormDept] = useState('Pavement Quality');
  const [formWard, setFormWard] = useState('Ward 4 - North');

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
    <div className="space-y-6 w-full min-w-0">
      <PageHeader
        title="Engineering Workforce &amp; Field Teams"
        subtitle="Manage municipal road maintenance crews, certified inspectors, and workload allocation."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30">
            {team.length} Active Personnel
          </span>
        }
        actions={
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Team Member</span>
          </button>
        }
      />

      {/* Role Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#3B2D53] pb-2 text-xs">
        <button
          onClick={() => setRoleFilter('ALL')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            roleFilter === 'ALL'
              ? 'bg-[#8B5CF6] text-white shadow-xs'
              : 'text-[#B9AECF] hover:bg-[#2B2042]'
          }`}
        >
          All Roster ({team.length})
        </button>
        <button
          onClick={() => setRoleFilter('Field Inspector')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            roleFilter === 'Field Inspector'
              ? 'bg-[#8B5CF6] text-white shadow-xs'
              : 'text-[#B9AECF] hover:bg-[#2B2042]'
          }`}
        >
          Field Inspectors
        </button>
        <button
          onClick={() => setRoleFilter('Maintenance Supervisor')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            roleFilter === 'Maintenance Supervisor'
              ? 'bg-[#8B5CF6] text-white shadow-xs'
              : 'text-[#B9AECF] hover:bg-[#2B2042]'
          }`}
        >
          Maintenance Supervisors
        </button>
        <button
          onClick={() => setRoleFilter('Chief Road Engineer')}
          className={`px-3 py-1.5 rounded-lg font-medium transition ${
            roleFilter === 'Chief Road Engineer'
              ? 'bg-[#8B5CF6] text-white shadow-xs'
              : 'text-[#B9AECF] hover:bg-[#2B2042]'
          }`}
        >
          Engineers &amp; Leadership
        </button>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-w-0">
        {filteredTeam.map(member => (
          <div
            key={member.id}
            className="bg-[#211735] rounded-xl border border-[#3B2D53] p-5 shadow-xs hover:border-[#8B5CF6]/50 transition space-y-4 flex flex-col justify-between min-w-0 overflow-hidden text-[#F5F3FF]"
          >
            <div className="space-y-3 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#8B5CF6] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-[#F5F3FF] truncate">{member.name}</h3>
                    <p className="text-xs text-[#A78BFA] font-medium truncate">{member.role}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                    member.status === 'Active'
                      ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                      : member.status === 'In Field'
                      ? 'bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30'
                      : 'bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/30'
                  }`}
                >
                  {member.status}
                </span>
              </div>

              <div className="text-xs text-[#B9AECF] space-y-1.5 pt-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Briefcase className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
                  <span className="truncate">{member.department}</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
                  <a href={`mailto:${member.email}`} className="text-[#A78BFA] hover:underline truncate">
                    {member.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-[#A78BFA] shrink-0" />
                  <span className="truncate">{member.phone}</span>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] uppercase font-bold text-[#B9AECF] block mb-1">Ward Coverage</span>
                <div className="flex flex-wrap gap-1">
                  {member.wardCoverage.map((w, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-[#140E22] rounded text-[#B9AECF] border border-[#3B2D53]">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Workload Stats */}
            <div className="pt-3 border-t border-[#3B2D53] grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-[#140E22] border border-[#3B2D53] text-center">
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Active Tasks</span>
                <p className="text-sm font-bold text-[#F5F3FF] mt-0.5">{member.activeAssignmentsCount}</p>
              </div>
              <div className="p-2 rounded-lg bg-[#140E22] border border-[#3B2D53] text-center">
                <span className="text-[10px] text-[#B9AECF] uppercase font-bold">Completed</span>
                <p className="text-sm font-bold text-[#34D399] mt-0.5">{member.completedTasksCount}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#211735] rounded-xl shadow-xl border border-[#3B2D53] max-w-md w-full p-6 text-xs space-y-4 text-[#F5F3FF]">
            <div className="flex items-center justify-between pb-3 border-b border-[#3B2D53]">
              <h3 className="text-sm font-bold text-[#F5F3FF]">Add Engineering Staff Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#B9AECF] hover:text-[#F5F3FF]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Er. Vikram Sen"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Official Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  placeholder="name@roadwatch.gov"
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] placeholder-[#B9AECF]/50 focus:outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Role Title</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as any)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#A78BFA]"
                  >
                    <option value="Field Inspector">Field Inspector</option>
                    <option value="Maintenance Supervisor">Maintenance Supervisor</option>
                    <option value="Chief Road Engineer">Chief Road Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Municipal Administrator">Municipal Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-[#F5F3FF] mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#A78BFA]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Department</label>
                <input
                  type="text"
                  value={formDept}
                  onChange={e => setFormDept(e.target.value)}
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#F5F3FF] mb-1">Primary Ward Jurisdiction</label>
                <input
                  type="text"
                  value={formWard}
                  onChange={e => setFormWard(e.target.value)}
                  className="w-full p-2 border border-[#3B2D53] rounded-lg bg-[#140E22] text-[#F5F3FF] focus:outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#3B2D53]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 border border-[#3B2D53] rounded-lg font-medium text-[#B9AECF] hover:bg-[#2B2042] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-semibold rounded-lg shadow-xs transition"
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
