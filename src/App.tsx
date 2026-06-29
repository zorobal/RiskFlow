/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import OdooNavbar from './components/OdooNavbar';
import DashboardModule from './components/DashboardModule';
import RiskMappingModule from './components/RiskMappingModule';
import EvaluationModule from './components/EvaluationModule';
import MatrixModule from './components/MatrixModule';
import ActionsModule from './components/ActionsModule';
import ConfigModule from './components/ConfigModule';
import AdminModule from './components/AdminModule';
import ReportingModule from './components/ReportingModule';
import AuditModule from './components/AuditModule';
import ComplianceModule from './components/ComplianceModule';
import SuperAdminModule from './components/SuperAdminModule';
import LoginModule from './components/LoginModule';
import DemoModule from './components/DemoModule';

import { 
  SOGESTI_CONFIG, 
  AEROTECH_CONFIG, 
  SOGESTI_RISKS, 
  AEROTECH_RISKS, 
  PRESET_USERS, 
  PRESET_ACTIONS, 
  PRESET_AUDIT_LOGS,
  PRESET_FONCTIONS,
  PRESET_AFFECTATIONS,
  PRESET_RULES,
  PRESET_ACCESS_PROFILES,
  PRESET_AUDIT_MISSIONS,
  PRESET_AUDIT_FINDINGS,
  PRESET_COMPLIANCE_FRAMEWORKS,
  PRESET_COMPLIANCE_OBLIGATIONS,
  PRESET_COMPLIANCE_INCIDENTS,
  PRESET_ENTREPRISES,
  PRESET_LICENCES,
  PRESET_HISTORIQUE_LICENCES
} from './initialData';

import { 
  TenantConfig, 
  User, 
  Risk, 
  ActionPlan, 
  AuditLog,
  Fonction,
  Affectation,
  Rule,
  AccessProfile,
  AuditMission,
  AuditFinding,
  ComplianceFramework,
  ComplianceObligation,
  ComplianceIncident,
  EntrepriseCliente,
  Licence,
  HistoriqueLicence
} from './types';

