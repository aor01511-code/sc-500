import React, { useState } from 'react';
import { ENTRA_ROLES } from '../data/entraData';
import { EntraRole } from '../types/entra';
import { 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Play,
  Lightbulb
} from 'lucide-react';

interface EntraRoleSimulatorProps {
  onNavigateToQuiz?: (topic: string) => void;
}

interface ActionTest {
  id: string;
  name: string;
  category: string;
  targetAccountType: 'non-admin' | 'helpdesk-admin' | 'user-admin' | 'global-admin' | 'config';
  targetAccountName: string;
  description: string;
  allowedRoles: string[];
}

export const EntraRoleSimulator: React.FC<EntraRoleSimulatorProps> = ({ onNavigateToQuiz }) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>('helpdesk-admin');
  const [actionResult, setActionResult] = useState<{
    actionId: string;
    actionName: string;
    success: boolean;
    operatorRole: string;
    targetAccountName: string;
    message: string;
    reasonExamNote: string;
    allowedRolesList: string[];
  } | null>(null);

  const currentRole = ENTRA_ROLES.find((r) => r.id === selectedRoleId) || ENTRA_ROLES[0];

  // Test operations in Entra ID
  const testActions: ActionTest[] = [
    {
      id: 'reset-normal-user',
      name: '一般社員 (非管理者) のパスワードをリセットする',
      category: 'パスワード管理',
      targetAccountType: 'non-admin',
      targetAccountName: '山田 太郎 (営業部・一般社員)',
      description: '日常的なパスワード失念に対応するTier 1サポート業務。',
      allowedRoles: ['helpdesk-admin', 'user-admin', 'password-admin', 'auth-admin', 'global-admin', 'priv-role-admin'],
    },
    {
      id: 'reset-helpdesk-admin',
      name: 'ヘルプデスク管理者 のパスワードをリセットする',
      category: 'パスワード管理',
      targetAccountType: 'helpdesk-admin',
      targetAccountName: '佐藤 サポート担当 (ヘルプデスク管理者)',
      description: 'ヘルプデスクロールを持つ管理者のパスワード再設定。',
      allowedRoles: ['user-admin', 'auth-admin', 'global-admin', 'priv-role-admin'],
    },
    {
      id: 'reset-user-admin',
      name: 'ユーザー管理者 のパスワードをリセットする',
      category: 'パスワード管理',
      targetAccountType: 'user-admin',
      targetAccountName: '鈴木 アイデンティティ主任 (ユーザー管理者)',
      description: 'ユーザー管理者自身のパスワード失念時の対応。',
      allowedRoles: ['global-admin', 'priv-role-admin'],
    },
    {
      id: 'reset-global-admin',
      name: 'グローバル管理者 のパスワードをリセットする',
      category: 'パスワード管理',
      targetAccountType: 'global-admin',
      targetAccountName: '特権運用責任者 (グローバル管理者)',
      description: '最高特権を持つアカウントのパスワード再設定。',
      allowedRoles: ['global-admin', 'priv-role-admin'],
    },
    {
      id: 'edit-conditional-access',
      name: '条件付きアクセス (Conditional Access) ポリシーを変更する',
      category: 'セキュリティ設定',
      targetAccountType: 'config',
      targetAccountName: '「全社MFA必須化」ポリシー',
      description: 'サインイン制御やゼロトラスト要件の構成。',
      allowedRoles: ['cond-access-admin', 'sec-admin', 'global-admin'],
    },
    {
      id: 'register-sso-app',
      name: 'SaaSアプリへのSAMLシングルサインオン (SSO) を構成する',
      category: 'アプリケーション管理',
      targetAccountType: 'config',
      targetAccountName: 'Salesforce / Slack エンタープライズアプリ',
      description: 'エンタープライズアプリケーションのSAML/OIDC連携設定。',
      allowedRoles: ['app-admin', 'global-admin'],
    },
    {
      id: 'assign-group-license',
      name: 'Microsoft 365 E5 ライセンスをグループに割り当てる',
      category: 'ライセンス管理',
      targetAccountType: 'config',
      targetAccountName: '全社ライセンス割り当て設定',
      description: 'グループベースのライセンス付与の構成。',
      allowedRoles: ['license-admin', 'user-admin', 'global-admin'],
    },
    {
      id: 'edit-dynamic-group',
      name: '動的グループ (Dynamic Group) のメンバールールを編集する',
      category: 'グループ管理',
      targetAccountType: 'config',
      targetAccountName: '「国内営業部 動的セキュリティグループ」',
      description: '属性クエリによる自動グループ化ルールの変更。',
      allowedRoles: ['groups-admin', 'user-admin', 'global-admin'],
    },
    {
      id: 'approve-pim-request',
      name: 'PIM (特権ロール) の昇格要求を承認する',
      category: '特権ガバナンス',
      targetAccountType: 'config',
      targetAccountName: 'セキュリティ管理者へのJust-In-Time昇格要求',
      description: 'PIMで申請されたロール昇格の承認ワークフロー操作。',
      allowedRoles: ['priv-role-admin', 'global-admin'],
    },
  ];

  const executeActionTest = (roleId: string, actionId: string) => {
    const role = ENTRA_ROLES.find((r) => r.id === roleId) || currentRole;
    const action = testActions.find((a) => a.id === actionId);
    if (!action) return;

    setSelectedRoleId(role.id);
    const isAllowed = action.allowedRoles.includes(role.id);
    const allowedRoleNames = action.allowedRoles.map((rId) => {
      const r = ENTRA_ROLES.find((item) => item.id === rId);
      return r ? r.nameJa : rId;
    });

    let reasonExamNote = '';
    if (action.id === 'reset-user-admin' && role.id === 'helpdesk-admin') {
      reasonExamNote = '【試験最頻出の落とし穴】ヘルプデスク管理者は「非管理者 (一般ユーザー)」のパスワードしかリセットできません。ユーザー管理者は上位ロールのため、ヘルプデスクによるリセットは拒否されます。';
    } else if (action.id === 'reset-helpdesk-admin' && role.id === 'user-admin') {
      reasonExamNote = '【試験合格の鍵】ユーザー管理者は、一般ユーザーに加えて「ヘルプデスク管理者」や「パスワード管理者」などのTier 2管理者のパスワードをリセットできます。';
    } else if (action.id === 'edit-conditional-access' && !isAllowed) {
      reasonExamNote = '条件付きアクセスの作成・変更には「条件付きアクセス管理者」「セキュリティ管理者」「グローバル管理者」のいずれかが必要です。最小特権の原則を保つため他のロールでは拒否されます。';
    } else if (isAllowed) {
      reasonExamNote = `「${role.nameJa}」にはこの操作を実行する正当な権限が付与されています。最小特権の原則に合致しています。`;
    } else {
      reasonExamNote = `最小特権の原則に基づき、操作には上位の管理者ロール（${allowedRoleNames.slice(0, 2).join('または')}）が必要です。`;
    }

    setActionResult({
      actionId: action.id,
      actionName: action.name,
      success: isAllowed,
      operatorRole: role.nameJa,
      targetAccountName: action.targetAccountName,
      message: isAllowed
        ? `操作が許可されました: 「${role.nameJa}」として正常に実行を完了しました。`
        : `アクセス拒否 (403 Forbidden): 「${role.nameJa}」には「${action.targetAccountName}」を操作する権限がありません！`,
      reasonExamNote,
      allowedRolesList: allowedRoleNames,
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner & Mission Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>Microsoft Entra ID (Azure AD)</span>
              <span>·</span>
              <span>ロール権限 & パスワードリセット階層</span>
              <span>·</span>
              <span>Role Delegation & Permissions Sandbox</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Entra ID ロール権限 & 委任シミュレーター
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              「どのロールが、誰のパスワードをリセットできるのか」「どのロールなら条件付きアクセスを変更できるのか」をボタン1つでテストし、結果と試験の出題理由を即座に確認できます。
            </p>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Lightbulb className="w-4 h-4" />
            <span>【迷ったらここを押すだけ！】試験でよく出るパターンを1クリックで試す:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => executeActionTest('helpdesk-admin', 'reset-normal-user')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ヘルプデスク ➔ 一般社員リセット</div>
                <div className="text-[10px] text-emerald-400 font-medium">結果: 許可 (成功)</div>
              </div>
            </button>

            <button
              onClick={() => executeActionTest('helpdesk-admin', 'reset-user-admin')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ヘルプデスク ➔ ユーザー管理者リセット</div>
                <div className="text-[10px] text-rose-400 font-medium">結果: 拒否 (超頻出の落とし穴)</div>
              </div>
            </button>

            <button
              onClick={() => executeActionTest('user-admin', 'reset-helpdesk-admin')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ユーザー管理者 ➔ ヘルプデスクリセット</div>
                <div className="text-[10px] text-emerald-400 font-medium">結果: 許可 (下位管理者はOK)</div>
              </div>
            </button>

            <button
              onClick={() => executeActionTest('helpdesk-admin', 'edit-conditional-access')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ヘルプデスク ➔ 条件付きアクセス変更</div>
                <div className="text-[10px] text-rose-400 font-medium">結果: 拒否 (権限不足)</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Operation Result Banner (High-visibility) */}
      {actionResult && (
        <div className={`p-5 rounded-lg border shadow-lg space-y-3 animate-in fade-in duration-200 ${
          actionResult.success
            ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
            : 'bg-rose-950/40 border-rose-600/70 text-rose-200'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {actionResult.success ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-mono font-bold tracking-wider uppercase opacity-80">
                  【操作の検証結果】
                </span>
                <h3 className="text-base font-bold text-white">
                  {actionResult.success ? '✓ 実行成功: 権限があります' : '✕ アクセス拒否 (403 Forbidden): 権限がありません'}
                </h3>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-400">操作者: </span>
              <strong className="text-white">{actionResult.operatorRole}</strong>
            </div>
          </div>

          <div className="p-3 bg-slate-950/80 rounded border border-slate-800 text-xs space-y-1.5 text-slate-200">
            <div>
              <strong>試した操作:</strong> {actionResult.actionName} (対象: {actionResult.targetAccountName})
            </div>
            <div className="text-slate-300">
              <strong>システムの判定:</strong> {actionResult.message}
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 rounded border border-amber-900/40 text-xs space-y-1">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4" />
              <span>なぜ試験でこう判定されるのか？ (試験対策の解説)</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              {actionResult.reasonExamNote}
            </p>
            <div className="text-slate-400 text-[10px] pt-1">
              この操作が許可される正しいロール: <span className="text-sky-300 font-semibold">{actionResult.allowedRolesList.join('、')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Two-Zone Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: STEP 1 - Role Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div>
                <div className="text-xs font-bold text-sky-400">【STEP 1】</div>
                <h2 className="text-sm font-semibold text-white">操作する管理者ロールを選択</h2>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                currentRole.tierLevel === 0
                  ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                  : currentRole.tierLevel === 1
                  ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                  : 'bg-sky-950/60 text-sky-300 border-sky-800/60'
              }`}>
                {currentRole.category}
              </span>
            </div>

            <p className="text-slate-400 text-[11px] mb-3">
              下のリストからロールをクリックして切り替えると、右側の実行テストでの権限が変化します。
            </p>

            <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
              {ENTRA_ROLES.map((role) => {
                const isSelected = selectedRoleId === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRoleId(role.id);
                      setActionResult(null);
                    }}
                    className={`w-full text-left p-2.5 rounded border text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-sky-950/50 border-sky-500 text-white shadow-sm ring-1 ring-sky-500/40'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1.5">
                        <span>{role.nameJa}</span>
                        {isSelected && <span className="text-[10px] text-sky-400 font-mono font-bold">● 選択中</span>}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{role.name}</div>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">Tier {role.tierLevel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Current Role Details & Constraints */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white text-sm">「{currentRole.nameJa}」の権限範囲</span>
              <span className="text-slate-500 font-mono text-[11px]">{currentRole.name}</span>
            </div>

            <p className="text-slate-300 leading-relaxed text-[11px]">
              {currentRole.description}
            </p>

            <div className="pt-2 border-t border-slate-800/60">
              <span className="text-emerald-400 font-semibold block mb-1">✓ 許可されている主要アクション:</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                {currentRole.keyPermissions.map((perm, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400">・</span>
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>

            {currentRole.cannotDo.length > 0 && (
              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-rose-400 font-semibold block mb-1">✕ 制限事項 (実行不可):</span>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  {currentRole.cannotDo.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-rose-400">・</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Zone: STEP 2 - Operations Testing Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="text-xs font-bold text-sky-400">【STEP 2】</div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span>試したい操作の「権限をテスト」ボタンを押す</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  現在の実行者: <strong className="text-sky-300">{currentRole.nameJa}</strong>
                </div>
              </div>
              <span className="text-xs text-slate-500">クリックで即時判定</span>
            </div>

            {/* Test Actions List */}
            <div className="space-y-2.5">
              {testActions.map((act) => {
                const isRolePermitted = act.allowedRoles.includes(currentRole.id);

                return (
                  <div
                    key={act.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{act.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">[{act.category}]</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        対象: <span className="text-slate-300 font-medium">{act.targetAccountName}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => executeActionTest(currentRole.id, act.id)}
                      className={`px-3 py-1.5 rounded font-semibold text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 ${
                        isRolePermitted
                          ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      <span>権限をテスト</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Password Reset Hierarchy Reference Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-400" />
              <span>【試験超頻出】パスワードリセットの委任階層ルール (まとめ)</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-rose-300">Tier 0 (グローバル管理者 / 特権ロール管理者):</span>
                </div>
                <div className="text-slate-400 pl-4">
                  ➔ すべての管理者および一般ユーザーのパスワードをリセット可能。
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                  <span className="font-bold text-amber-300">Tier 1 (ユーザー管理者 / 認証管理者):</span>
                </div>
                <div className="text-slate-400 pl-4">
                  ➔ 一般ユーザーに加え、「ヘルプデスク管理者」「パスワード管理者」等のTier 2管理者をリセット可能。<strong className="text-rose-400">同等以上（グローバル管理者やセキュリティ管理者）はリセット不可！</strong>
                </div>

                <div className="flex items-center gap-2 pt-1 border-t border-slate-900">
                  <span className="font-bold text-sky-300">Tier 2 (ヘルプデスク管理者 / パスワード管理者):</span>
                </div>
                <div className="text-slate-400 pl-4">
                  ➔ <strong className="text-amber-400">非管理者 (一般社員) のみ</strong>リセット可能。同じヘルプデスク管理者や上位管理者は一切リセット不可！
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
