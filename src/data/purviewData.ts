import { SensitiveInformationType, SensitivityLabel, UserProfile } from '../types/purview';

export const BUILT_IN_SITS: SensitiveInformationType[] = [
  {
    id: 'jp-mynumber',
    name: 'Japan Individual Number',
    nameJa: '日本 個人番号 (マイナンバー)',
    category: 'personal',
    description: '日本の行政手続における特定の個人を識別するための番号(12桁の数字)。検査数字(チェックディジット)アルゴリズム検証を含む。',
    defaultConfidence: 85,
    patterns: {
      regex: '\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b',
      supportingKeywords: ['マイナンバー', '個人番号', 'my number', 'mynumber', '特定個人情報', '通知カード'],
      proximity: 300,
    },
  },
  {
    id: 'credit-card',
    name: 'Credit Card Number',
    nameJa: 'クレジット カード番号 (PCI-DSS)',
    category: 'financial',
    description: 'Visa、Mastercard、JCB、American Express等の13-16桁カード番号。Luhnアルゴリズム(モジュロ10)による検証。',
    defaultConfidence: 85,
    patterns: {
      regex: '\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|35[0-9]{14})\\b',
      supportingKeywords: ['card number', 'cvv', 'exp date', '有効期限', 'クレジットカード', 'クレジット', 'カード番号', 'visa', 'mastercard', 'jcb'],
      proximity: 300,
    },
  },
  {
    id: 'jp-bank-account',
    name: 'Japan Bank Account',
    nameJa: '日本 銀行口座番号',
    category: 'financial',
    description: '日本の金融機関の店番(3桁)および口座番号(7桁)。',
    defaultConfidence: 75,
    patterns: {
      regex: '\\b(?:普通|当座|貯蓄)?\\s*(?:口座|預金)?\\s*(?:番号)?[:：]?\\s*\\d{7}\\b',
      supportingKeywords: ['銀行', '支店', '普通預金', '当座預金', '口座番号', '振込先', '店番号'],
      proximity: 200,
    },
  },
  {
    id: 'jp-drivers-license',
    name: 'Japan Driver License',
    nameJa: '日本 運転免許証番号',
    category: 'personal',
    description: '公安委員会発行の12桁の運転免許証番号。',
    defaultConfidence: 75,
    patterns: {
      regex: '\\b第?\\s*\\d{12}\\s*号?\\b',
      supportingKeywords: ['運転免許証', '免許証番号', '公安委員会', '免許証', '運転免許'],
      proximity: 250,
    },
  },
  {
    id: 'azure-management-key',
    name: 'Azure Storage / API Secret Key',
    nameJa: 'Azure 管理キー / APIシークレット',
    category: 'credentials',
    description: 'Azure Storage Account Key、ConnectionString等の機密認証トークン。',
    defaultConfidence: 85,
    patterns: {
      regex: '[a-zA-Z0-9+/]{86}==',
      supportingKeywords: ['AccountKey', 'SharedAccessKey', 'DefaultEndpointsProtocol', 'azure', 'secret', 'APIKey'],
      proximity: 150,
    },
  },
  {
    id: 'custom-customer-edm',
    name: 'Exact Data Match (EDM) - Customer Database',
    nameJa: '完全データ一致 (EDM): 顧客マスター',
    category: 'edm',
    description: '顧客ID、氏名、電話番号のハッシュ値テーブルと完全照合する高精度分類子 (偽陽性ほぼ0%)。',
    defaultConfidence: 95,
    patterns: {
      regex: '\\bCUST-[0-9]{6}\\b',
      supportingKeywords: ['顧客コード', 'CUST', '会員ID', '契約番号'],
      proximity: 200,
    },
  },
];

