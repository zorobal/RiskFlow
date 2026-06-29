/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ShieldAlert, 
  Calendar, 
  User as UserIcon,
  ChevronRight,
  Briefcase,
  AlertOctagon,
  Wrench,
  Trash2,
  Copy,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { Risk, TenantConfig, User, ActionPlan } from '../types';

interface RiskMappingModuleProps {
  risks: Risk[];
  tenantConfig: TenantConfig;
  actions: ActionPlan[];
  users: User[];
  currentUser: User;
  onAddRisk: (risk: Omit<Risk, 'id' | 'scoreBrut' | 'scoreResiduel' | 'createdAt' | 'history'>) => void;
  onUpdateRisk: (risk: Risk) => void;
  onDeleteRisk: (id: string) => void;
  onAddActionPlan: (plan: Omit<ActionPlan, 'id' | 'progress'>) => void;
  onAddLog: (action: string, details: string) => void;
}

export default function RiskMappingModule({
  risks,
  tenantConfig,
  actions,
  users,
  currentUser,
  onAddRisk,
  onUpdateRisk,
  onDeleteRisk,
  onAddActionPlan,
  onAddLog
}: RiskMappingModuleProps) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEntity, setSelectedEntity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Selection / Editing States
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Form fields for creating/editing
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formEntity, setFormEntity] = useState('');
  const [formFreq, setFormFreq] = useState(1);
  const [formImpact, setFormImpact] = useState(1);
  const [formControl, setFormControl] = useState(1);
  const [formStatus, setFormStatus] = useState('');

  // Action creation within risk sheet
  const [showAddAction, setShowAddAction] = useState(false);
  const [actionTitle, setActionTitle] = useState('');
  const [actionDesc, setActionDesc] = useState('');
  const [actionOwnerName, setActionOwnerName] = useState('');
  const [actionDueDate, setActionDueDate] = useState('');
  const [actionPriority, setActionPriority] = useState<'Basse' | 'Moyenne' | 'Haute' | 'Critique'>('Moyenne');

  // History comments
  const [historyComment, setHistoryComment] = useState('');

  // Filter risks
  const filteredRisks = risks.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'all' || r.categoryId === selectedCategory;
    const matchEntity = selectedEntity === 'all' || r.entityId === selectedEntity;
    const matchStatus = selectedStatus === 'all' || r.statusId === selectedStatus;
    
    return matchSearch && matchCat && matchEntity && matchStatus;
  });

  const getCriticality = (score: number) => {
    const found = tenantConfig.matrixThresholds.find(t => score >= t.minScore && score <= t.maxScore);
    return found || tenantConfig.matrixThresholds[0];
  };

  const handleOpenEdit = (risk: Risk) => {
    setSelectedRisk(risk);
    setIsCreating(false);
    setFormTitle(risk.title);
    setFormDesc(risk.description);
    setFormCategory(risk.categoryId);
    setFormEntity(risk.entityId);
    setFormFreq(risk.frequencyValue);
    setFormImpact(risk.impactValue);
    setFormControl(risk.controlValue);
    setFormStatus(risk.statusId);
    setShowAddAction(false);
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setSelectedRisk(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategory(tenantConfig.categories[0]?.id || '');
    setFormEntity(tenantConfig.entities[0]?.id || '');
    setFormFreq(1);
    setFormImpact(1);
    setFormControl(1);
    setFormStatus(tenantConfig.workflowSteps[0]?.id || 'w_brouillon');
    setShowAddAction(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (isCreating) {
      onAddRisk({
        title: formTitle,
        description: formDesc,
        categoryId: formCategory,
        entityId: formEntity,
        createdBy: currentUser.name,
        statusId: formStatus,
        frequencyValue: formFreq,
        impactValue: formImpact,
        controlValue: formControl
      });
      setIsCreating(false);
    } else if (selectedRisk) {
      // Calculate scores dynamically according to active formula expression
      let scoreBrut = formFreq * formImpact;
      let scoreResiduel = scoreBrut * formControl; // defaults

      if (tenantConfig.formula.expression === '(P * I) - M') {
        scoreResiduel = Math.max(0, (formFreq * formImpact) - formControl);
      }

      const updatedHistory = [...selectedRisk.history];
      if (
        formFreq !== selectedRisk.frequencyValue || 
        formImpact !== selectedRisk.impactValue || 
        formControl !== selectedRisk.controlValue
      ) {
        updatedHistory.push({
          date: new Date().toISOString().split('T')[0],
          user: currentUser.name,
          action: 'Réévaluation',
          comment: `Nouvelles cotes: P=${formFreq}, I=${formImpact}, M=${formControl}. Score résiduel: ${scoreResiduel}`
        });
      }

      const updated: Risk = {
        ...selectedRisk,
        title: formTitle,
        description: formDesc,
        categoryId: formCategory,
        entityId: formEntity,
        frequencyValue: formFreq,
        impactValue: formImpact,
        controlValue: formControl,
        statusId: formStatus,
        scoreBrut,
        scoreResiduel,
        history: updatedHistory
      };

      onUpdateRisk(updated);
      setSelectedRisk(null);
    }
  };

  const handleAddComment = () => {
    if (!selectedRisk || !historyComment.trim()) return;

    const updated: Risk = {
      ...selectedRisk,
      history: [
        ...selectedRisk.history,
        {
          date: new Date().toISOString().split('T')[0],
          user: currentUser.name,
          action: 'Commentaire',
          comment: historyComment
        }
      ]
    };

    onUpdateRisk(updated);
    setHistoryComment('');
    setSelectedRisk(updated);
    onAddLog('Forum Risk', `Commentaire ajouté sur le risque ${selectedRisk.id}`);
  };

  const handleAddActionPlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionTitle.trim() || !selectedRisk) return;

    onAddActionPlan({
      riskId: selectedRisk.id,
      title: actionTitle,
      description: actionDesc,
      ownerName: actionOwnerName || currentUser.name,
      dueDate: actionDueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      priority: actionPriority,
      status: 'À planifier'
    });

    setActionTitle('');
    setActionDesc('');
    setActionOwnerName('');
    setActionDueDate('');
    setActionPriority('Moyenne');
    setShowAddAction(false);
  };

  const changeWorkflowStep = (stepId: string) => {
    if (!selectedRisk) return;
    const updated: Risk = {
      ...selectedRisk,
      statusId: stepId,
      history: [
        ...selectedRisk.history,
        {
          date: new Date().toISOString().split('T')[0],
          user: currentUser.name,
          action: 'Transition de statut',
          comment: `Passage à l'étape: ${tenantConfig.workflowSteps.find(s => s.id === stepId)?.name || stepId}`
        }
      ]
    };
    onUpdateRisk(updated);
    setSelectedRisk(updated);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-50 overflow-hidden text-xs text-slate-800">
      {/* LEFT AREA: Filter Sidebar & Directory List */}
      <div className="flex-1 flex flex-col p-4 md:p-6 space-y-4 overflow-y-auto max-w-full md:max-w-4xl border-r border-slate-200">
        
        {/* Odoo Style Sub-Header: Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenCreate}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouveau Risque
            </button>

            {/* View Mode buttons */}
            <div className="flex items-center bg-slate-100 rounded p-0.5 border border-slate-200 text-slate-500">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600 font-semibold' : 'hover:bg-slate-50'}`}
                title="Vue Liste"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded transition ${viewMode === 'kanban' ? 'bg-white shadow-sm text-indigo-600 font-semibold' : 'hover:bg-slate-50'}`}
                title="Vue Kanban"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick text search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Rechercher par Titre, Code, ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full"
            />
          </div>
        </div>

        {/* Modular filters ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
          <div>
            <label className="text-[10px] text-slate-400 font-bold block h-4">Catégorie</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2 py-1 w-full"
            >
              <option value="all">Toutes</option>
              {tenantConfig.categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold block h-4">Département d'assiette</label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2 py-1 w-full"
            >
              <option value="all">Tous</option>
              {tenantConfig.entities.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-bold block h-4">Étape Workflow</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2 py-1 w-full"
            >
              <option value="all">Tous</option>
              {tenantConfig.workflowSteps.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* RISKS VIEWPORT CONTAINER */}
        {filteredRisks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
            <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-500 font-semibold">Aucun risque ne correspond à vos filtres.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedEntity('all'); setSelectedStatus('all'); }} 
              className="text-indigo-600 hover:underline hover:font-bold font-medium"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* Odoo Style Beautiful Tree list Table view */
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-2.5 px-4 font-bold">Code</th>
                    <th className="py-2.5 px-4 font-bold">Intitulé du risque</th>
                    <th className="py-2.5 px-4 font-bold">Entité Affectée</th>
                    <th className="py-2.5 px-4 font-bold text-center">Score Brut</th>
                    <th className="py-2.5 px-4 font-bold text-center">Risque Net</th>
                    <th className="py-2.5 px-4 font-bold text-center">Statut</th>
                    <th className="py-2.5 px-4 font-bold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRisks.map((risk) => {
                    const crit = getCriticality(risk.scoreResiduel);
                    const category = tenantConfig.categories.find(c => c.id === risk.categoryId);
                    const entity = tenantConfig.entities.find(e => e.id === risk.entityId);
                    const step = tenantConfig.workflowSteps.find(s => s.id === risk.statusId);
                    
                    return (
                      <tr 
                        key={risk.id}
                        onClick={() => handleOpenEdit(risk)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          selectedRisk?.id === risk.id ? 'bg-indigo-50/50' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-500">{risk.id}</td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-800 text-[11px] leading-tight">{risk.title}</p>
                          <span 
                            className="inline-block mt-1 font-semibold text-[9px] px-1.5 py-0.5 rounded text-white"
                            style={{ backgroundColor: category?.color || '#cbd5e1' }}
                          >
                            {category?.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-600">
                          {entity ? entity.name : '-'}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-500">{risk.scoreBrut}</td>
                        <td className="py-3 px-4 text-center">
                          <span 
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border"
                            style={{ backgroundColor: crit.color, color: crit.textColor, borderColor: crit.textColor + '35' }}
                          >
                            {risk.scoreResiduel} ({crit.label})
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${step?.color}`}>
                            {step ? step.name.substring(2) : risk.statusId}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => {
                                if (confirm("Êtes-vous sûr de vouloir archiver/supprimer ce risque ?")) {
                                  onDeleteRisk(risk.id);
                                  setSelectedRisk(null);
                                }
                              }}
                              className="p-1 hover:text-red-600 rounded hover:bg-red-50 text-slate-400"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban Board layout */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRisks.map((risk) => {
              const crit = getCriticality(risk.scoreResiduel);
              const category = tenantConfig.categories.find(c => c.id === risk.categoryId);
              const entity = tenantConfig.entities.find(e => e.id === risk.entityId);
              
              return (
                <div 
                  key={risk.id}
                  onClick={() => handleOpenEdit(risk)}
                  className={`bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer relative ${
                    selectedRisk?.id === risk.id ? 'ring-2 ring-indigo-600/30' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[9px]">
                      {risk.id}
                    </span>
                    <span 
                      className="px-2 py-0.5 rounded text-[9px] font-bold border"
                      style={{ backgroundColor: crit.color, color: crit.textColor, borderColor: crit.textColor + '30' }}
                    >
                      Score Net : {risk.scoreResiduel}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-[11px] leading-tight mb-2">{risk.title}</h4>
                  <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed mb-3">{risk.description}</p>
                  
                  <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-slate-100 gap-2">
                    <span 
                      className="text-[9px] font-bold px-2 py-0.5 rounded text-white"
                      style={{ backgroundColor: category?.color || '#cbd5e1' }}
                    >
                      {category?.name}
                    </span>
                    <span className="text-slate-400 italic text-[10px]">{entity?.name}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RIGHT AREA: Odoo Form Sheet and Sidebar Details */}
      {(selectedRisk || isCreating) ? (
        <div className="w-full md:w-[450px] bg-white border-t md:border-t-0 border-l border-slate-200 shadow-sm flex flex-col h-full overflow-y-auto">
          
          {/* Header Odoo stage bar */}
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <span className="font-bold text-slate-700">
              {isCreating ? "✏️ Création Risque" : `📄 Fiche ${selectedRisk?.id}`}
            </span>

            {/* Clickable Status Bar */}
            {!isCreating && (
              <div className="flex items-center space-x-0.5 text-[9px] font-bold uppercase">
                {tenantConfig.workflowSteps.map((s, index) => {
                  const isActive = selectedRisk?.statusId === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => changeWorkflowStep(s.id)}
                      className={`px-2 py-1 rounded-sm border transition-all ${
                        isActive 
                           ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s.name.substring(2)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-4 flex-1">
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Intitulé du Risque</label>
              <input 
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ex. Fuite de données critiques clients..."
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 font-bold uppercase">Description détaillée / Causes & Conséquences</label>
              <textarea 
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                rows={3}
                placeholder="Décrivez les causes d'occurence du risque et ses impacts majeurs..."
                className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Catégorie</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {tenantConfig.categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Périmètre / Entité</label>
                <select
                  value={formEntity}
                  onChange={(e) => setFormEntity(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-800 text-xs rounded p-2 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {tenantConfig.entities.map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* RATINGS ENGINE CONFIGURATION */}
            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-3">
              <h4 className="font-bold text-xs text-indigo-600 uppercase border-b border-indigo-200 pb-1 flex items-center gap-1">
                <Wrench className="w-3.5 h-3.5" />
                Évaluation (Formule: {tenantConfig.formula.expression})
              </h4>
              
              {/* Variable 1: Probability */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Probabilité/Fréquence (P)</span>
                  <span className="font-bold font-mono text-xs text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-100 shadow-sm">{formFreq}</span>
                </div>
                <select
                  value={formFreq}
                  onChange={(e) => setFormFreq(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded p-1.5"
                >
                  {tenantConfig.scales.frequency.map(item => (
                    <option key={item.value} value={item.value}>
                      Cotation {item.value} : {item.label}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 italic">
                  {tenantConfig.scales.frequency.find(f => f.value === formFreq)?.description}
                </p>
              </div>

              {/* Variable 2: Impact */}
              <div className="space-y-1 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Impact Conséquence (I)</span>
                  <span className="font-bold font-mono text-xs text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-100 shadow-sm">{formImpact}</span>
                </div>
                <select
                  value={formImpact}
                  onChange={(e) => setFormImpact(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded p-1.5"
                >
                  {tenantConfig.scales.impact.map(item => (
                    <option key={item.value} value={item.value}>
                      Cotation {item.value} : {item.label}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 italic">
                  {tenantConfig.scales.impact.find(f => f.value === formImpact)?.description}
                </p>
              </div>

              {/* Variable 3: Maîtrise */}
              <div className="space-y-1 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase">Niveau de Maîtrise / Contrôle (M)</span>
                  <span className="font-bold font-mono text-xs text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-100 shadow-sm">{formControl}</span>
                </div>
                <select
                  value={formControl}
                  onChange={(e) => setFormControl(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 text-slate-700 text-xs rounded p-1.5"
                >
                  {tenantConfig.scales.control.map(item => (
                    <option key={item.value} value={item.value}>
                      Cotation {item.value} : {item.label}
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-slate-400 italic">
                  {tenantConfig.scales.control.find(f => f.value === formControl)?.description}
                </p>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-purple-100 shadow-sm text-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Score Brut</span>
                  <span className="font-extrabold text-slate-700 text-lg font-mono">{formFreq * formImpact}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 font-bold block uppercase leading-none">Score Net / Résiduel</span>
                  <span className="font-extrabold text-red-600 text-lg font-mono">
                    {tenantConfig.formula.expression === '(P * I) - M' 
                      ? Math.max(0, (formFreq * formImpact) - formControl) 
                      : (formFreq * formImpact * formControl)}
                  </span>
                </div>
              </div>
            </div>

            {/* Workflow status picker if creating */}
            {isCreating && (
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Statut d'Initiation</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-xs rounded p-2 focus:outline-none focus:border-indigo-600"
                >
                  {tenantConfig.workflowSteps.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded shadow transition-all cursor-pointer text-center"
              >
                Enregistrer les modifications
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRisk(null); setIsCreating(false); }}
                className="py-2 px-3 border border-slate-300 text-slate-600 rounded hover:bg-slate-50 transition-all cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>

          {/* RELATED PLANS AND FORUM COMMENTS FOR EXISTING RISK */}
          {!isCreating && selectedRisk && (
            <div className="border-t border-slate-200 bg-slate-50/50 p-5 space-y-4">
              
              {/* RELATED ACTION PLANS LIST */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-700 uppercase flex items-center gap-1">
                    🔧 Actions Correctives associées
                  </h4>
                  <button 
                    onClick={() => setShowAddAction(!showAddAction)}
                    className="text-[11px] text-indigo-600 hover:underline font-bold flex items-center gap-0.5"
                  >
                    {showAddAction ? "Fermer" : "+ Ajouter une action"}
                  </button>
                </div>

                {showAddAction && (
                  <form onSubmit={handleAddActionPlanSubmit} className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                    <p className="font-semibold text-slate-700 text-[10px]">Nouvelle action de remédiation</p>
                    <input 
                      type="text" 
                      placeholder="Intitulé de l'action corrective..." 
                      required
                      value={actionTitle}
                      onChange={(e) => setActionTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-1.5 rounded focus:outline-none focus:border-indigo-600 font-semibold"
                    />
                    <textarea 
                      placeholder="Description de la solution corrective..." 
                      value={actionDesc}
                      onChange={(e) => setActionDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs p-1.5 rounded focus:outline-none focus:border-indigo-600"
                    ></textarea>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={actionOwnerName}
                        onChange={(e) => setActionOwnerName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-1.5 rounded"
                      >
                        <option value="">Pilote (Propriétaire)</option>
                        {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                      </select>
                      <input 
                        type="date"
                        value={actionDueDate}
                        onChange={(e) => setActionDueDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 text-xs p-1.5 rounded"
                      />
                    </div>

                    <div className="flex justify-between items-center gap-2 pt-1">
                      <select 
                        value={actionPriority}
                        onChange={(e) => setActionPriority(e.target.value as any)}
                        className="bg-slate-50 border border-slate-200 text-xs p-1.5 rounded"
                      >
                        <option value="Basse">Priorité: Basse</option>
                        <option value="Moyenne">Priorité: Moyenne</option>
                        <option value="Haute">Priorité: Haute</option>
                        <option value="Critique">Priorité: Critique</option>
                      </select>
                      <button 
                        type="submit"
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-bold hover:bg-indigo-700 cursor-pointer"
                      >
                        Créer plan d'action
                      </button>
                    </div>
                  </form>
                )}

                {/* Actual related actions list */}
                <div className="space-y-1.5">
                  {actions.filter(a => a.riskId === selectedRisk.id).length === 0 ? (
                    <p className="text-slate-400 italic text-[10px] text-center py-2">Aucun moyen correctif n'est planifié pour ce risque.</p>
                  ) : (
                    actions.filter(a => a.riskId === selectedRisk.id).map(a => (
                      <div key={a.id} className="bg-white p-2.5 rounded border border-slate-100 flex items-center justify-between text-xs hover:border-indigo-150 transition-all">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 text-[11px] leading-tight">{a.title}</p>
                          <p className="text-[10px] text-slate-400">Responsable: <span className="font-semibold text-indigo-650">{a.ownerName}</span> | Échéance: {a.dueDate}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          a.status === 'Réalisé' ? 'bg-green-100 text-green-800' :
                          a.status === 'En cours' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {a.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* TIMELINE AUDIT HISTORY */}
              <div className="space-y-2 border-t border-slate-200/60 pt-4">
                <h4 className="font-bold text-xs text-slate-700 uppercase flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  Journal d'impact & Historique d'évaluation
                </h4>
                
                {/* Comments Form */}
                <div className="flex gap-2 text-xs">
                  <input 
                    type="text" 
                    placeholder="Écrire une observation ou note interne..." 
                    value={historyComment}
                    onChange={(e) => setHistoryComment(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 text-xs p-1.5 rounded focus:outline-none focus:border-indigo-600"
                  />
                  <button 
                    onClick={handleAddComment}
                    className="px-3 bg-slate-700 hover:bg-slate-800 text-white rounded font-bold cursor-pointer text-[10px]"
                  >
                    Ajouter
                  </button>
                </div>

                {/* Timeline */}
                <div className="space-y-2 max-h-48 overflow-y-auto pt-1 pr-1">
                  {selectedRisk.history.slice().reverse().map((h, i) => (
                    <div key={i} className="relative pl-4 border-l border-slate-300 pb-2 text-[10px]">
                      <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-indigo-500"></div>
                      <div className="flex justify-between items-center text-slate-400 font-mono text-[9px]">
                        <span>{h.date} - 👤 {h.user}</span>
                        <span className="font-bold text-indigo-600">{h.action}</span>
                      </div>
                      <p className="text-slate-600 font-medium leading-relaxed mt-0.5">{h.comment || "Aucune note additionnelle."}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center p-12 text-slate-400 text-center bg-white">
          <ShieldAlert className="w-14 h-14 text-slate-200 mb-3" />
          <h3 className="font-bold text-slate-600 text-sm">Fiche de Détail Odoo</h3>
          <p className="max-w-xs text-xs mt-1 leading-relaxed">
            Sélectionnez un risque existant dans la cartographie à gauche pour afficher sa fiche d'évaluation, ses plans d'actions d'atténuation et son journal d'audit en temps réel, ou cliquez sur <strong>Nouveau Risque</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
