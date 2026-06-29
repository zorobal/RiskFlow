/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Layers, 
  Wrench, 
  Boxes, 
  FolderOpen, 
  ShieldCheck, 
  Users, 
  Workflow, 
  Code, 
  Clock, 
  ArrowRight,
  UserCheck,
  ToggleLeft,
  CheckCircle,
  Activity,
  UserX,
  Database,
  Copy,
  Check,
  CloudLightning,
  RefreshCw,
  AlertCircle,
  Server
} from 'lucide-react';
import { 
  TenantConfig, 
  ScaleItem, 
  RiskCategory, 
  OrgEntity, 
  Fonction, 
  Affectation, 
  Rule, 
  AccessProfile,
  User as GrcUser 
} from '../types';
import { 
  getSupabaseConfig, 
  getSupabaseClient, 
  testSupabaseConnection, 
  pushAllToSupabase, 
  pullAllFromSupabase, 
  getSqlSchema, 
  resetSupabaseClient 
} from '../lib/supabase';

interface ConfigModuleProps {
  tenantConfig: TenantConfig;
  onUpdateTenantConfig: (config: TenantConfig) => void;
  fonctions: Fonction[];
  onUpdateFonctions: (fns: Fonction[]) => void;
  affectations: Affectation[];
  onUpdateAffectations: (affs: Affectation[]) => void;
  rules: Rule[];
  onUpdateRules: (rls: Rule[]) => void;
  accessProfiles: AccessProfile[];
  onUpdateAccessProfiles: (aps: AccessProfile[]) => void;
  users: GrcUser[];
  onAddLog: (action: string, details: string) => void;
  
  // Extended props for Supabase synchronization
  tenants?: TenantConfig[];
  onUpdateTenants?: React.Dispatch<React.SetStateAction<TenantConfig[]>>;
  risks?: any[];
  onUpdateRisks?: React.Dispatch<React.SetStateAction<any[]>>;
  actions?: any[];
  onUpdateActions?: React.Dispatch<React.SetStateAction<any[]>>;
  auditLogs?: any[];
  onUpdateAuditLogs?: React.Dispatch<React.SetStateAction<any[]>>;
  onUpdateUsers?: React.Dispatch<React.SetStateAction<GrcUser[]>>;
  auditMissions?: any[];
  onUpdateAuditMissions?: React.Dispatch<React.SetStateAction<any[]>>;
  auditFindings?: any[];
  onUpdateAuditFindings?: React.Dispatch<React.SetStateAction<any[]>>;
  complianceFrameworks?: any[];
  onUpdateComplianceFrameworks?: React.Dispatch<React.SetStateAction<any[]>>;
  complianceObligations?: any[];
  onUpdateComplianceObligations?: React.Dispatch<React.SetStateAction<any[]>>;
  complianceIncidents?: any[];
  onUpdateComplianceIncidents?: React.Dispatch<React.SetStateAction<any[]>>;
  entreprises?: any[];
  onUpdateEntreprises?: React.Dispatch<React.SetStateAction<any[]>>;
  licences?: any[];
  onUpdateLicences?: React.Dispatch<React.SetStateAction<any[]>>;
  historiqueLicences?: any[];
  onUpdateHistoriqueLicences?: React.Dispatch<React.SetStateAction<any[]>>;
}

