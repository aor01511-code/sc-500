import React, { useState } from 'react';
import { MANAGED_IDENTITY_SCENARIOS, DYNAMIC_DEVICE_PRESETS } from '../data/entraData';
import { 
  Users, 
  Server, 
  Laptop, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  RefreshCw,
  ArrowRight,
  Code2
} from 'lucide-react';

export const EntraManagementSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'guests' | 'managed-id' | 'dynamic-devices'>('managed-id');

  // Guest Management State
  const [guestAccessLevel, setGuestAccessLevel] = useState<'default' | 'limited' | 'restricted'>('limited');
  const [invitedEmail, setInvitedEmail] = useState<string>('partner.auditor@external-audit.com');
  const [invitationStatus, setInvitationStatus] = useState<string | null>(null);

  // Managed Identity State
  const [selectedMiType, setSelectedMiType] = useState<'system-assigned' | 'user-assigned'>('system-assigned');

  // Dynamic Devices State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(DYNAMIC_DEVICE_PRESETS[0].id);
  const activePreset = DYNAMIC_DEVICE_PRESETS.find((p) => p.id === selectedPresetId) || DYNAMIC_DEVICE_PRESETS[0];

  const handleSendInvite = () => {
    setInvitationStatus(`招待状が正常に送信されました。ユーザーのUPNは一時的に「${invitedEmail.replace('@', '_')}#EXT#@contoso.onmicrosoft.com」として登録されました。`);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>Microsoft Entra ID (Azure AD)</span>
              <span>·</span>
              <span>リソース & デバイス & 外部コラボレーション</span>
              <span>·</span>
              <span>Guests vs Members & Managed Identities & Dynamic Devices</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Entra ID 管理基盤 (ゲスト・マネージドID・動的デバイス)
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              外部組織との協業を支えるB2Bゲスト管理、シークレットレスでAzureリソース間を認証するマネージドID、およびIntune準拠属性に基づく動的デバイスグループの仕組みを検証します。
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('managed-id')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'managed-id'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4 text-sky-400" />
          <span>1. マネージドID (Managed Identity)</span>
        </button>

        <button
          onClick={() => setActiveTab('guests')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'guests'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-400" />
          <span>2. ゲスト (Guest) vs メンバー (Member)</span>
        </button>

        <button
          onClick={() => setActiveTab('dynamic-devices')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'dynamic-devices'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Laptop className="w-4 h-4 text-indigo-400" />
          <span>3. 動的デバイス (Dynamic Devices)</span>
        </button>
      </div>

      {/* TAB 1: Managed Identity */}
      {activeTab === 'managed-id' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-sky-400" />
                <span>マネージドID (Managed Identity): 資格情報のハードコードを根絶</span>
              </h3>
              <p className="text-slate-400 mt-0.5">
                Azure VM や App Service が Azure Key Vault や Azure SQL に安全にアクセスする仕組み。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MANAGED_IDENTITY_SCENARIOS.map((mi) => {
              const isSelected = selectedMiType === mi.type;
              return (
                <button
                  key={mi.id}
                  onClick={() => setSelectedMiType(mi.type)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-slate-950 border-sky-500 shadow-md ring-1 ring-sky-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{mi.nameJa}</span>
                    {isSelected && <span className="text-[10px] text-sky-400 font-mono font-bold">SELECTED</span>}
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <div><strong>ライフサイクル:</strong> {mi.lifecycle}</div>
                    <div><strong>共有スコープ:</strong> {mi.sharingScope}</div>
                    <div><strong>シークレット管理:</strong> {mi.credentialStorage}</div>
                    <div className="text-sky-300 pt-1"><strong>おすすめ用途:</strong> {mi.recommendation}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Architecture IMDS flow */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
            <span className="font-bold text-slate-200 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-sky-400" />
              <span>マネージドIDの通信シーケンス (IMDS エンドポイント)</span>
            </span>

            <div className="p-3 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-slate-300 space-y-1">
              <div className="text-slate-500">// 1. Azureリソース内部からIMDS (169.254.169.254) にトークン要求 (認証ヘッダーのみ)</div>
              <div className="text-sky-300">GET http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://vault.azure.net</div>
              <div className="text-slate-500 pt-1">// 2. プラットフォームが Entra ID からアクセストークンを自動取得して返却</div>
              <div className="text-emerald-300">&#123; "access_token": "eyJ0eXAi...", "expires_on": "1742080000", "token_type": "Bearer" &#125;</div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              ソースコードや設定ファイルにパスワード、APIキー、シークレットを書き込む必要が完全にゼロになり、定期的なキー交換（ローテーション）もAzureが完全自動で行います。
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: Guests vs Members */}
      {activeTab === 'guests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span>ゲスト (B2B External Guests) vs メンバー (Members)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Invitation Simulator */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-white">外部パートナーをゲストとして招待する</span>
                <div>
                  <label className="text-slate-400 block mb-1">招待先メールアドレス:</label>
                  <input
                    type="email"
                    value={invitedEmail}
                    onChange={(e) => setInvitedEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>
                <button
                  onClick={handleSendInvite}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  B2B 招待メールを送信
                </button>
                {invitationStatus && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded text-[11px] text-emerald-300">
                    {invitationStatus}
                  </div>
                )}
              </div>
            </div>

            {/* Comparison Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3">
              <span className="font-bold text-white">ゲストとメンバーの決定的な違い:</span>
              <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong>ユーザープリンシパル名 (UPN):</strong> ゲストは <code className="bg-slate-900 px-1 py-0.5 rounded text-sky-300">user_partner.com#EXT#@contoso.onmicrosoft.com</code> という形式で識別される。
                </li>
                <li>
                  <strong>ディレクトリ権限:</strong> デフォルトでは自組織のグループ一覧や他の従業員のプロファイル閲覧が厳格に制限される。
                </li>
                <li>
                  <strong>認証の委任:</strong> 認証自体はゲスト側のホーム組織（相手のEntra IDやGoogleアカウント）で行われ、パスワードをContoso側が保持することはない。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Dynamic Devices */}
      {activeTab === 'dynamic-devices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-indigo-400" />
              <span>動的デバイス (Dynamic Device Groups) ルール設計</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              必要ライセンス: <strong className="text-sky-300">Entra ID P1 以上</strong>
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-semibold text-slate-300">事前定義ルールの選択:</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DYNAMIC_DEVICE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-950 border-sky-500 shadow-sm ring-1 ring-sky-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs">{preset.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">対象: {preset.target}</div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{activePreset.name}</span>
                <span className="font-mono text-sky-400 font-bold">合致デバイス数: {activePreset.matchedCount} 台</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block mb-1">メンバーシップ規則構文 (OPATH):</span>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded font-mono text-[11px] text-sky-300 break-all">
                  {activePreset.query}
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {activePreset.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
