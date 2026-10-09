import { 
  AzureRbacRole, 
  AzureResourceNode, 
  NsgRule, 
  PawDeviceConfig, 
  DefenderAlert,
  PimAssignment,
  AppGatewayPathRule,
  ContainerPlatformInfo,
  AcrSkuInfo,
  EndpointMgmtTopic,
  AksComponent,
  AksServiceTypeInfo,
  AksStorageTypeInfo,
  AksRbacRule,
  MonitorAgentInfo,
  LogTypeComparison,
  KqlQueryTemplate,
  MitreTacticItem,
  SentinelIncidentSimulation,
  JitVmRequestState
} from '../types/azureSec';

export const AZURE_RBAC_ROLES: AzureRbacRole[] = [
  {
    id: 'owner',
    name: 'Owner',
    nameJa: '所有者 (Owner)',
    type: 'built-in',
    description: '他のユーザーへのアクセス権の委任 (ロール割り当て) を含む、すべてのリソースへのフルアクセス権を持つ。',
    assignableScopes: ['/'],
    actions: ['*'],
    notActions: [],
    dataActions: ['*'],
    notDataActions: [],
    examTips: 'リソースの管理だけでなく「ロール割り当て (Microsoft.Authorization/roleAssignments/*)」ができる点が共同作成者との決定的な違い。',
  },
  {
    id: 'contributor',
    name: 'Contributor',
    nameJa: '共同作成者 (Contributor)',
    type: 'built-in',
    description: 'すべての種類のリソースを作成および管理できるが、他のユーザーにロールを割り当てることはできない。',
    assignableScopes: ['/'],
    actions: ['*'],
    notActions: [
      'Microsoft.Authorization/*/Delete',
      'Microsoft.Authorization/*/Write',
      'Microsoft.Authorization/elevateAccess/Action',
    ],
    examTips: '【超頻出】「リソースの作成・削除はさせたいが、アクセス権の変更は禁止したい」場合の標準ロール。',
  },
  {
    id: 'reader',
    name: 'Reader',
    nameJa: '閲覧者 (Reader)',
    type: 'built-in',
    description: 'すべてのリソースの表示および設定内容の参照が可能だが、変更・作成・削除は一切行えない。',
    assignableScopes: ['/'],
    actions: ['*/read'],
    notActions: [],
    examTips: '監査担当者やモニタリング担当者向けの最小特権ロール。',
  },
  {
    id: 'user-access-admin',
    name: 'User Access Administrator',
    nameJa: 'ユーザーアクセス管理者',
    type: 'built-in',
    description: 'Azureリソースへのユーザーアクセスの管理 (ロール割り当て) のみに特化したロール。リソース自体の作成・削除は行えない。',
    assignableScopes: ['/'],
    actions: ['Microsoft.Authorization/*'],
    notActions: [],
    examTips: 'リソースの運用はさせず「セキュリティ担当者にロール付与権限だけを与えたい」場合の正解ロール。',
  },
  {
    id: 'custom-vm-operator',
    name: 'Virtual Machine Operator (カスタムロール)',
    nameJa: '仮想マシン運用担当者 (カスタム)',
    type: 'custom',
    description: '仮想マシンの状態監視、起動、再起動のみを許可し、VMの削除やサイズ変更は拒否する最小特権カスタムロール。',
    assignableScopes: ['/subscriptions/sub-prod-01'],
    actions: [
      'Microsoft.Compute/virtualMachines/read',
      'Microsoft.Compute/virtualMachines/start/action',
      'Microsoft.Compute/virtualMachines/restart/action',
    ],
    notActions: [
      'Microsoft.Compute/virtualMachines/delete',
    ],
    examTips: 'カスタムロールはJSONで定義。NotActionsは「Actionsの許可集合から指定アクションを引き算する」動作をする。DenyRuleではない。',
  },
];

export const INITIAL_RESOURCE_TREE: AzureResourceNode[] = [
  {
    id: 'mg-root',
    name: 'テナントルート管理グループ (Tenant Root Group)',
    type: 'management-group',
    policyInherited: '全社セキュリティベースライン (イニシアチブ定義)',
    assignedRoles: [{ principal: 'セキュリティ統括部', roleId: 'reader' }],
  },
  {
    id: 'mg-corp',
    name: '企業基盤管理グループ (MG-Corp-Production)',
    type: 'management-group',
    parentId: 'mg-root',
    policyInherited: '指定リージョンのみ許可ポリシー (Japan East / West)',
    assignedRoles: [{ principal: 'クラウド推進課', roleId: 'reader' }],
  },
  {
    id: 'sub-prod',
    name: '本番環境サブスクリプション (Sub-Production-01)',
    type: 'subscription',
    parentId: 'mg-corp',
    lock: 'None',
    assignedRoles: [
      { principal: 'クラウドインフラ運用班', roleId: 'contributor', isPimEligible: true },
    ],
  },
  {
    id: 'rg-web',
    name: 'Web基盤リソースグループ (RG-WebApps-Prod)',
    type: 'resource-group',
    parentId: 'sub-prod',
    lock: 'CanNotDelete', // 削除不可ロック
    assignedRoles: [
      { principal: 'Web開発チーム', roleId: 'contributor' },
    ],
  },
  {
    id: 'vm-frontend',
    name: 'フロントエンドVM (VM-Prod-Front01)',
    type: 'resource',
    parentId: 'rg-web',
    lock: 'CanNotDelete', // 親RGから継承
    assignedRoles: [],
  },
  {
    id: 'rg-db',
    name: '基幹データベースRG (RG-Database-Prod)',
    type: 'resource-group',
    parentId: 'sub-prod',
    lock: 'ReadOnly', // 読み取り専用ロック
    assignedRoles: [
      { principal: 'DBAチーム', roleId: 'contributor' },
    ],
  },
  {
    id: 'sql-prod',
    name: 'Azure SQL Database (SQL-Master-Prod)',
    type: 'resource',
    parentId: 'rg-db',
    lock: 'ReadOnly', // 親RGから継承
    assignedRoles: [],
  },
];

export const PIM_ASSIGNMENTS_PRESET: PimAssignment[] = [
  {
    id: 'pim-1',
    principalName: 'tanaka.infra@company.com (田中)',
    scopeType: 'Azure Resource Role',
    scopeName: 'Sub-Production-01 (サブスクリプション)',
    roleName: '所有者 (Owner)',
    state: 'eligible',
    requiresMfa: true,
    requiresJustification: true,
    requiresApproval: true,
    maxDurationHours: 4,
  },
  {
    id: 'pim-2',
    principalName: 'sato.sec@company.com (佐藤)',
    scopeType: 'Azure AD Role',
    scopeName: 'Entra ID テナント全体',
    roleName: '特権ロール管理者 (Privileged Role Admin)',
    state: 'eligible',
    requiresMfa: true,
    requiresJustification: true,
    requiresApproval: false,
    maxDurationHours: 2,
  },
  {
    id: 'pim-3',
    principalName: 'suzuki.dev@company.com (鈴木)',
    scopeType: 'Azure Resource Role',
    scopeName: 'RG-WebApps-Prod (リソースグループ)',
    roleName: '共同作成者 (Contributor)',
    state: 'active',
    requiresMfa: true,
    requiresJustification: true,
    requiresApproval: false,
    maxDurationHours: 8,
  },
];

