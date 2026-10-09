import { HybridAuthMethodDetail, SyncRuleItem } from '../types/hybrid';

export const HYBRID_AUTH_METHODS: HybridAuthMethodDetail[] = [
  {
    id: 'phs',
    name: 'Password Hash Synchronization (PHS)',
    nameJa: 'パスワードハッシュ同期 (PHS)',
    infrastructureRequirement: '最小 (AADCサーバー1台のみで完結、オンプレに追加サーバー不要)',
    offlineCloudLogin: true, // オンプレが全滅してもクラウドでサインイン可能
    supportsLeakedCredentials: true, // Identity Protectionの資格情報漏洩検知に対応
    onPremPasswordPolicyEnforcement: 'delayed', // 同期サイクル(標準2分)に依存
    seamlessSsoSupport: true,
    stepFlow: [
      '1. オンプレミスADのMD4パスワードハッシュから、AADCがさらにSHA-256で1000回ハッシュ計算して暗号化',
      '2. TLS 443経由でMicrosoft Entra ID (クラウド) へハッシュ値のみを同期 (平文パスワードは送られない)',
      '3. サインイン時、Entra IDがクラウド内でハッシュを直接検証して認証完了',
      '4. 特徴: オンプレミスサーバーや回線が停止していても、Office 365 / Azureへのサインインが継続可能！',
    ],
    examSummary: '【推奨デフォルト】最も可用性が高く、Identity Protectionの「漏洩した資格情報」検知を利用するために必須。障害復旧(DR)の観点からもMicrosoft第一推奨。',
  },
  {
    id: 'pta',
    name: 'Pass-through Authentication (PTA)',
    nameJa: 'パススルー認証 (PTA)',
    infrastructureRequirement: '中 (オンプレミスに軽量PTAエージェントを2〜3台導入して高可用性確保)',
    offlineCloudLogin: false, // オンプレが落ちると認証不可
    supportsLeakedCredentials: false, // クラウドにハッシュがないため検知不可 (PHS併用で解決可能)
    onPremPasswordPolicyEnforcement: 'realtime', // 即座にDCで判定
    seamlessSsoSupport: true,
    stepFlow: [
      '1. ユーザーがクラウド(login.microsoftonline.com)にユーザー名とパスワードを入力',
      '2. Entra IDがパスワードを公開鍵で暗号化し、クラウド上の安全なキューに登録',
      '3. オンプレミスのPTAエージェントがアウトバウンド443でキューをポーリングして取得',
      '4. PTAエージェントが社内ドメインコントローラー(DC)のWin32 LogonUser APIで検証',
      '5. 検証結果(成功/失敗/ログオン時間外/無効アカウント等)をクラウドに返し、即座にリアルタイム判定！',
    ],
    examSummary: '【オンプレミス厳格運用】パスワードハッシュのクラウド保管を社内規定で禁止している場合や、「ログオン可能時間帯」「アカウント無効化」を即時リアルタイムで反映させたい場合に最適。',
  },
  {
    id: 'adfs',
    name: 'Active Directory Federation Services (AD FS)',
    nameJa: 'フェデレーション認証 (AD FS)',
    infrastructureRequirement: '最大 (AD FSファーム + WAP Webアプリケーションプロキシ + パブリックSSL証明書 + ロードバランサー)',
    offlineCloudLogin: false,
    supportsLeakedCredentials: false,
    onPremPasswordPolicyEnforcement: 'realtime',
    seamlessSsoSupport: false, // ADFS独自のWIA(Windows統合認証)を使用
    stepFlow: [
      '1. ユーザーがクラウドへアクセスすると、オンプレミスのADFS/WAPのURLへリダイレクト',
      '2. 社内ADFSサーバーに対してKerberos / スマートカード(PKI) / サードパーティMFAで認証',
      '3. ADFSサーバーがSAMLトークンを発行して署名',
      '4. ブラウザがSAMLアサーションをEntra IDにPOST送信し、トークン信頼関係によりサインイン完了',
    ],
    examSummary: '【レガシーまたは特殊要件】スマートカード認証(PIV/CAC)やオンプレミス3rdパーティMFA、複雑なクレーム変換が必要な場合に使用。管理コストと障害リスクが最も高い。',
  },
];

export const SYNC_RULES_PRESETS: SyncRuleItem[] = [
  {
    id: 'rule-in-ad-useraccount',
    name: 'In from AD - User AccountEnabled',
    direction: 'Inbound',
    precedence: 100,
    connectedSystem: 'corp.contoso.com (Active Directory)',
    sourceAttribute: 'userAccountControl',
    targetAttribute: 'accountEnabled',
    transformationType: 'Expression',
    expression: 'IIF(BitAnd([userAccountControl],2)=2,False,True)',
    description: 'オンプレミスADのuserAccountControl属性をビット演算し、アカウント有効/無効をメタバースへマッピングする標準規則。',
  },
  {
    id: 'rule-in-ad-userupn',
    name: 'In from AD - User UserPrincipalName',
    direction: 'Inbound',
    precedence: 101,
    connectedSystem: 'corp.contoso.com (Active Directory)',
    sourceAttribute: 'userPrincipalName',
    targetAttribute: 'userPrincipalName',
    transformationType: 'Direct',
    description: 'オンプレミスのUPNをメタバースオブジェクトのUPNへ直接同期。',
  },
  {
    id: 'rule-custom-mail-as-upn',
    name: 'In from AD - Custom Mail As UPN (カスタム規則)',
    direction: 'Inbound',
    precedence: 50, // 既定(100)より小さい値 ➔ 優先適用される！
    connectedSystem: 'corp.contoso.com (Active Directory)',
    sourceAttribute: 'mail',
    targetAttribute: 'userPrincipalName',
    transformationType: 'Direct',
    description: '【試験最頻出】オンプレミスADのUPNが「.local」など非ルーティングドメインの場合、メールアドレス(mail)属性をクラウドのUPNとして同期させるカスタム規則。Precedenceを50に設定して既定ルール(100)を上書き！',
  },
  {
    id: 'rule-out-aad-user',
    name: 'Out to AAD - User Identity',
    direction: 'Outbound',
    precedence: 150,
    connectedSystem: 'contoso.onmicrosoft.com (Microsoft Entra ID)',
    sourceAttribute: 'userPrincipalName',
    targetAttribute: 'userPrincipalName',
    transformationType: 'Direct',
    description: 'メタバースからクラウド(Entra ID)へ属性をプロビジョニングするアウトバウンド規則。',
  },
];
