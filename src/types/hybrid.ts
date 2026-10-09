export type HybridAuthMethod = 'phs' | 'pta' | 'adfs';

export interface HybridAuthMethodDetail {
  id: HybridAuthMethod;
  name: string;
  nameJa: string;
  infrastructureRequirement: string;
  offlineCloudLogin: boolean; // クラウド単独で認証可能か (オンプレ障害時)
  supportsLeakedCredentials: boolean; // 侵害された資格情報の検知が可能か
  onPremPasswordPolicyEnforcement: 'delayed' | 'realtime'; // オンプレミスパスワードポリシーの即時適用
  seamlessSsoSupport: boolean;
  stepFlow: string[];
  examSummary: string;
}

export interface SyncRuleItem {
  id: string;
  name: string;
  direction: 'Inbound' | 'Outbound';
  precedence: number; // 優先順位 (小さい数字が優先: 1〜99は既定、100+がカスタム推奨)
  connectedSystem: string;
  sourceAttribute: string;
  targetAttribute: string;
  transformationType: 'Direct' | 'Expression';
  expression?: string;
  description: string;
}

export interface SsprWritebackSimulation {
  userInitiated: boolean;
  cloudPasswordChanged: boolean;
  aadcAgentPickUp: boolean;
  onPremAdUpdated: boolean;
  error?: string;
}

export interface ConditionalAccessSessionDetail {
  devicePlatform: 'windows' | 'mac' | 'ios' | 'android' | 'linux';
  clientAppType: 'browser' | 'modern-app' | 'legacy-auth';
  persistentBrowserSession: 'always' | 'never' | 'default';
  signInFrequencyHours: number; // e.g. 8 hours
  userRiskLevel: 'low' | 'medium' | 'high';
  signInRiskLevel: 'low' | 'medium' | 'high';
}