export const NSG_RULES_PRESET: NsgRule[] = [
  {
    id: 'nsg-allow-https',
    name: 'Allow-HTTPS-Inbound',
    priority: 100,
    direction: 'Inbound',
    access: 'Allow',
    protocol: 'TCP',
    sourceType: 'Service Tag',
    sourceAddressPrefix: 'Internet',
    sourcePortRange: '*',
    destinationType: 'Application Security Group',
    destinationAddressPrefix: 'ASG-WebServers',
    destinationPortRange: '443',
    description: 'インターネットからのWeb HTTPS (443) 通信をWebサーバーASG宛てに許可。',
  },
  {
    id: 'nsg-allow-bastion-ssh',
    name: 'Allow-SSH-From-Bastion',
    priority: 200,
    direction: 'Inbound',
    access: 'Allow',
    protocol: 'TCP',
    sourceType: 'IP Addresses',
    sourceAddressPrefix: '10.0.1.0/24', // Bastion Subnet
    sourcePortRange: '*',
    destinationType: 'Any',
    destinationAddressPrefix: '*',
    destinationPortRange: '22',
    description: 'Azure Bastion管理サブネットからのみSSH管理アクセスを許可。',
  },
  {
    id: 'nsg-deny-rdp-internet',
    name: 'Deny-RDP-From-Internet',
    priority: 300,
    direction: 'Inbound',
    access: 'Deny',
    protocol: 'TCP',
    sourceType: 'Service Tag',
    sourceAddressPrefix: 'Internet',
    sourcePortRange: '*',
    destinationType: 'Any',
    destinationAddressPrefix: '*',
    destinationPortRange: '3389',
    description: '【重要】インターネットから直接のRDP接続を明示的に遮断。',
  },
  {
    id: 'nsg-allow-asg-db',
    name: 'Allow-App-To-DB-ASG',
    priority: 400,
    direction: 'Inbound',
    access: 'Allow',
    protocol: 'TCP',
    sourceType: 'Application Security Group',
    sourceAddressPrefix: 'ASG-WebServers',
    sourcePortRange: '*',
    destinationType: 'Application Security Group',
    destinationAddressPrefix: 'ASG-DbServers',
    destinationPortRange: '1433',
    description: 'Web層ASGからDB層ASGへのSQL通信のみを許可 (内部東西トラフィック制御)。',
  },
  {
    id: 'nsg-def-vnet',
    name: 'AllowVnetInBound',
    priority: 65000,
    direction: 'Inbound',
    access: 'Allow',
    protocol: 'Any',
    sourceType: 'Service Tag',
    sourceAddressPrefix: 'VirtualNetwork',
    sourcePortRange: '*',
    destinationType: 'Service Tag',
    destinationAddressPrefix: 'VirtualNetwork',
    destinationPortRange: '*',
    isDefault: true,
    description: '【既定の規則】同一VNetおよびピアリング先VNet内の全通信を許可。',
  },
  {
    id: 'nsg-def-lb',
    name: 'AllowAzureLoadBalancerInBound',
    priority: 65001,
    direction: 'Inbound',
    access: 'Allow',
    protocol: 'Any',
    sourceType: 'Service Tag',
    sourceAddressPrefix: 'AzureLoadBalancer',
    sourcePortRange: '*',
    destinationType: 'Any',
    destinationAddressPrefix: '*',
    destinationPortRange: '*',
    isDefault: true,
    description: '【既定の規則】Azureロードバランサーのヘルスプローブ通信を許可。',
  },
  {
    id: 'nsg-def-denyall',
    name: 'DenyAllInBound',
    priority: 65500,
    direction: 'Inbound',
    access: 'Deny',
    protocol: 'Any',
    sourceType: 'Any',
    sourceAddressPrefix: '*',
    sourcePortRange: '*',
    destinationType: 'Any',
    destinationAddressPrefix: '*',
    destinationPortRange: '*',
    isDefault: true,
    description: '【既定の規則】上記に合致しなかったすべてのインバウンド通信を破棄。',
  },
];

export const APP_GATEWAY_PATHS: AppGatewayPathRule[] = [
  {
    pathPattern: '/api/*',
    backendPool: 'Backend-Pool-Microservices (AKS クラスター)',
    wafAction: 'Allow',
    healthProbe: 'Healthy',
  },
  {
    pathPattern: '/images/*',
    backendPool: 'Backend-Pool-StaticMedia (Azure Storage / CDN)',
    wafAction: 'Allow',
    healthProbe: 'Healthy',
  },
  {
    pathPattern: '/admin/*',
    backendPool: 'Backend-Pool-AdminPortal (内部IP制限プール)',
    wafAction: 'Block', // WAF SQLi/XSS 検知時ブロック
    healthProbe: 'Healthy',
  },
];

export const DEFENDER_ALERTS: DefenderAlert[] = [
  {
    id: 'alert-acr-cve',
    resourceType: 'ACR',
    resourceName: 'acrproduction01.azurecr.io/webfrontend:v1.4',
    title: 'コンテナイメージ内に重大なCVE脆弱性 (Log4Shell / OpenSSL) を検出',
    severity: 'High',
    description: 'Defender for Containers (ACRレジストリスキャン) がプッシュされたコンテナイメージ内のベースOSおよびライブラリを検査し、既知の脆弱性を検知しました。',
    mitigation: '修正済みベースイメージにリビルドし、CI/CDパイプラインで自動スキャンをブロックゲートとして設定。',
    examConcept: 'Defender for Containers / ACR脆弱性スキャン (エージェントレススキャン)',
  },
  {
    id: 'alert-sql-injection',
    resourceType: 'SQL',
    resourceName: 'sql-prod-db01.database.windows.net / SalesDB',
    title: 'SQLインジェクションの試行および異常なデータベースアクセスを検知',
    severity: 'High',
    description: 'Defender for SQL (Advanced Threat Protection) が異常なクエリ構文および通常のアクセスベースラインから逸脱したデータ抽出パターンを検出しました。',
    mitigation: 'WAFのSQLインジェクション防御ルールをPreventionモードにし、脆弱なクエリをパラメータ化。',
    examConcept: 'Defender for SQL (脆弱性評価 VA + 高度な脅威保護 ATP)',
  },
  {
    id: 'alert-multicloud-s3',
    resourceType: 'AWS',
    resourceName: 'aws-account-prod-7890 / S3-AuditBucket',
    title: 'マルチクラウド CSPM: AWS S3バケットがパブリック公開設定になっています',
    severity: 'High',
    description: 'Defender for Cloud マルチクラウドコネクタがAWSアカウントを継続スキャンし、CIS AWSベンチマーク違反を検出。',
    mitigation: 'Defender for Cloud から「修復 (Fix)」をクリックし、AWS S3 Public Access Block を自動適用。',
    examConcept: 'Defender for Cloud マルチクラウド (AWS / GCP) CSPM 統合管理',
  },
  {
    id: 'alert-hybrid-arc',
    resourceType: 'HybridArc',
    resourceName: 'onprem-srv-dc01 (Azure Arc 対応サーバー)',
    title: 'ハイブリッド環境: オンプレミスサーバーのセキュリティパッチが未適用',
    severity: 'Medium',
    description: 'Azure Arc 経由で接続されたオンプレミスのWindows Serverに対して、Microsoft Cloud Security Benchmark (MCSB) 基準の未適用パッチを検出。',
    mitigation: 'Azure Update Manager からスケジュール更新を配信しパッチ適用。',
    examConcept: 'Azure Arc によるハイブリッドサーバーの Defender for Cloud 統合管理',
  },
];

export const PAW_CONFIGS: PawDeviceConfig[] = [
  {
    deviceType: 'privileged-paw',
    nameJa: '特権アクセスワークステーション (PAW: Tier 0/1)',
    targetRole: 'グローバル管理者、クラウドインフラ管理者、セキュリティ運用者',
    hardwareSecurity: 'TPM 2.0 必須、セキュアブート、HVCI (ハイパーバイザー保護コード整合性)、BitLocker',
    networkAccess: '専用管理VNetおよびAzure管理プレーンのみ。一般インターネット閲覧・メール送受信は完全ブロック！',
    internetBrowsingAllowed: false,
    examHighlight: '【セキュリティ最高峰】フィッシングやWebマルウェアによる管理者セッション乗っ取りを物理的・OSレベルで遮断する専用端末戦略。',
    features: {
      tpm20: true,
      secureBoot: true,
      hvciMemoryIntegrity: true,
      wdacApplicationControl: true,
      directInternetBrowsing: false,
      emailClientAllowed: false,
      intuneManaged: true,
    },
  },
  {
    deviceType: 'enterprise',
    nameJa: 'エンタープライズデバイス (一般社員PC)',
    targetRole: '一般社員、営業、バックオフィス業務',
    hardwareSecurity: 'TPM 2.0、BitLocker暗号化、Intuneコンプライアンスベースライン',
    networkAccess: '企業プロキシ・EDR監視下での一般Webアクセスおよびメール利用可能',
    internetBrowsingAllowed: true,
    examHighlight: 'MEM (Microsoft Endpoint Manager / Intune) による構成管理とMAM(モバイルアプリ保護)で保護。',
    features: {
      tpm20: true,
      secureBoot: true,
      hvciMemoryIntegrity: false,
      wdacApplicationControl: false,
      directInternetBrowsing: true,
      emailClientAllowed: true,
      intuneManaged: true,
    },
  },
  {
    deviceType: 'specialized',
    nameJa: '特殊デバイス (Specialized Device)',
    targetRole: '金融取引端末、開発者ワークステーション、SCADA/OT制御',
    hardwareSecurity: 'TPM 2.0、アプリケーション制御 (WDAC / AppLocker)、USBポート物理制限',
    networkAccess: '特定業務サーバーおよび開発リポジトリへの閉域アクセス',
    internetBrowsingAllowed: false,
    examHighlight: '特定業務専用のキオスクまたは厳格なホワイトリスト制御を実施。',
    features: {
      tpm20: true,
      secureBoot: true,
      hvciMemoryIntegrity: true,
      wdacApplicationControl: true,
      directInternetBrowsing: false,
      emailClientAllowed: false,
      intuneManaged: true,
    },
  },
];