export const INITIAL_SENSITIVITY_LABELS: SensitivityLabel[] = [
  {
    id: 'pub',
    name: 'Public',
    displayName: '一般公開 (Public)',
    color: '#10b981', // emerald
    priority: 0,
    encryption: {
      enabled: false,
      type: 'none',
      rights: 'viewer',
      allowExternalSharing: true,
    },
    visualMarking: {},
    autoLabeling: {
      enabled: false,
      conditionSITs: [],
      mode: 'recommend',
    },
  },
  {
    id: 'int',
    name: 'General / Internal',
    displayName: '社内限定 (Internal)',
    color: '#0284c7', // sky
    priority: 1,
    encryption: {
      enabled: false,
      type: 'none',
      rights: 'co-author',
      allowExternalSharing: false,
    },
    visualMarking: {
      footer: '社内限定利用 - 外部への無断転載禁止 [Contoso Corp]',
    },
    autoLabeling: {
      enabled: false,
      conditionSITs: [],
      mode: 'recommend',
    },
  },
  {
    id: 'conf',
    name: 'Confidential',
    displayName: '機密 (Confidential)',
    color: '#f59e0b', // amber
    priority: 2,
    encryption: {
      enabled: true,
      type: 'rms',
      rights: 'co-author',
      offlineAccessDays: 7,
      allowExternalSharing: false,
    },
    visualMarking: {
      header: '【機密情報 - 取扱注意】',
      footer: '保護対象: 権限のない転送・印刷・外部アクセスは禁止されています',
      watermark: 'CONFIDENTIAL',
    },
    autoLabeling: {
      enabled: true,
      conditionSITs: [
        { sitId: 'credit-card', minCount: 1, minConfidence: 85 },
        { sitId: 'jp-mynumber', minCount: 1, minConfidence: 75 },
      ],
      mode: 'recommend',
      justificationText: 'クレジット番号またはマイナンバーが検出されたため、機密ラベルを推奨します。',
    },
  },
  {
    id: 'highly-conf',
    name: 'Highly Confidential',
    displayName: '極秘 (Highly Confidential)',
    color: '#ef4444', // red
    priority: 3,
    encryption: {
      enabled: true,
      type: 'dke',
      rights: 'viewer',
      offlineAccessDays: 1,
      allowExternalSharing: false,
    },
    visualMarking: {
      header: '【極秘 - 二重暗号化対象】',
      footer: '社外流出厳禁 - DKE適用済み',
      watermark: 'HIGHLY RESTRICTED',
    },
    autoLabeling: {
      enabled: true,
      conditionSITs: [
        { sitId: 'jp-mynumber', minCount: 5, minConfidence: 85 },
        { sitId: 'azure-management-key', minCount: 1, minConfidence: 85 },
      ],
      mode: 'auto',
      justificationText: '多数のマイナンバーまたは管理者キーが検出されたため、自動的に極秘ラベルが付与されました。',
    },
  },
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'user-01',
    displayName: '田中 太郎 (Taro Tanaka)',
    email: 't.tanaka@contoso.com',
    department: 'Finance',
    country: 'JP',
    jobTitle: '財務マネージャー',
    riskScore: 24,
    tags: ['財務部', '一般ユーザー'],
  },
  {
    id: 'user-02',
    displayName: '佐藤 美咲 (Misaki Sato)',
    email: 'm.sato@contoso.com',
    department: 'Sales',
    country: 'JP',
    jobTitle: '法人営業担当',
    riskScore: 82, // elevated
    tags: ['営業部', '退職届提出済', 'リスク高'],
  },
  {
    id: 'user-03',
    displayName: '鈴木 一郎 (Ichiro Suzuki)',
    email: 'i.suzuki@contoso.com',
    department: 'Legal',
    country: 'JP',
    jobTitle: '法務コンプライアンス主任',
    riskScore: 12,
    tags: ['法務部', '監査権限者'],
  },
  {
    id: 'user-04',
    displayName: 'John Smith',
    email: 'j.smith@contoso.com',
    department: 'Engineering',
    country: 'US',
    jobTitle: 'クラウドアーキテクト',
    riskScore: 35,
    tags: ['開発部', '特権管理者'],
  },
  {
    id: 'user-05',
    displayName: '高橋 健二 (Kenji Takahashi)',
    email: 'k.takahashi@contoso.com',
    department: 'HR',
    country: 'JP',
    jobTitle: '人事担当マネージャー',
    riskScore: 15,
    tags: ['人事部', '個人情報取扱者'],
  },
];

export const SAMPLE_TEXT_SNIPPETS = [
  {
    title: 'マイナンバー含有の社内レポート',
    sitId: 'jp-mynumber',
    text: `【提出用書類】
従業員マイナンバー確認票
氏名: 山田 太郎
特定個人情報: 個人番号 1234-5678-9012 (通知カード確認済み)
利用目的: 社会保障および税務関連手続きのため。`,
  },
  {
    title: '顧客クレジットカード注文ログ',
    sitId: 'credit-card',
    text: `Transaction Order ID: #TX-99841
Customer Billing Info:
Cardholder: Kenji Yamada
Credit Card Number: 4532890123456789
CVV: 823
Exp Date: 12/28
Payment Status: Authorized via Payment Gateway.`,
  },
  {
    title: 'Azure インフラ接続文字列 (API Key)',
    sitId: 'azure-management-key',
    text: `// Cloud Database Storage Configuration
const connectionConfig = {
  accountName: "contosoprodstorage",
  endpointSuffix: "core.windows.net",
  AccountKey: "K8jH9g7F6e5D4c3B2a1Z0y9X8w7V6u5T4s3R2q1P0o9N8m7L6k5J4i3H2g1F0e9D8c7B6a5Z4y3X2w1V0u9T8s==",
  DefaultEndpointsProtocol: "https"
};`,
  },
  {
    title: '一般業務の会議議事録 (機密情報なし)',
    sitId: 'none',
    text: `2026年10月度 週次プロダクト定例会議
出席者: 田中、佐藤、鈴木
アジェンダ:
1. 次期Purviewコンプライアンス機能の社内勉強会スケジュール
2. アダプティブスコープ運用方針の確認
3. 次回ミーティングは来週火曜日10時より実施。`,
  },
];
