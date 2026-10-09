import React, { useState } from 'react';
import { AZURE_RBAC_ROLES, INITIAL_RESOURCE_TREE, PIM_ASSIGNMENTS_PRESET } from '../data/azureSecData';
import { AzureRbacRole, AzureResourceNode, PimAssignment } from '../types/azureSec';
import { 
  Key, 
  Layers, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Play, 
  Sparkles, 
  Clock, 
  FolderTree, 
  Trash2, 
  RefreshCw,
  Info,
  Server,
  FileCode,
  Shield,
  FileCheck,
  Check,
  UserCheck,
  Users
} from 'lucide-react';

interface AzureRbacPimSimulatorProps {
  onNavigateToQuiz?: (topic: string) => void;
}

export const AzureRbacPimSimulator: React.FC<AzureRbacPimSimulatorProps> = ({ onNavigateToQuiz }) => {
  const [activeTab, setActiveTab] = useState<'hierarchy-lock' | 'pim-lifecycle' | 'custom-role' | 'policy-blueprints'>('hierarchy-lock');

  // Resource Tree & Lock State
  const [resourceTree, setResourceTree] = useState<AzureResourceNode[]>(INITIAL_RESOURCE_TREE);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('rg-web');
  const [actionOutput, setActionOutput] = useState<{
    action: string;
    success: boolean;
    title: string;
    message: string;
    examReason: string;
  } | null>(null);

  // PIM Assignments State
  const [pimAssignments, setPimAssignments] = useState<PimAssignment[]>(PIM_ASSIGNMENTS_PRESET);
  const [selectedPimId, setSelectedPimId] = useState<string>('pim-1');
  const [pimJustification, setPimJustification] = useState<string>('本番VMの障害復旧およびセキュリティパッチ適用作業のため');
  const [pimDurationHours, setPimDurationHours] = useState<number>(4);
  const [accessReviewStatus, setAccessReviewStatus] = useState<'pending' | 'approved' | 'revoked'>('pending');

  // Custom Role State
  const [selectedRoleId, setSelectedRoleId] = useState<string>('custom-vm-operator');
  const currentCustomRole = AZURE_RBAC_ROLES.find((r) => r.id === selectedRoleId) || AZURE_RBAC_ROLES[0];

  // Azure Policy State
  const [policyEnforcement, setPolicyEnforcement] = useState<'Audit' | 'Deny'>('Deny');
  const [deployRegionAttempt, setDeployRegionAttempt] = useState<'Japan East' | 'East US'>('East US');
  const [policyDeployResult, setPolicyDeployResult] = useState<{
    success: boolean;
    title: string;
    detail: string;
  } | null>(null);

  const selectedNode = resourceTree.find((n) => n.id === selectedNodeId) || resourceTree[0];
  const selectedPim = pimAssignments.find((p) => p.id === selectedPimId) || pimAssignments[0];

  // Handler for resource action (Test Delete / Update)
  const handleTestResourceAction = (actionType: 'delete' | 'update') => {
    const currentLock = selectedNode.lock || 'None';

    if (actionType === 'delete') {
      if (currentLock === 'CanNotDelete' || currentLock === 'ReadOnly') {
        setActionOutput({
          action: 'リソースの削除試行 (Delete)',
          success: false,
          title: `削除が拒否されました (403 ScopeLocked: ${currentLock})`,
          message: `対象「${selectedNode.name}」には【${currentLock}】リソースロックが設定されています。サブスクリプション所有者(Owner)であっても、明示的にロックを解除しない限り削除できません！`,
          examReason: '【試験最頻出】リソースロック (CanNotDelete / ReadOnly) はRBAC権限よりも優先して評価されます。最高特権のOwnerであってもリソース削除は遮断されます。',
        });
      } else {
        setActionOutput({
          action: 'リソースの削除試行 (Delete)',
          success: true,
          title: '削除成功 (リソース破棄完了)',
          message: `ロックが設定されていないため、「${selectedNode.name}」は正常に削除されました。`,
          examReason: 'リソースロックが存在しない場合、共同作成者(Contributor)または所有者(Owner)はリソースを即座に削除可能です。本番環境ではCanNotDeleteロックが必須です。',
        });
      }
    } else if (actionType === 'update') {
      if (currentLock === 'ReadOnly') {
        setActionOutput({
          action: 'リソースの設定更新・再起動試行 (Update/Write)',
          success: false,
          title: '更新が拒否されました (403 ScopeLocked: ReadOnly)',
          message: `「${selectedNode.name}」には【ReadOnly】ロックが設定されているため、あらゆる設定変更やVM再起動アクションが遮断されます。`,
          examReason: '【CanNotDelete と ReadOnly の違い】CanNotDeleteは「変更は許可、削除のみ禁止」。ReadOnlyは「変更も削除も両方禁止」となります。',
        });
      } else {
        setActionOutput({
          action: 'リソースの設定更新・再起動試行 (Update/Write)',
          success: true,
          title: '更新成功 (設定変更完了)',
          message: `「${selectedNode.name}」の設定更新が完了しました。(CanNotDeleteロックは変更・更新操作をブロックしません)`,
          examReason: 'CanNotDelete ロック下では、VM再起動やWebアプリのデプロイなどの更新作業は通常通り実行可能です。',
        });
      }
    }
  };

  // Change Lock on selected node
  const handleApplyLock = (lockType: 'None' | 'CanNotDelete' | 'ReadOnly') => {
    setResourceTree((prev) =>
      prev.map((node) => {
        if (node.id === selectedNodeId) {
          return { ...node, lock: lockType };
        }
        // Inherit to children if RG
        if (selectedNodeId === 'rg-web' && node.parentId === 'rg-web') {
          return { ...node, lock: lockType };
        }
        if (selectedNodeId === 'rg-db' && node.parentId === 'rg-db') {
          return { ...node, lock: lockType };
        }
        return node;
      })
    );
  };

  // Toggle PIM Activation
  const handleTogglePimActivation = (assignmentId: string) => {
    setPimAssignments((prev) =>
      prev.map((item) => {
        if (item.id === assignmentId) {
          const nextState = item.state === 'eligible' ? 'active' : 'eligible';
          return { ...item, state: nextState };
        }
        return item;
      })
    );
  };

  // Test Policy Deployment
  const handleTestPolicyDeploy = () => {
    if (deployRegionAttempt === 'East US') {
      if (policyEnforcement === 'Deny') {
        setPolicyDeployResult({
          success: false,
          title: 'ポリシー違反: リソース作成が拒否されました (RequestDisallowedByPolicy)',
          detail: '「指定リージョンのみ許可ポリシー (Allowed Locations: Japan East / Japan West)」により、East US リージョンへの新規リソース作成要求はブロックされました。',
        });
      } else {
        setPolicyDeployResult({
          success: true,
          title: 'リソースは作成されましたが「非準拠 (Non-compliant)」として監査ログに記録されました',
          detail: 'ポリシー効果が「Audit」の場合、デプロイ自体は通過しますが、コンプライアンスレポート上でフラグが立ちます。',
        });
      }
    } else {
      setPolicyDeployResult({
        success: true,
        title: 'ポリシー準拠: デプロイ成功',
        detail: `「${deployRegionAttempt}」は許可リストに含まれているため、正常にリソースがプロビジョニングされました。`,
      });
    }
  };

  // 1-Click Quick Demo Mission trigger
  const triggerMission = (mission: 'lock-prevent-delete' | 'lock-readonly' | 'pim-activate' | 'access-review' | 'policy-deny') => {
    if (mission === 'lock-prevent-delete') {
      setActiveTab('hierarchy-lock');
      setSelectedNodeId('rg-web');
      handleApplyLock('CanNotDelete');
      setTimeout(() => handleTestResourceAction('delete'), 100);
    } else if (mission === 'lock-readonly') {
      setActiveTab('hierarchy-lock');
      setSelectedNodeId('rg-db');
      handleApplyLock('ReadOnly');
      setTimeout(() => handleTestResourceAction('update'), 100);
    } else if (mission === 'pim-activate') {
      setActiveTab('pim-lifecycle');
      setSelectedPimId('pim-1');
      handleTogglePimActivation('pim-1');
    } else if (mission === 'access-review') {
      setActiveTab('pim-lifecycle');
      setAccessReviewStatus('revoked');
    } else if (mission === 'policy-deny') {
      setActiveTab('policy-blueprints');
      setDeployRegionAttempt('East US');
      setPolicyEnforcement('Deny');
      setTimeout(() => handleTestPolicyDeploy(), 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>Azure ガバナンス & 特権アクセス管理</span>
              <span>·</span>
              <span>SC-300 / SC-500 / AZ-500 対策</span>
              <span>·</span>
              <span>PIM & RBAC & Azure Policy & Locks</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Azure PIM & 階層スコープ・リソースロック・Policy 検証スタジオ
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              管理グループ ➔ サブスクリプション ➔ リソースグループの階層継承、PIM (JIT昇格・アクセスレビュー)、リソースロック(CanNotDelete / ReadOnly)、Azure Policy / ブループリント、カスタムロールNotActionsを検証します。
            </p>
          </div>
        </div>

        {/* 3-Step Guided Navigation Banner (解決策: 何をしたらいいか一目でわかるガイド) */}
        <div className="mt-4 p-3 bg-slate-950/80 rounded border border-sky-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-sky-300 font-bold shrink-0">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>【シミュレーターの使い方: 3ステップ実践手順】</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-slate-300 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">① 下のミッションを選択</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">② パラメータや操作ボタンを実行</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">③ 判定理由 & 試験の落とし穴を確認</span>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Cards */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>【1クリック体験ミッション】試したいシナリオをクリックしてください:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <button
              onClick={() => triggerMission('lock-prevent-delete')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">所有者による削除試行</div>
                <div className="text-[10px] text-rose-400 font-medium">CanNotDeleteロックで阻止</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('lock-readonly')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ReadOnlyで変更試行</div>
                <div className="text-[10px] text-amber-400 font-medium">更新・再起動も遮断</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('pim-activate')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">PIM JIT特権昇格</div>
                <div className="text-[10px] text-sky-400 font-medium">理由/MFAで時限アクティブ化</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('access-review')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-indigo-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-indigo-950 border border-indigo-700 text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">アクセスレビュー (棚卸し)</div>
                <div className="text-[10px] text-indigo-400 font-medium">不要な特権を自動剥奪</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('policy-deny')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Azure Policy 拒否判定</div>
                <div className="text-[10px] text-emerald-400 font-medium">非許可リージョン作成阻止</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Action Result Banner */}
      {actionOutput && (
        <div className={`p-5 rounded-lg border shadow-lg space-y-2 animate-in fade-in duration-200 ${
          actionOutput.success
            ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
            : 'bg-rose-950/40 border-rose-600/70 text-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionOutput.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <h3 className="text-sm font-bold text-white">{actionOutput.title}</h3>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed pl-7">
            {actionOutput.message}
          </p>
          <div className="p-3 bg-slate-900/90 rounded border border-amber-900/50 text-xs space-y-1 mt-2">
            <div className="font-bold text-amber-300">💡 試験対策のポイント:</div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              {actionOutput.examReason}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('hierarchy-lock')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'hierarchy-lock'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderTree className="w-3.5 h-3.5" />
          <span>1. 階層スコープ & リソースロック</span>
        </button>

        <button
          onClick={() => setActiveTab('pim-lifecycle')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'pim-lifecycle'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>2. Azure PIM (JIT昇格 & アクセスレビュー)</span>
        </button>

        <button
          onClick={() => setActiveTab('policy-blueprints')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'policy-blueprints'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>3. Azure Policy & ブループリント</span>
        </button>

        <button
          onClick={() => setActiveTab('custom-role')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'custom-role'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>4. RBAC 組み込み vs カスタム (NotActions)</span>
        </button>
      </div>

      {/* TAB 1: Resource Hierarchy & Locks */}
      {activeTab === 'hierarchy-lock' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Hierarchy Tree (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
                <FolderTree className="w-4 h-4 text-sky-400" />
                <span>Azure 階層スコープツリー (選択してロック変更)</span>
              </span>

              <div className="space-y-1.5">
                {resourceTree.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const indentClass =
                    node.type === 'management-group'
                      ? 'pl-2'
                      : node.type === 'subscription'
                      ? 'pl-5'
                      : node.type === 'resource-group'
                      ? 'pl-8'
                      : 'pl-11';

                  return (
                    <button
                      key={node.id}
                      onClick={() => {
                        setSelectedNodeId(node.id);
                      }}
                      className={`w-full text-left p-2.5 rounded border text-xs transition-colors flex items-center justify-between ${indentClass} ${
                        isSelected
                          ? 'bg-sky-950/50 border-sky-500 text-white shadow-sm ring-1 ring-sky-500/40'
                          : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate">
                        <div className="font-semibold text-slate-200 truncate">{node.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">[{node.type}]</div>
                      </div>
                      {node.lock && node.lock !== 'None' && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 border ${
                          node.lock === 'ReadOnly'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : 'bg-rose-950/60 text-rose-300 border-rose-800'
                        }`}>
                          {node.lock}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1 mt-2">
                <strong>【継承の原則】:</strong> 親スコープ (管理グループ ➔ サブスクリプション ➔ RG) に設定されたリソースロックやポリシーは、すべての子リソースへ自動的に下方継承されます。
              </div>
            </div>
          </div>

          {/* Lock Configuration & Test Arena (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-sky-400 font-mono font-bold">選択中のスコープ:</span>
                  <h3 className="text-sm font-bold text-white">{selectedNode.name}</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
                  現在ロック: {selectedNode.lock || 'None'}
                </span>
              </div>

              {/* Lock selector */}
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  リソースロックの切り替え:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'None' as const, label: 'ロックなし (None)', desc: '通常のRBAC権限で削除・変更可能' },
                    { id: 'CanNotDelete' as const, label: '削除不可 (CanNotDelete)', desc: '変更は許可、削除のみブロック' },
                    { id: 'ReadOnly' as const, label: '読み取り専用 (ReadOnly)', desc: '変更も削除も両方ブロック' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => handleApplyLock(l.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        (selectedNode.lock || 'None') === l.id
                          ? 'bg-sky-950/50 border-sky-500 text-white ring-1 ring-sky-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{l.label}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{l.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Operations test */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-white">管理操作の実行テスト (あなたの権限: 所有者 Owner):</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTestResourceAction('delete')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>リソースの削除を試みる (Delete)</span>
                  </button>

                  <button
                    onClick={() => handleTestResourceAction('update')}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>リソースの更新・再起動を試みる (Update)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Azure PIM Lifecycle & Access Reviews */}
      {activeTab === 'pim-lifecycle' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-sky-400" />
              <span>Azure PIM: 特権ロールのJITアクティブ化 & アクセスレビュー (棚卸し)</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              常時特権(Standing Access)を廃止し、資格があるユーザー(Eligible)が業務理由・MFAを経て一時的にアクティブ化するライフサイクルを管理します。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* PIM Assignment list (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <span className="font-bold text-slate-300">PIM 割り当て一覧 (Azure ADロール & Azureリソースロール):</span>
              <div className="space-y-2">
                {pimAssignments.map((p) => {
                  const isSelected = selectedPimId === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPimId(p.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-sky-950/50 border-sky-500 text-white ring-1 ring-sky-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{p.principalName}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          p.state === 'active'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                        }`}>
                          {p.state}
                        </span>
                      </div>
                      <div className="text-[11px] text-sky-400 font-semibold mt-1">{p.roleName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">スコープ: {p.scopeName} ({p.scopeType})</div>
                    </button>
                  );
                })}
              </div>

              {/* Onboarding info */}
              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <strong>【Azureリソースのオンボード】:</strong> Azure ADロールだけでなく、サブスクリプションやリソースグループなどのAzureリソースをPIMにオンボードすることで、OwnerやContributorのJIT管理が可能になります。
              </div>
            </div>

            {/* PIM Activation & Access Review Sandbox (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono">選択中ユーザー:</span>
                    <h4 className="text-sm font-bold text-white">{selectedPim.principalName}</h4>
                  </div>
                  <span className="text-xs text-sky-400 font-mono font-bold">{selectedPim.roleName}</span>
                </div>

                {selectedPim.state === 'eligible' ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1 text-[11px]">
                      <div className="font-bold text-slate-200">昇格に必要な要件 (PIM設定ポリシー):</div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span>✓ MFA多要素認証: {selectedPim.requiresMfa ? '必須' : '不要'}</span>
                        <span>✓ 業務理由: {selectedPim.requiresJustification ? '必須' : '不要'}</span>
                        <span>✓ 上長承認: {selectedPim.requiresApproval ? '必要' : '自動承認'}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">JIT アクティブ化の正当な業務理由:</label>
                      <input
                        type="text"
                        value={pimJustification}
                        onChange={(e) => setPimJustification(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 font-semibold block mb-1">希望アクティブ化時間 (最大 {selectedPim.maxDurationHours} 時間):</label>
                      <select
                        value={pimDurationHours}
                        onChange={(e) => setPimDurationHours(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                      >
                        <option value={2}>2 時間</option>
                        <option value={4}>4 時間 (標準)</option>
                        <option value={8}>8 時間 (最大)</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleTogglePimActivation(selectedPim.id)}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>JIT 昇格を実行 (ロールアクティブ化)</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-4 bg-emerald-950/40 border border-emerald-800 rounded text-emerald-200 space-y-2">
                      <div className="font-bold flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>特権ロールがアクティブ化されています！</span>
                      </div>
                      <div className="text-[11px] text-slate-300">
                        有効期限: あと <strong>{pimDurationHours} 時間</strong> で自動的に権限が失効(剥奪)されます。
                      </div>
                    </div>

                    <button
                      onClick={() => handleTogglePimActivation(selectedPim.id)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold transition-colors"
                    >
                      作業完了: 権限を早期返上 (Deactivate)
                    </button>
                  </div>
                )}
              </div>

              {/* Access Review Card */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-400" />
                    <span>アクセスのレビュー (Access Reviews - 定期棚卸し)</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px]">
                    ステータス: {accessReviewStatus}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  放置された特権ユーザーを防止するため、四半期ごとに管理者に「この特権がまだ必要か？」をレビューさせます。
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setAccessReviewStatus('approved')}
                    className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-semibold text-xs transition-colors"
                  >
                    アクセスを承認 (継続付与)
                  </button>
                  <button
                    onClick={() => setAccessReviewStatus('revoked')}
                    className="flex-1 py-1.5 bg-rose-700 hover:bg-rose-600 text-white rounded font-semibold text-xs transition-colors"
                  >
                    アクセスを拒否 (自動剥奪)
                  </button>
                </div>

                {accessReviewStatus === 'revoked' && (
                  <div className="p-2.5 bg-rose-950/40 border border-rose-800 rounded text-rose-200 text-[11px]">
                    ✓ レビューにより権限が「不要」と判断され、PIMから資格情報が自動削除されました。
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Azure Policy & Blueprints */}
      {activeTab === 'policy-blueprints' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-sky-400" />
              <span>Azure Policy (ポリシー定義 & イニシアチブ) & Azure ブループリント</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              リソース作成時のルール強制 (リージョン制限、SKU制限、タグ強制) とコンプライアンス管理を検証します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-white">ポリシー定義の適用設定</span>
                <div>
                  <label className="text-slate-400 block mb-1">ポリシー名:</label>
                  <div className="p-2 bg-slate-900 rounded font-semibold text-slate-200">
                    許可された場所 (Allowed Locations: Japan East / Japan West)
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">ポリシー効果 (Effect):</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPolicyEnforcement('Deny')}
                      className={`p-2 rounded border text-center font-bold ${
                        policyEnforcement === 'Deny'
                          ? 'bg-rose-950 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Deny (違反デプロイを即座に遮断)
                    </button>
                    <button
                      onClick={() => setPolicyEnforcement('Audit')}
                      className={`p-2 rounded border text-center font-bold ${
                        policyEnforcement === 'Audit'
                          ? 'bg-amber-950 border-amber-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Audit (作成を許可し違反を記録)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">リソース作成試行先リージョン:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setDeployRegionAttempt('Japan East')}
                      className={`p-2 rounded border font-mono ${
                        deployRegionAttempt === 'Japan East'
                          ? 'bg-emerald-950 border-emerald-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      Japan East (許可リージョン)
                    </button>
                    <button
                      onClick={() => setDeployRegionAttempt('East US')}
                      className={`p-2 rounded border font-mono ${
                        deployRegionAttempt === 'East US'
                          ? 'bg-rose-950 border-rose-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      East US (未許可リージョン)
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleTestPolicyDeploy}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>デプロイ実行テスト</span>
                </button>

                {policyDeployResult && (
                  <div className={`p-3 rounded border text-[11px] space-y-1 ${
                    policyDeployResult.success
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-800 text-rose-200'
                  }`}>
                    <div className="font-bold">{policyDeployResult.title}</div>
                    <div className="text-slate-300">{policyDeployResult.detail}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3">
              <span className="font-bold text-white">【試験最重要】Policy vs Blueprint vs RBAC</span>
              <ul className="space-y-3 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">ポリシー定義 vs イニシアチブ定義:</strong>
                  単一のルールが「ポリシー定義」。複数のポリシー定義を束ねて包括的なコンプライアンス基準(例: ISO 27001、全社セキュリティベースライン)にしたものが「イニシアチブ定義」。
                </li>
                <li>
                  <strong className="text-indigo-300">Azure ブループリント (Blueprints):</strong>
                  「リソースグループ」「ARMテンプレート」「RBACロール割り当て」「Policy定義」の4つの成果物を1つの宣言型パッケージとして定義し、新しい環境へ一括展開するオーケストレーションツール。
                </li>
                <li>
                  <strong className="text-amber-300">RBAC と Policy の違い:</strong>
                  RBACは「誰が操作できるか(Who)」。Policyは「操作されたリソースがどんな状態・条件を満たすべきか(What)」を制限する。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RBAC Built-in vs Custom Role */}
      {activeTab === 'custom-role' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span>RBAC 組み込みロール vs カスタムロール & NotActions の引き算ルール</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="font-bold text-slate-300">ロールの選択:</span>
              <div className="space-y-1.5">
                {AZURE_RBAC_ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={`w-full text-left p-2.5 rounded border transition-colors ${
                      selectedRoleId === role.id
                        ? 'bg-sky-950/50 border-sky-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold">{role.nameJa}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{role.name}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white">{currentCustomRole.nameJa}</span>
                <span className="text-sky-400 font-mono text-[11px] font-bold">[{currentCustomRole.type}]</span>
              </div>

              <div>
                <span className="text-emerald-400 font-semibold block mb-1">Actions (許可アクション集合):</span>
                <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-slate-300 space-y-0.5">
                  {currentCustomRole.actions.map((act, i) => (
                    <div key={i}>+ {act}</div>
                  ))}
                </div>
              </div>

              {currentCustomRole.notActions.length > 0 && (
                <div>
                  <span className="text-rose-400 font-semibold block mb-1">NotActions (除外アクション):</span>
                  <div className="p-2 bg-slate-900 rounded font-mono text-[11px] text-rose-300 space-y-0.5">
                    {currentCustomRole.notActions.map((notAct, i) => (
                      <div key={i}>- {notAct}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-900 rounded border border-amber-800/40 text-[11px] text-amber-300 mt-2">
                <strong>💡 試験重要ルール:</strong> NotActions は「拒否 (Deny)」ではありません！Actions のワイルドカードから指定アクションを「差し引く」だけです。もし別のロールでそのアクションが付与されていれば実行可能になります。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