export const CONTAINER_PLATFORMS: ContainerPlatformInfo[] = [
  {
    id: 'aci',
    name: 'Azure Container Instances (ACI)',
    nameJa: 'Azure Container Instances (ACI)',
    category: 'serverless',
    idealUseCases: 'バッチ処理、突発的な軽量タスク、CI/CDビルドエージェント、高速起動テスト',
    startupTime: '秒単位 (数秒〜十数秒)',
    scalingModel: '手動またはAPIによる個別インスタンス作成 (オーケストレーションなし)',
    managementOverhead: 'Low (サーバーレス)',
    securityIsolation: 'ハイパーバイザーレベルのVM分離 (コンテナグループ単位)',
    examHighlight: '【超頻出】クラスタ管理不要で単一・複数コンテナを即座に立ち上げるサーバーレス実行基盤。秒単位課金。',
  },
  {
    id: 'aks',
    name: 'Azure Kubernetes Service (AKS)',
    nameJa: 'Azure Kubernetes Service (AKS)',
    category: 'orchestration',
    idealUseCases: '大規模マイクロサービス、複雑なサービスメッシュ、ステートフルワークロード、マルチコンテナ連携',
    startupTime: '分単位 (ノード起動を含む)',
    scalingModel: 'HPA (Horizontal Pod Autoscaler) & クラスタオートスケーラー',
    managementOverhead: 'High (マネージドK8s)',
    securityIsolation: 'Kubernetes RBAC、ネットワークポリシー (Calico/Azure)、Azure CNI、Podサンドボックス',
    examHighlight: 'エンタープライズ本番環境のデファクトスタンダード。フルマネージドKubernetes。',
  },
  {
    id: 'aca',
    name: 'Azure Container Apps (ACA)',
    nameJa: 'Azure Container Apps (ACA)',
    category: 'serverless',
    idealUseCases: 'マイクロサービス、Web API、バックグラウンド処理、イベント駆動型ワークロード',
    startupTime: '数秒 (KEDAによるゼロスケール対応)',
    scalingModel: 'KEDA (Kubernetes Event-driven Autoscaling) によるゼロ〜数十台自動スケーリング',
    managementOverhead: 'Low (サーバーレス)',
    securityIsolation: 'マネージドEnv、Env内双方向mTLS通信、Daprによるセキュアサービス間通信',
    examHighlight: '【近年の試験注目】Kubernetesの複雑さを隠蔽し、KEDAとDaprを標準統合したサーバーレスコンテナ。ゼロスケール(0台待機)対応。',
  },
  {
    id: 'aro',
    name: 'Azure Red Hat OpenShift (ARO)',
    nameJa: 'Azure Red Hat OpenShift (ARO)',
    category: 'specialized',
    idealUseCases: 'オンプレミスのOpenShift環境からの移行、Red Hatエコシステム統制下でのエンタープライズ開発',
    startupTime: '分単位',
    scalingModel: 'OpenShiftオートスケーラー',
    managementOverhead: 'High (マネージドK8s)',
    securityIsolation: 'SELinux、OpenShift Security Context Constraints (SCC)',
    examHighlight: 'MicrosoftとRed Hatが共同で運用・サポートするマネージドOpenShiftクラスタ。',
  },
  {
    id: 'webapp-containers',
    name: 'Web App for Containers',
    nameJa: 'Web App for Containers (App Service)',
    category: 'app-service',
    idealUseCases: 'コンテナ化されたWebサイト、HTTP/HTTPSベースのAPI、カスタムランタイムが必要なWebアプリ',
    startupTime: '数十秒',
    scalingModel: 'App Serviceプランに基づく自動スケーリング (CPU/メモリしきい値)',
    managementOverhead: 'Medium (PaaS)',
    securityIsolation: 'App Service サンドボックス、カスタムドメインSSL、VNet統合',
    examHighlight: 'DockerコンテナをそのままApp Serviceの高機能PaaS(デプロイスロット、カスタムドメイン)で動かす基盤。',
  },
  {
    id: 'azure-functions-containers',
    name: 'Azure Functions on Custom Containers',
    nameJa: 'Azure Functions (カスタムコンテナ)',
    category: 'serverless',
    idealUseCases: '非標準ライブラリや特定のOSバイナリが必要なイベント駆動サーバーレス関数',
    startupTime: '秒単位 (従量課金またはPremiumプラン)',
    scalingModel: 'イベント駆動型自動スケール',
    managementOverhead: 'Low (サーバーレス)',
    securityIsolation: 'Functions ランタイムサンドボックス',
    examHighlight: 'サーバーレスFaaSのコードと依存ライブラリをDockerイメージ化して実行。',
  },
  {
    id: 'service-fabric',
    name: 'Azure Service Fabric',
    nameJa: 'Azure Service Fabric',
    category: 'specialized',
    idealUseCases: '超高密度ステートフルマイクロサービス、ミッションクリティカルな超低遅延分散システム',
    startupTime: '分単位',
    scalingModel: 'Service Fabricパーティショニング＆スケーリング',
    managementOverhead: 'High (マネージドK8s)',
    securityIsolation: 'Windows/Linuxプロセス分離、Hyper-V分離コンテナ',
    examHighlight: 'Azureの内部コア基盤(SQL DatabaseやCosmos DBのバックエンド)としても稼働する分散基盤。',
  },
];

export const ACR_SKUS: AcrSkuInfo[] = [
  {
    sku: 'Basic',
    storageLimitGb: 10,
    webhooks: 2,
    readOpsPerMin: 1000,
    writeOpsPerMin: 100,
    geoReplication: false,
    zoneRedundancy: false,
    privateLinkSupport: false,
    contentTrustSupport: false,
    customerManagedKey: false,
    recommendation: '開発・検証環境、個人の小規模プロジェクト向け。',
  },
  {
    sku: 'Standard',
    storageLimitGb: 100,
    webhooks: 10,
    readOpsPerMin: 3000,
    writeOpsPerMin: 500,
    geoReplication: false,
    zoneRedundancy: false,
    privateLinkSupport: false,
    contentTrustSupport: false,
    customerManagedKey: false,
    recommendation: '一般的な本番環境。スループットとストレージ容量が十分な標準プラン。',
  },
  {
    sku: 'Premium',
    storageLimitGb: 500,
    webhooks: 500,
    readOpsPerMin: 10000,
    writeOpsPerMin: 2000,
    geoReplication: true,
    zoneRedundancy: true,
    privateLinkSupport: true,
    contentTrustSupport: true,
    customerManagedKey: true,
    recommendation: '【試験最重要】マルチリージョン展開(Geoレプリケーション)、VNet Private Link、イメージ署名(Content Trust)が必須のエンタープライズ要件ではPremium一択！',
  },
];

