export interface AzureRbacRole {
  id: string;
  name: string;
  nameJa: string;
  type: 'built-in' | 'custom';
  description: string;
  assignableScopes: string[];
  actions: string[];
  notActions: string[];
  dataActions?: string[];
  notDataActions?: string[];
  examTips: string;
}

export interface AzureResourceNode {
  id: string;
  name: string;
  type: 'management-group' | 'subscription' | 'resource-group' | 'resource';
  parentId?: string;
  lock?: 'ReadOnly' | 'CanNotDelete' | 'None';
  policyInherited?: string;
  assignedRoles: { principal: string; roleId: string; isPimEligible?: boolean }[];
}

export interface NsgRule {
  id: string;
  name: string;
  priority: number; // 100 - 4096 (custom), 65000 - 65500 (default)
  direction: 'Inbound' | 'Outbound';
  access: 'Allow' | 'Deny';
  protocol: 'TCP' | 'UDP' | 'ICMP' | 'Any';
  sourceType: 'Any' | 'IP Addresses' | 'Service Tag' | 'Application Security Group';
  sourceAddressPrefix: string; // e.g. 'Internet', 'VirtualNetwork', '10.0.0.0/24', 'AzureLoadBalancer', 'ASG-WebServers'
  sourcePortRange: string;
  destinationType: 'Any' | 'IP Addresses' | 'Service Tag' | 'Application Security Group';
  destinationAddressPrefix: string;
  destinationPortRange: string; // e.g. '80', '443', '3389', '22', '*'
  isDefault?: boolean;
  description: string;
}

export interface SimulatedPacket {
  direction: 'Inbound' | 'Outbound';
  sourceIP: string;
  sourceType: 'Any' | 'IP Addresses' | 'Service Tag' | 'Application Security Group';
  destPort: number;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  attachedSubnetNsg: boolean;
  attachedNicNsg: boolean;
}

export interface AppGatewayPathRule {
  pathPattern: string; // e.g. '/api/*', '/images/*'
  backendPool: string;
  wafAction: 'Allow' | 'Block';
  healthProbe: 'Healthy' | 'Unhealthy';
}

export interface PawDeviceConfig {
  deviceType: 'enterprise' | 'privileged-paw' | 'specialized';
  nameJa: string;
  targetRole: string;
  hardwareSecurity: string; // TPM 2.0, Secure Boot, HVCI
  networkAccess: string;
  internetBrowsingAllowed: boolean;
  examHighlight: string;
  features: {
    tpm20: boolean;
    secureBoot: boolean;
    hvciMemoryIntegrity: boolean;
    wdacApplicationControl: boolean;
    directInternetBrowsing: boolean;
    emailClientAllowed: boolean;
    intuneManaged: boolean;
  };
}

export interface DefenderAlert {
  id: string;
  resourceType: 'ACR' | 'SQL' | 'VM' | 'AWS' | 'HybridArc';
  resourceName: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low';
  description: string;
  mitigation: string;
  examConcept: string;
}

export interface PimAssignment {
  id: string;
  principalName: string;
  scopeType: 'Azure AD Role' | 'Azure Resource Role';
  scopeName: string;
  roleName: string;
  state: 'eligible' | 'active';
  requiresMfa: boolean;
  requiresJustification: boolean;
  requiresApproval: boolean;
  maxDurationHours: number;
}

export interface ContainerPlatformInfo {
  id: string;
  name: string;
  nameJa: string;
  category: 'serverless' | 'orchestration' | 'app-service' | 'specialized';
  idealUseCases: string;
  startupTime: string;
  scalingModel: string;
  managementOverhead: 'Low (サーバーレス)' | 'Medium (PaaS)' | 'High (マネージドK8s)';
  securityIsolation: string;
  examHighlight: string;
}

export interface AcrSkuInfo {
  sku: 'Basic' | 'Standard' | 'Premium';
  storageLimitGb: number;
  webhooks: number;
  readOpsPerMin: number;
  writeOpsPerMin: number;
  geoReplication: boolean;
  zoneRedundancy: boolean;
  privateLinkSupport: boolean;
  contentTrustSupport: boolean;
  customerManagedKey: boolean;
  recommendation: string;
}