export default function App() {
  // Master state
  const [tenants, setTenants] = useState<TenantConfig[]>(() => {
    const saved = localStorage.getItem('grc_tenants19');
    return saved ? JSON.parse(saved) : [SOGESTI_CONFIG, AEROTECH_CONFIG];
  });

  const [activeTenantId, setActiveTenantId] = useState<string>(() => {
    return localStorage.getItem('grc_activeTenantId19') || 'tenant1';
  });

  const [risks, setRisks] = useState<Risk[]>(() => {
    const saved = localStorage.getItem('grc_risks19');
    return saved ? JSON.parse(saved) : [...SOGESTI_RISKS, ...AEROTECH_RISKS];
  });

  const [actions, setActions] = useState<ActionPlan[]>(() => {
    const saved = localStorage.getItem('grc_actions19');
    return saved ? JSON.parse(saved) : PRESET_ACTIONS;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('grc_users19');
    return saved ? JSON.parse(saved) : PRESET_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('grc_currentUser19');
    if (saved) return JSON.parse(saved);
    return PRESET_USERS.find(u => u.name.includes('Alain')) || PRESET_USERS[0];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('grc_auditLogs19');
    return saved ? JSON.parse(saved) : PRESET_AUDIT_LOGS;
  });

  const [fonctions, setFonctions] = useState<Fonction[]>(() => {
    const saved = localStorage.getItem('grc_fonctions19');
    return saved ? JSON.parse(saved) : PRESET_FONCTIONS;
  });

  const [affectations, setAffectations] = useState<Affectation[]>(() => {
    const saved = localStorage.getItem('grc_affectations19');
    return saved ? JSON.parse(saved) : PRESET_AFFECTATIONS;
  });

  const [rules, setRules] = useState<Rule[]>(() => {
    const saved = localStorage.getItem('grc_rules19');
    return saved ? JSON.parse(saved) : PRESET_RULES;
  });

  const [accessProfiles, setAccessProfiles] = useState<AccessProfile[]>(() => {
    const saved = localStorage.getItem('grc_accessProfiles19');
    return saved ? JSON.parse(saved) : PRESET_ACCESS_PROFILES;
  });

  const [auditMissions, setAuditMissions] = useState<AuditMission[]>(() => {
    const saved = localStorage.getItem('grc_auditMissions19');
    return saved ? JSON.parse(saved) : PRESET_AUDIT_MISSIONS;
  });

  const [auditFindings, setAuditFindings] = useState<AuditFinding[]>(() => {
    const saved = localStorage.getItem('grc_auditFindings19');
    return saved ? JSON.parse(saved) : PRESET_AUDIT_FINDINGS;
  });

  const [complianceFrameworks, setComplianceFrameworks] = useState<ComplianceFramework[]>(() => {
    const saved = localStorage.getItem('grc_complianceFrameworks19');
    return saved ? JSON.parse(saved) : PRESET_COMPLIANCE_FRAMEWORKS;
  });

  const [complianceObligations, setComplianceObligations] = useState<ComplianceObligation[]>(() => {
    const saved = localStorage.getItem('grc_complianceObligations19');
    return saved ? JSON.parse(saved) : PRESET_COMPLIANCE_OBLIGATIONS;
  });

  const [complianceIncidents, setComplianceIncidents] = useState<ComplianceIncident[]>(() => {
    const saved = localStorage.getItem('grc_complianceIncidents19');
    return saved ? JSON.parse(saved) : PRESET_COMPLIANCE_INCIDENTS;
  });

  const [entreprises, setEntreprises] = useState<EntrepriseCliente[]>(() => {
    const saved = localStorage.getItem('grc_entreprises19');
    return saved ? JSON.parse(saved) : PRESET_ENTREPRISES;
  });

  const [licences, setLicences] = useState<Licence[]>(() => {
    const saved = localStorage.getItem('grc_licences19');
    return saved ? JSON.parse(saved) : PRESET_LICENCES;
  });

  const [historiqueLicences, setHistoriqueLicences] = useState<HistoriqueLicence[]>(() => {
    const saved = localStorage.getItem('grc_historiqueLicences19');
    return saved ? JSON.parse(saved) : PRESET_HISTORIQUE_LICENCES;
  });

  const [isSuperAdminMode, setIsSuperAdminMode] = useState<boolean>(() => {
    return localStorage.getItem('grc_superAdminMode19') === 'true';
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('grc_isLoggedIn19') === 'true';
  });

  const [showDemo, setShowDemo] = useState<boolean>(() => {
    return localStorage.getItem('grc_showDemo19') === 'true';
  });

  const [activeModule, setActiveModule] = useState<'dashboard' | 'risks' | 'evaluation' | 'heatmap' | 'actions' | 'config' | 'admin' | 'reporting' | 'audit' | 'compliance'>('dashboard');
  const [adminTab, setAdminTab] = useState<'users' | 'tenants' | 'audit'>('users');

  // Persistence side-effects
  useEffect(() => {
    localStorage.setItem('grc_tenants19', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    localStorage.setItem('grc_activeTenantId19', activeTenantId);
  }, [activeTenantId]);

  useEffect(() => {
    localStorage.setItem('grc_risks19', JSON.stringify(risks));
  }, [risks]);

  useEffect(() => {
    localStorage.setItem('grc_actions19', JSON.stringify(actions));
  }, [actions]);

  useEffect(() => {
    localStorage.setItem('grc_users19', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('grc_currentUser19', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('grc_auditLogs19', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('grc_fonctions19', JSON.stringify(fonctions));
  }, [fonctions]);

  useEffect(() => {
    localStorage.setItem('grc_affectations19', JSON.stringify(affectations));
  }, [affectations]);

  useEffect(() => {
    localStorage.setItem('grc_rules19', JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem('grc_accessProfiles19', JSON.stringify(accessProfiles));
  }, [accessProfiles]);

  useEffect(() => {
    localStorage.setItem('grc_auditMissions19', JSON.stringify(auditMissions));
  }, [auditMissions]);

  useEffect(() => {
    localStorage.setItem('grc_auditFindings19', JSON.stringify(auditFindings));
  }, [auditFindings]);

  useEffect(() => {
    localStorage.setItem('grc_complianceFrameworks19', JSON.stringify(complianceFrameworks));
  }, [complianceFrameworks]);

  useEffect(() => {
    localStorage.setItem('grc_complianceObligations19', JSON.stringify(complianceObligations));
  }, [complianceObligations]);

  useEffect(() => {
    localStorage.setItem('grc_complianceIncidents19', JSON.stringify(complianceIncidents));
  }, [complianceIncidents]);

  useEffect(() => {
    localStorage.setItem('grc_entreprises19', JSON.stringify(entreprises));
  }, [entreprises]);

  useEffect(() => {
    localStorage.setItem('grc_licences19', JSON.stringify(licences));
  }, [licences]);

  useEffect(() => {
    localStorage.setItem('grc_historiqueLicences19', JSON.stringify(historiqueLicences));
  }, [historiqueLicences]);

  useEffect(() => {
    localStorage.setItem('grc_superAdminMode19', String(isSuperAdminMode));
  }, [isSuperAdminMode]);

  useEffect(() => {
    localStorage.setItem('grc_isLoggedIn19', String(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('grc_showDemo19', String(showDemo));
  }, [showDemo]);

  // Current selected configurations
  const activeTenantConfig = tenants.find(t => t.id === activeTenantId) || tenants[0];
  
  // Scoped risk list belonging to active Tenant
  const activeTenantRisks = risks.filter(r => {
    // Treat R-100 values as Sogesti S.A. and R-200 as AeroTech
    if (activeTenantId === 'tenant1') {
      return r.id.startsWith('R-1');
    } else if (activeTenantId === 'tenant2') {
      return r.id.startsWith('R-2');
    }
    // Dynamic tenants fallback inside active selection
    return !r.id.startsWith('R-1') && !r.id.startsWith('R-2');
  });

  // State modifying functions
  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      details,
      tenantId: activeTenantId
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  const handleAddRisk = (rawRisk: Omit<Risk, 'id' | 'scoreBrut' | 'scoreResiduel' | 'createdAt' | 'history'>) => {
    // Generate sequential unique ID based on active tenants
    const prefix = activeTenantId === 'tenant1' ? 'R-1' : (activeTenantId === 'tenant2' ? 'R-2' : 'R-3');
    const existingIds = risks.filter(r => r.id.startsWith(prefix)).map(r => Number(r.id.split('-')[1]));
    const nextNum = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 101;
    const newId = `${prefix}${nextNum}`;

    // Compute original standard scores
    const scoreBrut = rawRisk.frequencyValue * rawRisk.impactValue;
    let scoreResiduel = scoreBrut * rawRisk.controlValue;

    if (activeTenantConfig.formula.expression === '(P * I) - M') {
      scoreResiduel = Math.max(0, scoreBrut - rawRisk.controlValue);
    }

    const newRisk: Risk = {
      ...rawRisk,
      id: newId,
      scoreBrut,
      scoreResiduel,
      createdAt: new Date().toISOString().split('T')[0],
      history: [
        {
          date: new Date().toISOString().split('T')[0],
          user: currentUser.name,
          action: 'Initiation',
          comment: `Fiche de risque initiée en tant que ${currentUser.role}.`
        }
      ]
    };

    setRisks(prev => [...prev, newRisk]);
    addAuditLog('Création Risque', `Nouveau risque enregistré : [Code ID: ${newId}] ${rawRisk.title}`);
  };

  const handleUpdateRisk = (updated: Risk) => {
    setRisks(prev => prev.map(r => r.id === updated.id ? updated : r));
    addAuditLog('Re-évaluation', `Mise à jour des critères de sévérité du risque ${updated.id}`);
  };

  const handleDeleteRisk = (id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id));
    addAuditLog('Archivage', `Retrait/Suppression définitive de la fiche de risque ${id}`);
  };

  const handleAddActionPlan = (rawPlan: Omit<ActionPlan, 'id' | 'progress'>) => {
    const newPlan: ActionPlan = {
      ...rawPlan,
      id: `a${actions.length + 1}`,
      progress: 0
    };
    setActions(prev => [...prev, newPlan]);
    addAuditLog('Planification d\'action', `Nouveau plan d'action de mitigation lié au risque ${rawPlan.riskId}`);
  };

  const handleUpdateActionPlan = (updated: ActionPlan) => {
    setActions(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const handleUpdateTenantConfig = (updatedConfig: TenantConfig) => {
    setTenants(prev => prev.map(t => t.id === updatedConfig.id ? updatedConfig : t));
    addAuditLog('Modification Paramètres', `Échelles de cotation ou périmètre révisés pour ${updatedConfig.companyName}`);
  };

  const handleAddUser = (rawUser: Omit<User, 'id'>) => {
    const newUser: User = {
      ...rawUser,
      id: `u${users.length + 1}`
    };
    setUsers(prev => [...prev, newUser]);
    addAuditLog('Nouveau membre', `Création du compte utilisateur "${rawUser.name}" [Privilèges: ${rawUser.role}]`);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog('Habilitation', `Suppression du profil de collaborateur DB ID: ${id}`);
  };

  const handleAddTenant = (name: string) => {
    const newId = `tenant_${Date.now()}`;
    const newTenant: TenantConfig = {
      // Setup identical layout to Sogesti custom
      ...SOGESTI_CONFIG,
      id: newId,
      companyName: name,
      entities: [
        { id: `${newId}_e1`, name: 'Direction Audit & Risques', type: 'Direction' },
        { id: `${newId}_e2`, name: 'Département Opérations', type: 'Département' }
      ]
    };

    setTenants(prev => [...prev, newTenant]);
    setActiveTenantId(newId);
    addAuditLog('Multi-tenant', `Initialisation d'une base de données étanche pour : ${name}`);
  };

  if (showDemo) {
    return (
      <DemoModule
        users={users}
        tenants={tenants}
        onBackToLogin={() => setShowDemo(false)}
        onSelectScenario={(user, tenantId, isSuperAdmin, initialModule) => {
          setCurrentUser(user);
          setActiveTenantId(tenantId);
          setIsSuperAdminMode(isSuperAdmin);
          setActiveModule(initialModule);
          setIsLoggedIn(true);
          setShowDemo(false);
          addAuditLog('Lancement Démo', `Lancement du scénario de démonstration pour : ${user.name} (${user.role})`);
        }}
      />
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginModule
        users={users}
        onEnterDemo={() => setShowDemo(true)}
        onLogin={(user) => {
          setCurrentUser(user);
          setIsLoggedIn(true);
          if (user.role === 'SuperAdmin') {
            setIsSuperAdminMode(true);
          } else {
            setIsSuperAdminMode(false);
            if (user.email.toLowerCase().includes('aerotech') || user.name.includes('Dieudonné') || user.id === 'u4') {
              setActiveTenantId('tenant2');
            } else {
              setActiveTenantId('tenant1');
            }
            setActiveModule('dashboard');
          }
          addAuditLog('Connexion', `Authentification réussie pour ${user.name} (${user.role}).`);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-xs select-none">
      
      {/* ODOO STYLED HEADER BAR */}
      <OdooNavbar 
        tenants={tenants}
        activeTenantId={activeTenantId}
        setActiveTenantId={setActiveTenantId}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        users={users}
        onUpdateUsers={setUsers}
        onConfigureCompany={() => {
          setAdminTab('tenants');
          setActiveModule('admin');
        }}
        activeModule={activeModule}
        setActiveModule={setActiveModule as any}
        onAddLog={addAuditLog}
        isSuperAdminMode={isSuperAdminMode}
        onToggleSuperAdminMode={setIsSuperAdminMode}
        onLogout={() => {
          setIsLoggedIn(false);
          setIsSuperAdminMode(false);
        }}
      />

      {/* MODULAR MODULES PORTAL */}
      <main className="flex-1 overflow-hidden flex flex-col bg-slate-50">
        
        {isSuperAdminMode ? (
          <SuperAdminModule
            entreprises={entreprises}
            onUpdateEntreprises={setEntreprises}
            licences={licences}
            onUpdateLicences={setLicences}
            historiqueLicences={historiqueLicences}
            onUpdateHistoriqueLicences={setHistoriqueLicences}
            tenants={tenants}
            risks={risks}
            actions={actions}
            auditLogs={auditLogs}
            fonctions={fonctions}
            users={users}
            onUpdateUsers={setUsers}
            onAddLog={addAuditLog}
            onRestoreTenantData={(tenantId, restoredData) => {
              if (tenantId === 'tenant1') {
                setRisks(prev => {
                  const filtered = prev.filter(r => !r.id.startsWith('R-1'));
                  return [...filtered, ...SOGESTI_RISKS];
                });
                addAuditLog('Restauration Système', 'Restauration complète des données Sogesti S.A. à l\'état de référence.');
              } else if (tenantId === 'tenant2') {
                setRisks(prev => {
                  const filtered = prev.filter(r => !r.id.startsWith('R-2'));
                  return [...filtered, ...AEROTECH_RISKS];
                });
                addAuditLog('Restauration Système', 'Restauration complète des données AeroTech à l\'état de référence.');
              }
            }}
          />
        ) : (
          <>
            {activeModule === 'dashboard' && (
              <DashboardModule 
                risks={activeTenantRisks}
                tenantConfig={activeTenantConfig}
                actions={actions}
              />
            )}

            {activeModule === 'risks' && (
              <RiskMappingModule 
                risks={activeTenantRisks}
                tenantConfig={activeTenantConfig}
                actions={actions}
                users={users}
                currentUser={currentUser}
                onAddRisk={handleAddRisk}
                onUpdateRisk={handleUpdateRisk}
                onDeleteRisk={handleDeleteRisk}
                onAddActionPlan={handleAddActionPlan}
                onAddLog={addAuditLog}
              />
            )}

            {activeModule === 'evaluation' && (
              <EvaluationModule 
                risks={activeTenantRisks}
                tenantConfig={activeTenantConfig}
              />
            )}

            {activeModule === 'heatmap' && (
              <MatrixModule 
                risks={activeTenantRisks}
                tenantConfig={activeTenantConfig}
                onAddLog={addAuditLog}
              />
            )}

            {activeModule === 'actions' && (
              <ActionsModule 
                actions={actions}
                risks={activeTenantRisks}
                tenantConfig={activeTenantConfig}
                users={users}
                onAddActionPlan={handleAddActionPlan}
                onUpdateActionPlan={handleUpdateActionPlan}
                onAddLog={addAuditLog}
              />
            )}

            {activeModule === 'config' && (
              <ConfigModule 
                tenantConfig={activeTenantConfig}
                onUpdateTenantConfig={handleUpdateTenantConfig}
                fonctions={fonctions}
                onUpdateFonctions={setFonctions}
                affectations={affectations}
                onUpdateAffectations={setAffectations}
                rules={rules}
                onUpdateRules={setRules}
                accessProfiles={accessProfiles}
                onUpdateAccessProfiles={setAccessProfiles}
                users={users}
                onAddLog={addAuditLog}
              />
            )}

            {activeModule === 'audit' && (
              <AuditModule 
                missions={auditMissions}
                findings={auditFindings}
                fonctions={fonctions}
                users={users}
                currentUser={currentUser}
                onAddMission={(newMission) => {
                  setAuditMissions(prev => [...prev, { ...newMission, id: `m_${Date.now()}` }]);
                }}
                onAddFinding={(newFinding) => {
                  setAuditFindings(prev => [...prev, { ...newFinding, id: `f_${Date.now()}` }]);
                }}
                onUpdateFindingStatus={(id, status) => {
                  setAuditFindings(prev => prev.map(f => f.id === id ? { ...f, statut: status } : f));
                }}
                onAddLog={addAuditLog}
              />
            )}

            {activeModule === 'compliance' && (
              <ComplianceModule 
                frameworks={complianceFrameworks}
                obligations={complianceObligations}
                incidents={complianceIncidents}
                fonctions={fonctions}
                onAddFramework={(newFw) => {
                  setComplianceFrameworks(prev => [...prev, { ...newFw, id: `cf_${Date.now()}` }]);
                }}
                onAddObligation={(newOb) => {
                  setComplianceObligations(prev => [...prev, { ...newOb, id: `co_${Date.now()}` }]);
                }}
                onUpdateObligationStatus={(id, status) => {
                  setComplianceObligations(prev => prev.map(ob => ob.id === id ? { ...ob, statut: status } : ob));
                }}
                onAddIncident={(newInc) => {
                  setComplianceIncidents(prev => [...prev, { ...newInc, id: `inc_${Date.now()}` }]);
                }}
                onUpdateIncidentStatus={(id, status) => {
                  setComplianceIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, statutDeclaration: status } : inc));
                }}
                onAddLog={addAuditLog}
              />
            )}

            {activeModule === 'admin' && (
              <AdminModule 
                users={users}
                onAddUser={handleAddUser}
                onDeleteUser={handleDeleteUser}
                tenants={tenants}
                onAddTenant={handleAddTenant}
                auditLogs={auditLogs}
                activeTenantId={activeTenantId}
                initialTab={adminTab}
              />
            )}

            {activeModule === 'reporting' && (
              <ReportingModule 
                risks={activeTenantRisks}
                tenantConfig={activeTenantConfig}
                actions={actions}
                onAddLog={addAuditLog}
              />
            )}
          </>
        )}

      </main>
    </div>
  );
}