export const ENDPOINT_MGMT_TOPICS: EndpointMgmtTopic[] = [
  {
    id: 'intune-sccm-comgmt',
    title: 'Microsoft Intune & Configuration Manager (Co-management)',
    titleJa: 'Intune & 構成マネージャー (共同管理 / Desktop Analytics)',
    category: 'comanagement',
    summary: 'オンプレミスSCCMとクラウドIntuneを並行稼働させ、ワークロード単位でクラウド管理へ移行するハイブリッド戦略。',
    examKeyPoints: [
      '共同管理 (Co-management): 既存のSCCMクライアントをIntuneにも登録し、コンプライアンスポリシーや更新プログラムなどのワークロードを個別にスライダーで切り替え可能。',
      'Desktop Analytics: Windows 10/11へのアップグレード準備状況、アプリの互換性リスク、ドライバーの問題をクラウドAIで事前判定。',
      'テナントアタッチ (Tenant Attach): SCCMコンソールのデバイス情報をIntune管理センターへ同期し、Webブラウザから一元可視化・リモート同期。',
    ],
  },
  {
    id: 'windows-autopilot',
    title: 'Windows Autopilot',
    titleJa: 'Windows Autopilot (OOBEゼロタッチプロビジョニング)',
    category: 'autopilot',
    summary: 'ハードウェアベンダーから直接社員の自宅へPCを配送し、初回電源投入(OOBE)で自動セットアップを完了させる仕組み。',
    examKeyPoints: [
      'ハードウェアハッシュ (Hardware Hash): デバイスのシリアル番号やマザーボード情報に基づく一意のハッシュを事前にIntuneへ登録。',
      'プロファイル種類: ユーザー主導モード (User-Driven: 社員が自身のUPN/Passでログイン)、自己展開モード (Self-Deploying: キオスク/共有PC向けでユーザー入力なし)、事前プロビジョニング (Pre-provisioned / 旧White Glove: IT担当者やベンダーが事前キッティング)。',
      'カスタムイメージの再作成が不要: 工場出荷時OSのまま、Entra参加 + Intuneポリシー + M365アプリ自動インストールが実行される。',
    ],
  },
  {
    id: 'bastion-vs-jumpbox',
    title: 'Azure Bastion vs ジャンプボックス (Jumpbox)',
    titleJa: 'Azure Bastion vs ジャンプボックス (踏み台サーバー)',
    category: 'bastion',
    summary: 'プライベート仮想マシンへのセキュアなRDP/SSH管理アクセスの違い。',
    examKeyPoints: [
      'Azure Bastion: PaaSマネージドサービス。Azure Portal (ブラウザ) から直接HTML5経由でセキュア接続。対象VMにパブリックIPは一切不要！',
      'ポート要件: クライアントPCからはHTTPS (443) のみ。Bastionサブネット名は必ず「AzureBastionSubnet」(/26以上) が必須。',
      'ジャンプボックスとの違い: ジャンプボックス(IaaS VM)は自前でのOSパッチ適用、NSGポート管理、マルウェア対策が必要だが、BastionはMicrosoft管理のため脆弱性リスクが極小。',
    ],
  },
  {
    id: 'update-mgmt-dsc',
    title: 'Azure Update Management & WSUS & Automation Account & DSC',
    titleJa: '更新プログラム管理 & WSUS & Automation Account & DSC',
    category: 'update-dsc',
    summary: 'Windows/Linuxの更新パッチ配信とDesired State Configuration (構成ドリフト防止)。',
    examKeyPoints: [
      'Azure Update Manager: エージェントレス(MMA不要)で直接AzureリソースマネージャーからVMのパッチ評価・スケジュール適用・再起動制御を実行。',
      '従来の Update Management: Azure Automation Account および Log Analytics ワークスペース (MMAエージェント) を利用してオンプレミス/マルチクラウドもカバー。',
      'WSUS連携: 社内WSUSサーバーから承認されたパッチのみを取得するようにグループポリシーとUpdate Managementを連携可能。',
      'DSC (Desired State Configuration): Local Configuration Manager (LCM) がOSの構成状態を定期監視し、意図せぬ変更(構成ドリフト)が発生した場合に自動修復(ApplyAndAutoCorrect)。',
    ],
  },
  {
    id: 'azure-disk-encryption',
    title: 'Azure Disk Encryption (ADE)',
    titleJa: 'Azure Disk Encryption (ADE: OS/データディスク暗号化)',
    category: 'ade',
    summary: 'WindowsのBitLocker、LinuxのDM-Cryptを利用してIaaS仮想マシンのOSディスクおよびデータディスクをOS内部で暗号化。',
    examKeyPoints: [
      'Key Vault 連携必須: BitLocker暗号化キー (BEK: BitLocker Encryption Key) はAzure Key Vaultに安全に保管される。Key Vaultの「ディスク暗号化用のAzure仮想マシン」アクセス許可が必要。',
      'キー暗号化キー (KEK): BEK自体をさらにRSAキーでラップして二重保護するオプション構成。',
      'サーバー側暗号化 (SSE) との違い: SSEはストレージサービス側(透過的暗号化)で行われるのに対し、ADEはVMのOSカーネルレベルで暗号化されるため、より厳格なコンプライアンス要件に対応。',
    ],
  },
];

export const AKS_COMPONENTS: AksComponent[] = [
  {
    id: 'kube-apiserver',
    name: 'kube-apiserver',
    nameJa: 'API サーバー (kube-apiserver)',
    plane: 'control-plane',
    azureManaged: true,
    description: 'Kubernetesクラスター全体のコントロールプレーンのフロントエンド。すべての管理操作・通信の唯一のエントリポイント。',
    responsibilities: [
      'kubectl や Azure CLI、内部コントローラーからの RESTful API リクエストを受信・検証',
      'ユーザー認証 (Authentication: Entra ID / Client Certs) および認可 (Authorization: Kubernetes RBAC)',
      'リクエストスキーマの妥当性検証および Admission Controllers (Azure Policy / Gatekeeper) の実行',
      'etcd と直接通信できる唯一のコンポーネント (他のコンポーネントはすべて apiserver 経由で状態取得)',
    ],
    keyExamPoints: [
      '【AKSの責任共有】コントロールプレーンは Azure が完全マネージド管理。ユーザーにVMのOS管理責任やetcdのバックアップ責任はない。',
      '【セキュリティ】プライベートAKSクラスター (Private Cluster) では、apiserver のエンドポイントにパブリックIPを付与せず社内VNet内プライベートIPに限定可能。',
    ],
  },
  {
    id: 'etcd',
    name: 'etcd',
    nameJa: '分散Key-Valueストア (etcd)',
    plane: 'control-plane',
    azureManaged: true,
    description: 'クラスターのすべての状態、設定マニフェスト、シークレットが格納される高可用性分散Key-Valueデータストア。',
    responsibilities: [
      'クラスターの「唯一の真実のソース (Single Source of Truth)」として全メタデータを永続保持',
      'Raftコンセンサスアルゴリズムによるノード間の一貫性とクォーラム維持',
      'apiserver からの更新・参照クエリの高速処理とイベント通知 (Watch)',
    ],
    keyExamPoints: [
      '【暗号化】AKSでは etcd のデータはAzureストレージのSSE (サーバー側暗号化) により自動暗号化。さらに KMS プラグイン連携による Envelope 暗号化もサポート。',
      '【直接アクセス不可】ユーザーやワーカーノードは etcd に直接接続不可。必ず apiserver 経由でのみ読み書きが行われる。',
    ],
  },
  {
    id: 'kube-scheduler',
    name: 'kube-scheduler',
    nameJa: 'スケジューラー (kube-scheduler)',
    plane: 'control-plane',
    azureManaged: true,
    description: '新しく作成された未割り当ての Pod を検知し、最適なワーカーノードを選定して割り当てる (バインドする) コンポーネント。',
    responsibilities: [
      'フィルタリング (Filtering / Predicates): Podの要求リソース (CPU / メモリ) を満たせないノードや Taints (汚れ) のあるノードを除外',
      'スコアリング (Scoring / Priorities): リソースバランス、Node Affinity (親和性)、Pod Anti-Affinity (分散配置) を評価して最高得点のノードを決定',
      '選定結果を apiserver に通知し、Pod の `nodeName` を確定',
    ],
    keyExamPoints: [
      '【可用性設計】複数アベイラビリティゾーン (AZ) にPodを分散配置するトポロジ分散制約 (topologySpreadConstraints) を評価して高可用性を保証。',
    ],
  },
  {
    id: 'kube-controller-manager',
    name: 'kube-controller-manager',
    nameJa: 'コントローラーマネージャー (kube-controller-manager)',
    plane: 'control-plane',
    azureManaged: true,
    description: 'クラスターの「期待される状態 (Desired State)」と「現在の状態 (Actual State)」を常に比較し、一致するように是正ループ (Control Loop) を回す。',
    responsibilities: [
      'Deployment / ReplicaSet コントローラー: Podの指定レプリカ数を常時監視・維持',
      'Node コントローラー: ノードのハートビート途絶・障害を検知し、Podを別ノードへ退避 (Eviction)',
      'EndpointSlice コントローラー: Service とバックエンドPodのIP紐付けを最新化',
      'Namespace / ServiceAccount コントローラー: デフォルト設定の自動生成・クリーンアップ',
    ],
    keyExamPoints: [
      '【自己修復】ノード停止やPodクラッシュ時に自動で代替Podを立ち上げるKubernetesの自己修復能力の心臓部。',
    ],
  },
  {
    id: 'kubelet',
    name: 'kubelet',
    nameJa: 'ノードエージェント (kubelet)',
    plane: 'worker-node',
    azureManaged: false,
    description: '各ワーカーノード上で直接動作する主エージェント。apiserverからPodSpecを受け取り、ローカルのコンテナを確実に健全稼働させる。',
    responsibilities: [
      'apiserver から割り当てられた PodSpec を受信',
      'CRI (Container Runtime Interface) 経由でコンテナランタイムにイメージプルとコンテナ起動を指示',
      'ボリューム (PV/PVC) のノードへのアタッチとPodへのマウントを監視',
      'ヘルスプローブ (LivenessProbe / ReadinessProbe / StartupProbe) を実行し、異常時はコンテナ再起動またはトラフィック除外を制御',
      'ノードのリソース使用状況やヘルス状態を apiserver に定期報告',
    ],
    keyExamPoints: [
      '【試験頻出】Kubelet はコンテナ内ではなく、ワーカーノードのホストOS上で直接デーモンとして動作する。',
      '【認証】Kubelet と apiserver 間の通信はクライアント証明書による mTLS で暗号化されている。',
    ],
  },
  {
    id: 'container-runtime',
    name: 'containerd',
    nameJa: 'コンテナーランタイム (containerd)',
    plane: 'worker-node',
    azureManaged: false,
    description: 'コンテナのライフサイクル (イメージ取得、実行、停止、ネットワーク名前空間構築) を実際にOSカーネルレベルで担うランタイム。',
    responsibilities: [
      'CRI-O / containerd: OCI (Open Container Initiative) 標準に準拠したランタイム',
      'コンテナレジストリ (ACR等) から暗号化コンテナイメージをプル',
      'Linux cgroups (CPU/メモリ制限) および namespaces (PID/Network/IPC等の隔離) を利用してコンテナプロセスを起動',
    ],
    keyExamPoints: [
      '【AKS標準】旧来の Docker デーモンから、軽量かつ業界標準の containerd へ完全移行済み。',
    ],
  },
  {
    id: 'kube-proxy',
    name: 'kube-proxy',
    nameJa: 'ネットワークプロキシ (kube-proxy)',
    plane: 'worker-node',
    azureManaged: false,
    description: '各ノード上で動作し、Kubernetes Service の抽象化 (ClusterIP) を実際のPodのプライベートIPへルーティングするネットワークプロキシ。',
    responsibilities: [
      'apiserver の Service と EndpointSlice の変更を常時監視',
      'ノード上の OS パケットフィルタリング (iptables または IPVS) ルールを動的に設定・更新',
      'Service宛てのトラフィックを、バックエンドの複数Podへランダムまたはラウンドロビンで負荷分散',
    ],
    keyExamPoints: [
      '【重要】kube-proxy 自体がパケットを中継するのではなく、カーネルの iptables/IPVS ルールを書き換えてOSカーネルレベルで高速転送する。',
    ],
  },
  {
    id: 'pod',
    name: 'Pod',
    nameJa: 'Pod (ポッド: 最小デプロイ単位)',
    plane: 'worker-node',
    azureManaged: false,
    description: 'Kubernetesで作成・管理できる最小の計算単位。1つまたは複数の密接に関連するコンテナのまとまり。',
    responsibilities: [
      '同一Pod内のコンテナはネットワーク名前空間 (同一IPアドレス、localhostで相互通信可能) を共有',
      '同一Pod内のコンテナはボリュームストレージを共有マウント可能',
      'エフェメラル (使い捨て): クラッシュや再スケジューリング時は新しいIPで再作成される',
    ],
    keyExamPoints: [
      '【サイドカーパターン】主コンテナのログ収集やmTLSプロキシ (Envoy) を同一Pod内の副コンテナとして同居させる設計パターン。',
    ],
  },
  {
    id: 'node-pool',
    name: 'Node Pools',
    nameJa: 'ノードプール (システムノードプール vs ユーザーノードプール)',
    plane: 'worker-node',
    azureManaged: false,
    description: '同一のVMサイズ、OS、設定を持つ仮想マシン群 (Virtual Machine Scale Sets: VMSS) のグループ。',
    responsibilities: [
      'システムノードプール (mode: System): CoreDNS, metrics-server などのクリティカルなシステムPod専用。Taintsで業務Podを排除可能。',
      'ユーザーノードプール (mode: User): アプリケーションPod用。GPU VM、メモリ最適化VM、スポットインスタンスなど柔軟に構成。',
      'Cluster Autoscaler (CA): Podの保留状態 (Pending) を検知して自動的にノードVMを増減。',
    ],
    keyExamPoints: [
      '【AZ-500/SC-300要点】AKSでは最低1つのLinuxシステムノードプールが必須。業務アプリの負荷急増でCoreDNSが共倒れしないよう、プールを分離するのがベストプラクティス。',
    ],
  },
];

