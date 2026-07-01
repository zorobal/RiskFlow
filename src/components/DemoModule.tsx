import React, { useState } from 'react';
import { 
  Sparkles, Server, Database, Shield, ArrowRight, Layers, Settings, 
  Key, RefreshCw, Play, Check, Code, Cpu, Info, Globe, HardDrive, 
  Lock, Eye, AlertCircle, Award, CheckSquare, ClipboardList, TrendingUp 
} from 'lucide-react';
import { User, TenantConfig } from '../types';

interface DemoModuleProps {
  users: User[];
  tenants: TenantConfig[];
  onSelectScenario: (user: User, tenantId: string, isSuperAdmin: boolean, initialModule: any) => void;
  onBackToLogin: () => void;
}

export default function DemoModule({ users, tenants, onSelectScenario, onBackToLogin }: DemoModuleProps) {
  const [activeTab, setActiveTab] = useState<'scenarios' | 'architecture' | 'frameworks' | 'features'>('scenarios');
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('sc_superadmin');
  
  // Interactive Supabase Router Playground State
  const [selectedTenantSim, setSelectedTenantSim] = useState<'tenant1' | 'tenant2' | 'tenant_new'>('tenant1');
  const [querySim, setQuerySim] = useState('SELECT id, title, score_residuel FROM risks LIMIT 3;');
  const [isExecutingQuery, setIsExecutingQuery] = useState(false);
  const [queryResult, setQueryResult] = useState<any[]>([
    { id: 'R-101', title: 'Rupture d\'approvisionnement critique', score_residuel: 16 }
  ]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 1500);
  };

  const handleSimulateQuery = () => {
    setIsExecutingQuery(true);
    setTimeout(() => {
      setIsExecutingQuery(false);
      if (selectedTenantSim === 'tenant1') {
        setQueryResult([
          { id: 'R-101', title: 'Rupture d\'approvisionnement critique', score_residuel: 16 },
          { id: 'R-102', title: 'Piratage et rançongiciel', score_residuel: 8 },
          { id: 'R-103', title: 'Non-conformité RGPD sur les fiches RH', score_residuel: 18 }
        ]);
      } else if (selectedTenantSim === 'tenant2') {
        setQueryResult([
          { id: 'R-201', title: 'Incident de calibrage des gouvernes', score_residuel: 12 },
          { id: 'R-202', title: 'Interruption de chaîne d\'assemblage', score_residuel: 6 },
          { id: 'R-203', title: 'Défaut d\'isolation thermique réacteurs', score_residuel: 15 }
        ]);
      } else {
        setQueryResult([
          { id: 'R-NEW-01', title: 'Base nouvellement provisionnée', score_residuel: 0 }
        ]);
      }
    }, 400);
  };

  const demoScenarios = [
    {
      id: 'sc_superadmin',
      title: 'Scénario 1 : SuperAdmin de la Plateforme GRC',
      description: 'Supervisez l\'infrastructure globale. Pilotez l\'activation et la suspension de licences des entreprises clientes (Sogesti, AeroTech), suivez l\'audit complet inter-entreprises, simulez un jeton de validation MFA double-facteur, et gérez la restauration des sauvegardes d\'urgence.',
      persona: users.find(u => u.role === 'SuperAdmin') || users[4] || users[0],
      tenantId: 'tenant1',
      isSuperAdmin: true,
      initialModule: 'admin',
      badge: 'Contrôle Global • Sauvegardes & MFA',
      badgeColor: 'bg-red-500/15 text-red-350 border-red-500/30'
    },
    {
      id: 'sc_riskmanager',
      title: 'Scénario 2 : Risk Manager de Sogesti S.A.',
      description: 'Pilotez l\'analyse des risques d\'une grande compagnie d\'assurance. Utilisez la matrice de criticité 4x4 et la formule originale de l\'IFACI (F x I x M), planifiez des actions de traitement correctives (MFA, RGPD) et filtrez les indicateurs de risques par Exercice fiscal annuel.',
      persona: users.find(u => u.email === 'alainpatricknkoumou@gmail.com') || users[0],
      tenantId: 'tenant1',
      isSuperAdmin: false,
      initialModule: 'dashboard',
      badge: 'Matrice 4x4 • Formule IFACI',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'sc_analyste',
      title: 'Scénario 3 : Analyste d\'AeroTech (Terrain)',
      description: 'Saisissez les fiches d\'incidents de calibrage d\'un constructeur aéronautique. Déclarez de nouveaux incidents de conformité technique, mettez à jour l\'état d\'avancement de vos plans de remédiation, et appliquez la formule soustraite mitigée (P * I - M) sur une grille 5x5.',
      persona: users.find(u => u.role === 'Analyste') || users[3] || users[0],
      tenantId: 'tenant2',
      isSuperAdmin: false,
      initialModule: 'actions',
      badge: 'Formule Mitigée • Grille 5x5',
      badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30'
    },
    {
      id: 'sc_direction',
      title: 'Scénario 4 : Direction Générale & Auditeur Chef',
      description: 'Supervisez la conformité réglementaire de haut niveau et examinez les constats d\'audits. Générez de splendides rapports d\'exposition consolidés pour les instances exécutives, et effectuez la clôture officielle d\'une session d\'exercice annuel.',
      persona: users.find(u => u.role === 'Direction') || users[1] || users[0],
      tenantId: 'tenant1',
      isSuperAdmin: false,
      initialModule: 'reporting',
      badge: 'Comité d\'Audit • Clôture d\'Exercice',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    }
  ];

  const caseStudies: Record<string, {
    title: string;
    description: string;
    targetTenantName: string;
    steps: {
      stepNumber: number;
      title: string;
      objective: string;
      action: string;
      result: string;
      module: string;
    }[];
  }> = {
    sc_superadmin: {
      title: "Supervision Multi-Tenant et Gestion de la Continuité GRC",
      description: "Ce cas d'usage simule le rôle du superviseur technique de la plateforme. Vous piloterez l'activation des contrats des entreprises clientes, visualiserez les audits de sécurité et simulerez une restauration d'urgence.",
      targetTenantName: "Console Plateforme GRC",
      steps: [
        {
          stepNumber: 1,
          title: "Supervision des Filiales et Entreprises Clientes",
          objective: "Visualiser l'état de validité des abonnements et licences des entreprises clientes de la plateforme.",
          action: "Accédez à la console d'administration centrale de la plateforme en démarrant ce scénario.",
          result: "Vous visualiserez l'Espace d'Administration Centrale avec la liste des entreprises clientes (Sogesti S.A., AeroTech, etc.) et l'état de validité de leurs licences.",
          module: "admin"
        },
        {
          stepNumber: 2,
          title: "Gestion des Licences en Temps Réel",
          objective: "Suspendre temporairement ou renouveler/activer l'accès d'un client de manière étanche.",
          action: "Allez dans l'Espace Centrale SuperAdmin, localisez l'entreprise et cliquez sur le bouton de suspension.",
          result: "La validité passe instantanément au statut 'Suspendu' ou 'Actif' avec journalisation dans l'audit de facturation globale.",
          module: "admin"
        },
        {
          stepNumber: 3,
          title: "Authentification Double-Facteur (MFA)",
          objective: "Assurer la haute sécurité de la plateforme d'administration en générant des clés temporaires d'accès.",
          action: "Observez le module de simulation MFA de sécurité actif à droite.",
          result: "Un code PIN d'authentification à 6 chiffres se régénère dynamiquement toutes les 15 secondes pour certifier les actions critiques.",
          module: "admin"
        },
        {
          stepNumber: 4,
          title: "Restauration d'Urgence (Plan de Reprise d'Activité)",
          objective: "Réinitialiser un client à son état d'origine en cas de corruption ou de besoin de démonstration neuve.",
          action: "Dans l'Espace SuperAdmin, cliquez sur le bouton 'Restaurer' lié à une entreprise pour réinitialiser sa base.",
          result: "Le cache local de session du client est instantanément rechargé aux valeurs réglementaires de référence.",
          module: "admin"
        }
      ]
    },
    sc_riskmanager: {
      title: "Évaluation Réglementaire IFACI & Traitement des Menaces",
      description: "Incarnez le Risk Manager de l'entreprise Sogesti S.A. Ce cas pratique vous guide dans l'évaluation d'un risque d'assurance, le comparatif par exercice fiscal et l'atténuation d'un risque résiduel informatique.",
      targetTenantName: "Sogesti S.A. (Assurances)",
      steps: [
        {
          stepNumber: 1,
          title: "Analyse d'Impact par Exercice Fiscal",
          objective: "Comparer et analyser l'exposition globale aux risques entre deux exercices annuels.",
          action: "Dans le Tableau de Bord, sélectionnez l'Exercice fiscal '2026' ou '2025' et observez le comparateur automatisé.",
          result: "Le système affiche les tendances comparées d'évolution des risques actifs, l'indice net moyen et le taux d'avancement des plans de mitigation.",
          module: "dashboard"
        },
        {
          stepNumber: 2,
          title: "Cotation IFACI d'une Cyberattaque de Ransomware",
          objective: "Réévaluer les critères de sévérité d'une fiche de risque informatique.",
          action: "Naviguez vers 'Cartographie des Risques', localisez le risque R-101 et cliquez sur 'Réévaluer'.",
          result: "Modifiez la Fréquence, l'Impact et la Maîtrise de la menace pour recalculer dynamiquement l'Indice Résiduel selon l'IFACI (F x I x M).",
          module: "risks"
        },
        {
          stepNumber: 3,
          title: "Déploiement du Plan de Traitement (Mitigation)",
          objective: "Associer une action corrective d'urgence pour réduire l'exposition nette de l'assurance.",
          action: "Naviguez dans le module 'Plans d'Actions' et ajoutez une action de mitigation (ex: Authentification MFA).",
          result: "L'action corrective est liée à la fiche de risque avec un responsable désigné et s'intègre au plan d'action global.",
          module: "actions"
        },
        {
          stepNumber: 4,
          title: "Contrôle visuel sur la Matrice de Criticité",
          objective: "Vérifier la descente thermique du risque sur la grille de criticité 4x4.",
          action: "Naviguez vers le module 'Matrice de Criticité' (Heatmap) pour observer la position du risque.",
          result: "Le risque R-101 est positionné à l'intersection brute (Fréquence x Impact) et résiduelle (atténuée par le contrôle).",
          module: "heatmap"
        }
      ]
    },
    sc_analyste: {
      title: "Signalement d'Incidents Qualité et Saisie de Terrain",
      description: "Incarnez l'analyste GRC de terrain chez AeroTech. Ce cas pratique démontre la déclaration d'incidents techniques de calibrage, l'avancement des corrections et l'application de la formule soustraite mitigée.",
      targetTenantName: "AeroTech (Aéronautique)",
      steps: [
        {
          stepNumber: 1,
          title: "Déclaration d'un Incident Qualité de Calibrage",
          objective: "Enregistrer une déviation ou un incident survenu en atelier aéronautique.",
          action: "Dans le module 'Conformité', déclarez un incident lié à un calibrage ou à la sécurité physique.",
          result: "Le système l'enregistre avec un niveau de gravité, trace l'action dans le journal d'audit et la rattache au pôle technique.",
          module: "compliance"
        },
        {
          stepNumber: 2,
          title: "Planification d'une Action Corrective Immédiate",
          objective: "Rédiger une mesure corrective d'ingénierie et l'affecter aux ingénieurs responsables.",
          action: "Naviguez vers 'Plans d'Actions' pour planifier une action corrective d'urgence avec priorité haute.",
          result: "L'action s'intègre au tableau Kanban pour un suivi en temps réel de son exécution par l'atelier.",
          module: "actions"
        },
        {
          stepNumber: 3,
          title: "Clôture de l'Action et Impact sur la Matrice 5x5",
          objective: "Valider l'exécution de la correction et observer le calcul soustrait mitigé (P * I - M).",
          action: "Modifiez le statut de l'action corrective pour la marquer comme 'Réalisé'.",
          result: "Le taux de remédiation global augmente, et la sévérité résiduelle diminue drastiquement sur la matrice 5x5.",
          module: "heatmap"
        }
      ]
    },
    sc_direction: {
      title: "Revue de Conformité, Rapports GRC et Clôture Annuelle d'Exercice",
      description: "Incarnez le Directeur Général ou l'Auditeur en Chef de Sogesti. Ce cas pratique vous guide dans l'examen des constats d'audits, la génération de rapports de conformité et la clôture officielle d'une session annuelle.",
      targetTenantName: "Sogesti S.A. (Assurances)",
      steps: [
        {
          stepNumber: 1,
          title: "Examen des Constats d'Audits Internes",
          objective: "Prendre connaissance des recommandations formulées par les équipes d'audit.",
          action: "Accédez à l'onglet 'Audit Interne' pour examiner la mission d'audit en cours.",
          result: "Vous visualisez l'historique d'audit, les écarts constatés et les plans d'action attendus pour la conformité.",
          module: "audit"
        },
        {
          stepNumber: 2,
          title: "Génération de la Liasse de Reporting",
          objective: "Consulter la synthèse consolidée pour les instances réglementaires.",
          action: "Naviguez vers le module 'Rapports & Audit' pour extraire le dossier de reporting annuel.",
          result: "Les données d'évaluation, de conformité et les indicateurs clés s'affichent sous forme de liasse synthétique.",
          module: "reporting"
        },
        {
          stepNumber: 3,
          title: "Clôture de la Session Annuelle d'Exercice",
          objective: "Figer définitivement les informations de l'exercice pour entamer le nouveau cycle fiscal.",
          action: "Accédez au module 'Administration' (Admin), ouvrez l'onglet 'Sessions & Exercices', cliquez sur 'Clôturer', rédigez le bilan annuel consolidé et validez.",
          result: "La session passe au statut 'Clôturée' immuable et le bilan annuel consolidé est sauvegardé de façon sécurisée.",
          module: "admin"
        }
      ]
    }
  };

  return (
    <div className="min-h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
      
      {/* Top Header Navigation */}
      <header className="px-6 py-4 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-wide">ESPACE DÉMONSTRATION INTERACTIVE</h1>
            <p className="text-[10px] text-slate-400 font-mono">DÉPLOIEMENT VERCEL • ISOLATION DE DONNÉES SUPABASE</p>
          </div>
        </div>
        
        <button
          onClick={onBackToLogin}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded text-xs font-bold transition-all cursor-pointer hover:text-white"
        >
          &larr; Retour au Portail de Connexion
        </button>
      </header>

      {/* Main Container Split */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Navigation Links & Deep Dives */}
        <div className="lg:w-3/4 flex flex-col space-y-6">
          
          {/* Tabs Menu */}
          <div className="flex border-b border-slate-800 space-x-1 bg-slate-900/40 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('scenarios')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'scenarios' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Scénarios Pratiques</span>
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'features' 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Grille de Fonctionnalités</span>
            </button>
          </div>

          {/* Tab Content 1: Scenarios */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/15">
                <h3 className="text-sm font-bold text-indigo-300 flex items-center mb-1">
                  <Sparkles className="w-4.5 h-4.5 mr-2 text-indigo-400" />
                  Prêt pour un essai guidé en conditions réelles ?
                </h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Sélectionnez l'un des scénarios d'excellence ci-dessous pour charger son <strong>Cas Pratique Pas-à-Pas</strong>. Vous pouvez démarrer le scénario complet en un clic ou lancer l'application directement à l'étape de votre choix grâce aux boutons d'accès instantanés.
                </p>
              </div>

              {/* Scenarios Selection Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoScenarios.map((sc) => {
                  const isSelected = sc.id === selectedScenarioId;
                  return (
                    <div 
                      key={sc.id}
                      onClick={() => setSelectedScenarioId(sc.id)}
                      className={`flex flex-col justify-between rounded-xl p-5 border transition-all duration-200 cursor-pointer relative overflow-hidden group select-none ${
                        isSelected 
                          ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/20' 
                          : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      {/* Active indicator ribbon */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-indigo-600 text-[8.5px] text-white font-extrabold px-3 py-1 rounded-bl shadow flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Cas Pratique Actif
                        </div>
                      )}

                      <div>
                        {/* Top ribbon */}
                        <span className={`inline-block text-[9px] font-bold uppercase border px-2 py-0.5 rounded-full ${sc.badgeColor} mb-4`}>
                          {sc.badge}
                        </span>
                        
                        <h4 className={`text-xs font-bold transition-colors mb-2 ${isSelected ? 'text-indigo-300' : 'text-white group-hover:text-indigo-400'}`}>
                          {sc.title}
                        </h4>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          {sc.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={sc.persona.avatar} 
                            alt="" 
                            className="w-8 h-8 rounded-full border border-slate-700 object-cover" 
                          />
                          <div className="text-left">
                            <p className="text-[10.5px] font-bold text-slate-300 leading-none">{sc.persona.name}</p>
                            <p className="text-[9px] text-slate-500 font-medium">{sc.persona.role}</p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent setting selected case twice
                            onSelectScenario(sc.persona, sc.tenantId, sc.isSuperAdmin, sc.initialModule);
                          }}
                          className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px] transition-all cursor-pointer flex items-center gap-1 shadow"
                          title="Lancer le scénario de test complet"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          Lancer Complet
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DYNAMIC CASE STUDY - STEP-BY-STEP (Cas Pratique Actif) */}
              {selectedScenarioId && caseStudies[selectedScenarioId] && (
                <div className="bg-slate-900/60 border border-indigo-500/20 rounded-xl p-5 space-y-5 animate-fade-in">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1 bg-indigo-600/20 text-indigo-400 rounded">
                          <ClipboardList className="w-4 h-4" />
                        </span>
                        <h4 className="font-extrabold text-sm text-white tracking-wide">
                          Cas Pratique : {caseStudies[selectedScenarioId].title}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                        {caseStudies[selectedScenarioId].description}
                      </p>
                    </div>
                    <div className="bg-slate-850 border border-slate-750 text-slate-300 font-mono text-[9.5px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                      Espace Cible : <strong className="text-white">{caseStudies[selectedScenarioId].targetTenantName}</strong>
                    </div>
                  </div>

                  {/* Steps Timeline / Cards */}
                  <div className="space-y-4">
                    <p className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                      Étapes guidées du cas pratique (Cliquez sur "Lancer cette étape" pour naviguer directement) :
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {caseStudies[selectedScenarioId].steps.map((step) => {
                        const targetScenario = demoScenarios.find(sc => sc.id === selectedScenarioId)!;
                        return (
                          <div 
                            key={step.stepNumber} 
                            className="bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4.5 space-y-3.5 transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="bg-indigo-600/15 text-indigo-300 border border-indigo-500/20 text-[9.5px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                  Étape {step.stepNumber}
                                </span>
                                <span className="text-slate-500 text-[10px] font-mono font-semibold uppercase flex items-center gap-1">
                                  <Layers className="w-3 h-3 text-slate-400" />
                                  Module : {step.module.toUpperCase()}
                                </span>
                              </div>

                              <h5 className="font-bold text-slate-100 text-[11.5px] tracking-wide">
                                {step.title}
                              </h5>

                              <div className="space-y-2 text-[10.5px]">
                                <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-850/50">
                                  <strong className="text-indigo-400 text-[10px] uppercase font-bold block mb-0.5">🎯 Objectif Métier :</strong>
                                  <p className="text-slate-300 leading-relaxed">{step.objective}</p>
                                </div>
                                <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-850/50">
                                  <strong className="text-amber-400 text-[10px] uppercase font-bold block mb-0.5">🛠️ Action à Réaliser :</strong>
                                  <p className="text-slate-300 leading-relaxed">{step.action}</p>
                                </div>
                                <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-850/50">
                                  <strong className="text-emerald-400 text-[10px] uppercase font-bold block mb-0.5">✨ Résultat Attendu :</strong>
                                  <p className="text-slate-300 leading-relaxed">{step.result}</p>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-900 flex justify-end">
                              <button
                                onClick={() => onSelectScenario(
                                  targetScenario.persona,
                                  targetScenario.tenantId,
                                  targetScenario.isSuperAdmin,
                                  step.module
                                )}
                                className="w-full sm:w-auto py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded text-[10px] tracking-wide transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                              >
                                <span>Lancer cette étape</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab Content 4: Full Features Grid */}
          {activeTab === 'features' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                <h3 className="font-bold text-white mb-1 text-xs">Matrice de Couverture Fonctionnelle</h3>
                <p className="text-slate-400 text-[11px]">Consultez la liste exhaustive des fonctionnalités activées sur la plateforme Sogesti GRC :</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2.5">
                  <div className="flex items-start space-x-2.5 p-3 bg-slate-900/50 border border-slate-850 rounded-lg">
                    <CheckSquare className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-[11px]">Cartographie Dynamique des Risques</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Création de fiches, historisation des re-évaluations, gestion du workflow et assignations d'entités organisationnelles.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2.5 p-3 bg-slate-900/50 border border-slate-850 rounded-lg">
                    <Layers className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-[11px]">Matrice Heatmap 4x4 / 5x5</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Positionnement automatique des risques sur une grille thermique colorée en temps réel avec filtres multicritères.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 bg-slate-900/50 border border-slate-850 rounded-lg">
                    <ClipboardList className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-[11px]">Missions d'Audit Interne</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Création de missions d'audits, formulation de constats/recommandations de remédiation, assignation de responsables.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start space-x-2.5 p-3 bg-slate-900/50 border border-slate-850 rounded-lg">
                    <Shield className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-[11px]">Périmètres de Conformité Réglementaire</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Création de référentiels de conformité (RGPD, ISO 27001), suivi des obligations et déclaration d'incidents.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 bg-slate-900/50 border border-slate-850 rounded-lg">
                    <Cpu className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-[11px]">Contrôle SuperAdmin Multi-Tenant</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Console d'administration plateforme : licence mensuelle, supervision, logs d'activité complets et sauvegarde portable.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 bg-slate-900/50 border border-slate-850 rounded-lg">
                    <Lock className="w-4 h-4 text-indigo-400 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-white text-[11px]">Sécurité Renforcée & MFA</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">Double validation des actions d'administration destructrices, et simulation d'un module d'authentification double-facteur.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Quick Specs / Architecture / Test Stats */}
        <div className="lg:w-1/4 space-y-5">
          
          {/* Contact & Demo Information */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-500/15 rounded-lg text-[10px] text-indigo-300 leading-normal space-y-2">
            <p className="font-bold text-white text-xs">ℹ️ Mode Démo Client</p>
            <p>
              Cette interface permet à vos futurs clients d'explorer toutes les fonctionnalités en un seul clic sans nécessiter d'inscription préalable.
            </p>
            <p className="text-slate-400 text-[9px]">
              Toutes les données de test sont stockées en mémoire cache locale de session (localStorage/sessionStorage).
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
