/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Briefcase, 
  History, 
  Lock, 
  UserPlus
} from 'lucide-react';
import { User, TenantConfig, AuditLog, Role } from '../types';

interface AdminModuleProps {
  users: User[];
  onAddUser: (u: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
  tenants: TenantConfig[];
  onAddTenant: (name: string) => void;
  auditLogs: AuditLog[];
  activeTenantId: string;
  initialTab?: 'users' | 'tenants' | 'audit';
}

export default function AdminModule({
  users,
  onAddUser,
  onDeleteUser,
  tenants,
  onAddTenant,
  auditLogs,
  activeTenantId,
  initialTab
}: AdminModuleProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'tenants' | 'audit'>(initialTab || 'users');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('Analyste');

  const [newTenantName, setNewTenantName] = useState('');

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    onAddUser({
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=80&fit=crop&q=80`
    });

    setNewUserName('');
    setNewUserEmail('');
    setNewUserRole('Analyste');
  };

  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    onAddTenant(newTenantName);
    setNewTenantName('');
  };

  return (
    <div className="flex-grow p-6 bg-slate-50 overflow-y-auto space-y-6 text-xs text-slate-800">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Module d'Administration Générale
          </h2>
          <p className="text-slate-500 text-[11px]">
            Gérez les habilitations utilisateurs (RBAC), provisionnez de nouvelles structures (Multi-tenancy), et inspectez la traçabilité des opérations en base.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: Local Sub Navigation */}
        <div className="lg:col-span-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'users' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>🔑 Profils & Habilitations</span>
          </button>
          
          <button
            onClick={() => setActiveTab('tenants')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'tenants' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>🏢 Multi-Entreprises</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'audit' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>📝 Journal d'Audit Système</span>
          </button>
        </div>

        {/* RIGHT COMPONENT: Content Area */}
        <div className="lg:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
          
          {/* USERS PRIVILEGES TAB */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Gestion des Utilisateurs & Rôles (RBAC)</h3>
                  <p className="text-slate-400 text-[10.5px]">Affectation de privilèges et de signatures de validation pour les Analystes, Managers et la Direction.</p>
                </div>
              </div>

              {/* Creator Form */}
              <form onSubmit={handleAddUserSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-150 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Nom complet</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Jean-Pierre..."
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Email professionnel</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="jp.dupont@co.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Rôle / Privilèges GRC</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as Role)}
                    className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-700 font-bold"
                  >
                    <option value="Analyste">Analyste (Saisie)</option>
                    <option value="Responsable">Responsable (Revue)</option>
                    <option value="Risk Manager">Risk Manager (Cotation)</option>
                    <option value="Direction">Direction (Approbation)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Créer Utilisateur
                </button>
              </form>

              {/* Users tables list */}
              <div className="space-y-2">
                <p className="font-bold text-slate-800">Liste des collaborateurs référencés :</p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200">
                        <th className="py-2.5 px-4 font-bold">Collaborateur</th>
                        <th className="py-2.5 px-4 font-bold">Email</th>
                        <th className="py-2.5 px-4 font-bold">Rôle assigné</th>
                        <th className="py-2.5 px-4 font-bold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="py-2 px-4 flex items-center gap-2">
                            <img src={u.avatar} alt="" className="w-6 h-6 rounded-full shrink-0" />
                            <strong className="text-slate-800 text-[11px]">{u.name}</strong>
                          </td>
                          <td className="py-2 px-4 font-mono text-slate-500">{u.email}</td>
                          <td className="py-2 px-4">
                            <span className="bg-indigo-50 text-indigo-650 px-2 py-0.5 rounded text-[9.5px] font-bold">
                              {u.role}
                            </span>
                          </td>
                          <td className="py-2 px-4 text-center">
                            {users.length > 1 ? (
                              <button
                                onClick={() => onDeleteUser(u.id)}
                                className="p-1 text-slate-400 hover:text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TENANTS PROVISIONING TAB */}
          {activeTab === 'tenants' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 h-14">
                <h3 className="font-bold text-sm text-slate-800">Provisionnement Multi-Entreprises (Multi-tenant GRC)</h3>
                <p className="text-slate-400 text-[10.5px]">Créez une entité juridique étanche indépendante possédant ses propres risques et configurations de variables.</p>
              </div>

              {/* Creator form */}
              <form onSubmit={handleAddTenantSubmit} className="p-4 bg-slate-50 rounded-xl border border-slate-150 flex flex-col sm:flex-row gap-3 items-end">
                <div className="space-y-1 flex-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Dénomination Sociale de la Nouvelle Structure</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex. Banque Commerciale du Centre S.A."
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded p-1.5 font-bold text-slate-800 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="py-1.5 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow transition text-xs cursor-pointer"
                >
                  🚀 Initialiser entreprise
                </button>
              </form>

              <div className="space-y-2.5">
                <p className="font-bold text-slate-800">Entreprises enregistrées sur cette instance locale :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-72 overflow-y-auto">
                  {tenants.map(t => (
                    <div key={t.id} className="p-3.5 bg-white rounded-lg border border-slate-200 shadow-sm flex items-center justify-between">
                      <div className="space-y-0.5">
                        <strong className="text-slate-800 text-[11px]">{t.companyName}</strong>
                        <p className="text-[9.5px] text-slate-400">Identifiant Unique DB: <code className="font-mono bg-slate-100 p-0.5 rounded">{t.id}</code></p>
                      </div>
                      
                      {t.id === activeTenantId && (
                        <span className="bg-green-150 text-green-800 border border-green-200 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          🏢 Active
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC REAL TIME AUDIT LOG LIST */}
          {activeTab === 'audit' && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-2 flex justify-between items-center h-14">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Journal d'Audit Système & Traçabilité (Compliance Audit Trail)</h3>
                  <p className="text-slate-400 text-[10.5px]">Historique inaltérable de l'activité pour l'audit et la conformité SOX / IFACI.</p>
                </div>
              </div>

              {/* Logger block list */}
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {auditLogs.slice().reverse().map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row justify-between gap-2.5 text-[10.5px]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded text-[9.5px]">
                          {log.action}
                        </span>
                        <span className="text-slate-400 font-mono text-[9px]">
                          {new Date(log.timestamp).toLocaleTimeString() || log.timestamp}
                        </span>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed">{log.details}</p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-bold text-slate-700">👤 {log.userName}</p>
                      <p className="text-slate-400 text-[9.5px]">Grade: {log.userRole}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
