export type PurviewDomain = 
  | 'hybrid-id'
  | 'entra-roles'
  | 'entra-licenses'
  | 'entra-auth'
  | 'entra-mgmt'
  | 'azure-rbac-pim'
  | 'azure-network-nsg'
  | 'azure-appgw-firewall'
  | 'azure-host-sec'
  | 'azure-endpoint-mgmt'
  | 'azure-container-sec'
  | 'azure-aks-k8s'
  | 'azure-monitor-sentinel'
  | 'sensitivity' 
  | 'dlp' 
  | 'retention' 
  | 'insider-risk' 
  | 'adaptive-scope' 
  | 'exam-quiz' 
  | 'cheatsheet';

export interface SensitiveInformationType {
  id: string;
  name: string;
  nameJa: string;
  category: 'financial' | 'personal' | 'credentials' | 'custom' | 'edm';
  description: string;
  defaultConfidence: number; // e.g. 85
  patterns: {
    regex: string;
    supportingKeywords: string[];
    proximity: number; // default 300 characters
  };
}

export interface SensitivityLabel {
  id: string;
  name: string;
  displayName: string;
  color: string;
  priority: number; // 0 is lowest, 5 is highest
  parentId?: string;
  encryption: {
    enabled: boolean;
    type: 'rms' | 'dke' | 'none';
    rights: 'co-author' | 'reviewer' | 'viewer' | 'custom';
    offlineAccessDays?: number;
    allowExternalSharing: boolean;
  };
  visualMarking: {
    header?: string;
    footer?: string;
    watermark?: string;
  };
  autoLabeling: {
    enabled: boolean;
    conditionSITs: { sitId: string; minCount: number; minConfidence: number }[];
    mode: 'recommend' | 'auto';
    justificationText?: string;
  };
}

export interface DlpPolicyRule {
  id: string;
  name: string;
  locations: {
    exchange: boolean;
    sharepoint: boolean;
    onedrive: boolean;
    teams: boolean;
    endpoints: boolean;
    cloudApps: boolean;
  };
  conditions: {
    sitId: string;
    minCount: number;
    isExternal: boolean;
  };
  actions: {
    blockAccess: boolean;
    allowOverride: boolean;
    requireJustification: boolean;
    notifyUser: boolean;
    policyTip: string;
    generateIncidentAlert: boolean;
    alertSeverity: 'Low' | 'Medium' | 'High';
  };
  endpointRestrictions: {
    usbCopy: 'allow' | 'audit' | 'block' | 'block-with-override';
    clipboard: 'allow' | 'audit' | 'block';
    unallowedBrowsers: 'allow' | 'audit' | 'block';
    printing: 'allow' | 'audit' | 'block';
  };
  mode: 'test-no-notif' | 'test-with-notif' | 'enforce';
}

export interface RetentionPolicyItem {
  id: string;
  name: string;
  type: 'policy' | 'label';
  scopeType: 'org-wide' | 'site-specific' | 'adaptive';
  retentionYears: number | 'infinite';
  actionAfterRetention: 'delete' | 'nothing';
  retentionTrigger: 'created-date' | 'modified-date' | 'labeled-date' | 'event';
  isRecord: boolean; // Regulatory Record or Standard Record
  isRegulatoryRecord: boolean;
}

export interface ExamQuestion {
  id: string;
  domain: 'sensitivity' | 'dlp' | 'retention' | 'insider-risk' | 'governance';
  difficulty: 'Basic' | 'Intermediate' | 'Scenario';
  title: string;
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
  }[];
  correctOptionId: string;
  explanation: string;
  keyExamConcept: string;
  relatedLab: PurviewDomain;
  licenseRequirement?: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  department: string;
  country: string;
  jobTitle: string;
  riskScore: number;
  tags: string[];
}