export const AKS_SERVICE_TYPES: AksServiceTypeInfo[] = [
  {
    type: 'ClusterIP',
    nameJa: 'ClusterIP (クラスター内部専用サービス)',
    description: 'クラスター内部通信専用の仮想IP。デフォルトのServiceタイプであり、外部からの直接アクセスを遮断。',
    accessibility: 'クラスター内限定',
    portRange: '任意のポート (例: 80, 8080, 5432)',
    allocatedIp: '10.0.12.45 (クラスター内仮想IP)',
    azureLoadBalancerProvisioned: false,
    yamlSnippet: `apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  type: ClusterIP
  selector:
    app: api-server
  ports:
  - port: 8080
    targetPort: 8080`,
    packetPath: [
      '1. クラスター内のフロントエンドPodが DNS (backend-service.default.svc.cluster.local) を問い合わせ',
      '2. CoreDNS が ClusterIP (10.0.12.45) を返却',
      '3. 送信ノードの kube-proxy (iptables) が ClusterIP 宛てのパケットを検知',
      '4. バックエンドPod群 (10.244.1.12 または 10.244.2.18) から1台を選択し、宛先IPをDNAT変換して直接転送',
    ],
    examTips: '【基本】内部マイクロサービス間通信やDB接続は必ずClusterIPを使用。外部公開が不要なリソースを誤ってインターネットに晒さないための基本防御。',
  },
  {
    type: 'NodePort',
    nameJa: 'NodePort (各ノードの専用ポート開放)',
    description: 'すべてのワーカーノードの指定ポート (30000-32767) をリッスンし、<ノードIP>:<NodePort> で直接外部から接続可能にする。',
    accessibility: 'ノードIP:Port経由',
    portRange: '30000 - 32767 (K8s既定の予約範囲)',
    allocatedIp: '任意のワーカーノードIP (例: 20.40.10.5:31250)',
    azureLoadBalancerProvisioned: false,
    yamlSnippet: `apiVersion: v1
kind: Service
metadata:
  name: dev-nodeport-service
spec:
  type: NodePort
  selector:
    app: web-frontend
  ports:
  - port: 80
    targetPort: 80
    nodePort: 31250`,
    packetPath: [
      '1. クライアントが任意のワーカーノードのパブリック/プライベートIPのポート 31250 へアクセス',
      '2. そのノードの kube-proxy が受信し、iptables ルールに基づき転送先Podを決定',
      '3. 対象Podが別ノードにある場合は、ノード間内部ネットワークを経由して対象ノードのPodへ到達',
    ],
    examTips: '【制約と注意】ポートが30000番台に限定される。実稼働環境では単独利用せず、独自の外部L4/L7ロードバランサーと組み合わせるか、LoadBalancer/Ingressを使用する。',
  },
  {
    type: 'LoadBalancer',
    nameJa: 'LoadBalancer (Azure Load Balancer 自動プロビジョニング)',
    description: 'Azure Load Balancer (パブリックまたは内部VNetプライベート) を自動配備し、標準のHTTP(80)/HTTPS(443)ポートで外部公開。',
    accessibility: '外部インターネット/社内VNet',
    portRange: '任意の標準ポート (80, 443 等)',
    allocatedIp: '51.144.92.10 (Azure Public IP) または 10.200.1.5 (内部LB)',
    azureLoadBalancerProvisioned: true,
    yamlSnippet: `apiVersion: v1
kind: Service
metadata:
  name: public-web-lb
  annotations:
    # 内部LBにする場合は以下のアノテーションを指定
    # service.beta.kubernetes.io/azure-load-balancer-internal: "true"
spec:
  type: LoadBalancer
  selector:
    app: web-frontend
  ports:
  - port: 80
    targetPort: 80`,
    packetPath: [
      '1. 外部インターネットのユーザーが Azure Load Balancer のパブリックIP (51.144.92.10:80) へアクセス',
      '2. Azure Load Balancer が正常なAKSワーカーノードのヘルスプローブポート経由でトラフィックを転送',
      '3. 受信ノードの kube-proxy が iptables に従って、コンテナが稼働するPodへロードバランシング',
    ],
    examTips: '【試験頻出】アノテーション「service.beta.kubernetes.io/azure-load-balancer-internal: true」を付与すると、パブリックIPではなく社内VNet専用の「内部ロードバランサー (Internal LB)」が自動配備される。',
  },
];

