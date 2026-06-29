/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle, 
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { Risk, TenantConfig, ActionPlan } from '../types';

interface ReportingModuleProps {
  risks: Risk[];
  tenantConfig: TenantConfig;
  actions: ActionPlan[];
  onAddLog: (action: string, details: string) => void;
}

export default function ReportingModule({
  risks,
  tenantConfig,
  actions,
  onAddLog
}: ReportingModuleProps) {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Critical statistics calculations
  const totalRisks = risks.length;
  
  const avgResidualScore = totalRisks > 0
    ? Number((risks.reduce((acc, curr) => acc + curr.scoreResiduel, 0) / totalRisks).toFixed(1))
    : 0;

  const getCriticality = (score: number) => {
    const found = tenantConfig.matrixThresholds.find(t => score >= t.minScore && score <= t.maxScore);
    return found || tenantConfig.matrixThresholds[0];
  };

  const highRisksCount = risks.filter(r => {
    const crit = getCriticality(r.scoreResiduel);
    return crit.label.includes('élevé') || crit.label.includes('Catastrophique') || crit.label.includes('significatif');
  }).length;

  const totalActions = actions.filter(a => risks.some(r => r.id === a.riskId)).length;
  const completedActions = actions.filter(a => risks.some(r => r.id === a.riskId) && a.status === 'Réalisé').length;
  const actionCompletionRate = totalActions > 0 
    ? Math.round((completedActions / totalActions) * 100) 
    : 0;

  const handlePrint = () => {
    onAddLog('Impression PDF', `Génération du rapport de cartographie d'audit au format d'impression papier`);
    setToastMessage('🖨️ Préparation du document pour impression de la cartographie...');
    setShowToast(true);
    setTimeout(() => {
      window.print();
      setShowToast(false);
    }, 1500);
  };

  const handleExportExcel = () => {
    onAddLog('Export Excel / CSV', 'Téléchargement de l\'analyse brute du registre des risques sous format Excel/CSV.');
    
    // Prepare CSV data
    const headers = ['Code', 'Titres', 'Categorie', 'Périmètre_Entite', 'Probabilite_P', 'Impact_I', 'Maitrise_M', 'Calcul_Score_Brut(P*I)', 'Calcul_Score_Residuel', 'Critique_Seuils'];
    const rows = risks.map(r => {
      const cat = tenantConfig.categories.find(c => c.id === r.categoryId)?.name || '';
      const ent = tenantConfig.entities.find(e => e.id === r.entityId)?.name || '';
      const crit = getCriticality(r.scoreResiduel).label;
      return [
        r.id,
        `"${r.title.replace(/"/g, '""')}"`,
        `"${cat.replace(/"/g, '""')}"`,
        `"${ent.replace(/"/g, '""')}"`,
        r.frequencyValue,
        r.impactValue,
        r.controlValue,
        r.scoreBrut,
        r.scoreResiduel,
        `"${crit.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodeUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodeUri);
    link.setAttribute("download", `GRC_Cartographie_Risques_${tenantConfig.companyName.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('📥 Téléchargement Excel CSV initié avec succès ! Rechargement...');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  return (
    <div className="flex-1 p-6 bg-slate-50 overflow-y-auto space-y-6 text-slate-800 text-xs">
      
      {/* Toast Alert feedback block */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-white rounded-md p-3 shadow-xl flex items-center gap-2 max-w-sm animate-fade-in text-xs font-semibold border border-slate-700">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Button command ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200 print:hidden">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Édition et Génération de Rapports d'Audit
          </h2>
          <p className="text-slate-500 text-[11px]">
            Produisez des rapports personnalisés exportables certifiés pour vos conseils d'administration et vos audits.
          </p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.8 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimer Rapport (PDF)
          </button>
          
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-1.8 border border-emerald-300 text-emerald-800 hover:bg-emerald-55 bg-emerald-50 rounded font-bold transition flex items-center gap-1 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exporter Registre (Excel/CSV)
          </button>
        </div>
      </div>

      {/* REPORT VIEWER CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-350 p-8 shadow-md max-w-4xl mx-auto space-y-8 animate-fade-in print:p-0 print:border-none print:shadow-none">
        
        {/* Document Header */}
        <div className="flex justify-between items-start border-b-2 border-indigo-200 pb-5">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-indigo-650 font-sans tracking-tight">RAPPORT EXÉCUTIF DU REGISTRE DES RISQUES</h1>
            <p className="text-slate-500 font-medium leading-none text-[11px]">Dispositifs globaux d'évaluation et de gouvernance du risque</p>
            <p className="text-indigo-600 font-semibold text-[10.5px]">Organisation : <strong className="text-slate-800">{tenantConfig.companyName}</strong></p>
          </div>
          
          <div className="text-right text-[10.5px] text-slate-400">
            <p className="font-bold">Date de production : {new Date().toLocaleDateString()}</p>
            <p className="font-mono">Réf: GRC-IFACI-REP-2026</p>
            <p className="mt-1 badge font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 inline-block print:hidden">STATUT : VALIDÉ</p>
          </div>
        </div>

        {/* Executive summary statement */}
        <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <h3 className="font-bold text-sm text-indigo-600 flex items-center gap-1">
            📢 Synthèse Globale de l'Audit Interne
          </h3>
          <p className="text-slate-650 leading-relaxed text-[11px]">
            La cartographie des risques consolidée de l'organisation <strong>{tenantConfig.companyName}</strong> a été réévaluée conformément aux normes professionnelles de l'<strong>IFACI (Groupe Professionnel IFACI 2013)</strong>. En combinant la cotation de la Fréquence/Probabilité d'occurrence, l'estimation des Impacts Financiers/Réglementaires et le niveau d'efficacité de notre dispositif de contrôle interne, nous avons hiérarchisé l'ensemble du profil de risques d'entreprise.
          </p>
        </div>

        {/* Score Metrics section */}
        <div className="grid grid-cols-3 gap-4 border border-slate-200 rounded-xl p-4 divide-x divide-slate-200 text-center bg-slate-50/50">
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-bold block mb-1">Index de risque net moyen</span>
            <span className="text-2xl font-black text-slate-800 font-mono">{avgResidualScore}</span>
            <p className="text-[9.5px] text-slate-400">Toutes catégories confondues</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-bold block mb-1">Risques critiques de seuils</span>
            <span className="text-2xl font-black text-red-600 font-mono">{highRisksCount}</span>
            <p className="text-[9.5px] text-slate-400">Nécessitant surveillance active</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-450 uppercase font-bold block mb-1">Déploiement des remédiations</span>
            <span className="text-2xl font-black text-indigo-600 font-mono">{actionCompletionRate}%</span>
            <p className="text-[9.5px] text-slate-400">{completedActions}/{totalActions} actions menées au bout</p>
          </div>
        </div>

        {/* Threat registry detailed table */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-indigo-650 text-xs uppercase border-b border-indigo-200 pb-1">
            📜 Registre Actif des Risques Identifiés
          </h3>
          
          <table className="w-full border-collapse border border-slate-200 text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[9px] border-b border-slate-200">
                <th className="py-2 px-3 border border-slate-200">Code</th>
                <th className="py-2 px-3 border border-slate-200">Intitulé du risque</th>
                <th className="py-2 px-3 border border-slate-200">Entité Organisatrice</th>
                <th className="py-2 px-3 border border-slate-200 text-center">P</th>
                <th className="py-2 px-3 border border-slate-200 text-center">I</th>
                <th className="py-2 px-3 border border-slate-200 text-center">M</th>
                <th className="py-2 px-3 border border-slate-200 text-center">Score Net</th>
                <th className="py-2 px-3 border border-slate-200 text-center">Sévérité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[10px]">
              {risks.map((risk) => {
                const entityName = tenantConfig.entities.find(e => e.id === risk.entityId)?.name || 'Opérations Générales';
                const crit = getCriticality(risk.scoreResiduel);
                return (
                  <tr key={risk.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-mono font-bold text-slate-600 border border-slate-200">{risk.id}</td>
                    <td className="py-2 px-3 border border-slate-200">
                      <p className="font-bold text-slate-800 leading-tight">{risk.title}</p>
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-500 border border-slate-200">{entityName}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-450 border border-slate-200">{risk.frequencyValue}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-450 border border-slate-200">{risk.impactValue}</td>
                    <td className="py-2 px-3 text-center font-mono font-bold text-slate-450 border border-slate-200">{risk.controlValue}</td>
                    <td className="py-2 px-3 text-center font-mono font-black text-indigo-600 border border-slate-200">{risk.scoreResiduel}</td>
                    <td className="py-2 px-3 text-center border border-slate-200">
                      <span className="font-bold uppercase tracking-wider text-[8px]" style={{ color: crit.textColor }}>
                        {crit.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mitigation Actions table */}
        <div className="space-y-3 pt-4">
          <h3 className="font-extrabold text-indigo-650 text-xs uppercase border-b border-indigo-200 pb-1">
            🔧 Suivi et Maturité de l'Atténuation des Risques
          </h3>

          <table className="w-full border-collapse border border-slate-200 text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold tracking-wider text-[9px] border-b border-slate-200">
                <th className="py-2 px-3 border border-slate-200">ID Action</th>
                <th className="py-2 px-3 border border-slate-200">Action Corrective programmée</th>
                <th className="py-2 px-3 border border-slate-200">Pilote désigné</th>
                <th className="py-2 px-3 border border-slate-200 text-center">Échéance</th>
                <th className="py-2 px-3 border border-slate-200 text-center">Avancement</th>
                <th className="py-2 px-3 border border-slate-200 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-[10px]">
              {actions.map((act) => (
                <tr key={act.id}>
                  <td className="py-2 px-3 font-mono font-bold text-slate-500 border border-slate-200">{act.id}</td>
                  <td className="py-2 px-3 border border-slate-200">
                    <p className="font-bold text-slate-800 leading-tight">{act.title}</p>
                    <p className="text-[9.5px] text-slate-400 mt-0.5 mt-1">Concerne : <span className="font-semibold text-slate-650 font-mono">{act.riskId}</span></p>
                  </td>
                  <td className="py-2 px-3 font-bold text-indigo-600 border border-slate-200">{act.ownerName}</td>
                  <td className="py-2 px-3 text-center font-mono text-slate-600 border border-slate-200">{act.dueDate}</td>
                  <td className="py-2 px-3 text-center border border-slate-200">
                    <span className="font-bold text-slate-700 font-mono">{act.progress}%</span>
                  </td>
                  <td className="py-2 px-3 text-center border border-slate-200">
                    <span className="font-bold uppercase tracking-wider text-[8px] text-slate-600">
                      {act.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Certificate stamp bottom signatures */}
        <div className="pt-2 border-t-2 border-indigo-200/50 flex justify-between text-[10px] text-slate-400 pr-5">
          <div>
            <p className="font-bold text-slate-500">Signatures de Conformité :</p>
            <p className="mt-6 italic font-medium">Alain-Patrick Nkoumou, Lead Risk Manager</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-500">Approbation Direction :</p>
            <p className="mt-6 italic font-medium">Marie-Thérèse Atangana, Représentante Générale</p>
          </div>
        </div>

      </div>
    </div>
  );
}
