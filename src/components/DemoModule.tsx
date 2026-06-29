import React, { useState } from 'react';
import { 
  Sparkles, Server, Database, Shield, ArrowRight, Layers, Settings, 
  Key, RefreshCw, Play, Check, Code, Cpu, Info, Globe, HardDrive, 
  Lock, Eye, AlertCircle, Award, CheckSquare, ClipboardList 
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
      id: 'sc1',
      title: 'Scénario A : Audit de Risques Sogesti S.A.',
      description: 'Découvrez la GRC standard d\'un groupe d\'assurance avec une matrice de criticité 4x4, la formule IFACI originale et des audits internes structurés.',
      persona: users.find(u => u.name.includes('Alain')) || users[0],
      tenantId: 'tenant1',
      isSuperAdmin: false,
      initialModule: 'dashboard',
      badge: 'Matrice 4x4 • Formule IFACI',
      badgeColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    },
    {
      id: 'sc2',
      title: 'Scénario B : Supervision Aéronautique AeroTech',
      description: 'Explorez comment un constructeur aéronautique utilise une formule mitigée soustraite (P * I - M), une échelle 5x5 de haute précision et gère ses incidents.',
      persona: users.find(u => u.role === 'Analyste') || users[3],
      tenantId: 'tenant2',
      isSuperAdmin: false,
      initialModule: 'heatmap',
      badge: 'Matrice 5x5 • Formule Mitigée',
      badgeColor: 'bg-teal-500/15 text-teal-300 border-teal-500/30'
    }
  ];

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
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-500/15">
                <h3 className="text-sm font-bold text-indigo-300 flex items-center mb-1">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Prêt pour un essai en conditions réelles ?
                </h3>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  Choisissez l'un des scénarios clés ci-dessous. En cliquant sur "Démarrer", le système va automatiquement configurer la session, pré-sélectionner l'entreprise correspondante et vous rediriger directement sur la page ciblée.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoScenarios.map((sc) => (
                  <div 
                    key={sc.id}
                    className="flex flex-col justify-between bg-slate-900/60 border border-slate-800 hover:border-indigo-500/30 rounded-lg p-5 transition-all group relative overflow-hidden"
                  >
                    <div>
                      {/* Top ribbon */}
                      <span className={`inline-block text-[9px] font-bold uppercase border px-2 py-0.5 rounded-full ${sc.badgeColor} mb-4`}>
                        {sc.badge}
                      </span>
                      
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                        {sc.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <img 
                          src={sc.persona.avatar} 
                          alt="" 
                          className="w-7 h-7 rounded-full border border-slate-750 object-cover" 
                        />
                        <div className="text-left">
                          <p className="text-[10px] font-bold text-slate-300 leading-none">{sc.persona.name}</p>
                          <p className="text-[8px] text-slate-500">{sc.persona.role}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectScenario(sc.persona, sc.tenantId, sc.isSuperAdmin, sc.initialModule)}
                        className="p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded cursor-pointer transition-colors"
                        title="Lancer le scénario de test"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Demo Tour Guide Box */}
              <div className="bg-slate-900/30 p-5 rounded-lg border border-slate-800/80 mt-4 text-xs space-y-3">
                <h4 className="font-bold text-white flex items-center">
                  <ClipboardList className="w-4 h-4 text-indigo-400 mr-1.5" />
                  Guide de Démonstration à Présenter à Vos Collaborateurs :
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-[11px] pl-1">
                  <li>
                    <span className="font-semibold text-white">Validation du workflow IFACI</span> : Lancez le <span className="text-indigo-300">Scénario A</span>, accédez au module <span className="font-semibold text-slate-200">"Cartographie des Risques"</span>, cliquez sur un risque en statut <span className="bg-yellow-500/10 text-yellow-500 px-1 rounded">Brouillon</span>, re-évaluez sa sévérité et soumettez-le pour validation.
                  </li>
                  <li>
                    <span className="font-semibold text-white">Mitigation aéronautique</span> : Lancez le <span className="text-teal-300">Scénario B</span>, visitez l'onglet <span className="font-semibold text-slate-200">"Matrice de Criticité"</span>, et observez comment la formule soustrait la capacité de contrôle de l'impact brut de manière proportionnelle.
                  </li>
                </ol>
              </div>
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
