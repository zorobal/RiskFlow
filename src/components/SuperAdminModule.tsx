/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CreditCard, 
  Database, 
  Activity, 
  LifeBuoy, 
  Lock, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Download, 
  Upload, 
  ShieldCheck, 
  Search, 
  Filter, 
  Eye, 
  FileText,
  Clock,
  Settings,
  X,
  Smartphone,
  Server,
  CloudLightning,
  Code,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
import { 
  EntrepriseCliente, 
  Licence, 
  HistoriqueLicence, 
  SuperAdminRole, 
  TenantConfig, 
  Risk, 
  ActionPlan, 
  AuditLog, 
  Fonction 
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

interface SuperAdminModuleProps {
  entreprises: EntrepriseCliente[];
  onUpdateEntreprises: React.Dispatch<React.SetStateAction<EntrepriseCliente[]>>;
  licences: Licence[];
  onUpdateLicences: React.Dispatch<React.SetStateAction<Licence[]>>;
  historiqueLicences: HistoriqueLicence[];
  onUpdateHistoriqueLicences: React.Dispatch<React.SetStateAction<HistoriqueLicence[]>>;
  tenants: TenantConfig[];
  onUpdateTenants: React.Dispatch<React.SetStateAction<TenantConfig[]>>;
  risks: Risk[];
  onUpdateRisks: React.Dispatch<React.SetStateAction<Risk[]>>;
  actions: ActionPlan[];
  onUpdateActions: React.Dispatch<React.SetStateAction<ActionPlan[]>>;
  auditLogs: AuditLog[];
  onUpdateAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  fonctions: Fonction[];
  onUpdateFonctions: React.Dispatch<React.SetStateAction<Fonction[]>>;
  users: any[];
  onUpdateUsers: React.Dispatch<React.SetStateAction<any[]>>;
  affectations: any[];
  onUpdateAffectations: React.Dispatch<React.SetStateAction<any[]>>;
  rules: any[];
  onUpdateRules: React.Dispatch<React.SetStateAction<any[]>>;
  accessProfiles: any[];
  onUpdateAccessProfiles: React.Dispatch<React.SetStateAction<any[]>>;
  auditMissions: any[];
  onUpdateAuditMissions: React.Dispatch<React.SetStateAction<any[]>>;
  auditFindings: any[];
  onUpdateAuditFindings: React.Dispatch<React.SetStateAction<any[]>>;
  complianceFrameworks: any[];
  onUpdateComplianceFrameworks: React.Dispatch<React.SetStateAction<any[]>>;
  complianceObligations: any[];
  onUpdateComplianceObligations: React.Dispatch<React.SetStateAction<any[]>>;
  complianceIncidents: any[];
  onUpdateComplianceIncidents: React.Dispatch<React.SetStateAction<any[]>>;
  onAddLog: (action: string, details: string) => void;
  onRestoreTenantData: (tenantId: string, restoredData: any) => void;
}

export default function SuperAdminModule({
  entreprises,
  onUpdateEntreprises,
  licences,
  onUpdateLicences,
  historiqueLicences,
  onUpdateHistoriqueLicences,
  tenants,
  onUpdateTenants,
  risks,
  onUpdateRisks,
  actions,
  onUpdateActions,
  auditLogs,
  onUpdateAuditLogs,
  fonctions,
  onUpdateFonctions,
  users,
  onUpdateUsers,
  affectations,
  onUpdateAffectations,
  rules,
  onUpdateRules,
  accessProfiles,
  onUpdateAccessProfiles,
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
  onAddLog,
  onRestoreTenantData
}: SuperAdminModuleProps) {
  // Navigation tabs in SuperAdmin space
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tenants' | 'licences' | 'users' | 'backups' | 'supervision' | 'support' | 'supabase'>('dashboard');
  
  // SuperAdmin Role State
  const [currentRole, setCurrentRole] = useState<SuperAdminRole>('SuperAdministrateur technique');
  
  // MFA (Multi-Factor Authentication) State for Section 10.5
  const [mfaVerified, setMfaVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('grc_superadmin_mfa') === 'true';
  });
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  
  // System Log trail (separate from functional tenant logs)
  const [systemLogs, setSystemLogs] = useState<{ id: string; timestamp: string; role: string; action: string; details: string; status: 'Succès' | 'Échec' | 'Alerte' }[]>(() => {
    const saved = localStorage.getItem('grc_syslogs19');
    return saved ? JSON.parse(saved) : [
      { id: 'sys1', timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), role: 'SuperAdministrateur technique', action: 'Démarrage système', details: 'Déploiement de la version GRC v1.4.2 complété sur l\'infrastructure cloud.', status: 'Succès' },
      { id: 'sys2', timestamp: new Date(Date.now() - 3600000 * 5).toISOString(), role: 'SuperAdministrateur commercial / contractuel', action: 'Création Entreprise', details: 'Initialisation du tenant Pharmaco Group S.A. en statut Essai.', status: 'Succès' },
      { id: 'sys3', timestamp: new Date(Date.now() - 3600000 * 12).toISOString(), role: 'Support niveau 2', action: 'Diagnostic Lecture seule', details: 'Consultation diagnostic pour le ticket support #2819 de Sogesti International S.A.', status: 'Succès' },
    ];
  });

  // Save System Logs
  useEffect(() => {
    localStorage.setItem('grc_syslogs19', JSON.stringify(systemLogs));
  }, [systemLogs]);

  const addSystemLog = (action: string, details: string, status: 'Succès' | 'Échec' | 'Alerte' = 'Succès') => {
    const newLog = {
      id: `sys_${Date.now()}`,
      timestamp: new Date().toISOString(),
      role: currentRole,
      action,
      details,
      status
    };
    setSystemLogs(prev => [newLog, ...prev]);
  };

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
          setConnMessage('Supabase connecté ! ' + (config.isOverridden ? '(Surcharges manuelles)' : '(Variables d\'environnement)'));
        } else {
          setConnStatus('error');
          setConnMessage(res.message);
        }
      });
    }
  }, []);

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
        addSystemLog('Intégration Cloud', 'Connexion réussie à la base de données Supabase.', 'Succès');
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
    addSystemLog('Intégration Cloud', 'Réinitialisation des configurations d\'accès à la base de données', 'Succès');
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
      tenants: tenants || [],
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
        addSystemLog('Supabase Push', 'Transfert complet des données locales vers Supabase', 'Succès');
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
        addSystemLog('Supabase Pull', 'Synchronisation locale des données depuis Supabase', 'Succès');
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
    addSystemLog('Supabase Config', `Auto-Sync ${nextVal ? 'activé' : 'désactivé'}`, 'Succès');
  };

  // Diagnostic Mode states
  const [diagnosticTenantId, setDiagnosticTenantId] = useState<string>('');
  const [diagnosticReason, setDiagnosticReason] = useState('');
  const [diagnosticActive, setDiagnosticActive] = useState(false);
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([]);

  // Modals / forms states
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showEditLicenceModal, setShowEditLicenceModal] = useState(false);
  const [selectedLicence, setSelectedLicence] = useState<Licence | null>(null);
  
  // New Company form
  const [newCompany, setNewCompany] = useState({
    raisonSociale: '',
    secteurActivite: 'Services Financiers',
    regionHebergement: 'Europe (Paris)',
    contactPrincipal: '',
    typeAbonnement: 'Mensuel' as 'Mensuel' | 'Annuel' | 'Sur devis',
    maxUsers: 10,
    modules: ['Cartographie', 'Plans d\'action'] as ('Cartographie' | 'Plans d\'action' | 'Audit' | 'Conformité' | 'Reporting')[]
  });

  // SuperAdmin password update states
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [adminPasswordSuccess, setAdminPasswordSuccess] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState('');

  // Add client user states
  const [newClientUserName, setNewClientUserName] = useState('');
  const [newClientUserEmail, setNewClientUserEmail] = useState('');
  const [newClientUserPassword, setNewClientUserPassword] = useState('');
  const [newClientUserRole, setNewClientUserRole] = useState<'Analyste' | 'Responsable' | 'Risk Manager' | 'Direction'>('Analyste');
  const [newClientUserTenant, setNewClientUserTenant] = useState('tenant1');

  // Edit client user states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingUserName, setEditingUserName] = useState('');
  const [editingUserEmail, setEditingUserEmail] = useState('');
  const [editingUserPassword, setEditingUserPassword] = useState('');
  const [editingUserRole, setEditingUserRole] = useState<'Analyste' | 'Responsable' | 'Risk Manager' | 'Direction' | 'SuperAdmin'>('Analyste');
  const [editingUserTenant, setEditingUserTenant] = useState('tenant1');

  const handleUpdateAdminPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) {
      setAdminPasswordError('Veuillez saisir un mot de passe.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      setAdminPasswordError('Les mots de passe ne correspondent pas.');
      return;
    }

    onUpdateUsers(prev => prev.map(u => {
      if (u.role === 'SuperAdmin') {
        return { ...u, password: newAdminPassword };
      }
      return u;
    }));

    setNewAdminPassword('');
    setConfirmAdminPassword('');
    setAdminPasswordSuccess('Mot de passe SuperAdmin mis à jour avec succès !');
    setAdminPasswordError('');
    addSystemLog('Sécurité', 'Le mot de passe du SuperAdministrateur a été modifié.', 'Succès');
  };

  const handleAddClientUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientUserName || !newClientUserEmail || !newClientUserPassword) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const newUser = {
      id: `u_${Date.now()}`,
      name: newClientUserName,
      email: newClientUserEmail,
      role: newClientUserRole,
      password: newClientUserPassword,
      tenantId: newClientUserTenant,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 900000)}?w=80&fit=crop&q=80`
    };

    onUpdateUsers(prev => [...prev, newUser]);

    setNewClientUserName('');
    setNewClientUserEmail('');
    setNewClientUserPassword('');
    addSystemLog('Habilitation', `Création du compte d'accès client : ${newClientUserName} (${newClientUserRole})`, 'Succès');
    alert(`Compte client créé avec succès pour ${newClientUserName}.`);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserEmail || !editingUserName) {
      alert("Champs obligatoires manquants.");
      return;
    }

    onUpdateUsers(prev => prev.map(u => {
      if (u.id === editingUserId) {
        return {
          ...u,
          name: editingUserName,
          email: editingUserEmail,
          password: editingUserPassword || u.password,
          role: editingUserRole,
          tenantId: editingUserTenant
        };
      }
      return u;
    }));

    addSystemLog('Habilitation', `Modification du compte d'accès client : ${editingUserName}`, 'Succès');
    setEditingUserId(null);
    alert('Modifications enregistrées avec succès.');
  };

  const handleDeleteClientUser = (userId: string, userName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte de ${userName} ?`)) {
      onUpdateUsers(prev => prev.filter(u => u.id !== userId));
      addSystemLog('Habilitation', `Suppression du compte d'accès client : ${userName}`, 'Succès');
    }
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterStatut, setFilterStatut] = useState('All');

  // Double validations
  const [doubleValidationTarget, setDoubleValidationTarget] = useState<{ type: 'delete' | 'restore'; id: string; name?: string } | null>(null);
  const [doubleValidationCode, setDoubleValidationCode] = useState('');

  // Canary deployment simulations (Section 10.3.5)
  const [canaryStatus, setCanaryStatus] = useState<'IDLE' | 'PROGRESS' | 'COMPLETED'>('IDLE');
  const [canaryProgress, setCanaryProgress] = useState(0);

  // Auto save database backup / restore
  const [importText, setImportText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [exportData, setExportData] = useState<string>('');

  // Handle simulated MFA confirmation
  const handleVerifyMfa = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '123456' || mfaCode.trim().length === 6) {
      setMfaVerified(true);
      sessionStorage.setItem('grc_superadmin_mfa', 'true');
      setMfaError('');
      addSystemLog('Connexion MFA', 'Authentification à double facteur validée avec succès.', 'Succès');
    } else {
      setMfaError('Code MFA incorrect. Veuillez utiliser "123456" ou n\'importe quel code à 6 chiffres pour ce prototype.');
      addSystemLog('Connexion MFA', 'Échec de validation du double facteur (code erroné).', 'Échec');
    }
  };

  const handleLogoutMfa = () => {
    setMfaVerified(false);
    sessionStorage.removeItem('grc_superadmin_mfa');
    addSystemLog('Déconnexion', 'Session SuperAdministrateur fermée.', 'Succès');
  };

  // Helper function to check role permission
  const hasPermission = (action: 'INFRA' | 'COMMERCIAL' | 'SUPPORT') => {
    if (currentRole === 'SuperAdministrateur technique') {
      return action === 'INFRA' || action === 'SUPPORT';
    }
    if (currentRole === 'SuperAdministrateur commercial / contractuel') {
      return action === 'COMMERCIAL';
    }
    if (currentRole === 'Support niveau 2') {
      return action === 'SUPPORT';
    }
    return false;
  };

  // 10.3.1 - Lifecycle Management
  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('COMMERCIAL')) {
      alert("Votre sous-rôle actuel ne vous autorise pas à réaliser des opérations commerciales.");
      return;
    }

    const companyId = `tenant_${Date.now()}`;
    const licenceId = `lic_${Date.now()}`;

    const newCompanyObj: EntrepriseCliente = {
      id: companyId,
      raisonSociale: newCompany.raisonSociale,
      secteurActivite: newCompany.secteurActivite,
      dateCreationCompte: new Date().toISOString().split('T')[0],
      statutCompte: 'Essai',
      regionHebergement: newCompany.regionHebergement,
      idContactPrincipal: newCompany.contactPrincipal || 'Administrateur Client'
    };

    const newLicenceObj: Licence = {
      id: licenceId,
      entrepriseId: companyId,
      typeAbonnement: newCompany.typeAbonnement,
      nombreUtilisateursMax: Number(newCompany.maxUsers),
      nombreUtilisateursActuel: 1,
      modulesActives: newCompany.modules as any,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date(Date.now() + 3600000 * 24 * 30).toISOString().split('T')[0], // 30 days trial
      statutLicence: 'En période d\'essai'
    };

    const newHist: HistoriqueLicence = {
      id: `hist_${Date.now()}`,
      licenceId: licenceId,
      typeChangement: 'Création',
      dateChangement: new Date().toISOString().split('T')[0],
      effectuePar: currentRole,
      details: `Création de l'entreprise ${newCompany.raisonSociale} avec offre ${newCompany.typeAbonnement} (${newCompany.maxUsers} max users).`
    };

    onUpdateEntreprises(prev => [...prev, newCompanyObj]);
    onUpdateLicences(prev => [...prev, newLicenceObj]);
    onUpdateHistoriqueLicences(prev => [newHist, ...prev]);

    setShowAddCompanyModal(false);
    addSystemLog('Création Entreprise', `Initialisation réussie de l'entreprise : ${newCompany.raisonSociale}`, 'Succès');
    
    // Reset form
    setNewCompany({
      raisonSociale: '',
      secteurActivite: 'Services Financiers',
      regionHebergement: 'Europe (Paris)',
      contactPrincipal: '',
      typeAbonnement: 'Mensuel',
      maxUsers: 10,
      modules: ['Cartographie', 'Plans d\'action']
    });
  };

  const handleUpdateCompanyStatut = (id: string, newStatus: EntrepriseCliente['statutCompte']) => {
    if (!hasPermission('COMMERCIAL')) {
      alert("Droits commerciaux requis.");
      return;
    }

    onUpdateEntreprises(prev => prev.map(ent => {
      if (ent.id === id) {
        addSystemLog('Modification Statut', `Passage de l'entreprise ${ent.raisonSociale} à l'état [${newStatus}]`, 'Succès');
        
        // Also update associated licence status appropriately
        onUpdateLicences(lics => lics.map(l => {
          if (l.entrepriseId === id) {
            let licStatut: Licence['statutLicence'] = 'Active';
            if (newStatus === 'Suspendu') licStatut = 'Suspendue';
            if (newStatus === 'Résilié') licStatut = 'Expirée';
            if (newStatus === 'Essai') licStatut = 'En période d\'essai';
            
            // Log history
            const newHist: HistoriqueLicence = {
              id: `hist_${Date.now()}`,
              licenceId: l.id,
              typeChangement: newStatus === 'Suspendu' ? 'Suspension' : 'Changement de palier',
              dateChangement: new Date().toISOString().split('T')[0],
              effectuePar: currentRole,
              details: `Statut entreprise modifié vers ${newStatus}. Statut licence aligné sur ${licStatut}.`
            };
            onUpdateHistoriqueLicences(h => [newHist, ...h]);

            return { ...l, statutLicence: licStatut };
          }
          return l;
        }));

        return { ...ent, statutCompte: newStatus };
      }
      return ent;
    }));
  };

  const handleDeleteCompanyRequest = (ent: EntrepriseCliente) => {
    if (!hasPermission('COMMERCIAL')) {
      alert("Droits requis.");
      return;
    }
    setDoubleValidationTarget({ type: 'delete', id: ent.id, name: ent.raisonSociale });
    setDoubleValidationCode('');
  };

  const handleConfirmDeleteCompany = () => {
    if (doubleValidationCode !== 'SUPPRIMER') {
      alert('Veuillez saisir exactement le mot "SUPPRIMER" pour valider l\'opération irréversible.');
      return;
    }

    const companyId = doubleValidationTarget?.id;
    const companyName = doubleValidationTarget?.name;

    if (companyId) {
      onUpdateEntreprises(prev => prev.filter(ent => ent.id !== companyId));
      onUpdateLicences(prev => prev.filter(l => l.entrepriseId !== companyId));
      addSystemLog('Suppression Définitive', `Compte client [${companyName}] et toutes les licences associées ont été purgés.`, 'Succès');
    }

    setDoubleValidationTarget(null);
  };

  // 10.3.2 - Licence Management
  const handleOpenEditLicence = (lic: Licence) => {
    if (!hasPermission('COMMERCIAL')) {
      alert("Privilèges d'administration commerciale requis.");
      return;
    }
    setSelectedLicence(lic);
    setShowEditLicenceModal(true);
  };

  const handleUpdateLicence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLicence || !hasPermission('COMMERCIAL')) return;

    onUpdateLicences(prev => prev.map(l => {
      if (l.id === selectedLicence.id) {
        const company = entreprises.find(c => c.id === l.entrepriseId);
        
        // Log changes in history
        const newHist: HistoriqueLicence = {
          id: `hist_${Date.now()}`,
          licenceId: l.id,
          typeChangement: 'Changement de palier',
          dateChangement: new Date().toISOString().split('T')[0],
          effectuePar: currentRole,
          details: `Licence mise à jour: Max users=${selectedLicence.nombreUtilisateursMax}, Modules=[${selectedLicence.modulesActives.join(', ')}], Offre=${selectedLicence.typeAbonnement}`
        };
        onUpdateHistoriqueLicences(h => [newHist, ...h]);
        addSystemLog('Mise à jour Licence', `Paramètres de licence modifiés pour l'entreprise ${company?.raisonSociale || l.entrepriseId}`, 'Succès');

        return selectedLicence;
      }
      return l;
    }));

    setShowEditLicenceModal(false);
    setSelectedLicence(null);
  };

  // 10.3.4 - Backup / Restore & Portability
  const handleExportData = (companyId: string) => {
    if (!hasPermission('INFRA')) {
      alert("Droits d'administration technique (INFRA) requis pour l'exportation des bases de données.");
      return;
    }

    const company = entreprises.find(c => c.id === companyId);
    
    // Filter data relating to this tenant to construct a genuine SQL/JSON struct dump
    const tenantRisks = risks.filter(r => r.entityId.startsWith(companyId === 'tenant1' ? 'e1' : companyId === 'tenant2' ? 'e1' : 'none')); // approximation based on presets
    const tenantActions = actions.filter(a => tenantRisks.some(r => r.id === a.riskId));
    const tenantAuditLogs = auditLogs.filter(al => al.tenantId === companyId);
    
    const exportDump = {
      version: "GRC_EXPORT_v1.0",
      timestamp: new Date().toISOString(),
      exportedBy: currentRole,
      entreprise: company,
      tenantConfig: tenants.find(t => t.id === companyId),
      data: {
        risks: tenantRisks,
        actions: tenantActions,
        auditLogs: tenantAuditLogs,
      }
    };

    setExportData(JSON.stringify(exportDump, null, 2));
    addSystemLog('Export Données', `Sauvegarde complète à la demande générée avec succès pour l'entreprise : ${company?.raisonSociale}`, 'Succès');
  };

  const handleSimulateRestore = (companyId: string) => {
    if (!hasPermission('INFRA')) {
      alert("Droits d'administration technique (INFRA) requis.");
      return;
    }
    const company = entreprises.find(c => c.id === companyId);
    setDoubleValidationTarget({ type: 'restore', id: companyId, name: company?.raisonSociale });
    setDoubleValidationCode('');
  };

  const handleConfirmRestore = () => {
    if (doubleValidationCode !== 'RESTAURER') {
      alert('Veuillez saisir "RESTAURER" pour confirmer l\'écrasement des données de production.');
      return;
    }

    // Simulate restoring from a backup
    addSystemLog('Restauration Système', `Données du tenant [${doubleValidationTarget?.name}] restaurées à partir du dernier snapshot planifié.`, 'Succès');
    alert(`Les données de production pour l'entreprise "${doubleValidationTarget?.name}" ont été restaurées avec succès.`);
    setDoubleValidationTarget(null);
  };

  // 10.3.5 - Canary Update deployment
  const handleTriggerCanaryUpdate = () => {
    if (!hasPermission('INFRA')) {
      alert("Droits d'administration technique (INFRA) requis.");
      return;
    }

    setCanaryStatus('PROGRESS');
    setCanaryProgress(10);
    addSystemLog('Mise à jour Canary', 'Déploiement progressif du correctif de sécurité GRC-2026-09 au lot d\'entreprises "Essai" initié.', 'Succès');

    const interval = setInterval(() => {
      setCanaryProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setCanaryStatus('COMPLETED');
          addSystemLog('Mise à jour Canary', 'Mise à jour appliquée à 100% sur l\'ensemble des nœuds de la plateforme.', 'Succès');
          return 100;
        }
        return prev + 30;
      });
    }, 800);
  };

  // 10.3.6 - Diagnostic Read-Only Support Mode
  const handleActivateDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasPermission('SUPPORT')) {
      alert("Droits de diagnostic et de support requis.");
      return;
    }

    if (!diagnosticTenantId || !diagnosticReason.trim()) {
      alert("Veuillez sélectionner une entreprise et spécifier le motif du diagnostic.");
      return;
    }

    const company = entreprises.find(c => c.id === diagnosticTenantId);
    
    setDiagnosticActive(true);
    // Simulate diagnostic system loading logs
    setDiagnosticLogs([
      `[${new Date().toLocaleTimeString()}] Connexion sécurisée au diagnostic tenant [${company?.raisonSociale}] établie.`,
      `[${new Date().toLocaleTimeString()}] MODE DIAGNOSTIC LECTURE SEULE ACTIF - Droits d'écriture suspendus pour la sécurité.`,
      `[${new Date().toLocaleTimeString()}] Récupération des logs d'audit fonctionnels du client...`,
      `[${new Date().toLocaleTimeString()}] Analyse de conformité du moteur de règles du client...`,
      `[${new Date().toLocaleTimeString()}] Total de ${risks.length} fiches de risques inspectées.`,
      `[${new Date().toLocaleTimeString()}] Aucune anomalie de base de données détectée.`
    ]);

    addSystemLog('Accès Diagnostic', `Mode diagnostic ouvert pour [${company?.raisonSociale}] - Motif : ${diagnosticReason}`, 'Succès');
  };

  // Filter companies list
  const filteredCompanies = entreprises.filter(ent => {
    const matchesSearch = ent.raisonSociale.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ent.secteurActivite.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = filterRegion === 'All' || ent.regionHebergement === filterRegion;
    const matchesStatut = filterStatut === 'All' || ent.statutCompte === filterStatut;
    return matchesSearch && matchesRegion && matchesStatut;
  });

  // KPI Calculations (Section 10.3.3)
  const totalClients = entreprises.length;
  const trialClients = entreprises.filter(c => c.statutCompte === 'Essai').length;
  const activeClients = entreprises.filter(c => c.statutCompte === 'Actif').length;
  const suspendedClients = entreprises.filter(c => c.statutCompte === 'Suspendu').length;
  const renewalRate = 94.8; // Simulated aggregate metric

  // Modules distribution metric counts
  const modulesCounts = {
    Cartographie: licences.filter(l => l.modulesActives.includes('Cartographie')).length,
    Plans: licences.filter(l => l.modulesActives.includes('Plans de traitement' as any) || l.modulesActives.includes('Plans d\'action')).length,
    Audit: licences.filter(l => l.modulesActives.includes('Audit')).length,
    Conformite: licences.filter(l => l.modulesActives.includes('Conformité')).length,
    Reporting: licences.filter(l => l.modulesActives.includes('Reporting')).length,
  };

  if (!mfaVerified) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500"></div>
          
          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-500">
              <Lock className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white tracking-tight">Accès Espace SuperAdministrateur</h2>
              <p className="text-slate-400 text-[11px]">
                Pour des raisons de sécurité, l'accès à la console d'administration de la plateforme requiert une double authentification.
              </p>
            </div>

            <div className="w-full bg-slate-950 rounded-lg p-3 border border-slate-800 text-left space-y-2">
              <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>MFA de démonstration</span>
              </div>
              <p className="text-slate-500 text-[10px] leading-relaxed">
                Le système simule l'envoi d'un mot de passe à usage unique (OTP). Saisissez le code de simulation <strong className="text-indigo-400 font-mono">123456</strong> pour déverrouiller la console.
              </p>
            </div>

            <form onSubmit={handleVerifyMfa} className="w-full space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Code à 6 chiffres</label>
                <input 
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ex : 123456"
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-center text-lg font-mono tracking-widest text-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              {mfaError && (
                <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-[11px] text-left flex items-start space-x-1.5">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{mfaError}</span>
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded text-xs transition-colors flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Valider l'Authentification</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-950 text-slate-100">
      
      {/* 10.1 - Segmented SuperAdmin Identity Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-white tracking-tight">Console SuperAdministrateur</h1>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">
                Platform Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Supervision technique, licences contractuelles et étanchéité multi-tenant de la plateforme GRC.
            </p>
          </div>
        </div>

        {/* 10.4 - Role Selector Segment */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block text-right">Rôle Habilité Actuel :</label>
            <select
              value={currentRole}
              onChange={(e) => {
                const newRole = e.target.value as SuperAdminRole;
                setCurrentRole(newRole);
                addSystemLog('Changement Privilèges', `Basculé vers le profil de droits : ${newRole}`, 'Succès');
              }}
              className="bg-slate-950 border border-slate-800 rounded text-xs px-2 py-1 text-slate-200 font-medium focus:outline-none focus:border-indigo-500"
            >
              <option value="SuperAdministrateur technique">⚙️ SuperAdmin Technique (Infra & Logs)</option>
              <option value="SuperAdministrateur commercial / contractuel">💼 SuperAdmin Commercial (Contrats & Licences)</option>
              <option value="Support niveau 2">🛠️ Support niveau 2 (Diagnostic Read-only)</option>
            </select>
          </div>

          <button 
            onClick={handleLogoutMfa}
            className="self-end sm:self-auto bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold px-2.5 py-1.5 rounded text-[10px] tracking-wide flex items-center space-x-1"
          >
            <Lock className="w-3 h-3 text-red-400" />
            <span>Fermer Session</span>
          </button>
        </div>
      </div>

      {/* Internal Navigation Ribbon */}
      <div className="bg-slate-900 border-b border-slate-850 px-6 flex items-center space-x-1 overflow-x-auto scrollbar-none">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'dashboard' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Tableau de Bord Global
        </button>
        <button 
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'tenants' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Entreprises Clientes
        </button>
        <button 
          onClick={() => setActiveTab('licences')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'licences' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Licences & Contrats
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'users' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          🔑 Comptes Accès Clients
        </button>
        <button 
          onClick={() => setActiveTab('backups')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'backups' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Sauvegardes & Restitution
        </button>
        <button 
          onClick={() => setActiveTab('supervision')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'supervision' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Supervision Technique
        </button>
        <button 
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'support' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Diagnostic & Support
        </button>
        <button 
          onClick={() => setActiveTab('supabase')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'supabase' ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          ☁ Intégration Supabase
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* ==================== TAB: DASHBOARD ==================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* KPI Statistics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Clients de la Plateforme</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold text-white">{totalClients}</span>
                  <span className="text-[10px] text-emerald-400 font-medium">SaaS Multi-tenant</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Comptes Actifs</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold text-emerald-400">{activeClients}</span>
                  <span className="text-[10px] text-slate-500">Abonnements actifs</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Comptes d'Essai</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold text-indigo-400">{trialClients}</span>
                  <span className="text-[10px] text-slate-500">Prospects</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Comptes Suspendus</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold text-red-400">{suspendedClients}</span>
                  <span className="text-[10px] text-slate-500">Blocage impayés</span>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg col-span-2 lg:col-span-1">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Taux de Renouvellement</p>
                <div className="flex items-baseline space-x-2 mt-2">
                  <span className="text-2xl font-bold text-white">{renewalRate}%</span>
                  <span className="text-[10px] text-emerald-400 font-medium">Trimestriel</span>
                </div>
              </div>
            </div>

            {/* Alertes Opérationnelles & Distribution Modules */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Alertes Opérationnelles */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Alertes d'exploitation et d'usage</span>
                  </h3>
                  <span className="bg-slate-950 text-slate-400 px-2 py-0.5 rounded text-[10px] font-mono">Actives</span>
                </div>

                <div className="space-y-3">
                  {/* Real simulated quota alert */}
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start space-x-3">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white">Quotas d'utilisateurs proches du plafond - Sogesti</p>
                      <p className="text-slate-400 text-[11px]">
                        L'entreprise Sogesti International S.A. approche de sa limite contractuelle (<strong>45</strong> utilisateurs enregistrés sur un plafond de <strong>50</strong>).
                      </p>
                      <button 
                        onClick={() => {
                          const lic = licences.find(l => l.entrepriseId === 'tenant1');
                          if (lic) handleOpenEditLicence(lic);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-bold text-[10px] tracking-wide"
                      >
                        Ajuster le palier contractuel &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Suspended alert */}
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
                    <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white">Facturation en défaut - Global Retail Corp</p>
                      <p className="text-slate-400 text-[11px]">
                        L'accès au portail de l'entreprise Global Retail Corp est actuellement suspendu temporairement.
                      </p>
                      <button 
                        onClick={() => handleUpdateCompanyStatut('tenant4', 'Actif')}
                        className="text-emerald-400 hover:text-emerald-300 font-bold text-[10px] tracking-wide"
                      >
                        Réactiver le compte suite à régularisation &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Trial ending alert */}
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg flex items-start space-x-3">
                    <AlertTriangle className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-white">Fin de période d'essai imminente - Pharmaco Group S.A.</p>
                      <p className="text-slate-400 text-[11px]">
                        La période d'essai de Pharmaco Group S.A. expire dans 2 jours. Aucune carte bancaire n'est enregistrée.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distribution Modules souscrits */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">Modules les plus souscrits</h3>
                </div>

                <div className="space-y-3.5 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium">Cartographie des risques</span>
                      <span className="text-indigo-400 font-bold">{modulesCounts.Cartographie} / {totalClients}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${(modulesCounts.Cartographie / totalClients) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium">Plans d'action</span>
                      <span className="text-indigo-400 font-bold">{modulesCounts.Plans} / {totalClients}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${(modulesCounts.Plans / totalClients) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium">Rapports & Indicateurs (KRI)</span>
                      <span className="text-indigo-400 font-bold">{modulesCounts.Reporting} / {totalClients}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500" style={{ width: `${(modulesCounts.Reporting / totalClients) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium">Audit interne</span>
                      <span className="text-indigo-400 font-bold">{modulesCounts.Audit} / {totalClients}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${(modulesCounts.Audit / totalClients) * 100}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-slate-300 font-medium">Conformité réglementaire</span>
                      <span className="text-indigo-400 font-bold">{modulesCounts.Conformite} / {totalClients}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500" style={{ width: `${(modulesCounts.Conformite / totalClients) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sécurité du Compte SuperAdmin */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span>Sécurité & Clé SuperAdmin</span>
                  </h3>
                  <span className="text-[10px] bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded font-mono">vito</span>
                </div>

                <form onSubmit={handleUpdateAdminPassword} className="space-y-3.5">
                  {adminPasswordSuccess && (
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[11px] font-medium">
                      {adminPasswordSuccess}
                    </div>
                  )}
                  {adminPasswordError && (
                    <div className="p-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[11px] font-medium">
                      {adminPasswordError}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Nouveau Mot de Passe SuperAdmin</label>
                    <input 
                      type="password"
                      required
                      placeholder="Saisissez le nouveau mot de passe..."
                      value={newAdminPassword}
                      onChange={(e) => {
                        setNewAdminPassword(e.target.value);
                        setAdminPasswordSuccess('');
                        setAdminPasswordError('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Confirmer le Mot de Passe</label>
                    <input 
                      type="password"
                      required
                      placeholder="Retapez le mot de passe..."
                      value={confirmAdminPassword}
                      onChange={(e) => {
                        setConfirmAdminPassword(e.target.value);
                        setAdminPasswordSuccess('');
                        setAdminPasswordError('');
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded shadow transition text-xs cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Sauvegarder la Clé d'Accès</span>
                  </button>
                </form>
              </div>

            </div>

            {/* Journaux Système récents */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Dernières actions du SuperAdministrateur (Immuables)</span>
                </h3>
                <span className="bg-slate-950 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                  Syslog Immuable
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Horodatage</th>
                      <th className="py-2">Habilité</th>
                      <th className="py-2">Action</th>
                      <th className="py-2">Détails</th>
                      <th className="py-2">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {systemLogs.slice(0, 5).map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="py-2.5 font-mono text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2.5 font-semibold text-slate-300">{log.role}</td>
                        <td className="py-2.5 text-indigo-400 font-medium">{log.action}</td>
                        <td className="py-2.5 text-slate-400 max-w-sm truncate">{log.details}</td>
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            log.status === 'Succès' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                            log.status === 'Échec' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: TENANTS ==================== */}
        {activeTab === 'tenants' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer par raison sociale, secteur..."
                    className="bg-slate-900 border border-slate-800 text-xs text-white rounded pl-9 pr-3 py-2 w-64 focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  />
                </div>

                {/* Filters */}
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="All">Toutes les régions</option>
                  <option value="Europe (Paris)">Europe (Paris)</option>
                  <option value="Europe (Francfort)">Europe (Francfort)</option>
                  <option value="US East (N. Virginia)">US East (N. Virginia)</option>
                </select>

                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                  className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded px-3 py-2 focus:outline-none"
                >
                  <option value="All">Tous les statuts</option>
                  <option value="Actif">Actif</option>
                  <option value="Essai">Période d'essai</option>
                  <option value="Suspendu">Suspendu</option>
                </select>
              </div>

              {/* Action Button */}
              {hasPermission('COMMERCIAL') && (
                <button
                  onClick={() => setShowAddCompanyModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded text-xs flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Créer une Entreprise Cliente (Tenant)</span>
                </button>
              )}
            </div>

            {/* List of Tenants */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider">Entreprises clientes inscrites</h3>
              </div>

              <div className="divide-y divide-slate-800">
                {filteredCompanies.map((ent) => {
                  const associatedLicence = licences.find(l => l.entrepriseId === ent.id);
                  return (
                    <div key={ent.id} className="p-4 hover:bg-slate-850/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-white">{ent.raisonSociale}</h4>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ent.statutCompte === 'Actif' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            ent.statutCompte === 'Essai' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {ent.statutCompte === 'Actif' ? 'Actif' : ent.statutCompte === 'Essai' ? 'Essai' : 'Suspendu'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-[11px] text-slate-400">
                          <p>Secteur : <span className="text-slate-300 font-medium">{ent.secteurActivite}</span></p>
                          <p>Hébergement : <span className="text-slate-300 font-medium font-mono text-[10px]">{ent.regionHebergement}</span></p>
                          <p>Création : <span className="text-slate-300 font-medium">{ent.dateCreationCompte}</span></p>
                          <p>Contact : <span className="text-slate-300 font-medium">{ent.idContactPrincipal}</span></p>
                        </div>
                      </div>

                      {/* Associated Licence Summary & Actions */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="bg-slate-950 px-3 py-1.5 rounded border border-slate-800 text-[11px] space-y-0.5">
                          <p className="text-slate-400 text-[9px] uppercase tracking-wider font-bold">Abonnement</p>
                          <p className="text-slate-200 font-medium">
                            {associatedLicence ? `${associatedLicence.typeAbonnement} (${associatedLicence.nombreUtilisateursMax} max users)` : 'Aucune licence'}
                          </p>
                        </div>

                        {/* Lifecycle buttons */}
                        <div className="flex items-center space-x-1">
                          {hasPermission('COMMERCIAL') && (
                            <>
                              {ent.statutCompte === 'Suspendu' ? (
                                <button
                                  onClick={() => handleUpdateCompanyStatut(ent.id, 'Actif')}
                                  className="bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 px-2 py-1.5 rounded text-[10px] font-bold"
                                  title="Réactiver l'accès au portail"
                                >
                                  Réactiver
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateCompanyStatut(ent.id, 'Suspendu')}
                                  className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-1.5 rounded text-[10px] font-bold"
                                  title="Suspendre temporairement l'accès"
                                >
                                  Suspendre
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDeleteCompanyRequest(ent)}
                                className="bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 p-1.5 rounded"
                                title="Suppression définitive du compte client"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredCompanies.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    Aucune entreprise cliente ne correspond aux filtres appliqués.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: COMPTES ACCES CLIENTS ==================== */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in text-xs">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Formulaire de création / édition */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">
                    {editingUserId ? "✏️ Modifier le Compte Client" : "➕ Nouveau Compte Client"}
                  </h3>
                  <p className="text-slate-400 text-[10px] mt-0.5">
                    Configurez un identifiant d'accès pour un client. L'utilisateur pourra ensuite modifier ses identifiants depuis son profil.
                  </p>
                </div>

                <form onSubmit={editingUserId ? handleSaveEditUser : handleAddClientUser} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Nom Complet du Collaborateur</label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex : Jean-Pierre Ndzana"
                      value={editingUserId ? editingUserName : newClientUserName}
                      onChange={(e) => editingUserId ? setEditingUserName(e.target.value) : setNewClientUserName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Adresse Email (Identifiant / Login)</label>
                    <input 
                      type="email"
                      required
                      placeholder="Ex : j.dupont@entreprise.com"
                      value={editingUserId ? editingUserEmail : newClientUserEmail}
                      onChange={(e) => editingUserId ? setEditingUserEmail(e.target.value) : setNewClientUserEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">
                      {editingUserId ? "Mot de passe (Laisser vide pour ne pas modifier)" : "Mot de passe Initial"}
                    </label>
                    <input 
                      type="text"
                      required={!editingUserId}
                      placeholder={editingUserId ? "••••••••" : "Saisissez un mot de passe temporaire..."}
                      value={editingUserId ? editingUserPassword : newClientUserPassword}
                      onChange={(e) => editingUserId ? setEditingUserPassword(e.target.value) : setNewClientUserPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Rattaché à l'Entreprise</label>
                    <select
                      value={editingUserId ? editingUserTenant : newClientUserTenant}
                      onChange={(e) => editingUserId ? setEditingUserTenant(e.target.value) : setNewClientUserTenant(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      {tenants.map(t => (
                        <option key={t.id} value={t.id}>{t.companyName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Rôle Applicatif</label>
                    <select
                      value={editingUserId ? editingUserRole : newClientUserRole}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        editingUserId ? setEditingUserRole(val) : setNewClientUserRole(val);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="Analyste">Analyste (Lecture seule / Saisie des risques)</option>
                      <option value="Responsable">Responsable de division (Validation d'évaluations)</option>
                      <option value="Risk Manager">Risk Manager (Création, cotations & plans d'actions)</option>
                      <option value="Direction">Direction (Tableau de bord et rapports décisionnels)</option>
                    </select>
                  </div>

                  <div className="pt-2 flex items-center space-x-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded shadow text-xs transition cursor-pointer"
                    >
                      {editingUserId ? "Enregistrer les modifications" : "Créer le compte d'accès"}
                    </button>
                    {editingUserId && (
                      <button
                        type="button"
                        onClick={() => setEditingUserId(null)}
                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded text-xs transition"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Liste des comptes clients actifs */}
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 xl:col-span-2 space-y-4">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">Habilitations & Identifiants Actifs</h3>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Tous les comptes d'accès configurés pour les entreprises de la plateforme.
                    </p>
                  </div>
                  <span className="bg-slate-950 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    {users.filter(u => u.role !== 'SuperAdmin').length} Comptes clients
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5">Utilisateur</th>
                        <th className="py-2.5">Email (Login ID)</th>
                        <th className="py-2.5">Mot de Passe actuel</th>
                        <th className="py-2.5">Entreprise rattachée</th>
                        <th className="py-2.5">Rôle</th>
                        <th className="py-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {users.filter(u => u.role !== 'SuperAdmin').map((u) => {
                        const associatedTenant = tenants.find(t => t.id === u.tenantId);
                        const tenantName = associatedTenant ? associatedTenant.companyName : 'Sogesti International S.A. (Défaut)';
                        
                        return (
                          <tr key={u.id} className="hover:bg-slate-850/30">
                            <td className="py-3 font-semibold text-white flex items-center space-x-2">
                              <img src={u.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&fit=crop&q=80"} className="w-5 h-5 rounded-full border border-slate-800 shrink-0" />
                              <span>{u.name}</span>
                            </td>
                            <td className="py-3 font-mono text-slate-300">{u.email}</td>
                            <td className="py-3 font-mono text-amber-400 select-all font-bold">
                              {u.password || "Initial123"}
                            </td>
                            <td className="py-3 text-slate-300">{tenantName}</td>
                            <td className="py-3">
                              <span className="bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-bold">
                                {u.role}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingUserId(u.id);
                                    setEditingUserName(u.name);
                                    setEditingUserEmail(u.email);
                                    setEditingUserPassword(u.password || '');
                                    setEditingUserRole(u.role);
                                    setEditingUserTenant(u.tenantId || 'tenant1');
                                  }}
                                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-400 transition"
                                  title="Modifier l'identifiant"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteClientUser(u.id, u.name)}
                                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-red-400 transition"
                                  title="Supprimer le compte"
                                >
                                  🗑️
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

            </div>
          </div>
        )}

        {/* ==================== TAB: LICENCES & CONTRACTS ==================== */}
        {activeTab === 'licences' && (
          <div className="space-y-6 animate-fade-in">
            {/* Grid of Licences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {licences.map((lic) => {
                const company = entreprises.find(c => c.id === lic.entrepriseId);
                const isNearingLimit = lic.nombreUtilisateursMax - lic.nombreUtilisateursActuel <= 5;
                
                return (
                  <div key={lic.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-md relative overflow-hidden">
                    {/* Status ribbon */}
                    <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg ${
                      lic.statutLicence === 'Active' ? 'bg-emerald-600/10 text-emerald-400 border-l border-b border-emerald-500/20' :
                      lic.statutLicence === 'En période d\'essai' ? 'bg-indigo-600/10 text-indigo-400 border-l border-b border-indigo-500/20' :
                      'bg-red-600/10 text-red-400 border-l border-b border-red-500/20'
                    }`}>
                      {lic.statutLicence}
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase text-indigo-400 font-mono tracking-widest">ID LICENCE : {lic.id}</p>
                      <h4 className="text-sm font-bold text-white">{company?.raisonSociale || 'Inconnue'}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs">
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Abonnement</p>
                        <p className="text-slate-200 font-semibold mt-0.5">{lic.typeAbonnement}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Échéance contractuelle</p>
                        <p className="text-slate-200 font-semibold mt-0.5">{lic.dateFin}</p>
                      </div>
                    </div>

                    {/* Quota Consumable display Section 10.3.2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-400 font-medium">Consommation Quota Utilisateurs :</span>
                        <span className={`font-bold ${isNearingLimit ? 'text-red-400' : 'text-slate-200'}`}>
                          {lic.nombreUtilisateursActuel} / {lic.nombreUtilisateursMax} actifs
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${isNearingLimit ? 'bg-red-500' : 'bg-indigo-500'}`} 
                          style={{ width: `${Math.min(100, (lic.nombreUtilisateursActuel / lic.nombreUtilisateursMax) * 100)}%` }}
                        ></div>
                      </div>
                      {isNearingLimit && (
                        <p className="text-[10px] text-red-400 font-medium flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Alerte quota : le client approche de sa limite active contractuelle.</span>
                        </p>
                      )}
                    </div>

                    {/* Activates Modules list (instant toggle impact) */}
                    <div className="space-y-1.5">
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Modules Activés :</p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Cartographie', 'Plans d\'action', 'Audit', 'Conformité', 'Reporting'].map((modName) => {
                          const isAct = lic.modulesActives.includes(modName as any);
                          return (
                            <span 
                              key={modName}
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                isAct 
                                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' 
                                  : 'bg-slate-950 text-slate-600 border-slate-850 line-through'
                              }`}
                            >
                              {modName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick actions */}
                    {hasPermission('COMMERCIAL') && (
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">Débute le : {lic.dateDebut}</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const updated = {
                                ...lic,
                                dateFin: new Date(Date.now() + 3600000 * 24 * 365).toISOString().split('T')[0],
                                statutLicence: 'Active' as const
                              };
                              onUpdateLicences(prev => prev.map(l => l.id === lic.id ? updated : l));
                              
                              const newHist: HistoriqueLicence = {
                                id: `hist_${Date.now()}`,
                                licenceId: lic.id,
                                typeChangement: 'Renouvellement',
                                dateChangement: new Date().toISOString().split('T')[0],
                                effectuePar: currentRole,
                                details: `Renouvellement annuel rapide effectué pour ${company?.raisonSociale}. Nouvelle échéance: ${updated.dateFin}.`
                              };
                              onUpdateHistoriqueLicences(h => [newHist, ...h]);
                              addSystemLog('Renouvellement Licence', `Abonnement annuel renouvelé pour ${company?.raisonSociale}`, 'Succès');
                            }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-2 py-1 rounded text-[10px]"
                          >
                            Renouveler +1 An
                          </button>
                          <button
                            onClick={() => handleOpenEditLicence(lic)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-2 py-1 rounded text-[10px] flex items-center space-x-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Ajuster</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Historique Contractuel */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider">Historique de Licence (Traçabilité Section 10.2.3)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2">Date</th>
                      <th className="py-2">ID Licence</th>
                      <th className="py-2">Type d'Événement</th>
                      <th className="py-2">Opérateur</th>
                      <th className="py-2">Modifications apportées</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {historiqueLicences.map((hist) => (
                      <tr key={hist.id} className="hover:bg-slate-850/30">
                        <td className="py-2.5 font-mono text-[10px] text-slate-400">{hist.dateChangement}</td>
                        <td className="py-2.5 text-indigo-400 font-mono text-[10px]">{hist.licenceId}</td>
                        <td className="py-2.5 font-bold text-slate-200">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            hist.typeChangement === 'Création' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            hist.typeChangement === 'Suspension' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {hist.typeChangement}
                          </span>
                        </td>
                        <td className="py-2.5 font-semibold text-slate-300">{hist.effectuePar}</td>
                        <td className="py-2.5 text-slate-400">{hist.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: BACKUPS & PORTABILITY ==================== */}
        {activeTab === 'backups' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Export Panel */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
                <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-3">
                  <Download className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">Portabilité totale : Export SQL / JSON (Section 10.3.4)</h3>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Conformément au principe de réversibilité totale, vous pouvez exporter à la demande l'intégralité des configurations et données d'un client dans un format JSON structuré indépendant.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sélectionner le Client à exporter :</label>
                    <select
                      id="export-company-select"
                      className="w-full bg-slate-950 border border-slate-800 rounded text-xs px-3 py-2 text-white focus:outline-none"
                      onChange={(e) => handleExportData(e.target.value)}
                      defaultValue=""
                    >
                      <option value="" disabled>-- Choisir une entreprise --</option>
                      {entreprises.map(c => (
                        <option key={c.id} value={c.id}>{c.raisonSociale}</option>
                      ))}
                    </select>
                  </div>

                  {exportData && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Dump Archive JSON généré :</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(exportData);
                            alert("Archive copiée dans le presse-papiers !");
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-bold text-[10px] tracking-wide"
                        >
                          Copier l'archive
                        </button>
                      </div>
                      <textarea
                        readOnly
                        value={exportData}
                        rows={10}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-3 font-mono text-[10px] text-indigo-300 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Restore Panel */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
                <div className="flex items-center space-x-2 text-amber-500 border-b border-slate-800 pb-3">
                  <Upload className="w-5 h-5" />
                  <h3 className="font-bold text-white text-sm">Procédure de Restauration de production</h3>
                </div>

                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Restaurez les données d'un client à partir d'une sauvegarde planifiée ou d'un snapshot technique. <strong>Avertissement :</strong> Cette action est irréversible et écrasera toutes les données en production du client sélectionné.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sélectionner le Client à restaurer :</label>
                    <div className="flex gap-2">
                      <select
                        id="restore-company-select"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded text-xs px-3 py-2 text-white focus:outline-none"
                        defaultValue=""
                      >
                        <option value="" disabled>-- Choisir une entreprise --</option>
                        {entreprises.map(c => (
                          <option key={c.id} value={c.id}>{c.raisonSociale}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          const val = (document.getElementById('restore-company-select') as HTMLSelectElement).value;
                          if (val) handleSimulateRestore(val);
                        }}
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-3 py-2 rounded text-xs"
                      >
                        Restaurer
                      </button>
                    </div>
                  </div>

                  <div className="border border-slate-800 bg-slate-950/50 p-3 rounded-lg text-[11px] text-slate-400 space-y-1">
                    <p className="font-semibold text-white">Dernières Sauvegardes Automatiques Système :</p>
                    <div className="flex items-center justify-between py-1 border-b border-slate-900 font-mono text-[10px]">
                      <span>Snapshot_Hourly_0400.sql</span>
                      <span className="text-emerald-400">Aujourd'hui, 04:00 (Succès)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-900 font-mono text-[10px]">
                      <span>Snapshot_Daily_Yesterday.sql</span>
                      <span className="text-emerald-400">Hier, 00:00 (Succès)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: SUPERVISION TECHNIQUE ==================== */}
        {activeTab === 'supervision' && (
          <div className="space-y-6 animate-fade-in">
            {/* Live Infrastructure Stats Section 10.3.5 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Disponibilité Plateforme</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">99.98%</p>
                </div>
                <div className="text-emerald-400 bg-emerald-500/10 p-2 rounded-full">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Charge CPU Moyenne</p>
                  <p className="text-xl font-bold text-white mt-1">18.4%</p>
                </div>
                <div className="text-indigo-400 bg-indigo-500/10 p-2 rounded-full">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Temps de réponse API</p>
                  <p className="text-xl font-bold text-white mt-1">45 ms</p>
                </div>
                <div className="text-indigo-400 bg-indigo-500/10 p-2 rounded-full">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">Volumétrie DB Globale</p>
                  <p className="text-xl font-bold text-amber-500 mt-1">1.24 Go</p>
                </div>
                <div className="text-amber-400 bg-amber-500/10 p-2 rounded-full">
                  <Database className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Canary Release & Deployment section */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-white text-sm">Gestion des Mises à jour Applicatives (Section 10.3.5)</h3>
                <span className="bg-indigo-600/10 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold">Plateforme centralisée</span>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                Déployez de nouvelles versions du moteur de règles et de l'ERP à l'ensemble du portefeuille ou de manière ciblée par lots de serveurs (Canary Release).
              </p>

              <div className="p-4 bg-slate-950 rounded-lg border border-slate-850 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Version de production stable active : <span className="font-mono text-indigo-400 text-xs">v1.4.2</span></p>
                  <p className="text-slate-500 text-[10px]">Dernière mise à jour effectuée le 2026-06-25 par double approbation infra.</p>
                </div>

                <div className="flex items-center gap-2">
                  {canaryStatus === 'IDLE' && (
                    <button
                      onClick={handleTriggerCanaryUpdate}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded text-xs flex items-center space-x-1.5 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Lancer le déploiement v1.4.3 (Canary)</span>
                    </button>
                  )}

                  {canaryStatus === 'PROGRESS' && (
                    <div className="flex items-center space-x-3 text-xs text-amber-500 font-semibold">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span>Canary en cours : {canaryProgress}%</span>
                    </div>
                  )}

                  {canaryStatus === 'COMPLETED' && (
                    <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-bold">
                      <CheckCircle className="w-4 h-4" />
                      <span>Mise à jour v1.4.3 terminée à 100% !</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB: DIAGNOSTIC & SUPPORT ==================== */}
        {activeTab === 'support' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
              <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-3">
                <LifeBuoy className="w-5 h-5" />
                <h3 className="font-bold text-white text-sm">Mode Support & Diagnostic en lecture seule (Section 10.3.6)</h3>
              </div>

              <p className="text-slate-400 text-[11px] leading-relaxed">
                Le SuperAdministrateur dispose d'un accès en <strong>lecture seule</strong> aux données du tenant uniquement pour résoudre un ticket de support ouvert. Toute modification de données est bloquée pour préserver l'intégrité, et l'historique d'accès est journalisé dans l'audit trail de la plateforme de manière immuable.
              </p>

              {!diagnosticActive ? (
                <form onSubmit={handleActivateDiagnostic} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sélectionner l'Entreprise à inspecter :</label>
                      <select
                        id="diag-company-select"
                        className="w-full bg-slate-950 border border-slate-800 rounded text-xs px-3 py-2 text-white focus:outline-none"
                        value={diagnosticTenantId}
                        onChange={(e) => setDiagnosticTenantId(e.target.value)}
                        required
                      >
                        <option value="" disabled>-- Choisir une entreprise --</option>
                        {entreprises.map(c => (
                          <option key={c.id} value={c.id}>{c.raisonSociale}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Motif / Ticket n° :</label>
                      <input 
                        type="text"
                        placeholder="Ex : Ticket #2819 - Anomalie affichage matrice"
                        className="w-full bg-slate-950 border border-slate-800 rounded text-xs px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                        value={diagnosticReason}
                        onChange={(e) => setDiagnosticReason(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-2 rounded text-xs flex items-center space-x-1.5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Démarrer la Session Diagnostic (Lecture Seule)</span>
                  </button>
                </form>
              ) : (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span>
                      <p className="text-slate-200 font-semibold">
                        Inspection active de l'entreprise : <span className="text-indigo-400">{entreprises.find(e => e.id === diagnosticTenantId)?.raisonSociale}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDiagnosticActive(false);
                        addSystemLog('Fermeture Diagnostic', `Mode diagnostic fermé pour l'entreprise inspectée.`, 'Succès');
                      }}
                      className="text-red-400 hover:text-red-300 font-bold"
                    >
                      Quitter
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest font-mono">Console d'inspection diagnostic :</p>
                    <div className="bg-slate-950 border border-slate-800 rounded p-4 font-mono text-[10px] text-indigo-300 space-y-1 max-h-48 overflow-y-auto">
                      {diagnosticLogs.map((log, idx) => (
                        <p key={idx}>{log}</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB: SUPABASE INTEGRATION ==================== */}
        {activeTab === 'supabase' && (
          <div className="space-y-6 animate-fade-in text-xs text-slate-300">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-lg space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 border-b border-slate-800 pb-3">
                <Database className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="font-bold text-white text-sm">Intégration Cloud Supabase (Moteur PostgreSQL)</h3>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Configurez la connexion avec votre instance PostgreSQL hébergée chez <strong className="text-amber-400">Supabase</strong>. Cette fonctionnalité de synchronisation multi-tenant et de réplication cloud est strictement restreinte aux <strong className="text-white">SuperAdministrateurs de la Plateforme</strong> pour des raisons de sécurité de l'infrastructure.
              </p>

              {/* SECTION 1: CREDENTIALS */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <Server className="w-4 h-4 text-indigo-400" />
                    1. Paramètres de Connexion Supabase
                  </h4>
                  {connStatus === 'success' ? (
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 self-start">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      RÉSEAU CONNECTÉ & FONCTIONNEL
                    </span>
                  ) : connStatus === 'loading' ? (
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 animate-pulse self-start">
                      <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                      TENTATIVE D'ACCÈS...
                    </span>
                  ) : (
                    <span className="bg-slate-800 text-slate-400 border border-slate-700 font-bold px-2.5 py-1 rounded text-[10px] flex items-center gap-1 self-start">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                      ACCÈS NON CONFIGURÉ
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
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
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
                      className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded shadow transition text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CloudLightning className="w-3.5 h-3.5" />
                    Tester & Enregistrer les identifiants
                  </button>
                  {(dbUrl || dbKey) && (
                    <button
                      type="button"
                      onClick={handleClearConfig}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded transition text-xs cursor-pointer"
                    >
                      Réinitialiser par défaut (Clés système)
                    </button>
                  )}
                </div>

                {connMessage && (
                  <div className={`p-3 rounded-lg border text-[11px] leading-relaxed flex items-start gap-2 ${
                    connStatus === 'success' 
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' 
                      : connStatus === 'error'
                      ? 'bg-red-950/40 border-red-900 text-red-300'
                      : 'bg-indigo-950/40 border-indigo-900 text-indigo-300'
                  }`}>
                    <div className="mt-0.5 font-bold">● Statut :</div>
                    <div className="flex-1 font-medium">{connMessage}</div>
                  </div>
                )}
              </div>

              {/* SECTION 2: SQL SCHEMA GENERATOR */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-white text-xs flex items-center gap-2">
                    <Code className="w-4 h-4 text-amber-500" />
                    2. Schéma d'initialisation PostgreSQL (Supabase SQL Editor)
                  </h4>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-indigo-400 font-bold rounded text-[10px] transition cursor-pointer flex items-center gap-1"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copier le Script SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-slate-400 text-[10.5px] leading-relaxed">
                  Avant de commencer le transit de données, exécutez le script SQL ci-dessous dans la console de votre projet Supabase (<strong className="text-indigo-400">SQL Editor</strong>) pour configurer les 17 tables relationnelles de la plateforme ERP GRC.
                </p>

                <div className="relative">
                  <pre className="p-4 bg-slate-950 text-slate-400 rounded-lg text-[10px] font-mono overflow-x-auto max-h-52 overflow-y-auto border border-slate-850 shadow-inner select-all leading-normal">
                    {getSqlSchema()}
                  </pre>
                </div>
              </div>

              {/* SECTION 3: DATA SYNCHRONIZATION */}
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-4">
                <h4 className="font-bold text-white text-xs flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  3. Synchronisation et transit des données locales & distantes
                </h4>
                <p className="text-slate-400 text-[10.5px]">
                  Basculez librement vos données entre le stockage local du navigateur et la base de données relationnelle Supabase de l'organisation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Push controls */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <h5 className="font-bold text-white text-[11px] uppercase tracking-wide">
                      Push (Navigateur Local ➔ Base PostgreSQL)
                    </h5>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Publier l'intégralité des configurations locales, utilisateurs, risques, contrôles, audits, et licences vers votre base de données Supabase cloud.
                    </p>
                    <button
                      type="button"
                      onClick={handlePushData}
                      disabled={connStatus !== 'success' || syncStatus !== 'idle'}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded shadow transition text-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      {syncStatus === 'pushing' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <CloudLightning className="w-3.5 h-3.5" />
                          Lancer la Synchronisation Push
                        </>
                      )}
                    </button>
                  </div>

                  {/* Pull controls */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <h5 className="font-bold text-white text-[11px] uppercase tracking-wide">
                      Pull (Base PostgreSQL ➔ Navigateur Local)
                    </h5>
                    <p className="text-slate-400 text-[10px] leading-relaxed">
                      Importer l'intégralité des données GRC depuis la base de données Supabase cloud et écraser toutes les informations en cours d'utilisation dans ce navigateur.
                    </p>
                    <button
                      type="button"
                      onClick={handlePullData}
                      disabled={connStatus !== 'success' || syncStatus !== 'idle'}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold rounded shadow transition text-xs cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      {syncStatus === 'pulling' ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Récupération...
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          Lancer la Synchronisation Pull
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Auto-Sync Switch */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-amber-400 text-xs">Mise à jour en temps réel automatique (Auto-Sync)</h5>
                    <p className="text-slate-400 text-[10px]">
                      Lorsque cette option de réplication cloud est activée, toutes les modifications du système (création de risques, plans d'actions, comptes, licences, audits) sont automatiquement transmises à Supabase.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleAutoSync}
                    className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out shrink-0 relative focus:outline-none cursor-pointer ${
                      autoSync ? 'bg-amber-600' : 'bg-slate-800'
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
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Console de synchronisation :</div>
                    <div className="p-3 bg-slate-950 text-slate-350 rounded-lg font-mono text-[9px] max-h-36 overflow-y-auto space-y-1 shadow-inner border border-slate-900 leading-normal select-text">
                      {syncLogs.map((log, idx) => (
                        <div key={idx} className={log.startsWith('✓') ? 'text-emerald-400' : log.startsWith('⚠') ? 'text-amber-400' : 'text-slate-400'}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ==================== MODAL: ADD COMPANY ==================== */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-850 rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Création d'une Entreprise Cliente & Licence Initiale</h3>
              <button onClick={() => setShowAddCompanyModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Raison Sociale de l'entreprise</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ex : Pharmaco Group S.A."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                    value={newCompany.raisonSociale}
                    onChange={(e) => setNewCompany({...newCompany, raisonSociale: e.target.value})}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Secteur d'Activité</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                    value={newCompany.secteurActivite}
                    onChange={(e) => setNewCompany({...newCompany, secteurActivite: e.target.value})}
                  >
                    <option value="Services Financiers">Services Financiers</option>
                    <option value="Aéronautique & Défense">Aéronautique & Défense</option>
                    <option value="Pharmacie & Santé">Pharmacie & Santé</option>
                    <option value="Grande Distribution">Grande Distribution</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Région d'Hébergement (RGPD)</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                    value={newCompany.regionHebergement}
                    onChange={(e) => setNewCompany({...newCompany, regionHebergement: e.target.value})}
                  >
                    <option value="Europe (Paris)">Europe (Paris)</option>
                    <option value="Europe (Francfort)">Europe (Francfort)</option>
                    <option value="US East (N. Virginia)">US East (N. Virginia)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Type d'abonnement</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                    value={newCompany.typeAbonnement}
                    onChange={(e) => setNewCompany({...newCompany, typeAbonnement: e.target.value as any})}
                  >
                    <option value="Mensuel">Mensuel</option>
                    <option value="Annuel">Annuel</option>
                    <option value="Sur devis">Sur devis</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Plafond utilisateurs max</label>
                  <input 
                    type="number"
                    min={1}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                    value={newCompany.maxUsers}
                    onChange={(e) => setNewCompany({...newCompany, maxUsers: Number(e.target.value)})}
                  />
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact Administrateur Client</label>
                  <input 
                    type="text"
                    placeholder="Nom du contact principal ou email"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                    value={newCompany.contactPrincipal}
                    onChange={(e) => setNewCompany({...newCompany, contactPrincipal: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Modules inclus au contrat :</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Cartographie', 'Plans d\'action', 'Audit', 'Conformité', 'Reporting'].map((mod) => (
                      <label key={mod} className="flex items-center space-x-2 bg-slate-950 p-2 rounded border border-slate-850 cursor-pointer hover:bg-slate-900">
                        <input 
                          type="checkbox"
                          checked={newCompany.modules.includes(mod as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewCompany({...newCompany, modules: [...newCompany.modules, mod as any]});
                            } else {
                              setNewCompany({...newCompany, modules: newCompany.modules.filter(m => m !== mod)});
                            }
                          }}
                          className="rounded border-slate-800 text-indigo-600 focus:ring-0"
                        />
                        <span className="text-slate-300">{mod}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded"
                >
                  Créer et Activer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: EDIT LICENCE ==================== */}
      {showEditLicenceModal && selectedLicence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-850 rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-slate-850 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Ajuster la Licence Contractuelle</h3>
              <button onClick={() => setShowEditLicenceModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateLicence} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Type d'abonnement</label>
                <select
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                  value={selectedLicence.typeAbonnement}
                  onChange={(e) => setSelectedLicence({...selectedLicence, typeAbonnement: e.target.value as any})}
                >
                  <option value="Mensuel">Mensuel</option>
                  <option value="Annuel">Annuel</option>
                  <option value="Sur devis">Sur devis</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nombre d'utilisateurs max</label>
                <input 
                  type="number"
                  min={selectedLicence.nombreUtilisateursActuel}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                  value={selectedLicence.nombreUtilisateursMax}
                  onChange={(e) => setSelectedLicence({...selectedLicence, nombreUtilisateursMax: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date d'échéance contractuelle</label>
                <input 
                  type="date"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none"
                  value={selectedLicence.dateFin}
                  onChange={(e) => setSelectedLicence({...selectedLicence, dateFin: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Activer/Désactiver des modules :</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Cartographie', 'Plans d\'action', 'Audit', 'Conformité', 'Reporting'].map((mod) => (
                    <label key={mod} className="flex items-center space-x-2 bg-slate-950 p-2 rounded border border-slate-850 cursor-pointer hover:bg-slate-900">
                      <input 
                        type="checkbox"
                        checked={selectedLicence.modulesActives.includes(mod as any)}
                        onChange={(e) => {
                          const modules = selectedLicence.modulesActives;
                          if (e.target.checked) {
                            setSelectedLicence({...selectedLicence, modulesActives: [...modules, mod as any]});
                          } else {
                            setSelectedLicence({...selectedLicence, modulesActives: modules.filter(m => m !== mod)});
                          }
                        }}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-0"
                      />
                      <span className="text-slate-300">{mod}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditLicenceModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded"
                >
                  Enregistrer les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: DOUBLE VALIDATION FOR SENSITIVE ACTIONS ==================== */}
      {doubleValidationTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 animate-fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-red-500/20 rounded-lg shadow-2xl overflow-hidden">
            <div className="bg-red-500/10 px-5 py-4 border-b border-red-500/20 flex items-center justify-between text-red-400">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <h3 className="font-bold text-sm">Double Validation Requise (Sécurité Section 10.5)</h3>
              </div>
              <button onClick={() => setDoubleValidationTarget(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {doubleValidationTarget.type === 'delete' ? (
                <>
                  <p className="text-slate-300 leading-relaxed">
                    Vous demandez la suppression définitive de l'entreprise cliente <strong className="text-white">{doubleValidationTarget.name}</strong>.
                    Cette opération est destructrice et supprimera instantanément l'ensemble des licences, des comptes utilisateurs et de l'historique associé.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saisir <span className="text-red-400 font-mono">SUPPRIMER</span> pour valider :</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold text-center uppercase focus:border-red-500 focus:outline-none"
                      value={doubleValidationCode}
                      onChange={(e) => setDoubleValidationCode(e.target.value)}
                      placeholder="Tapez SUPPRIMER"
                    />
                  </div>
                  <div className="pt-3 border-t border-slate-850 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setDoubleValidationTarget(null)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDeleteCompany}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded"
                    >
                      Confirmer la suppression irréversible
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-slate-300 leading-relaxed">
                    Vous demandez la restauration de la base de données de production pour l'entreprise <strong className="text-white">{doubleValidationTarget.name}</strong> à partir d'un snapshot technique de sauvegarde. Tout travail non sauvegardé effectué depuis ce snapshot sera irrémédiablement perdu.
                  </p>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Saisir <span className="text-amber-500 font-mono">RESTAURER</span> pour valider :</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-white font-bold text-center uppercase focus:border-amber-500 focus:outline-none"
                      value={doubleValidationCode}
                      onChange={(e) => setDoubleValidationCode(e.target.value)}
                      placeholder="Tapez RESTAURER"
                    />
                  </div>
                  <div className="pt-3 border-t border-slate-850 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setDoubleValidationTarget(null)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmRestore}
                      className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded"
                    >
                      Rétablir le snapshot de sauvegarde
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