export interface AciDeploymentConfig {
  containerGroupName: string;
  osType: 'Linux' | 'Windows';
  cpuCores: number;
  memoryGb: number;
  restartPolicy: 'Always' | 'OnFailure' | 'Never';
  ipAddressType: 'Public' | 'Private (VNet委任)';
  dnsNameLabel: string;
  port: number;
  imageRegistry: 'Docker Hub (Public)' | 'Azure Container Registry (Private)';
  imageName: string;
  managedIdentity: boolean;
  secureEnvironmentVariables: boolean;
}

export interface EndpointMgmtTopic {
  id: string;
  title: string;
  titleJa: string;
  category: 'autopilot' | 'comanagement' | 'bastion' | 'update-dsc' | 'ade';
  summary: string;
  examKeyPoints: string[];
}

export interface AksComponent {
  id: string;
  name: string;
  nameJa: string;
  plane: 'control-plane' | 'worker-node';
  azureManaged: boolean;
  description: string;
  responsibilities: string[];
  keyExamPoints: string[];
}

export interface AksServiceTypeInfo {
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  nameJa: string;
  description: string;
  accessibility: 'クラスター内限定' | 'ノードIP:Port経由' | '外部インターネット/社内VNet';
  portRange: string;
  allocatedIp: string;
  azureLoadBalancerProvisioned: boolean;
  yamlSnippet: string;
  packetPath: string[];
  examTips: string;
}

export interface AksStorageTypeInfo {
  id: string;
  name: string;
  storageBackend: 'Azure Managed Disk' | 'Azure Files' | 'Azure Blob Storage';
  accessModes: ('ReadWriteOnce' | 'ReadWriteMany' | 'ReadOnlyMany')[];
  performance: string;
  multiNodeShareable: boolean;
  provisioner: string;
  recommendedUse: string;
  examNote: string;
}

export interface AksRbacRule {
  id: string;
  roleName: string;
  roleKind: 'Role' | 'ClusterRole';
  targetNamespace?: string;
  bindingKind: 'RoleBinding' | 'ClusterRoleBinding';
  boundSubject: string;
  subjectType: 'User' | 'Group' | 'ServiceAccount';
  allowedResources: string[];
  allowedVerbs: string[];
  scopeDescription: string;
}

export interface MonitorAgentInfo {
  id: string;
  name: string;
  nameJa: string;
  status: '新標準 (推奨)' | 'レガシー (非推奨/廃止)' | '特殊用途';
  osSupported: 'Windows & Linux' | 'Windows のみ' | 'Linux のみ';
  architecture: string;
  configurationModel: 'データ収集ルール (DCR)' | 'ワークスペースID & キー' | 'ストレージアカウント接続文字列';
  keyExamPoints: string[];
}

export interface LogTypeComparison {
  id: string;
  name: string;
  nameJa: string;
  scope: 'テナント (Tenant)' | 'サブスクリプション (Subscription)' | 'リソース (Resource)' | 'ゲストOS (OS/Guest)';
  description: string;
  destination: string;
  setupLocation: string;
  examples: string[];
}

export interface KqlQueryTemplate {
  id: string;
  title: string;
  category: 'セキュリティインシデント' | '不審なサインイン' | 'リソース監査' | 'パフォーマンス';
  query: string;
  explanation: string;
  sampleColumns: string[];
  sampleRows: (string | number)[][];
}

export interface MitreTacticItem {
  id: string;
  tacticNumber: string;
  name: string;
  nameJa: string;
  description: string;
  techniques: string[];
  sentinelAnalyticsType: 'Scheduled (KQL)' | 'NRT (Near Real-Time)' | 'Fusion (ML)' | 'Anomaly';
}

export interface SentinelIncidentSimulation {
  id: string;
  title: string;
  severity: 'High' | 'Medium' | 'Low' | 'Informational';
  status: '新規 (New)' | 'アクティブ (Active)' | '解決済み (Closed)';
  tactics: string[];
  source: 'Microsoft Entra ID Protection' | 'Defender for Cloud' | 'CEF / Syslog' | 'Scheduled KQL Rule';
  entities: { type: 'IP' | 'User' | 'Host' | 'Process'; value: string }[];
  alertCount: number;
  description: string;
  automatedPlaybook: string;
}

export interface JitVmRequestState {
  vmName: string;
  protocol: 'RDP' | 'SSH';
  port: number;
  sourceIp: string;
  durationHours: number;
  approved: boolean;
  expiresInMinutes: number;
  nsgRuleApplied: boolean;
}