export default function ConfigModule({
  tenantConfig,
  onUpdateTenantConfig,
  fonctions,
  onUpdateFonctions,
  affectations,
  onUpdateAffectations,
  rules,
  onUpdateRules,
  accessProfiles,
  onUpdateAccessProfiles,
  users,
  onAddLog,
  
  tenants,
  onUpdateTenants,
  risks,
  onUpdateRisks,
  actions,
  onUpdateActions,
  auditLogs,
  onUpdateAuditLogs,
  onUpdateUsers,
  auditMissions,
  onUpdateAuditMissions,
  auditFindings,
  onUpdateAuditFindings,
  complianceFrameworks,
  onUpdateComplianceFrameworks,
  complianceObligations,
  onUpdateComplianceObligations,
  complianceIncidents,
  onUpdateComplianceIncidents,
  entreprises,
  onUpdateEntreprises,
  licences,
  onUpdateLicences,
  historiqueLicences,
  onUpdateHistoriqueLicences
}: ConfigModuleProps) {
  // Config Modules Sub-tab switcher
  const [activeTab, setActiveTab] = useState<'org' | 'functions' | 'rules' | 'scales' | 'formula' | 'categories' | 'workflow' | 'rights' | 'supabase'>('org');

  // Supabase Integration States
  const [dbUrl, setDbUrl] = useState(() => localStorage.getItem('supabase_url_override') || '');
  const [dbKey, setDbKey] = useState(() => localStorage.getItem('supabase_key_override') || '');
  const [connStatus, setConnStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [connMessage, setConnMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'pushing' | 'pulling'>('idle');
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [copiedSql, setCopiedSql] = useState(false);
  const [autoSync, setAutoSync] = useState(() => localStorage.getItem('supabase_auto_sync') === 'true');

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config.url && config.key) {
      testSupabaseConnection(config.url, config.key).then(res => {
        if (res.success) {
          setConnStatus('success');
          setConnMessage('Supabase connecté ! ' + (config.isOverridden ? '(Surcharges manuelles)' : '(Variables d\'environnement Vercel)'));
        } else {
          setConnStatus('error');
          setConnMessage(res.message);
        }
      });
    }
  }, []);

  // Org Node Inputs
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgType, setNewOrgType] = useState<OrgEntity['type']>('Département');
  const [newOrgParent, setNewOrgParent] = useState('');
  const [newOrgCode, setNewOrgCode] = useState('');
  const [newOrgSecondary, setNewOrgSecondary] = useState<string>(''); // For matriciel

  // Function & Assignment Inputs
  const [newFTitle, setNewFTitle] = useState('');
  const [newFEntity, setNewFEntity] = useState(tenantConfig.entities[0]?.id || '');
  const [newFProfile, setNewFProfile] = useState(accessProfiles[0]?.id || 'ap3');

  const [assignUser, setAssignUser] = useState(users[0]?.id || '');
  const [assignFunction, setAssignFunction] = useState(fonctions[0]?.id || '');
  const [assignDateDebut, setAssignDateDebut] = useState('2026-06-29');

  // Rules Engine Builder Inputs
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleType, setNewRuleType] = useState<Rule['typeRegle']>('Workflow');
  const [newRuleTarget, setNewRuleTarget] = useState<Rule['objetCible']>('Risque');
  const [newRuleCondField, setNewRuleCondField] = useState('scoreBrut');
  const [newRuleCondOp, setNewRuleCondOp] = useState('>=');
  const [newRuleCondVal, setNewRuleCondVal] = useState('12');
  const [newRuleActType, setNewRuleActType] = useState<Rule['action']['type']>('ESCALADE_VALIDATION');
  const [newRuleActLevel, setNewRuleActLevel] = useState('Comite_Audit');
  const [newRuleActNotifier, setNewRuleActNotifier] = useState<string>('f_cro');

  // Scales Sub-tab toggle
  const [activeScaleType, setActiveScaleType] = useState<'freq' | 'imp' | 'ctrl'>('freq');

  // Category Inputs
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#22c55e');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Formula Inputs
  const [selectedFormulaId, setSelectedFormulaId] = useState(tenantConfig.formula.id);
  const [matrixSize, setMatrixSize] = useState(tenantConfig.matrixSize);

  // --- Org Nodes Add & Remove ---
  const handleAddOrgNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) return;

    const codeShort = newOrgCode.trim() || newOrgName.toUpperCase().substring(0, 5).replace(/ /g, '-');
    const newNode: OrgEntity = {
      id: `e_${Date.now()}`,
      name: newOrgName,
      type: newOrgType,
      parentId: newOrgParent || undefined,
      code: codeShort,
      statut: 'Actif',
      rattachementsSecondaires: newOrgSecondary ? [newOrgSecondary] : []
    };

    onUpdateTenantConfig({
      ...tenantConfig,
      entities: [...tenantConfig.entities, newNode]
    });

    onAddLog('Config Structure', `Ajout de l'unité organisationnelle "${newOrgName}" [Code: ${codeShort}, Type: ${newOrgType}]`);
    setNewOrgName('');
    setNewOrgCode('');
    setNewOrgParent('');
    setNewOrgSecondary('');
  };

  const handleRemoveOrgNode = (id: string) => {
    const hasChildren = tenantConfig.entities.some(e => e.parentId === id);
    if (hasChildren) {
      alert("⚠️ Cette unité possède des sous-composants hiérarchiques. Veuillez d'abord supprimer ou réassigner ces sous-unités.");
      return;
    }

    const updated = {
      ...tenantConfig,
      entities: tenantConfig.entities.map(e => e.id === id ? { ...e, statut: 'Archivé' as const } : e)
    };
    onUpdateTenantConfig(updated);
    onAddLog('Config Structure', `Archivage / Soft Delete de l'unité organisationnelle [ID: ${id}]`);
  };

  // --- Functions & Assignments ---
  const handleAddFunction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFTitle.trim()) return;

    const newFn: Fonction = {
      id: `fn_${Date.now()}`,
      libelle: newFTitle,
      entityId: newFEntity,
      habilitationProfileId: newFProfile
    };

    onUpdateFonctions([...fonctions, newFn]);
    onAddLog('Config Fonctions', `Création de la fonction métier "${newFTitle}"`);
    setNewFTitle('');
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUser || !assignFunction) return;

    // Check if there is already an active assignment for this function
    const existingActive = affectations.find(a => a.fonctionId === assignFunction && a.statut === 'Actif');
    let updatedAffectations = [...affectations];
    
    if (existingActive) {
      // Soft end existing one to maintain history
      updatedAffectations = updatedAffectations.map(a => 
        a.id === existingActive.id 
          ? { ...a, statut: 'Historique' as const, dateFin: assignDateDebut } 
          : a
      );
    }

    const newAff: Affectation = {
      id: `aff_${Date.now()}`,
      userId: assignUser,
      fonctionId: assignFunction,
      dateDebut: assignDateDebut,
      statut: 'Actif'
    };

    onUpdateAffectations([...updatedAffectations, newAff]);
    
    const userName = users.find(u => u.id === assignUser)?.name || 'Inconnu';
    const functionLabel = fonctions.find(f => f.id === assignFunction)?.libelle || 'Fonction';
    onAddLog('Config Habilitations', `Affectation de ${userName} à la fonction "${functionLabel}"`);
  };

  const handleRemoveAssignment = (id: string) => {
    const updated = affectations.map(a => 
      a.id === id ? { ...a, statut: 'Historique' as const, dateFin: new Date().toISOString().split('T')[0] } : a
    );
    onUpdateAffectations(updated);
  };

  // --- Rules Engine ---
  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleTitle.trim()) return;

    const parsedValue = isNaN(Number(newRuleCondVal)) ? newRuleCondVal : Number(newRuleCondVal);

    const newRule: Rule = {
      id: `r_rule_${Date.now()}`,
      libelle: newRuleTitle,
      typeRegle: newRuleType,
      objetCible: newRuleTarget,
      condition: {
        operateur: 'ET',
        regles: [
          { champ: newRuleCondField, operateur: newRuleCondOp, valeur: parsedValue }
        ]
      },
      action: {
        type: newRuleActType,
        parametres: {
          niveau_requis: newRuleActLevel,
          delai_jours: 15,
          notifier: [newRuleActNotifier]
        }
      },
      priorite: rules.length + 1,
      statut: 'Active'
    };

    onUpdateRules([...rules, newRule]);
    onAddLog('Moteur Règles', `Création d'une règle de gestion "${newRuleTitle}"`);
    setNewRuleTitle('');
  };

  const handleRemoveRule = (id: string) => {
    onUpdateRules(rules.filter(r => r.id !== id));
  };

  // --- Scales Edit ---
  const handleUpdateScaleLabel = (type: 'freq' | 'imp' | 'ctrl', index: number, field: 'label' | 'description', value: string) => {
    const nextScales = { ...tenantConfig.scales };
    let list: ScaleItem[] = [];

    if (type === 'freq') {
      list = [...nextScales.frequency];
      list[index] = { ...list[index], [field]: value };
      nextScales.frequency = list;
    } else if (type === 'imp') {
      list = [...nextScales.impact];
      list[index] = { ...list[index], [field]: value };
      nextScales.impact = list;
    } else {
      list = [...nextScales.control];
      list[index] = { ...list[index], [field]: value };
      nextScales.control = list;
    }

    onUpdateTenantConfig({
      ...tenantConfig,
      scales: nextScales
    });
  };

  // --- Category Management ---
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const newCat: RiskCategory = {
      id: `cat_${Date.now()}`,
      name: newCatName,
      color: newCatColor,
      description: newCatDesc
    };

    onUpdateTenantConfig({
      ...tenantConfig,
      categories: [...tenantConfig.categories, newCat]
    });
    
    setNewCatName('');
    setNewCatDesc('');
    onAddLog('Config Catégories', `Ajout de la catégorie de risque "${newCatName}"`);
  };

  const handleRemoveCategory = (id: string) => {
    onUpdateTenantConfig({
      ...tenantConfig,
      categories: tenantConfig.categories.filter(c => c.id !== id)
    });
  };

  // --- Formulas Configuration ---
  const handleFormulaUpdate = (formId: string) => {
    setSelectedFormulaId(formId);
    let expression = 'P * I * M';
    let label = 'Formule IFACI Standard';
    let variables = [
      { name: 'P', label: 'Probabilité/Fréquence', min: 1, max: 4 },
      { name: 'I', label: 'Impact', min: 1, max: 4 },
      { name: 'M', label: 'Maîtrise/Contrôle', min: 1, max: 4 },
    ];
    let description = 'Calcul par produit simple du score brut (P x I) puis risque net (Brut x Maîtrise). Échelle de 1 à 64.';

    if (formId === 'f2') {
      expression = '(P * I) - M';
      label = 'Formule Aéronautique P * I - M';
      variables = [
        { name: 'P', label: 'Probabilité/Fréquence', min: 1, max: 5 },
        { name: 'I', label: 'Impact', min: 1, max: 5 },
        { name: 'M', label: 'Maîtrise/Contrôle', min: 1, max: 5 },
      ];
      description = 'Score Brut = P x I (max 25). Score Net = (P x I) - M (échelle de 0 à 24 pour intégrer la mitigation soustractive).';
    }

    onUpdateTenantConfig({
      ...tenantConfig,
      formula: { id: formId, name: label, expression, variables, description }
    });
    onAddLog('Config Moteur', `Modification de la formule de calcul vers : ${label}`);
  };

  const handleMatrixSizeUpdate = (newSize: number) => {
    setMatrixSize(newSize);
    onUpdateTenantConfig({
      ...tenantConfig,
      matrixSize: newSize
    });
  };

  // Indented helper to display nested structure
  const renderIndentedOrg = (parentId: string | undefined, depth: number = 0): React.ReactNode => {
    const children = tenantConfig.entities.filter(e => e.parentId === parentId && e.statut !== 'Archivé');
    if (children.length === 0) return null;

    return (
      <div className={`space-y-1.5 ${depth > 0 ? 'pl-4 border-l border-indigo-100 mt-1' : ''}`}>
        {children.map(node => (
          <div key={node.id} className="space-y-1">
            <div className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-indigo-50/20 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold bg-indigo-150 text-indigo-750 px-1.5 py-0.5 rounded">
                  {node.code}
                </span>
                <span className="font-bold text-slate-800 text-[11px]">{node.name}</span>
                <span className="text-[8.5px] text-slate-400 capitalize bg-white border px-1 rounded">
                  {node.type}
                </span>
                {node.rattachementsSecondaires && node.rattachementsSecondaires.length > 0 && (
                  <span className="text-[8px] bg-amber-50 text-amber-700 font-semibold px-1 py-0.2 rounded border border-amber-200">
                    🔗 Matriciel: {tenantConfig.entities.find(e => e.id === node.rattachementsSecondaires?.[0])?.code || 'Secondaire'}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleRemoveOrgNode(node.id)}
                className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 cursor-pointer"
                title="Supprimer / Archiver"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {renderIndentedOrg(node.id, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  // Supabase connection and sync helpers
  const handleCopySql = () => {
    navigator.clipboard.writeText(getSqlSchema());
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestConnection = async () => {
    if (!dbUrl || !dbKey) {
      setConnStatus('error');
      setConnMessage('Veuillez spécifier l\'URL Supabase et la clé d\'API Anon.');
      return;
    }
    setConnStatus('loading');
    setConnMessage('Test de la connexion en cours...');
    try {
      const result = await testSupabaseConnection(dbUrl, dbKey);
      if (result.success) {
        setConnStatus('success');
        localStorage.setItem('supabase_url_override', dbUrl);
        localStorage.setItem('supabase_key_override', dbKey);
        resetSupabaseClient();
        onAddLog('Intégration Cloud', 'Connexion réussie à la base de données Supabase.');
      } else {
        setConnStatus('error');
      }
      setConnMessage(result.message);
    } catch (e: any) {
      setConnStatus('error');
      setConnMessage(`Erreur : ${e?.message || 'Identifiants invalides'}`);
    }
  };

  const handleClearConfig = () => {
    localStorage.removeItem('supabase_url_override');
    localStorage.removeItem('supabase_key_override');
    setDbUrl('');
    setDbKey('');
    setConnStatus('idle');
    setConnMessage('Configuration réinitialisée. Les variables d\'environnement système seront privilégiées.');
    resetSupabaseClient();
    onAddLog('Intégration Cloud', 'Réinitialisation des configurations d\'accès à la base de données');
  };

  const handlePushData = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('Erreur : Aucun client Supabase connecté. Veuillez configurer les accès.');
      return;
    }
    setSyncStatus('pushing');
    setSyncLogs(['Début du transfert des tables...', 'Lecture des données locales...']);

    const dataset = {
      tenants: tenants || [tenantConfig],
      users: users || [],
      risks: risks || [],
      actions: actions || [],
      auditLogs: auditLogs || [],
      fonctions: fonctions || [],
      affectations: affectations || [],
      rules: rules || [],
      accessProfiles: accessProfiles || [],
      auditMissions: auditMissions || [],
      auditFindings: auditFindings || [],
      complianceFrameworks: complianceFrameworks || [],
      complianceObligations: complianceObligations || [],
      complianceIncidents: complianceIncidents || [],
      entreprises: entreprises || [],
      licences: licences || [],
      historiqueLicences: historiqueLicences || [],
    };

    try {
      const res = await pushAllToSupabase(client, dataset);
      if (res.success) {
        setSyncLogs(prev => [...prev, '✓ Données synchronisées avec succès sur Supabase (17 tables) !']);
        onAddLog('Supabase Push', 'Transfert complet des données locales vers Supabase');
      } else {
        setSyncLogs(prev => [...prev, '⚠ Des erreurs ont été détectées :', ...res.messages]);
      }
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `Erreur critique : ${err?.message || err}`]);
    } finally {
      setSyncStatus('idle');
    }
  };

  const handlePullData = async () => {
    const client = getSupabaseClient();
    if (!client) {
      alert('Erreur : Aucun client Supabase connecté. Veuillez configurer les accès.');
      return;
    }
    setSyncStatus('pulling');
    setSyncLogs(['Début de la récupération des données...', 'Interrogation des tables cloud...']);

    try {
      const res = await pullAllFromSupabase(client);
      if (res.success && res.data) {
        const d = res.data;
        if (onUpdateTenants && d.tenants && d.tenants.length > 0) onUpdateTenants(d.tenants);
        if (onUpdateUsers && d.users && d.users.length > 0) onUpdateUsers(d.users);
        if (onUpdateRisks && d.risks && d.risks.length > 0) onUpdateRisks(d.risks);
        if (onUpdateActions && d.actions && d.actions.length > 0) onUpdateActions(d.actions);
        if (onUpdateAuditLogs && d.auditLogs && d.auditLogs.length > 0) onUpdateAuditLogs(d.auditLogs);
        if (onUpdateFonctions && d.fonctions && d.fonctions.length > 0) onUpdateFonctions(d.fonctions);
        if (onUpdateAffectations && d.affectations && d.affectations.length > 0) onUpdateAffectations(d.affectations);
        if (onUpdateRules && d.rules && d.rules.length > 0) onUpdateRules(d.rules);
        if (onUpdateAccessProfiles && d.accessProfiles && d.accessProfiles.length > 0) onUpdateAccessProfiles(d.accessProfiles);
        if (onUpdateAuditMissions && d.auditMissions && d.auditMissions.length > 0) onUpdateAuditMissions(d.auditMissions);
        if (onUpdateAuditFindings && d.auditFindings && d.auditFindings.length > 0) onUpdateAuditFindings(d.auditFindings);
        if (onUpdateComplianceFrameworks && d.complianceFrameworks && d.complianceFrameworks.length > 0) onUpdateComplianceFrameworks(d.complianceFrameworks);
        if (onUpdateComplianceObligations && d.complianceObligations && d.complianceObligations.length > 0) onUpdateComplianceObligations(d.complianceObligations);
        if (onUpdateComplianceIncidents && d.complianceIncidents && d.complianceIncidents.length > 0) onUpdateComplianceIncidents(d.complianceIncidents);
        if (onUpdateEntreprises && d.entreprises && d.entreprises.length > 0) onUpdateEntreprises(d.entreprises);
        if (onUpdateLicences && d.licences && d.licences.length > 0) onUpdateLicences(d.licences);
        if (onUpdateHistoriqueLicences && d.historiqueLicences && d.historiqueLicences.length > 0) onUpdateHistoriqueLicences(d.historiqueLicences);

        setSyncLogs(prev => [...prev, '✓ Récupération cloud réussie ! L\'ERP local a été mis à jour.']);
        onAddLog('Supabase Pull', 'Synchronisation locale des données depuis Supabase');
      } else {
        setSyncLogs(prev => [...prev, `⚠ Échec : ${res.message}`]);
      }
    } catch (err: any) {
      setSyncLogs(prev => [...prev, `Erreur : ${err?.message || err}`]);
    } finally {
      setSyncStatus('idle');
    }
  };

  const handleToggleAutoSync = () => {
    const nextVal = !autoSync;
    setAutoSync(nextVal);
    localStorage.setItem('supabase_auto_sync', String(nextVal));
    onAddLog('Supabase Config', `Auto-Sync ${nextVal ? 'activé' : 'désactivé'}`);
  };

  return (
    <div className="flex-grow p-6 bg-slate-50 overflow-y-auto space-y-6 text-slate-800 text-xs select-none">
      
      {/* Title block */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
            Paramétrage de l'ERP GRC (No-Code Configurable Engine)
          </h2>
          <p className="text-slate-500 text-[11px]">
            Configurez l'organigramme matriciel, le moteur de règles de gestion, l'affectation des personnes aux rôles d'audit, et les échelles de cotation pour <span className="font-bold text-indigo-650">{tenantConfig.companyName}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COMPONENT: CONFIG MODULES TAB SELECTOR */}
        <div className="lg:col-span-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <div className="px-3 py-1 font-bold text-slate-400 text-[9px] uppercase tracking-wider">
            1. Organigramme & Rôles
          </div>
          <button
            onClick={() => setActiveTab('org')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'org' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Organigramme Arborescent</span>
          </button>
          
          <button
            onClick={() => setActiveTab('functions')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'functions' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Fonctions & Affectations</span>
          </button>

          <div className="px-3 py-1 font-bold text-slate-400 text-[9px] uppercase tracking-wider pt-3">
            2. Moteur de Règles & Workflows
          </div>
          <button
            onClick={() => setActiveTab('rules')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'rules' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Code className="w-4 h-4 text-indigo-600" />
            <span>Moteur de Règles No-Code</span>
          </button>

          <button
            onClick={() => setActiveTab('workflow')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'workflow' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Workflow className="w-4 h-4 text-indigo-600" />
            <span>Workflow de Validation</span>
          </button>

          <div className="px-3 py-1 font-bold text-slate-400 text-[9px] uppercase tracking-wider pt-3">
            3. Paramètres de Notation & Cotation
          </div>
          <button
            onClick={() => setActiveTab('scales')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'scales' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Wrench className="w-4 h-4 text-indigo-600" />
            <span>Échelles de Cotation</span>
          </button>

          <button
            onClick={() => setActiveTab('formula')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'formula' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Boxes className="w-4 h-4 text-indigo-600" />
            <span>Formule de Calcul GRC</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left ${
              activeTab === 'categories' ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <FolderOpen className="w-4 h-4 text-indigo-600" />
            <span>Catégories de Risques</span>
          </button>

          <div className="px-3 py-1 font-bold text-slate-400 text-[9px] uppercase tracking-wider pt-3 border-t border-slate-100">
            4. Base de données Cloud
          </div>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`w-full flex items-center space-x-2 px-3 py-2.5 rounded font-bold transition text-left cursor-pointer ${
              activeTab === 'supabase' 
                ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                : 'hover:bg-slate-50 text-slate-600'
            }`}
          >
            <Database className="w-4 h-4 text-amber-600" />
            <span>Intégration Supabase</span>
          </button>
        </div>

        {/* RIGHT PANEL: DISPLAY ACTIVE CONFIGURATION VIEWS */}
        <div className="lg:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[440px]">
          
          {/* TAB: ORGANIGRAMME */}
          {activeTab === 'org' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Organigramme Hiérarchique & Matriciel (Section 2.1)</h3>
                  <p className="text-slate-400 text-[10.5px]">Configurez la structure arborescente de votre organisation avec gestion des rattachements fonctionnels multiples.</p>
                </div>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddOrgNode} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="space-y-1 sm:col-span-3">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Libellé Unité</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex. Direction Financière..."
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Code Court</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex. DAF-GRP..."
                    value={newOrgCode}
                    onChange={(e) => setNewOrgCode(e.target.value)}
                    className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs font-mono font-bold text-indigo-700"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Type Unité</label>
                  <select
                    value={newOrgType}
                    onChange={(e) => setNewOrgType(e.target.value as any)}
                    className="w-full bg-white border border-slate-250 rounded p-1.5 text-slate-700"
                  >
                    <option value="Direction">👨‍💼 Direction</option>
                    <option value="Département">📁 Département</option>
                    <option value="Service">🔧 Service</option>
                    <option value="Site">📍 Site Local</option>
                    <option value="Filiale">🏢 Filiale</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Unité Parente</label>
                  <select
                    value={newOrgParent}
                    onChange={(e) => setNewOrgParent(e.target.value)}
                    className="w-full bg-white border border-slate-255 rounded p-1.5 text-slate-600"
                  >
                    <option value="">-- Racine (Groupe) --</option>
                    {tenantConfig.entities.filter(e => e.statut !== 'Archivé').map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] text-slate-400 font-bold uppercase">Rattachement Matriciel</label>
                  <select
                    value={newOrgSecondary}
                    onChange={(e) => setNewOrgSecondary(e.target.value)}
                    className="w-full bg-white border border-slate-255 rounded p-1.5 text-slate-600"
                  >
                    <option value="">Aucun (Hiérarchique simple)</option>
                    {tenantConfig.entities.filter(e => e.statut !== 'Archivé').map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="py-1.8 sm:col-span-1 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 cursor-pointer text-center text-xs"
                >
                  +
                </button>
              </form>

              {/* Visual Hierarchy */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-slate-800 uppercase text-xs">Aperçu Arborescent du Périmètre :</h4>
                <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/30 max-h-96 overflow-y-auto">
                  {/* Render root level entities */}
                  {renderIndentedOrg(undefined)}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FUNCTIONS & ASSIGNMENTS */}
          {activeTab === 'functions' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">Séparation Personne / Fonction / Unité (Section 2.1.4)</h3>
                <p className="text-slate-400 text-[10.5px]">Une fonction est rattachée à une unité structurelle. Une personne physique (Utilisateur) y est affectée pour une période donnée.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Create Function Block */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-left">
                  <h4 className="font-bold text-slate-850 uppercase text-xs flex items-center gap-1">
                    <Wrench className="w-3.5 h-3.5 text-indigo-600" />
                    1. Déclarer une Nouvelle Fonction
                  </h4>

                  <form onSubmit={handleAddFunction} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Intitulé de la fonction</label>
                      <input 
                        type="text"
                        required
                        placeholder="Ex. Auditeur Interne local, CRO Filiale..."
                        value={newFTitle}
                        onChange={(e) => setNewFTitle(e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Rattaché à l'unité</label>
                      <select
                        value={newFEntity}
                        onChange={(e) => setNewFEntity(e.target.value)}
                        className="w-full bg-white border border-slate-255 rounded p-1.5 text-slate-650"
                      >
                        {tenantConfig.entities.filter(e => e.statut !== 'Archivé').map(e => (
                          <option key={e.id} value={e.id}>{e.name} ({e.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Profil de droits (RBAC)</label>
                      <select
                        value={newFProfile}
                        onChange={(e) => setNewFProfile(e.target.value)}
                        className="w-full bg-white border border-slate-255 rounded p-1.5 text-slate-650"
                      >
                        {accessProfiles.map(p => (
                          <option key={p.id} value={p.id}>{p.libelle} ({p.portee})</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.8 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded shadow cursor-pointer text-center text-xs"
                    >
                      Enregistrer la Fonction
                    </button>
                  </form>
                </div>

                {/* Affect User to Function Block */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-left">
                  <h4 className="font-bold text-slate-850 uppercase text-xs flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                    2. Affecter une Personne à une Fonction
                  </h4>

                  <form onSubmit={handleAddAssignment} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Personne physique (Collaborateur)</label>
                      <select
                        value={assignUser}
                        onChange={(e) => setAssignUser(e.target.value)}
                        className="w-full bg-white border border-slate-255 rounded p-1.5 text-slate-650"
                      >
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Fonction occupée</label>
                      <select
                        value={assignFunction}
                        onChange={(e) => setAssignFunction(e.target.value)}
                        className="w-full bg-white border border-slate-255 rounded p-1.5 text-slate-650"
                      >
                        {fonctions.map(f => {
                          const entityCode = tenantConfig.entities.find(e => e.id === f.entityId)?.code || 'GRP';
                          return (
                            <option key={f.id} value={f.id}>{f.libelle} [Unité: {entityCode}]</option>
                          );
                        })}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-bold uppercase">Date de prise de poste (Début)</label>
                      <input 
                        type="date"
                        required
                        value={assignDateDebut}
                        onChange={(e) => setAssignDateDebut(e.target.value)}
                        className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs font-semibold text-slate-800"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-1.8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow cursor-pointer text-center text-xs"
                    >
                      Activer l'affectation nominative
                    </button>
                  </form>
                </div>

              </div>

              {/* Current Active & Historical Roles list */}
              <div className="space-y-3 pt-3 border-t">
                <h4 className="font-extrabold text-slate-800 uppercase text-xs">Suivi des Titulaires de Rôles et Historique des Nominations :</h4>
                <div className="border border-slate-150 rounded-xl overflow-hidden bg-white">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[9px] text-slate-400 uppercase font-bold tracking-wider border-b">
                        <th className="py-2 px-3">Collaborateur</th>
                        <th className="py-2 px-3">Fonction administrative</th>
                        <th className="py-2 px-3">Unité Rattachée</th>
                        <th className="py-2 px-3">Période d'affectation</th>
                        <th className="py-2 px-3 text-center">Statut du Titre</th>
                        <th className="py-2 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-[10.5px]">
                      {affectations.map(aff => {
                        const colName = users.find(u => u.id === aff.userId)?.name || 'Collaborateur';
                        const fnObj = fonctions.find(f => f.id === aff.fonctionId);
                        const fnLabel = fnObj?.libelle || 'Fonction';
                        const unitObj = fnObj ? tenantConfig.entities.find(e => e.id === fnObj.entityId) : null;
                        return (
                          <tr key={aff.id} className="hover:bg-slate-50/50">
                            <td className="py-2 px-3 font-semibold text-slate-800">{colName}</td>
                            <td className="py-2 px-3 text-indigo-700 font-medium">{fnLabel}</td>
                            <td className="py-2 px-3 font-bold font-mono">{unitObj ? unitObj.code : 'GRP'}</td>
                            <td className="py-2 px-3 font-mono text-slate-500">
                              Du {aff.dateDebut} {aff.dateFin ? `au ${aff.dateFin}` : 'à ce jour'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                aff.statut === 'Actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                              }`}>
                                {aff.statut}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {aff.statut === 'Actif' && (
                                <button
                                  onClick={() => handleRemoveAssignment(aff.id)}
                                  className="p-1 hover:bg-rose-50 rounded text-rose-500 cursor-pointer"
                                  title="Clôturer la fonction (Libérer)"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: RULES ENGINE */}
          {activeTab === 'rules' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Moteur de Règles de Gestion No-Code (Section 2.2)</h3>
                  <p className="text-slate-400 text-[10.5px]">Configurez des règles conditionnelles interactives (Calcul, Seuil, Escalades). Les règles sont lues en tâche de fond et exécutées.</p>
                </div>
              </div>

              {/* Rules creator */}
              <form onSubmit={handleAddRule} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-indigo-700 text-xs uppercase">Constructeur Visuel de Logique "Si ... Alors"</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="space-y-1 sm:col-span-4">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Libellé de la règle métier</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex. Escalade automatique si budget critique..."
                      value={newRuleTitle}
                      onChange={(e) => setNewRuleTitle(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Type Règle</label>
                    <select
                      value={newRuleType}
                      onChange={(e) => setNewRuleType(e.target.value as any)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-700"
                    >
                      <option value="Workflow">Workflow</option>
                      <option value="Seuil">Seuil d'alerte</option>
                      <option value="Calcul">Calcul / Score</option>
                      <option value="Accès">Droits / Accès</option>
                      <option value="Reporting">Reporting</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Objet Pivot</label>
                    <select
                      value={newRuleTarget}
                      onChange={(e) => setNewRuleTarget(e.target.value as any)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-700"
                    >
                      <option value="Risque">Risque</option>
                      <option value="Plan d'action">Plan d'action</option>
                      <option value="Audit">Audit</option>
                      <option value="Conformité">Conformité</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Condition Champ</label>
                    <select
                      value={newRuleCondField}
                      onChange={(e) => setNewRuleCondField(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-750"
                    >
                      <option value="scoreBrut">Score Brut (P x I)</option>
                      <option value="scoreResiduel">Score Résiduel</option>
                      <option value="categoryId">Id Catégorie</option>
                      <option value="impactValue">Gravité</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Opérateur</label>
                    <select
                      value={newRuleCondOp}
                      onChange={(e) => setNewRuleCondOp(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-750"
                    >
                      <option value=">=">&gt;= (Supérieur)</option>
                      <option value="=">= (Égal)</option>
                      <option value="<=">&lt;= (Inférieur)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Valeur seuil</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex. 12 ou cat_finance..."
                      value={newRuleCondVal}
                      onChange={(e) => setNewRuleCondVal(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs font-mono font-bold text-indigo-700"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Action déclenchée</label>
                    <select
                      value={newRuleActType}
                      onChange={(e) => setNewRuleActType(e.target.value as any)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-700"
                    >
                      <option value="ESCALADE_VALIDATION">ESCALADE_VALIDATION</option>
                      <option value="NOTIFY_ROLE">NOTIFY_ROLE (Notifier Rôle)</option>
                      <option value="BLOCK_ACCESS">BLOCK_ACCESS (Bloquer Accès)</option>
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[9px] text-slate-400 font-bold uppercase">Destinataire / Rôle cible</label>
                    <select
                      value={newRuleActNotifier}
                      onChange={(e) => setNewRuleActNotifier(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded p-1.5 text-xs text-slate-650"
                    >
                      {fonctions.map(f => (
                        <option key={f.id} value={f.libelle}>{f.libelle}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="sm:col-span-3 py-1.8 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded shadow cursor-pointer text-center text-xs"
                  >
                    Activer la Règle Métier
                  </button>
                </div>
              </form>

              {/* Rules list with JSON preview */}
              <div className="space-y-4 pt-2">
                <h4 className="font-extrabold text-slate-800 uppercase text-xs">Registre Actif du Moteur de Règles :</h4>
                <div className="space-y-3.5">
                  {rules.map(rule => (
                    <div key={rule.id} className="p-4 bg-white hover:border-indigo-300 border border-slate-200 rounded-xl shadow-inner grid grid-cols-1 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-7 space-y-2 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] bg-indigo-50 text-indigo-750 px-1.5 py-0.5 rounded font-bold">
                            RULE ID: {rule.id}
                          </span>
                          <span className="text-[8.5px] bg-amber-50 text-amber-800 font-bold px-1 py-0.2 rounded border border-amber-200">
                            Priorité {rule.priorite}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-xs leading-tight">
                          {rule.libelle}
                        </h5>
                        <p className="text-slate-400 text-[9.5px]">
                          Cible d'interprétation : <strong className="text-slate-600">{rule.objetCible}</strong> | Type : <strong className="text-slate-600">{rule.typeRegle}</strong>
                        </p>
                      </div>

                      <div className="lg:col-span-5 text-left bg-slate-850 p-2.5 rounded font-mono text-[10px] text-emerald-400 overflow-x-auto">
                        <span className="text-slate-400 block pb-1 border-b border-slate-700">// Représentation Interne (Section 2.2.2 JSON)</span>
                        <pre className="mt-1">{JSON.stringify({ condition: rule.condition, action: rule.action }, null, 2)}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB: WORKFLOWS */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">Circuits de Validation et Délais d'Escalade (Section 2.2.4)</h3>
                <p className="text-slate-400 text-[10.5px]">Définissez les étapes séquentielles obligatoires pour approuver un risque. Chaque étape est liée à une fonction validatrice.</p>
              </div>

              {/* Workflow diagram/steps visualizer */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-800 uppercase text-xs">Séquence du Workflow GRC :</h4>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                  {tenantConfig.workflowSteps.map((step, index) => (
                    <React.Fragment key={step.id}>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2 relative shadow-sm hover:border-indigo-300 transition">
                        <span className="absolute top-1.5 left-2 bg-indigo-50 text-indigo-600 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded">
                          Étape {step.order}
                        </span>
                        
                        <div className="font-bold text-slate-850 text-xs mt-3">
                          {step.name}
                        </div>

                        <p className="text-slate-400 text-[9px] leading-tight">
                          {step.id === 'w_brouillon' ? 'Initiateur de la fiche' :
                           step.id === 'w_validation' ? 'Responsable d\'Unité d\'assiette' :
                           step.id === 'w_approuve' ? 'CRO / Secrétariat d\'Audit' : 'Revue technique'}
                        </p>

                        <div className="pt-2 border-t text-[9px] text-slate-450 space-y-0.5">
                          <p>Délai max : 15 jours</p>
                          <p className="font-semibold text-rose-600">Timeout : Escalade</p>
                        </div>
                      </div>

                      {index < tenantConfig.workflowSteps.length - 1 && (
                        <div className="hidden sm:flex justify-center shrink-0">
                          <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-left text-indigo-900 leading-relaxed text-[11px]">
                <strong className="block mb-1">📢 Escalades et Notifications de Délai :</strong>
                Conformément au modèle, si le délai de validation est dépassé, le système exécute une escalade automatique vers la direction supérieure ou applique une validation tacite selon le paramétrage de l'étape. Les relances automatiques par courriel sont adressées aux *fonctions* et non aux personnes physiques pour parer à toute absence de titulaire.
              </div>
            </div>
          )}

          {/* TAB: RIGHTS / PROFILES */}
          {activeTab === 'rights' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">Gestionnaire de Profils de Droits (Section 2.2.5)</h3>
                <p className="text-slate-400 text-[10.5px]">Créez des profils de droits d'accès rattachés à l'organigramme (Portée: unité propre, unité + sous-unités, toutes unités, unités spécifiques).</p>
              </div>

              <div className="space-y-4">
                {accessProfiles.map(profile => (
                  <div key={profile.id} className="p-4 bg-white hover:bg-slate-50/50 border border-slate-200 rounded-xl shadow-sm space-y-3 text-left">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <strong className="text-slate-900 text-xs font-black block leading-none">{profile.libelle}</strong>
                        <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded mt-2.5 inline-block">
                          Portée : {profile.portee}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-3.5 pt-2 border-t border-slate-100 text-center">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Lecture</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${profile.droits.lecture ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                          {profile.droits.lecture ? 'ACTIF' : 'BLOQUÉ'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Création</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${profile.droits.creation ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                          {profile.droits.creation ? 'ACTIF' : 'BLOQUÉ'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Modification</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${profile.droits.modification ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                          {profile.droits.modification ? 'ACTIF' : 'BLOQUÉ'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Validation</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${profile.droits.validation ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                          {profile.droits.validation ? 'ACTIF' : 'BLOQUÉ'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Clôture</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${profile.droits.cloture ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                          {profile.droits.cloture ? 'ACTIF' : 'BLOQUÉ'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Exports (PDF/Excel)</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${profile.droits.export ? 'bg-green-100 text-green-800' : 'bg-rose-100 text-rose-800'}`}>
                          {profile.droits.export ? 'ACTIF' : 'BLOQUÉ'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RATING SCALES EDITING */}
          {activeTab === 'scales' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Échelles de Cotation et Description des Seuils</h3>
                  <p className="text-slate-400 text-[10.5px]">Configurez la signification textuelle de chaque niveau de cotation (Variables de probabilité, impact et maîtrise).</p>
                </div>
              </div>

              {/* Variables scale type selector */}
              <div className="flex bg-slate-100 rounded p-0.5 max-w-sm border border-slate-200">
                <button
                  onClick={() => setActiveScaleType('freq')}
                  className={`flex-1 py-1 px-3 text-center rounded text-xs font-bold transition ${activeScaleType === 'freq' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Probabilité / Fréquence (P)
                </button>
                <button
                  onClick={() => setActiveScaleType('imp')}
                  className={`flex-1 py-1 px-3 text-center rounded text-xs font-bold transition ${activeScaleType === 'imp' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Gravité / Impact (I)
                </button>
                <button
                  onClick={() => setActiveScaleType('ctrl')}
                  className={`flex-1 py-1 px-3 text-center rounded text-xs font-bold transition ${activeScaleType === 'ctrl' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Niveau Maîtrise (M)
                </button>
              </div>

              {/* Editing block layout */}
              <div className="space-y-4">
                {activeScaleType === 'freq' && tenantConfig.scales.frequency.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="col-span-1 text-center">
                      <span className="font-bold text-sm font-mono text-indigo-600 bg-white px-2 py-1.5 rounded-full border shadow-inner">
                        {item.value}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={item.label}
                        onChange={(e) => handleUpdateScaleLabel('freq', idx, 'label', e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1 rounded font-bold text-xs" 
                      />
                    </div>
                    <div className="col-span-8">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => handleUpdateScaleLabel('freq', idx, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1 rounded text-slate-500" 
                      />
                    </div>
                  </div>
                ))}

                {activeScaleType === 'imp' && tenantConfig.scales.impact.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="col-span-1 text-center">
                      <span className="font-bold text-sm font-mono text-indigo-600 bg-white px-2 py-1.5 rounded-full border shadow-inner">
                        {item.value}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={item.label}
                        onChange={(e) => handleUpdateScaleLabel('imp', idx, 'label', e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1 rounded font-bold text-xs" 
                      />
                    </div>
                    <div className="col-span-8">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => handleUpdateScaleLabel('imp', idx, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1 rounded text-slate-500" 
                      />
                    </div>
                  </div>
                ))}

                {activeScaleType === 'ctrl' && tenantConfig.scales.control.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    <div className="col-span-1 text-center">
                      <span className="font-bold text-sm font-mono text-indigo-600 bg-white px-2 py-1.5 rounded-full border shadow-inner">
                        {item.value}
                      </span>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        value={item.label}
                        onChange={(e) => handleUpdateScaleLabel('ctrl', idx, 'label', e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1 rounded font-bold text-xs" 
                      />
                    </div>
                    <div className="col-span-8">
                      <input 
                        type="text" 
                        value={item.description}
                        onChange={(e) => handleUpdateScaleLabel('ctrl', idx, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-200 p-1 rounded text-slate-500" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM CALCULATIONS & MATRIX VALUES */}
          {activeTab === 'formula' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">Modèles Mathématiques d'Évaluation (Risk Calculation Engine)</h3>
                <p className="text-slate-400 text-[10.5px]">Choisissez la formule algorithmique que le moteur doit exécuter à la volée pendant la cotation d'un risque.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Formulas presets */}
                <div className="p-4 bg-slate-50 hover:bg-slate-100/65 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-800 font-bold">Standard Multiplicatif IFACI 2013</strong>
                    <input 
                      type="radio" 
                      name="formula-select" 
                      checked={selectedFormulaId === 'f1'}
                      onChange={() => handleFormulaUpdate('f1')}
                      className="accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <code className="block bg-slate-800 text-teal-400 font-mono p-1 px-2 rounded text-xs">
                    Risque résiduel = P x I x M
                  </code>
                  <p className="text-slate-500 text-[10.5px]">
                    Sévérité du risque net basée sur l'action de multiplication cumulative standard. Idéal pour les grands groupes bancaires et industriels complexes.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 hover:bg-slate-100/65 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <strong className="text-slate-800 font-bold">Soustractif de Mitigation AeroTech</strong>
                    <input 
                      type="radio" 
                      name="formula-select" 
                      checked={selectedFormulaId === 'f2'}
                      onChange={() => handleFormulaUpdate('f2')}
                      className="accent-indigo-600 cursor-pointer"
                    />
                  </div>
                  <code className="block bg-slate-800 text-teal-400 font-mono p-1 px-2 rounded text-xs">
                    Risque net = (P x I) - M
                  </code>
                  <p className="text-slate-500 text-[10.5px]">
                    Sévérité du risque net pondérée à la baisse par déduction exacte de l'indice de maturité du contrôle interne. Échelle plus resserrée.
                  </p>
                </div>
              </div>

              {/* Matrix size configurations */}
              <div className="space-y-3 pt-4 border-t border-slate-105">
                <h4 className="font-bold text-slate-800 text-xs">Dimensionnement de la Matrice d'Impact (Heatmap Layout)</h4>
                <div className="flex items-center gap-3">
                  <span className="text-slate-500 font-medium">Taille de grille configurée :</span>
                  <select
                    value={matrixSize}
                    onChange={(e) => handleMatrixSizeUpdate(Number(e.target.value))}
                    className="bg-slate-100 border border-slate-200 text-indigo-600 rounded p-1.5 font-bold text-xs cursor-pointer"
                  >
                    <option value="3">3 x 3 - Simplifiée</option>
                    <option value="4">4 x 4 - Modèle IFACI 2013 standard</option>
                    <option value="5">5 x 5 - Modèle COSO / Aéronautique</option>
                    <option value="10">10 x 10 - Précision Décimale Avancée</option>
                  </select>
                </div>
                <p className="text-slate-400 text-[10px] leading-relaxed">
                  Modifier la taille de la grille redimensionne dynamiquement les coordonnées du module Matrice ainsi que les calculs de cotations du Risque brut.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: RISK CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800">Catégories de Risque Paramétrables</h3>
                <p className="text-slate-400 text-[10.5px]">Améliorez la classification de vos risques en créant des thématiques sur-mesure.</p>
              </div>

              <form onSubmit={handleAddCategory} className="p-4 bg-slate-50 rounded-xl border border-slate-150 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Intitulé de la catégorie</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ex. Risques Climatiques..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full bg-white border border-slate-255 rounded p-1.5 text-xs text-slate-900 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Couleur Thématique</label>
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="color" 
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="w-8 h-8 rounded shrink-0 cursor-pointer border border-slate-200"
                    />
                    <span className="font-mono text-[10px] text-slate-450 uppercase">{newCatColor}</span>
                  </div>
                </div>
                <button
                  type="submit"
                  className="py-2 bg-indigo-600 text-white font-bold rounded shadow hover:bg-indigo-700 text-xs cursor-pointer text-center"
                >
                  Ajouter Thématique
                </button>
              </form>

              {/* Categories list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-80 overflow-y-auto">
                {tenantConfig.categories.map((cat) => (
                  <div 
                    key={cat.id} 
                    className="p-3 bg-white hover:bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat.color }}></span>
                      <div>
                        <strong className="text-slate-800 text-[11px] block leading-none">{cat.name}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-red-50 cursor-pointer"
                      title="Retirer la catégorie"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SUPABASE INTEGRATION */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-600" />
                  Intégration Cloud Supabase (Moteur Relationnel PostgreSQL)
                </h3>
                <p className="text-slate-400 text-[10.5px]">
                  Connectez l'ERP GRC à votre projet Supabase pour stocker durablement et synchroniser en temps réel toutes les tables d'audit, de risques, de contrôles et d'utilisateurs.
                </p>
              </div>

              {/* SECTION 1: CREDENTIALS */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-600" />
                    1. Identifiants de connexion Supabase
                  </h4>
                  {connStatus === 'success' ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      PROJET CONNECTÉ
                    </span>
                  ) : connStatus === 'loading' ? (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                      VÉRIFICATION...
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-500 border border-slate-200 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      NON CONFIGURÉ
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">URL du Projet (API endpoint)</label>
                    <input
                      type="text"
                      placeholder="https://your-project-id.supabase.co"
                      value={dbUrl}
                      onChange={(e) => {
                        setDbUrl(e.target.value);
                        setConnStatus('idle');
                      }}
                      className="w-full bg-white border border-slate-250 rounded p-2 text-xs font-mono text-slate-900 shadow-inner"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Clé d'API publique (anon key)</label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={dbKey}
                      onChange={(e) => {
                        setDbKey(e.target.value);
                        setConnStatus('idle');
                      }}
                      className="w-full bg-white border border-slate-250 rounded p-2 text-xs font-mono text-slate-900 shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    onClick={handleTestConnection}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow transition text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CloudLightning className="w-3.5 h-3.5" />
                    Sauvegarder & Tester la connexion
                  </button>
                  {(dbUrl || dbKey) && (
                    <button
                      onClick={handleClearConfig}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded transition text-xs cursor-pointer"
                    >
                      Réinitialiser par défaut
                    </button>
                  )}
                </div>

                {connMessage && (
                  <div className={`p-3 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
                    connStatus === 'success' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                      : connStatus === 'error'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-indigo-50 border-indigo-150 text-indigo-800'
                  }`}>
                    <div className="mt-0.5 font-bold">● Statut :</div>
                    <div className="flex-1 font-medium">{connMessage}</div>
                  </div>
                )}
              </div>

              {/* SECTION 2: SQL SCHEMA GENERATOR */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                    <Code className="w-4 h-4 text-amber-600" />
                    2. Création des tables PostgreSQL (Supabase SQL Editor)
                  </h4>
                  <button
                    onClick={handleCopySql}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-250 text-indigo-600 font-bold rounded text-[10px] transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier le Script SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-500 text-[10.5px] leading-relaxed">
                  Avant de synchroniser les données, vous devez créer les tables relationnelles nécessaires. Ouvrez l'onglet <strong className="text-indigo-600">SQL Editor</strong> dans votre console Supabase, collez-y le script généré ci-dessous, puis cliquez sur <strong className="text-indigo-600">Run</strong>.
                </p>

                <div className="relative">
                  <pre className="p-4 bg-slate-950 text-slate-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-52 overflow-y-auto border border-slate-950 shadow-inner select-all leading-normal">
                    {getSqlSchema()}
                  </pre>
                </div>
              </div>

              {/* SECTION 3: DATA SYNCHRONIZATION */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-600" />
                  3. Transfert et synchronisation des données (17 tables GRC)
                </h4>
                <p className="text-slate-500 text-[10.5px]">
                  Basculez librement vos données entre votre navigateur local et votre base de données relationnelle Supabase.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Push controls */}
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-3">
                    <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                      Push (Local ➔ Cloud)
                    </h5>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Envoyer et mettre à jour l'intégralité de vos risques, plans d'actions, audits, habilitations et organisations vers votre base de données Supabase.
                    </p>
                    <button
                      onClick={handlePushData}
                      disabled={connStatus !== 'success' || syncStatus !== 'idle'}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded shadow transition text-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      {syncStatus === 'pushing' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <CloudLightning className="w-3.5 h-3.5" />
                          Envoyer toutes les données locales
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pull controls */}
                  <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-3">
                    <h5 className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                      Pull (Cloud ➔ Local)
                    </h5>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Récupérer la totalité des données GRC depuis votre projet Supabase distant et écraser vos données locales dans le navigateur.
                    </p>
                    <button
                      onClick={handlePullData}
                      disabled={connStatus !== 'success' || syncStatus !== 'idle'}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded shadow transition text-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      {syncStatus === 'pulling' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Récupération...
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          Récupérer toutes les données du Cloud
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Auto-Sync Switch */}
                <div className="p-4 bg-amber-50/50 border border-amber-200/50 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-amber-800 text-xs">Mise à jour en temps réel (Auto-Sync)</h5>
                    <p className="text-slate-500 text-[10px]">
                      Lorsque cette option est activée, toutes vos modifications locales (risques, actions, audits) sont instantanément propagées sur Supabase.
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAutoSync}
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out shrink-0 relative focus:outline-none cursor-pointer ${
                      autoSync ? 'bg-amber-600' : 'bg-slate-300'
                    }`}
                  >
                    <span 
                      className={`inline-block w-4 h-4 rounded-full bg-white transform transition-transform duration-200 ease-in-out absolute top-1 left-1 ${
                        autoSync ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Sync Logs */}
                {syncLogs.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Logs de Synchronisation :</div>
                    <div className="p-3 bg-slate-950 text-slate-300 rounded-lg font-mono text-[9px] max-h-36 overflow-y-auto space-y-1 shadow-inner border border-slate-900 leading-normal select-text">
                      {syncLogs.map((log, idx) => (
                        <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400' : log.startsWith('⚠') ? 'text-amber-400' : 'text-slate-350'}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