export const AKS_STORAGE_TYPES: AksStorageTypeInfo[] = [
  {
    id: 'managed-csi',
    name: 'managed-csi (Azure Managed Disk)',
    storageBackend: 'Azure Managed Disk',
    accessModes: ['ReadWriteOnce'],
    performance: '超高速 (低遅延 IOPS 確保)',
    multiNodeShareable: false,
    provisioner: 'disk.csi.azure.com',
    recommendedUse: 'データベース (PostgreSQL, MySQL, SQL Server)、ステートフルな単一Podワークロード',
    examNote: '【試験最重要】Azure Managed Disk は「ReadWriteOnce (RWO)」のみ対応。単一のノードにしかアタッチできないため、複数ノードにまたがるレプリカPod間で同時に共有マウントすることはできない！',
  },
  {
    id: 'azurefile-csi',
    name: 'azurefile-csi (Azure Files)',
    storageBackend: 'Azure Files',
    accessModes: ['ReadWriteMany', 'ReadWriteOnce', 'ReadOnlyMany'],
    performance: '標準〜高 (SMB / NFS v4.1)',
    multiNodeShareable: true,
    provisioner: 'file.csi.azure.com',
    recommendedUse: 'Webサイトの静的アセット共有、CMS (WordPress)、複数Podからの同時読み書きログ保存',
    examNote: '【試験最重要】「ReadWriteMany (RWX)」が必要な場合は Azure Files (azurefile-csi) を選択する。異なるノードで稼働する複数Podから同時に共有マウントが可能。',
  },
  {
    id: 'azureblob-csi',
    name: 'azureblob-csi (Azure Blob Storage)',
    storageBackend: 'Azure Blob Storage',
    accessModes: ['ReadWriteMany', 'ReadOnlyMany'],
    performance: '大容量・オブジェクト指向 (BlobFuse2 / NFS v3)',
    multiNodeShareable: true,
    provisioner: 'blob.csi.azure.com',
    recommendedUse: 'ビッグデータ解析、AI/機械学習の学習データセット、ペタバイト級アーカイブデータ',
    examNote: '非構造化データや大規模データセットをマウントする場合に利用。BlobFuse2によるキャッシュ機構で高速化。',
  },
];

export const AKS_RBAC_RULES: AksRbacRule[] = [
  {
    id: 'dev-pod-reader',
    roleName: 'pod-reader',
    roleKind: 'Role',
    targetNamespace: 'development',
    bindingKind: 'RoleBinding',
    boundSubject: 'dev-team@contoso.com',
    subjectType: 'Group',
    allowedResources: ['pods', 'pods/log'],
    allowedVerbs: ['get', 'list', 'watch'],
    scopeDescription: '「development」Namespace内のPodの参照・ログ閲覧のみ可能。Podの作成や削除、他Namespaceへのアクセスは一切拒否。',
  },
  {
    id: 'dev-app-deployer',
    roleName: 'app-deployer',
    roleKind: 'Role',
    targetNamespace: 'development',
    bindingKind: 'RoleBinding',
    boundSubject: 'ci-cd-service-account',
    subjectType: 'ServiceAccount',
    allowedResources: ['deployments', 'services', 'pods', 'configmaps'],
    allowedVerbs: ['get', 'list', 'create', 'update', 'delete', 'patch'],
    scopeDescription: '「development」Namespace内でのアプリケーション配備・更新・削除の完全権限。Cluster-wideなノードや他Namespaceには影響しない。',
  },
  {
    id: 'cluster-security-auditor',
    roleName: 'security-auditor',
    roleKind: 'ClusterRole',
    targetNamespace: undefined,
    bindingKind: 'ClusterRoleBinding',
    boundSubject: 'sec-auditor@contoso.com',
    subjectType: 'User',
    allowedResources: ['nodes', 'namespaces', 'persistentvolumes', 'pods', 'services'],
    allowedVerbs: ['get', 'list', 'watch'],
    scopeDescription: 'クラスター全体のすべてのリソース (全Namespaceおよびノード・PV等のクラスターレベルリソース) の参照専用権限。',
  },
  {
    id: 'cluster-super-admin',
    roleName: 'cluster-admin',
    roleKind: 'ClusterRole',
    targetNamespace: undefined,
    bindingKind: 'ClusterRoleBinding',
    boundSubject: 'infra-admin-group',
    subjectType: 'Group',
    allowedResources: ['*'],
    allowedVerbs: ['*'],
    scopeDescription: 'クラスター全体におけるすべてのリソースに対する完全な制御権限 (ワイルドカード `*`)。',
  },
];

export const MONITOR_AGENTS: MonitorAgentInfo[] = [
  {
    id: 'ama',
    name: 'Azure Monitor Agent (AMA)',
    nameJa: 'Azure Monitor エージェント (AMA: 新標準)',
    status: '新標準 (推奨)',
    osSupported: 'Windows & Linux',
    architecture: 'データ収集ルール (DCR: Data Collection Rules) を使用して、収集対象のイベントやメトリックを中央集中で高度にフィルタリング。Azure Arc サーバーにも完全対応。',
    configurationModel: 'データ収集ルール (DCR)',
    keyExamPoints: [
      '【新世代の標準エージェント】従来の MMA、WAD、LAD を一元統合・置換。',
      '【コスト最適化】DCR により、特定の EventID やファシリティのみをフィルタして Log Analytics へ送信できるため、不要なログ取り込みコストを劇的に削減。',
      '【認証強化】ワークスペースキーを使用せず、VM のシステム割り当て/ユーザー割り当てマネージドIDを利用して安全に認証。',
    ],
  },
  {
    id: 'mma',
    name: 'Log Analytics Agent (MMA / OMS)',
    nameJa: 'Log Analytics エージェント (MMA: レガシー・廃止)',
    status: 'レガシー (非推奨/廃止)',
    osSupported: 'Windows & Linux',
    architecture: 'ワークスペースIDと主キー (Workspace Key) を用いて Log Analytics ワークスペースへ直接ログをストリーミング送信。DCR には非対応。',
    configurationModel: 'ワークスペースID & キー',
    keyExamPoints: [
      '【2024年8月廃止】Microsoft によりサポート終了済み。既存の環境はすべて AMA (Azure Monitor Agent) への移行が必須要件。',
      '【セキュリティ課題】共有秘密キー (Primary Key) が漏洩した場合、悪意あるログの偽装送信や改ざんのリスクが生じる。',
    ],
  },
  {
    id: 'wad-lad',
    name: 'Diagnostics Extension (WAD / LAD)',
    nameJa: 'Azure 診断拡張機能 (WAD: Windows / LAD: Linux)',
    status: 'レガシー (非推奨/廃止)',
    osSupported: 'Windows & Linux',
    architecture: 'VM のゲスト OS メトリックやイベントログを Azure Storage アカウント (Table/Blob) または Event Hubs へ保存する初期の拡張機能。',
    configurationModel: 'ストレージアカウント接続文字列',
    keyExamPoints: [
      'Log Analytics への高度な KQL クエリ分析には不向き。AMA へ移行することが推奨される。',
    ],
  },
  {
    id: 'dependency',
    name: 'Dependency Agent',
    nameJa: 'Dependency エージェント (依存関係マッピング)',
    status: '特殊用途',
    osSupported: 'Windows & Linux',
    architecture: 'VM 上で送受信されるプロセス間の TCP 接続データ、発信元/送信先 IP、ポート番号を収集し、VM Insights の「マップ (Map)」ビューを自動描画。',
    configurationModel: 'データ収集ルール (DCR)',
    keyExamPoints: [
      '【VM Insights 必須】サーバー間のネットワーク依存関係の可視化や、移行前の依存関係分析 (Azure Migrate) で利用。',
    ],
  },
  {
    id: 'telegraf',
    name: 'Telegraf Agent',
    nameJa: 'Telegraf エージェント (Linux メトリック収集)',
    status: '特殊用途',
    osSupported: 'Linux のみ',
    architecture: 'オープンソースのプラグインベースのエージェント。InfluxDB エコシステムや Linux システムの詳細メトリックを Azure Monitor メトリックへ送信。',
    configurationModel: 'ストレージアカウント接続文字列',
    keyExamPoints: [
      'Linux の高度なカスタムメトリック収集で利用されるプラグイン駆動型コレクター。',
    ],
  },
];

