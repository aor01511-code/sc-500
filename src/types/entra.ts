export type EntraDomain =
  | 'roles-matrix'
  | 'licenses-tier'
  | 'conditional-access'
  | 'identity-protection'
  | 'pim'
  | 'auth-methods'
  | 'identity-management'
  | 'entra-quiz';

export interface EntraRole {
  id: string;
  name: string;
  nameJa: string;
  category: 'Tier 0 (最高特権)' | 'Tier 1 (アイデンティティ・セキュリティ)' | 'Tier 2 (運用・ヘルプデスク)';
  tierLevel: 0 | 1 | 2;
  description: string;
  canResetPasswordFor: ('non-admin' | 'helpdesk-admin' | 'user-admin' | 'all-admins')[];
  keyPermissions: string[];
  cannotDo: string[];
  examTips: string;
}

export type EntraLicenseTier = 'free' | 'p1' | 'p2';

export interface LicenseFeature {
  id: string;
  name: string;
  category: string;
  description: string;
  minLicense: EntraLicenseTier;
  examHighlight: string;
}

export interface ConditionalAccessRule {
  id: string;
  name: string;
  state: 'enabled' | 'report-only' | 'disabled';
  users: {
    include: string[]; // 'all' | 'guests' | 'specific'
    exclude: string[]; // e.g. 'break-glass-emergency-account'
  };
  cloudApps: {
    include: string[]; // 'all' | 'office365' | 'salesforce'
  };
  conditions: {
    devicePlatforms: string[]; // 'windows' | 'mac' | 'ios' | 'android'
    locations: 'any' | 'trusted' | 'untrusted';
    clientApps: ('browser' | 'mobile-desktop' | 'legacy-auth')[];
    signInRisk: 'none' | 'low' | 'medium' | 'high';
    userRisk: 'none' | 'low' | 'medium' | 'high';
  };
  grantControls: {
    operator: 'AND' | 'OR';
    requireMfa: boolean;
    requireCompliantDevice: boolean;
    requireHybridJoined: boolean;
    blockAccess: boolean;
  };
}

export interface PimRoleAssignment {
  id: string;
  roleId: string;
  roleName: string;
  principalName: string;
  assignmentType: 'eligible' | 'active'; // 適格 (Eligible) vs アクティブ (Active)
  requiresApproval: boolean;
  requiresMfa: boolean;
  maxDurationHours: number;
  approverRole: string;
}

export interface ManagedIdentityScenario {
  id: string;
  type: 'system-assigned' | 'user-assigned';
  nameJa: string;
  resourceType: string;
  lifecycle: string;
  sharingScope: string;
  credentialStorage: string;
  recommendation: string;
}

export interface DynamicDeviceRule {
  id: string;
  name: string;
  target: 'device' | 'user';
  query: string;
  description: string;
  matchedCount: number;
}
