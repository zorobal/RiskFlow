/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckSquare, 
  TrendingUp, 
  FolderIcon, 
  HelpCircle,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Risk, TenantConfig, ActionPlan } from '../types';

interface DashboardModuleProps {
  risks: Risk[];
  tenantConfig: TenantConfig;
  actions: ActionPlan[];
}

export default function DashboardModule({
  risks,
  tenantConfig,
  actions
}: DashboardModuleProps) {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  // Filter risks
  const filteredRisks = risks.filter(r => {
    const matchEntity = selectedEntityId === 'all' || r.entityId === selectedEntityId;
    const matchCat = selectedCategoryId === 'all' || r.categoryId === selectedCategoryId;
    return matchEntity && matchCat;
  });

  // Calculate Metrics
  const totalRisks = filteredRisks.length;
  
  const avgResidualScore = totalRisks > 0
    ? Number((filteredRisks.reduce((acc, curr) => acc + curr.scoreResiduel, 0) / totalRisks).toFixed(1))
    : 0;

  const totalActions = actions.filter(a => filteredRisks.some(r => r.id === a.riskId)).length;
  const completedActions = actions.filter(a => filteredRisks.some(r => r.id === a.riskId) && a.status === 'Réalisé').length;
  const actionCompletionRate = totalActions > 0 
    ? Math.round((completedActions / totalActions) * 100) 
    : 0;

  // Group by Criticality
  const getCriticality = (score: number) => {
    const found = tenantConfig.matrixThresholds.find(t => score >= t.minScore && score <= t.maxScore);
    return found || tenantConfig.matrixThresholds[0];
  };

  const criticalityCounts = tenantConfig.matrixThresholds.map(t => {
    const count = filteredRisks.filter(r => {
      const crit = getCriticality(r.scoreResiduel);
      return crit.label === t.label;
    }).length;
    return {
      label: t.label,
      count,
      color: t.color,
      textColor: t.textColor,
      percentage: totalRisks > 0 ? Math.round((count / totalRisks) * 100) : 0
    };
  });

  // Group by Categories
  const categoryCounts = tenantConfig.categories.map(cat => {
    const count = filteredRisks.filter(r => r.categoryId === cat.id).length;
    return {
      label: cat.name,
      count,
      color: cat.color,
      percentage: totalRisks > 0 ? Math.round((count / totalRisks) * 100) : 0
    };
  });

  // Group by Entity for Bar Chart
  const entityCounts = tenantConfig.entities
    .filter(e => e.type !== 'Direction' || tenantConfig.entities.some(child => child.parentId === e.id)) // focus on operational or parent directions
    .map(entity => {
      const count = filteredRisks.filter(r => r.entityId === entity.id).length;
      return {
        name: entity.name,
        count
      };
    })
    .filter(item => item.count > 0);

  // Highest risks
  const topRisks = [...filteredRisks]
    .sort((a, b) => b.scoreResiduel - a.scoreResiduel)
    .slice(0, 4);

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-6 text-slate-800 text-xs">
      {/* Top filter utility ribbon in Odoo style */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Tableau de Bord Décisionnel
          </h2>
          <p className="text-slate-500 text-[11px]">
            Statistiques temps réel du profil de risques pour l'entreprise <span className="font-semibold text-slate-700">{tenantConfig.companyName}</span>
          </p>
        </div>

        {/* Top filter selects */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase">Entité Org</span>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs font-medium cursor-pointer"
            >
              <option value="all">Toutes les entités (Global)</option>
              {tenantConfig.entities.map(e => (
                <option key={e.id} value={e.id}>
                  {e.type === 'Filiale' ? '🏢 ' : e.type === 'Site' ? '📍 ' : '📁 '} {e.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-semibold mb-1 uppercase">Catégorie</span>
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-medium cursor-pointer"
            >
              <option value="all">Toutes les catégories</option>
              {tenantConfig.categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metrics Row - Bento Grid of KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Risques Identifiés</span>
            <p className="text-3xl font-extrabold text-slate-900 leading-tight">{totalRisks}</p>
            <p className="text-[10px] text-slate-500">Risques actifs référencés</p>
          </div>
          <div className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center border border-indigo-100">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Indice de Risque Moyen</span>
            <p className="text-3xl font-extrabold text-indigo-650 leading-tight">{avgResidualScore}</p>
            <p className="text-[10px] text-slate-500">Note moyenne résiduelle</p>
          </div>
          <div className="w-11 h-11 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center border border-teal-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Taux de Plans d'action</span>
            <p className="text-3xl font-extrabold text-slate-900 leading-tight">{actionCompletionRate}%</p>
            <p className="text-[10px] text-slate-500">{completedActions}/{totalActions} actions clôturées</p>
          </div>
          <div className="w-11 h-11 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Alerte Critique</span>
            <p className="text-3xl font-extrabold text-red-600 leading-tight">
              {filteredRisks.filter(r => getCriticality(r.scoreResiduel).label.includes('élevé') || getCriticality(r.scoreResiduel).label.includes('Catastrophique') || getCriticality(r.scoreResiduel).label.includes('significatif')).length}
            </p>
            <p className="text-[10px] text-slate-500">Risques à forte intensité</p>
          </div>
          <div className="w-11 h-11 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Criticality Breakdown and Top List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Criticality Bar / Breakdown card */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              Niveau de Criticité des Risques Résiduels (IFACI Net Risk)
            </h3>
            
            <div className="space-y-3">
              {criticalityCounts.map((crit, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: crit.textColor }}></span>
                      {crit.label}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {crit.count} {crit.count > 1 ? 'risques' : 'risque'} ({crit.percentage}%)
                    </span>
                  </div>
                  {/* Custom animated progress bar */}
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${crit.percentage}%`,
                        backgroundColor: crit.textColor
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-800 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p>
                <strong>Le saviez-vous ?</strong> Le risque résiduel ou net comptabilise le niveau d'efficacité des dispositifs de maîtrise de l'entreprise. Un score de [0-6] est jugé "Faible (sous contrôle)" tandis qu'un score &gt; 32 indique une urgence d'alerte direction.
              </p>
            </div>
          </div>

          {/* SVG Custom Interactive Chart: Risks by department */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-4.5 h-4.5 text-teal-600" />
              Volume de Risques Identifiés par Entité Organisationnelle
            </h3>

            {entityCounts.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                Aucune donnée à afficher pour cette sélection d'entité.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Custom pure SVG clean bar graphics */}
                <div className="w-full h-48 py-2">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <line x1="50" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="50" y1="70" x2="480" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="50" y1="120" x2="480" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="50" y1="170" x2="480" y2="170" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Bars rendering */}
                    {entityCounts.map((entity, idx) => {
                      const totalBars = entityCounts.length;
                      const barWidth = 40;
                      const spacing = (400 - totalBars * barWidth) / (totalBars + 1);
                      const x = 50 + spacing + idx * (barWidth + spacing);
                      
                      const maxCount = Math.max(...entityCounts.map(item => item.count), 1);
                      const barHeight = (entity.count / maxCount) * 130;
                      const y = 170 - barHeight;
                                return (
                        <g key={idx} className="group cursor-default">
                          {/* Animated main bar rect */}
                          <rect
                            x={x}
                            y={y}
                            width={barWidth}
                            height={barHeight}
                            fill="#4f46e5"
                            rx="3"
                            className="transition-all duration-300 hover:fill-indigo-500"
                          />
                          {/* Text count top indicator */}
                          <text
                            x={x + barWidth / 2}
                            y={y - 6}
                            textAnchor="middle"
                            fill="#334155"
                            className="font-mono text-[10px] font-bold"
                          >
                            {entity.count}
                          </text>
                          {/* Label bottom */}
                          <text
                            x={x + barWidth / 2}
                            y="185"
                            textAnchor="middle"
                            fill="#64748b"
                            className="text-[9px]"
                          >
                            {entity.name.length > 10 ? `${entity.name.substring(0, 10)}.` : entity.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="flex flex-wrap gap-3 justify-center text-[10px] text-slate-500">
                  {entityCounts.map((item, idx) => (
                    <span key={idx} className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 bg-indigo-600 rounded-sm"></span>
                      {item.name} ({item.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Category counts and top 4 threat matrix list */}
        <div className="lg:col-span-4 space-y-6">
          {/* Risks by Category Pie/Donut approximation list */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <FolderIcon className="w-4.5 h-4.5 text-teal-600" />
              Répartition par Catégorie
            </h3>
            
            <div className="space-y-4">
              {categoryCounts.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                    <span className="font-medium text-slate-700">{cat.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] font-mono">({cat.count})</span>
                    <span className="bg-slate-100 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded text-[10px]">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Threatening Risks (High Residual Scores) */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <h3 className="font-bold text-sm text-slate-800 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-red-600" />
              Alerte : Top Risques Majeurs
            </h3>

            {topRisks.length === 0 ? (
              <p className="text-center text-slate-400 py-6">Aucun risque à haute criticité.</p>
            ) : (
              <div className="space-y-3.5">
                {topRisks.map((risk) => {
                  const crit = getCriticality(risk.scoreResiduel);
                  return (
                    <div 
                      key={risk.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors space-y-1.5"
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-slate-600 bg-slate-200 px-1 py-0.5 rounded text-[10px]">
                          {risk.id}
                        </span>
                        <span 
                          className="px-2 py-0.5 rounded text-[9px] font-bold border"
                          style={{ backgroundColor: crit.color, color: crit.textColor, borderColor: crit.textColor + '30' }}
                        >
                          Net: {risk.scoreResiduel}
                        </span>
                      </div>
                      
                      <p className="font-bold text-slate-800 text-[11px] hover:text-indigo-600 cursor-pointer">
                        {risk.title}
                      </p>
                      
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>P: {risk.frequencyValue} | I: {risk.impactValue} | M: {risk.controlValue}</span>
                        <span className="font-semibold text-slate-500">
                          Brut: {risk.scoreBrut}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