export const LOG_TYPES_DATA: LogTypeComparison[] = [
  {
    id: 'tenant-log',
    name: 'Microsoft Entra ログ (AAD ログ)',
    nameJa: 'テナントログ (Microsoft Entra 監査 & サインインログ)',
    scope: 'テナント (Tenant)',
    description: 'テナント全体の全ユーザー、サービスプリンシパル、マネージドIDのサインイン履歴、条件付きアクセスの評価結果、および管理者によるロール変更・ユーザー作成の監査ログ。',
    destination: 'Log Analytics ワークスペース / Event Hubs / ストレージアカウント',
    setupLocation: 'Microsoft Entra 管理センター ➔ 診断設定 (Diagnostic Settings)',
    examples: ['SigninLogs (ユーザーサインイン)', 'AuditLogs (テナント設定・ユーザー変更)', 'NonInteractiveUserSignInLogs', 'ServicePrincipalSignInLogs'],
  },
  {
    id: 'activity-log',
    name: 'Azure アクティビティログ (Activity Log)',
    nameJa: 'サブスクリプション・アクティビティログ',
    scope: 'サブスクリプション (Subscription)',
    description: 'Azure Resource Manager (ARM) のコントロールプレーン操作ログ。「誰が、いつ、どのリソースを作成・変更・削除したか」をサブスクリプション全体で自動記録。',
    destination: '自動で90日間無料保持。長期保存やKQL分析・アラート発火にはLog Analyticsへ「アクティビティログの診断設定」でエクスポート。',
    setupLocation: 'Azure Monitor ➔ アクティビティログ ➔ 診断設定のエクスポート',
    examples: ['VMの起動/停止 (Microsoft.Compute/virtualMachines/write)', 'ロール割り当ての追加 (roleAssignments/write)', 'リソースロックの削除', 'NSGルールの作成'],
  },
  {
    id: 'resource-log',
    name: 'Azure リソースログ (Resource Logs / 診断ログ)',
    nameJa: 'リソースログ (各サービスの内部データプレーンログ)',
    scope: 'リソース (Resource)',
    description: '特定のリソースの「内部動作」に関する詳細ログ。デフォルトでは収集・保存されないため、各リソースで明示的に「診断設定 (Diagnostic Settings)」を構成する必要がある。',
    destination: 'Log Analytics ワークスペース / ストレージアカウント / パートナーソリューション',
    setupLocation: '各リソースのブレード ➔ 監視 ➔ 診断設定 (Diagnostic Settings)',
    examples: ['Key Vault のシークレット参照ログ (AuditEvent)', 'Azure Firewall のパケットログ (AzureFirewallNetworkRule)', 'App Service のHTTPアクセスログ', 'NSG フローログ'],
  },
  {
    id: 'guest-os-log',
    name: 'ゲスト OS ログ & メトリック',
    nameJa: '仮想マシン OS 内部ログ (Guest OS Logs)',
    scope: 'ゲストOS (OS/Guest)',
    description: 'VM の内部で発生する Windows イベントログ (Security / Application / System) や Linux Syslog、パフォーマンスカウンター。',
    destination: 'Log Analytics ワークスペース (AMA + DCR 経由)',
    setupLocation: 'Azure Monitor ➔ データ収集ルール (DCR) を作成し、VM に関連付け',
    examples: ['EventID 4624 (ログオン成功)', 'EventID 4625 (ログオン失敗)', 'Syslog auth.log (SSH試行)', '% Processor Time (CPU使用率)'],
  },
];

export const KQL_PRESETS: KqlQueryTemplate[] = [
  {
    id: 'kql-brute-force',
    title: '不審なサインイン失敗の急増 (総当たり攻撃ブルートフォース検知)',
    category: '不審なサインイン',
    query: `SigninLogs
| where TimeGenerated > ago(24h)
| where ResultType != 0 // 0以外は認証失敗
| summarize 
    FailedCount = count(), 
    FailureReasons = make_set(ResultDescription),
    TargetAccounts = dcount(UserPrincipalName)
  by IPAddress, Location
| where FailedCount >= 5
| order by FailedCount desc`,
    explanation: '過去24時間以内に同一IPアドレスから5回以上サインインに失敗したアクセス元を特定。パスワードスプレーや辞書攻撃を即時暴き出します。',
    sampleColumns: ['IPAddress', 'Location', 'FailedCount', 'TargetAccounts', 'FailureReasons'],
    sampleRows: [
      ['198.51.100.44', 'ロシア', 142, 28, '["Invalid username or password", "Account locked"]'],
      ['203.0.113.88', '不明 (Tor出口)', 67, 12, '["Strong authentication required", "Invalid password"]'],
      ['192.0.2.15', '中国', 23, 5, '["User account does not exist"]'],
    ],
  },
  {
    id: 'kql-priv-role',
    title: '特権ロール (所有者・管理者) の不正な割り当ての監査',
    category: 'セキュリティインシデント',
    query: `AzureActivity
| where TimeGenerated > ago(7d)
| where OperationNameValue =~ "Microsoft.Authorization/roleAssignments/write"
| where ActivityStatusValue == "Success"
| project 
    TimeGenerated, 
    Caller, 
    SubscriptionId, 
    ResourceGroup, 
    Properties = parse_json(Properties)
| extend RoleDefinition = tostring(Properties.requestbody.properties.roleDefinitionId)
| order by TimeGenerated desc`,
    explanation: 'サブスクリプション内で RBAC ロール (特に Owner や Contributor、ユーザーアクセス管理者) が付与されたイベントをすべて追跡。権限昇格の不正を監視します。',
    sampleColumns: ['TimeGenerated', 'Caller', 'ResourceGroup', 'Operation', 'Status'],
    sampleRows: [
      ['2026-10-08 20:15:22', 'admin-breakglass@contoso.com', 'rg-production-db', 'roleAssignments/write', 'Success'],
      ['2026-10-08 14:02:11', 'sec-auditor@contoso.com', 'rg-network-core', 'roleAssignments/write', 'Success'],
    ],
  },
  {
    id: 'kql-suspicious-process',
    title: '難読化された PowerShell 起動 (MITRE T1059.001 実行戦術)',
    category: 'セキュリティインシデント',
    query: `SecurityEvent
| where TimeGenerated > ago(24h)
| where EventID == 4688 // プロセス作成イベント
| where Process has_any ("powershell.exe", "pwsh.exe")
| where CommandLine has_any ("-enc", "-encodedcommand", "downloadstring", "bypass")
| project TimeGenerated, Computer, Account, Process, CommandLine, ParentProcessName`,
    explanation: 'Windows 仮想マシン上で、難読化された Base64 コマンド (-enc) や実行ポリシー回避 (-ExecutionPolicy Bypass) を伴って起動された PowerShell プロセスを検知します。',
    sampleColumns: ['TimeGenerated', 'Computer', 'Account', 'Process', 'CommandLine'],
    sampleRows: [
      ['2026-10-08 21:40:12', 'vm-prod-web01', 'SYSTEM', 'powershell.exe', 'powershell.exe -enc SQBFAFgA... (Base64)'],
      ['2026-10-08 18:22:04', 'vm-finance-db', 'LOCALADMIN', 'powershell.exe', 'powershell.exe -nop -w hidden -c "IEX(New-Object Net.WebClient)..."'],
    ],
  },
  {
    id: 'kql-perf-cpu',
    title: '仮想マシンの CPU 使用率 90% 超過の検知 (メトリックログ)',
    category: 'パフォーマンス',
    query: `Perf
| where TimeGenerated > ago(1h)
| where ObjectName == "Processor" and CounterName == "% Processor Time"
| where InstanceName == "_Total"
| where CounterValue > 90
| summarize AvgCpu = round(avg(CounterValue), 2), MaxCpu = round(max(CounterValue), 2) by Computer, bin(TimeGenerated, 5m)
| order by MaxCpu desc`,
    explanation: '過去1時間以内に CPU 使用率が 90% を超過した仮想マシンを 5 分ごとの集計で特定。アラートルールと連動させてアクショングループを実行します。',
    sampleColumns: ['Computer', 'TimeInterval', 'AvgCpu (%)', 'MaxCpu (%)'],
    sampleRows: [
      ['vm-prod-app01', '10/08 21:45 - 21:50', 94.2, 98.6],
      ['vm-prod-app02', '10/08 21:40 - 21:45', 91.8, 96.2],
    ],
  },
];

