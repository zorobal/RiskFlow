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
  UserPlus,
  Edit,
  Power,
  Check,
  X
} from 'lucide-react';
import { User, TenantConfig, AuditLog, Role, SessionExercice } from '../types';

interface AdminModuleProps {
  users: User[];
  onAddUser: (u: Omit<User, 'id'>) => void;
  onDeleteUser: (id: string) => void;
  onUpdateUser: (u: User) => void;
  tenants: TenantConfig[];
  onAddTenant: (name: string) => void;
  auditLogs: AuditLog[];
  activeTenantId: string;
  initialTab?: 'users' | 'tenants' | 'audit' | 'sessions';
  sessions: SessionExercice[];
  onAddSession: (s: SessionExercice) => void;
  onUpdateSession: (s: SessionExercice) => void;
}

export default function AdminModule({
  users,
  onAddUser,
  onDeleteUser,
  onUpdateUser,
  tenants,
  onAddTenant,
  auditLogs,
  activeTenantId,
  initialTab,
  sessions,
  onAddSession,
  onUpdateSession
}: AdminModuleProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'tenants' | 'audit' | 'sessions'>(initialTab || 'users');

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState<Role>('Analyste');
  const [editUserIsActive, setEditUserIsActive] = useState(true);
  const [editUserAllowedModules, setEditUserAllowedModules] = useState<string[]>([]);

  // Session state
  const [newSessionAnnee, setNewSessionAnnee] = useState(2027);
  const [newSessionDebut, setNewSessionDebut] = useState('2027-01-01');
  const [newSessionFin, setNewSessionFin] = useState('2027-12-31');

  const [closingSession, setClosingSession] = useState<SessionExercice | null>(null);
  const [bilanAnnuelInput, setBilanAnnuelInput] = useState('');

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Form states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>(['Analyste']);

  const [newTenantName, setNewTenantName] = useState('');

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || selectedRoles.length === 0) return;

    onAddUser({
      name: newUserName,
      email: newUserEmail,
      role: selectedRoles[0],
      roles: selectedRoles,
      isActive: true,
      allowedModules: selectedRoles.includes('Administrateur') || selectedRoles.includes('SuperAdmin')
        ? ['dashboard', 'risks', 'evaluation', 'heatmap', 'actions', 'audit', 'compliance', 'config', 'admin', 'reporting']
        : ['dashboard', 'risks', 'evaluation', 'heatmap', 'actions', 'audit', 'compliance', 'reporting'],
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=80&fit=crop&q=80`
    });

    setNewUserName('');
    setNewUserEmail('');
    setSelectedRoles(['Analyste']);
  };

  const startEditUser = (u: User) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserEmail(u.email);
    setEditUserRole(u.role);
    setEditUserIsActive(u.isActive !== false);
    setEditUserAllowedModules(u.allowedModules || ['dashboard', 'risks', 'evaluation', 'heatmap', 'actions', 'audit', 'compliance', 'reporting']);
  };

  const saveUserEdit = () => {
    if (!editingUser) return;
    onUpdateUser({
      ...editingUser,
      name: editUserName,
      email: editUserEmail,
      role: editUserRole,
      roles: [editUserRole],
      isActive: editUserIsActive,
      allowedModules: editUserAllowedModules
    });
    setEditingUser(null);
  };

  const handleAddTenantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    onAddTenant(newTenantName);
    setNewTenantName('');
  };

  const handleCreateSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSession({
      id: `sess_${Date.now()}`,
      annee: newSessionAnnee,
      dateDebut: newSessionDebut,
      dateFin: newSessionFin,
      statut: 'Ouverte'
    });
    // Increment default year
    const nextYear = newSessionAnnee + 1;
    setNewSessionAnnee(nextYear);
    setNewSessionDebut(`${nextYear}-01-01`);
    setNewSessionFin(`${nextYear}-12-31`);
  };

  const handleCloturerClick = (s: SessionExercice) => {
    setClosingSession(s);
    setBilanAnnuelInput(`Bilan de l'exercice ${s.annee} : Clôture annuelle effectuée le ${new Date().toISOString().split('T')[0]}. Tous les comptes et écritures sont chronologiquement figés.`);
  };

  const submitCloture = () => {
    if (!closingSession) return;
    onUpdateSession({
      ...closingSession,
      statut: 'Clôturée',
      dateCloture: new Date().toISOString().split('T')[0],
      bilanAnnuel: bilanAnnuelInput
    });
    setClosingSession(null);
    setBilanAnnuelInput('');
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
            onClick={() => setActiveTab('audit')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'audit' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <History className="w-4 h-4 text-indigo-600" />
            <span>📝 Journal d'Audit Système</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'sessions' ? 'bg-indigo-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Briefcase className="w-4 h-4 text-emerald-600" />
            <span>📅 Sessions & Exercices</span>
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
                <div className="space-y-1 bg-slate-50 p-3 rounded border border-slate-200">
                  <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Rôles / Privilèges GRC (Multi-sélection)</label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto bg-white p-2 rounded border border-slate-200">
                    {(['Analyste', 'Responsable', 'Risk Manager', 'Direction', 'Administrateur'] as Role[]).map((r) => {
                      const isChecked = selectedRoles.includes(r);
                      return (
                        <label key={r} className="flex items-center space-x-2 p-1 rounded hover:bg-slate-50 transition-colors cursor-pointer text-[11px] font-semibold text-slate-700">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRoles([...selectedRoles, r]);
                              } else {
                                if (selectedRoles.length > 1) {
                                  setSelectedRoles(selectedRoles.filter(role => role !== r));
                                }
                              }
                            }}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>
                            {r === 'Analyste' && 'Analyste (Saisie)'}
                            {r === 'Responsable' && 'Responsable (Revue)'}
                            {r === 'Risk Manager' && 'Risk Manager (Cotation)'}
                            {r === 'Direction' && 'Direction (Approbation)'}
                            {r === 'Administrateur' && 'Administrateur (Gestion Totale)'}
                          </span>
                        </label>
                      );
                    })}
                  </div>
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
                        <th className="py-2.5 px-4 font-bold">Rôle principal</th>
                        <th className="py-2.5 px-4 font-bold">Statut</th>
                        <th className="py-2.5 px-4 font-bold">Modules Visibles</th>
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
                            <div className="flex flex-wrap gap-1">
                              {u.roles && u.roles.length > 0 ? (
                                u.roles.map((r) => (
                                  <span key={r} className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-100">
                                    {r}
                                  </span>
                                ))
                              ) : (
                                <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-bold border border-indigo-100">
                                  {u.role}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-4">
                            {u.isActive !== false ? (
                              <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-emerald-200 flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                Actif
                              </span>
                            ) : (
                              <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full text-[9px] font-bold border border-red-200 flex items-center gap-1 w-fit">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                Suspendu
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-slate-500 max-w-[180px] truncate" title={u.allowedModules ? u.allowedModules.join(', ') : 'Tous'}>
                            {u.allowedModules ? (
                              <div className="flex flex-wrap gap-1">
                                {u.allowedModules.map(m => (
                                  <span key={m} className="bg-slate-100 text-slate-700 text-[8px] font-bold px-1 rounded">
                                    {m === 'dashboard' ? 'TdB' : m === 'risks' ? 'Carto' : m === 'evaluation' ? 'Calcul' : m === 'heatmap' ? 'Matrice' : m === 'actions' ? 'Actions' : m === 'audit' ? 'Audit' : m === 'compliance' ? 'Conformité' : m === 'config' ? 'Config' : m === 'admin' ? 'Admin' : m === 'reporting' ? 'Rapports' : m}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Tous les modules (Par défaut)</span>
                            )}
                          </td>
                          <td className="py-2 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => startEditUser(u)}
                                className="p-1 text-slate-500 hover:text-indigo-600 rounded transition"
                                title="Modifier / Gérer les modules"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {users.length > 1 ? (
                                <button
                                  onClick={() => onDeleteUser(u.id)}
                                  className="p-1 text-slate-400 hover:text-red-500 rounded transition"
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* EDIT USER MODAL */}
              {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in text-slate-800">
                  <div className="bg-white rounded-xl border border-slate-250 shadow-2xl p-6 w-full max-w-lg space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                      <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                        <Edit className="w-4 h-4 text-indigo-600" />
                        <span>Modifier le Collaborateur : {editingUser.name}</span>
                      </h3>
                      <button 
                        onClick={() => setEditingUser(null)}
                        className="text-slate-400 hover:text-slate-600 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Nom complet</label>
                        <input 
                          type="text" 
                          required 
                          value={editUserName}
                          onChange={(e) => setEditUserName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-250 rounded p-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Email professionnel</label>
                        <input 
                          type="email" 
                          required 
                          value={editUserEmail}
                          onChange={(e) => setEditUserEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-250 rounded p-1.5 text-xs text-slate-800"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Rôle principal GRC</label>
                        <select
                          value={editUserRole}
                          onChange={(e) => setEditUserRole(e.target.value as Role)}
                          className="w-full bg-slate-50 border border-slate-250 rounded p-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
                        >
                          <option value="Analyste">Analyste (Saisie)</option>
                          <option value="Responsable">Responsable (Revue)</option>
                          <option value="Risk Manager">Risk Manager (Cotation)</option>
                          <option value="Direction">Direction (Approbation)</option>
                          <option value="Administrateur">Administrateur (Gestion Totale)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Statut d'activité</label>
                        <div className="flex items-center space-x-4 h-8">
                          <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold">
                            <input 
                              type="radio"
                              checked={editUserIsActive}
                              onChange={() => setEditUserIsActive(true)}
                              className="text-indigo-600"
                            />
                            <span className="text-emerald-600 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              Actif
                            </span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer text-xs font-semibold">
                            <input 
                              type="radio"
                              checked={!editUserIsActive}
                              onChange={() => setEditUserIsActive(false)}
                              className="text-indigo-600"
                            />
                            <span className="text-red-650 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                              Suspendu
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Checkboxes for Module Permissions */}
                      <div className="col-span-2 border-t border-slate-150 pt-3">
                        <label className="text-[10px] text-indigo-650 font-bold uppercase block mb-2">🛡️ Visibilité des modules (Habilitations de visibilité)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-150">
                          {[
                            { id: 'dashboard', name: 'Tableau de Bord' },
                            { id: 'risks', name: 'Cartographie' },
                            { id: 'evaluation', name: 'Calcul & Évaluation' },
                            { id: 'heatmap', name: 'Matrice Risques' },
                            { id: 'actions', name: "Plans d'Actions" },
                            { id: 'audit', name: 'Audit Interne' },
                            { id: 'compliance', name: 'Conformité' },
                            { id: 'reporting', name: 'Rapports' },
                            { id: 'config', name: 'Configuration' },
                            { id: 'admin', name: 'Administration' },
                          ].map((m) => {
                            const isChecked = editUserAllowedModules.includes(m.id);
                            return (
                              <label key={m.id} className="flex items-center space-x-2 p-1 rounded hover:bg-white transition cursor-pointer text-[10.5px] font-semibold text-slate-750">
                                <input 
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setEditUserAllowedModules([...editUserAllowedModules, m.id]);
                                    } else {
                                      setEditUserAllowedModules(editUserAllowedModules.filter(x => x !== m.id));
                                    }
                                  }}
                                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{m.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-150 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={saveUserEdit}
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded shadow transition text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Sauvegarder les modifications
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-xs transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

          {/* SESSIONS & EXERCICES TAB */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">📅 Gestion des Exercices & Sessions Annuelles</h3>
                  <p className="text-slate-400 text-[10.5px]">Configurez la périodicité de vos sessions d'exercice, démarrez une nouvelle année ou clôturez l'exercice en cours.</p>
                </div>
              </div>

              {/* Form to open new session */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
                <p className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-emerald-600" />
                  Démarrer une Nouvelle Session d'Exercice Annuel
                </p>
                <form onSubmit={handleCreateSessionSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Année d'Exercice</label>
                    <input 
                      type="number" 
                      required 
                      value={newSessionAnnee}
                      onChange={(e) => {
                        const yr = parseInt(e.target.value) || 2027;
                        setNewSessionAnnee(yr);
                        setNewSessionDebut(`${yr}-01-01`);
                        setNewSessionFin(`${yr}-12-31`);
                      }}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-800 font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Date de début de session</label>
                    <input 
                      type="date" 
                      required 
                      value={newSessionDebut}
                      onChange={(e) => setNewSessionDebut(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Date de fin de session</label>
                    <input 
                      type="date" 
                      required 
                      value={newSessionFin}
                      onChange={(e) => setNewSessionFin(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded shadow transition text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Démarrer l'Exercice
                  </button>
                </form>
              </div>

              {/* Sessions List */}
              <div className="space-y-3">
                <p className="font-bold text-slate-800">Historique des Exercices GRC :</p>
                <div className="grid grid-cols-1 gap-3">
                  {sessions.slice().reverse().map((s) => (
                    <div 
                      key={s.id} 
                      className={`p-4 rounded-xl border transition-all duration-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                        s.statut === 'Ouverte' 
                          ? 'bg-emerald-50/40 border-emerald-200 shadow-sm' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900">Exercice {s.annee}</span>
                          {s.statut === 'Ouverte' ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                              Session Ouverte (En cours)
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded-full border border-slate-200">
                              Clôturé
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[10.5px]">
                          Période : <strong className="text-slate-700">{s.dateDebut}</strong> au <strong className="text-slate-700">{s.dateFin}</strong>
                          {s.dateCloture && (
                            <>
                              {' '}• Clôturé le : <strong className="text-slate-700">{s.dateCloture}</strong>
                            </>
                          )}
                        </p>
                        {s.bilanAnnuel && (
                          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-slate-600 max-w-2xl font-mono text-[10px] leading-relaxed whitespace-pre-wrap">
                            💡 {s.bilanAnnuel}
                          </div>
                        )}
                      </div>

                      {s.statut === 'Ouverte' && (
                        <button
                          onClick={() => handleCloturerClick(s)}
                          className="py-1.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Power className="w-3.5 h-3.5" />
                          Clôturer l'Exercice
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* MODAL CLÔTURE D'EXERCICE (Bilan Annuel) */}
              {closingSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in text-slate-800">
                  <div className="bg-white rounded-xl border border-slate-250 shadow-2xl p-6 w-full max-w-lg space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                      <h3 className="text-sm font-bold text-slate-950 flex items-center space-x-2">
                        <Power className="w-4 h-4 text-red-600" />
                        <span>Clôture de l'Exercice Annuel {closingSession.annee}</span>
                      </h3>
                      <button 
                        onClick={() => setClosingSession(null)}
                        className="text-slate-400 hover:text-slate-600 font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        La clôture d'un exercice fige les écritures, risques et plans d'action de cette période. Veuillez enregistrer un <strong>bilan annuel récapitulatif</strong> (indicateurs clés, avancement des plans) avant de confirmer la fermeture définitive de la session.
                      </p>

                      <div className="space-y-1 pt-2">
                        <label className="text-[10px] text-slate-400 font-bold uppercase">Bilan récapitulatif annuel (Bilan Annuel)</label>
                        <textarea
                          rows={4}
                          required
                          value={bilanAnnuelInput}
                          onChange={(e) => setBilanAnnuelInput(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-250 rounded p-2 text-xs text-slate-800 leading-relaxed focus:outline-none font-sans"
                          placeholder="Entrez les conclusions de l'année..."
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-150 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={submitCloture}
                        className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded shadow transition text-xs cursor-pointer flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Valider la Clôture Définitive
                      </button>
                      <button
                        type="button"
                        onClick={() => setClosingSession(null)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded text-xs transition flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