export const MITRE_ATTACK_TACTICS: MitreTacticItem[] = [
  {
    id: 'recon',
    tacticNumber: 'TA0043',
    name: 'Reconnaissance',
    nameJa: '偵察 (Reconnaissance)',
    description: 'ターゲット組織のネットワーク、公開リソース、従業員情報に関する能動的/受動的情報収集。',
    techniques: ['T1595: アクティブスキャン', 'T1596: 公開情報の検索', 'T1589: 資格情報リストの収集'],
    sentinelAnalyticsType: 'Anomaly',
  },
  {
    id: 'initial-access',
    tacticNumber: 'TA0001',
    name: 'Initial Access',
    nameJa: '初期侵入 (Initial Access)',
    description: 'ネットワークやクラウド環境への足がかりを得る。フィッシング、公開サーバーの脆弱性悪用、漏洩パスワードの使用。',
    techniques: ['T1078: 有効なアカウントの使用', 'T1566: フィッシング', 'T1190: 公開アプリケーションのエクスプロイト'],
    sentinelAnalyticsType: 'Scheduled (KQL)',
  },
  {
    id: 'execution',
    tacticNumber: 'TA0002',
    name: 'Execution',
    nameJa: '実行 (Execution)',
    description: 'ローカルまたはリモートシステム上で悪意あるコードやスクリプトを実行。',
    techniques: ['T1059: コマンドとスクリプトインタープリター (PowerShell/Bash)', 'T1204: ユーザーによる実行'],
    sentinelAnalyticsType: 'NRT (Near Real-Time)',
  },
  {
    id: 'persistence',
    tacticNumber: 'TA0003',
    name: 'Persistence',
    nameJa: '永続化 (Persistence)',
    description: '再起動や認証情報の変更があってもシステムへのアクセスを維持する足場作り (スケジュールされたタスク、新しいアカウント作成)。',
    techniques: ['T1053: スケジュールタスク/Job', 'T1136: アカウントの作成', 'T1098: アカウント操作 (SSH鍵追加)'],
    sentinelAnalyticsType: 'Scheduled (KQL)',
  },
  {
    id: 'priv-esc',
    tacticNumber: 'TA0004',
    name: 'Privilege Escalation',
    nameJa: '権限昇格 (Privilege Escalation)',
    description: 'より高いアクセス権限 (管理者、SYSTEM、ルート、Azure RBAC所有者) を獲得する手法。',
    techniques: ['T1068: 権限昇格エクスプロイト', 'T1078: 特権アカウントの悪用', 'T1548: 認証メカニズムのバイパス'],
    sentinelAnalyticsType: 'Scheduled (KQL)',
  },
  {
    id: 'defense-evasion',
    tacticNumber: 'TA0005',
    name: 'Defense Evasion',
    nameJa: '防衛回避 (Defense Evasion)',
    description: 'セキュリティソフト (Defender/EDR) の停止、ログの削除、コード難読化による検知回避。',
    techniques: ['T1562: セキュリティツールの無効化', 'T1070: 痕跡インジケーターの消去', 'T1027: 難読化ファイル/情報'],
    sentinelAnalyticsType: 'Fusion (ML)',
  },
  {
    id: 'credential-access',
    tacticNumber: 'TA0006',
    name: 'Credential Access',
    nameJa: '認証情報アクセス (Credential Access)',
    description: 'パスワード、ハッシュ、トークン、Key Vault の秘密情報の窃取 (LSASSダンプ、キーストローク)。',
    techniques: ['T1003: OS資格情報のダンピング (LSASS)', 'T1110: ブルートフォース攻撃', 'T1555: 資格情報ストアからの取得'],
    sentinelAnalyticsType: 'Scheduled (KQL)',
  },
  {
    id: 'discovery',
    tacticNumber: 'TA0007',
    name: 'Discovery',
    nameJa: '探索 (Discovery)',
    description: '内部システム、ネットワーク構成、リソースグループ、権限範囲の調査。',
    techniques: ['T1087: アカウントの探索', 'T1082: システム情報の探索', 'T1018: リモートシステムの探索'],
    sentinelAnalyticsType: 'Anomaly',
  },
  {
    id: 'lateral-movement',
    tacticNumber: 'TA0008',
    name: 'Lateral Movement',
    nameJa: '横展開 (Lateral Movement)',
    description: '侵入した初期ノードから別サーバー、ドメインコントローラー、別サブネットへアクセスを拡大。',
    techniques: ['T1021: リモートサービス (RDP/SSH/WinRM)', 'T1550: 代替認証マテリアル (Pass the Hash)'],
    sentinelAnalyticsType: 'Fusion (ML)',
  },
  {
    id: 'collection',
    tacticNumber: 'TA0009',
    name: 'Collection',
    nameJa: '収集 (Collection)',
    description: '対象組織の重要データ (DBダンプ、機密ドキュメント、ソースコード) を1箇所に集約。',
    techniques: ['T1560: 収集データの圧縮/暗号化', 'T1005: ローカルシステムからのデータ収集'],
    sentinelAnalyticsType: 'Scheduled (KQL)',
  },
  {
    id: 'c2',
    tacticNumber: 'TA0011',
    name: 'Command and Control',
    nameJa: 'C2通信 (Command & Control)',
    description: '侵入システムと攻撃者のC2サーバー間の暗号化通信チャネル確立。',
    techniques: ['T1071: アプリケーション層プロトコル (HTTPS/DNSトンネリング)', 'T1573: 暗号化チャネル'],
    sentinelAnalyticsType: 'Fusion (ML)',
  },
  {
    id: 'exfiltration',
    tacticNumber: 'TA0010',
    name: 'Exfiltration',
    nameJa: '外部送出 (Exfiltration)',
    description: '盗み出した機密データを外部のクラウドストレージや攻撃者サーバーへ不正転送。',
    techniques: ['T1567: Webサービス経由の送出', 'T1048: 代替プロトコル経由の送出'],
    sentinelAnalyticsType: 'Scheduled (KQL)',
  },
  {
    id: 'impact',
    tacticNumber: 'TA0040',
    name: 'Impact',
    nameJa: '影響 (Impact)',
    description: 'ランサムウェアによるファイル暗号化、データ破壊、サービス拒否 (DoS) による業務停止。',
    techniques: ['T1486: データ暗号化 (ランサムウェア)', 'T1485: データの破壊', 'T1489: サービスの停止'],
    sentinelAnalyticsType: 'NRT (Near Real-Time)',
  },
];

export const SENTINEL_INCIDENTS_PRESET: SentinelIncidentSimulation[] = [
  {
    id: 'INC-2026-001',
    title: '多段階 Fusion 検知: 異常な場所からのサインイン成功後に難読化 PowerShell が実行され横展開を試行',
    severity: 'High',
    status: '新規 (New)',
    tactics: ['Initial Access', 'Execution', 'Lateral Movement'],
    source: 'Scheduled KQL Rule',
    entities: [
      { type: 'User', value: 'victim-dev@contoso.com' },
      { type: 'IP', value: '185.220.101.5 (Tor Exit Node)' },
      { type: 'Host', value: 'vm-prod-web01' },
      { type: 'Process', value: 'powershell.exe -enc ...' },
    ],
    alertCount: 3,
    description: 'Microsoft Sentinel の機械学習 (Fusion) が Entra ID Protection の不審なサインインアラートと、AMA が収集した SecurityEvent (4688) を自動相関。重大インシデントとして集約。',
    automatedPlaybook: 'Playbook-BlockIP-And-RevokeUser (Logic Apps による悪意あるIPのNSG即時遮断 & ユーザーセッション強制失効)',
  },
  {
    id: 'INC-2026-002',
    title: 'Microsoft Defender for Cloud: Key Vault へのブルートフォース攻撃とシークレット一括ダウンロード検知',
    severity: 'High',
    status: 'アクティブ (Active)',
    tactics: ['Credential Access', 'Collection'],
    source: 'Defender for Cloud',
    entities: [
      { type: 'IP', value: '198.51.100.99' },
      { type: 'Host', value: 'kv-prod-secrets' },
    ],
    alertCount: 2,
    description: 'Defender for Key Vault が通常のアクセスパターンと大きく乖離した急激な GetSecret 操作のスパイクを異常検知。',
    automatedPlaybook: 'Playbook-IsolateKeyVault (ファイアウォールルールを即時 DenyAll に変更)',
  },
  {
    id: 'INC-2026-003',
    title: 'CEF ログ相関: パロアルト外部ファイアウォールでのC2通信遮断と内部ホストのビーコニング',
    severity: 'Medium',
    status: '新規 (New)',
    tactics: ['Command and Control'],
    source: 'CEF / Syslog',
    entities: [
      { type: 'Host', value: 'vm-finance-db' },
      { type: 'IP', value: '45.33.32.156 (C2 Server)' },
    ],
    alertCount: 1,
    description: 'オンプレミスおよびクラウド境界のオンプレFWからSyslog/CEF経由で取り込んだログと脅威インテリジェンス (TI) がマッチ。',
    automatedPlaybook: 'Playbook-NotifyTeamsAndIsolateVM (Teams 通知 & VM ネットワークインターフェースを隔離NSGへ切り替え)',
  },
];

export const JIT_VM_PRESET: JitVmRequestState = {
  vmName: 'vm-jumpbox-mgmt',
  protocol: 'RDP',
  port: 3389,
  sourceIp: '203.0.113.50 (管理者の現在のパブリックIP)',
  durationHours: 3,
  approved: true,
  expiresInMinutes: 180,
  nsgRuleApplied: true,
};


