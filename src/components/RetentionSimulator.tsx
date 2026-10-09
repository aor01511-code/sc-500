import React, { useState, useMemo } from 'react';
import { RetentionPolicyItem } from '../types/purview';
import { 
  Clock, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  HelpCircle,
  FileCheck,
  CheckCircle2,
  FolderArchive,
  Lock
} from 'lucide-react';

interface RetentionSimulatorProps {
  onNavigateToQuiz?: (questionId: string) => void;
}

export const RetentionSimulator: React.FC<RetentionSimulatorProps> = ({ onNavigateToQuiz }) => {
  // Preset scenario configurations
  const [tenantPolicyYears, setTenantPolicyYears] = useState<number>(7);
  const [tenantPolicyAction, setTenantPolicyAction] = useState<'delete' | 'nothing'>('delete');
  const [tenantPolicyEnabled, setTenantPolicyEnabled] = useState<boolean>(true);

  const [sitePolicyYears, setSitePolicyYears] = useState<number>(3);
  const [sitePolicyAction, setSitePolicyAction] = useState<'delete' | 'nothing'>('nothing');
  const [sitePolicyEnabled, setSitePolicyEnabled] = useState<boolean>(true);

  const [hasRetentionLabel, setHasRetentionLabel] = useState<boolean>(true);
  const [labelYears, setLabelYears] = useState<number>(5);
  const [labelAction, setLabelAction] = useState<'delete' | 'nothing'>('delete');
  const [isRegulatoryRecord, setIsRegulatoryRecord] = useState<boolean>(false);

  // User action: when the user tries to delete the file
  const [userDeletedAtYear, setUserDeletedAtYear] = useState<number>(2); // year 2
  const [timelineInspectionYear, setTimelineInspectionYear] = useState<number>(3);

  // Evaluate the 4 Principles
  const evaluation = useMemo(() => {
    // Gather all active rules
    const activeRules: {
      source: string;
      isExplicit: boolean; // Label is explicit, policy is implicit
      retains: boolean;
      retentionYears: number;
      actionAfter: 'delete' | 'nothing';
      isDeleteOnly: boolean;
    }[] = [];

    if (tenantPolicyEnabled) {
      activeRules.push({
        source: '全社保持ポリシー (Tenant Scope)',
        isExplicit: false,
        retains: tenantPolicyYears > 0,
        retentionYears: tenantPolicyYears,
        actionAfter: tenantPolicyAction,
        isDeleteOnly: tenantPolicyYears === 0 && tenantPolicyAction === 'delete',
      });
    }

    if (sitePolicyEnabled) {
      activeRules.push({
        source: '法務サイト保持ポリシー (Site Scope)',
        isExplicit: false,
        retains: sitePolicyYears > 0,
        retentionYears: sitePolicyYears,
        actionAfter: sitePolicyAction,
        isDeleteOnly: sitePolicyYears === 0 && sitePolicyAction === 'delete',
      });
    }

    if (hasRetentionLabel) {
      activeRules.push({
        source: isRegulatoryRecord ? '保持ラベル: 規制レコード (Regulatory Record)' : '保持ラベル (Explicit Retention Label)',
        isExplicit: true,
        retains: labelYears > 0,
        retentionYears: labelYears,
        actionAfter: labelAction,
        isDeleteOnly: labelYears === 0 && labelAction === 'delete',
      });
    }

    // Step 1: Retention wins over deletion
    const retainRules = activeRules.filter((r) => r.retains);
    const deleteOnlyRules = activeRules.filter((r) => r.isDeleteOnly);

    let effectiveRetentionYears = 0;
    let winningRuleName = '';
    let principleApplied = '';
    let detailedSteps: string[] = [];

    if (retainRules.length > 0) {
      detailedSteps.push('原則1適用: 「保持は削除に優先する」(Retention wins over deletion)。保持設定が存在するため、削除専用ルールは無視されます。');

      // Step 2: Longest retention period wins
      const maxRetention = Math.max(...retainRules.map((r) => r.retentionYears));
      const candidates = retainRules.filter((r) => r.retentionYears === maxRetention);

      if (candidates.length === 1) {
        effectiveRetentionYears = maxRetention;
        winningRuleName = candidates[0].source;
        principleApplied = `原則2適用: 「最長保持期間が優先される」(${winningRuleName} の ${maxRetention}年間)`;
        detailedSteps.push(`原則2適用: 保持期間を比較 (${retainRules.map((r) => `${r.source}: ${r.retentionYears}年`).join(' vs ')})。最長の ${maxRetention}年 が決定。`);
      } else {
        // Tie breaker: Step 3: Explicit inclusion wins over implicit
        const explicitCandidate = candidates.find((r) => r.isExplicit);
        if (explicitCandidate) {
          effectiveRetentionYears = maxRetention;
          winningRuleName = explicitCandidate.source;
          principleApplied = `原則3適用: 「明示的な適用は暗黙的な適用に優先する」(${winningRuleName})`;
          detailedSteps.push(`原則3適用: 保持期間(${maxRetention}年)が同等ですが、明示的な保持ラベルが優先されます。`);
        } else {
          effectiveRetentionYears = maxRetention;
          winningRuleName = candidates[0].source;
          principleApplied = `原則2適用: 同等の最長保持期間 (${maxRetention}年間)`;
          detailedSteps.push(`最長保持期間 ${maxRetention}年 で合致します。`);
        }
      }
    } else if (deleteOnlyRules.length > 0) {
      // Step 4: Shortest deletion period wins
      detailedSteps.push('保持ルールなし: 削除設定のみが存在します。');
      principleApplied = '原則4適用: 「最短削除期間が優先される」(Shortest deletion period wins)';
      effectiveRetentionYears = 0;
      winningRuleName = '削除ルール';
    } else {
      winningRuleName = '保持設定なし (通常ライフサイクル)';
      principleApplied = '保持ポリシー・ラベルは適用されていません。';
    }

    return {
      effectiveRetentionYears,
      winningRuleName,
      principleApplied,
      detailedSteps,
      isProtected: effectiveRetentionYears > 0,
    };
  }, [
    tenantPolicyYears,
    tenantPolicyAction,
    tenantPolicyEnabled,
    sitePolicyYears,
    sitePolicyAction,
    sitePolicyEnabled,
    hasRetentionLabel,
    labelYears,
    labelAction,
    isRegulatoryRecord,
  ]);

  // Determine file location at inspection year
  const fileStatusAtYear = useMemo(() => {
    const yr = timelineInspectionYear;
    const isDeletedByUser = yr >= userDeletedAtYear;
    const isWithinRetention = yr < evaluation.effectiveRetentionYears;

    if (isRegulatoryRecord) {
      if (isDeletedByUser) {
        return {
          location: 'アクティブドキュメントライブラリ (削除拒否)',
          badgeColor: 'rose',
          note: '規制レコード (Regulatory Record) のため、保持期間中のユーザー削除・管理者削除は一切拒否されます。ファイルは元のライブラリに残り続けます。',
        };
      }
    }

    if (!isDeletedByUser) {
      return {
        location: 'アクティブ ドキュメントライブラリ',
        badgeColor: 'emerald',
        note: 'ユーザーによる削除は行われておらず、通常のライブラリで共同作業・閲覧が可能です。',
      };
    }

    // Deleted by user
    if (isWithinRetention) {
      return {
        location: 'Preservation Hold Library (保持保管庫)',
        badgeColor: 'amber',
        note: `ユーザーは Year ${userDeletedAtYear} に削除しましたが、最長保持期間 (${evaluation.effectiveRetentionYears}年) の満了までサイト内の隠し保持保管庫 (Preservation Hold Library) に安全に保持されます。eDiscoveryで検索可能です。`,
      };
    } else {
      return {
        location: '完全消去済み (Purged) / 第2段階ゴミ箱',
        badgeColor: 'slate',
        note: `保持期間 (${evaluation.effectiveRetentionYears}年) が満了し、削除アクションが実行されたため、永久に消去されました。`,
      };
    }
  }, [timelineInspectionYear, userDeletedAtYear, evaluation.effectiveRetentionYears, isRegulatoryRecord]);

  const triggerMission = (mission: 'longest-wins' | 'retain-vs-delete' | 'regulatory-record' | 'delete-at-year-4') => {
    if (mission === 'longest-wins') {
      setTenantPolicyEnabled(true);
      setTenantPolicyYears(7);
      setSitePolicyEnabled(true);
      setSitePolicyYears(3);
      setHasRetentionLabel(true);
      setLabelYears(5);
      setIsRegulatoryRecord(false);
      setUserDeletedAtYear(2);
      setTimelineInspectionYear(3);
    } else if (mission === 'retain-vs-delete') {
      setTenantPolicyEnabled(true);
      setTenantPolicyYears(7);
      setSitePolicyEnabled(true);
      setSitePolicyYears(0);
      setSitePolicyAction('delete');
      setHasRetentionLabel(false);
      setIsRegulatoryRecord(false);
      setUserDeletedAtYear(2);
      setTimelineInspectionYear(4);
    } else if (mission === 'regulatory-record') {
      setHasRetentionLabel(true);
      setLabelYears(5);
      setIsRegulatoryRecord(true);
      setUserDeletedAtYear(2);
      setTimelineInspectionYear(2);
    } else if (mission === 'delete-at-year-4') {
      setTenantPolicyEnabled(true);
      setTenantPolicyYears(7);
      setHasRetentionLabel(false);
      setUserDeletedAtYear(2);
      setTimelineInspectionYear(8);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>SC-500 スコープ 3</span>
              <span>·</span>
              <span>データライフサイクルとレコード管理の実装</span>
              <span>·</span>
              <span>The 4 Principles of Retention & Preservation Hold Library</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              保持の4大原則 (Principles of Retention) 競合判定エンジン
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              複数の保持ポリシーと保持ラベルが同時に適用された場合の優先度ルール (保持優先・最長保持・明示優先・最短削除) と、ユーザー削除時の「保持保管庫 (Preservation Hold Library)」への移動メカニズムを動的にシミュレートします。
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToQuiz?.('q1')}
              className="px-3 py-2 text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 rounded hover:bg-sky-900/50 transition-colors flex items-center gap-1.5"
            >
              <span>関連の試験問題を見る</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>【迷ったらここを押すだけ！】保持の4大原則を1クリックで体験:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => triggerMission('longest-wins')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">7年 vs 3年 vs 5年の競合</div>
                <div className="text-[10px] text-sky-400 font-medium">結果: 最長の7年が勝つ (原則2)</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('retain-vs-delete')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">7年保持 vs 3年削除</div>
                <div className="text-[10px] text-emerald-400 font-medium">結果: 保持が削除に勝つ (原則1)</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('regulatory-record')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">規制レコードを2年目に削除試行</div>
                <div className="text-[10px] text-rose-400 font-medium">結果: WORMにより削除拒否</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('delete-at-year-4')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">保持期間満了(8年目)のファイル</div>
                <div className="text-[10px] text-slate-400 font-medium">結果: 完全に消去済み (Purged)</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Policy Conflict Configuration Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>競合する保持ルールの一覧構成</span>
              </h2>
              <span className="text-xs text-slate-500">SharePoint / OneDrive</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Rule 1: Tenant Wide Policy */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200">1. 全社保持ポリシー (Org-Wide)</div>
                  <input
                    type="checkbox"
                    checked={tenantPolicyEnabled}
                    onChange={(e) => setTenantPolicyEnabled(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 bg-slate-900 border-slate-700"
                  />
                </div>
                {tenantPolicyEnabled ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">保持期間:</span>
                      <span className="font-mono text-sky-300 font-bold">{tenantPolicyYears} 年間</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={tenantPolicyYears}
                      onChange={(e) => setTenantPolicyYears(Number(e.target.value))}
                      className="w-full accent-sky-500"
                    />
                    <div className="flex items-center justify-between text-slate-400">
                      <span>期間終了後のアクション:</span>
                      <span className="font-mono text-slate-300">{tenantPolicyAction === 'delete' ? '自動削除' : '何もしない'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px]">無効化中</div>
                )}
              </div>

              {/* Rule 2: Site Specific Policy */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200">2. サイト固有保持ポリシー (Site Policy)</div>
                  <input
                    type="checkbox"
                    checked={sitePolicyEnabled}
                    onChange={(e) => setSitePolicyEnabled(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 bg-slate-900 border-slate-700"
                  />
                </div>
                {sitePolicyEnabled ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">保持期間:</span>
                      <span className="font-mono text-sky-300 font-bold">{sitePolicyYears} 年間</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={sitePolicyYears}
                      onChange={(e) => setSitePolicyYears(Number(e.target.value))}
                      className="w-full accent-sky-500"
                    />
                    <div className="flex items-center justify-between text-slate-400">
                      <span>期間終了後のアクション:</span>
                      <span className="font-mono text-slate-300">{sitePolicyAction === 'delete' ? '自動削除' : '何もしない'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px]">無効化中</div>
                )}
              </div>

              {/* Rule 3: Explicit Retention Label */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-200">3. 手動付与保持ラベル (Retention Label)</div>
                  <input
                    type="checkbox"
                    checked={hasRetentionLabel}
                    onChange={(e) => setHasRetentionLabel(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 bg-slate-900 border-slate-700"
                  />
                </div>
                {hasRetentionLabel ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">保持期間 (作成日から):</span>
                      <span className="font-mono text-sky-300 font-bold">{labelYears} 年間</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={10}
                      value={labelYears}
                      onChange={(e) => setLabelYears(Number(e.target.value))}
                      className="w-full accent-sky-500"
                    />
                    <div className="flex items-center justify-between text-slate-400">
                      <span>期間終了後のアクション:</span>
                      <span className="font-mono text-slate-300">{labelAction === 'delete' ? '自動削除' : '何もしない'}</span>
                    </div>
                    <label className="flex items-center gap-2 pt-1 text-slate-300">
                      <input
                        type="checkbox"
                        checked={isRegulatoryRecord}
                        onChange={(e) => setIsRegulatoryRecord(e.target.checked)}
                        className="rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                      />
                      <span className="text-[11px]">
                        規制レコード (Regulatory Record) として宣言
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px]">保持ラベル未付与</div>
                )}
              </div>

              {/* User Deletion Simulator */}
              <div className="p-3 bg-slate-950 border border-amber-900/40 rounded space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ユーザーの削除操作タイミング:</span>
                  </span>
                  <span className="font-mono text-amber-300 font-bold">作成後 {userDeletedAtYear} 年目</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={9}
                  value={userDeletedAtYear}
                  onChange={(e) => setUserDeletedAtYear(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="text-[11px] text-slate-400">
                  ユーザーが「ごみ箱へ移動 / 削除」を実行する年数を調整できます。
                </div>
              </div>
            </div>
          </div>

          {/* 4 Principles Reference Summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-bold text-sky-400 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Microsoft公式: 保持の4大原則 (優先順位)</span>
            </h3>
            <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              <li>
                <strong>保持は削除に優先する</strong> (Retention wins over deletion): 片方が「7年保持」、もう片方が「3年で削除」の場合、保持が勝つ。
              </li>
              <li>
                <strong>最長保持期間が優先される</strong> (Longest retention period wins): 「7年保持」と「3年保持」なら、7年間保持される。
              </li>
              <li>
                <strong>明示的な適用は暗黙的な適用に優先する</strong> (Explicit inclusion wins over implicit): 保持ラベル(個別指定)は、包括的なポリシー(テナント/サイト全体)に優先。
              </li>
              <li>
                <strong>最短削除期間が優先される</strong> (Shortest deletion period wins): 保持ルールがなく削除ルールのみの場合、最短期間(例: 1年削除 vs 3年削除)で削除される。
              </li>
            </ol>
          </div>
        </div>

        {/* Right Zone: Decision Matrix & Dynamic Timeline Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Engine Resolution Summary Card */}
          <div className="bg-slate-900 border-2 border-sky-500/40 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-sky-400 font-semibold">判定結果 (Final Purview Resolution)</span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  実効保持期間: <span className="text-sky-300 font-mono text-lg">{evaluation.effectiveRetentionYears} 年間</span>
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">勝訴ルール (Winning Rule):</div>
                <div className="text-xs font-semibold text-slate-200">{evaluation.winningRuleName}</div>
              </div>
            </div>

            {/* Principles Step Breakdown */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300">適用された原則と推論プロセス:</div>
              <div className="space-y-1.5">
                {evaluation.detailedSteps.map((step, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Timeline Visualizer (0 to 10 Years) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>ライフサイクル タイムライン (年数経過シミュレーター)</span>
              </h3>
              <div className="text-xs text-slate-400">
                検査年数: <span className="font-mono text-sky-300 font-bold">作成後 {timelineInspectionYear} 年目</span>
              </div>
            </div>

            {/* Slider to scrub through time */}
            <div className="pt-2">
              <input
                type="range"
                min={0}
                max={10}
                value={timelineInspectionYear}
                onChange={(e) => setTimelineInspectionYear(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono mt-1">
                <span>0年 (作成)</span>
                <span>2年</span>
                <span>4年</span>
                <span>6年</span>
                <span>8年</span>
                <span>10年</span>
              </div>
            </div>

            {/* Visual Timeline Bar Display */}
            <div className="space-y-2 text-xs pt-2">
              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-400 truncate">全社ポリシー:</span>
                <div className="flex-1 bg-slate-950 rounded h-4 overflow-hidden border border-slate-800 relative">
                  {tenantPolicyEnabled && (
                    <div
                      className="bg-sky-600/70 h-full"
                      style={{ width: `${(tenantPolicyYears / 10) * 100}%` }}
                    />
                  )}
                </div>
                <span className="w-12 text-right font-mono text-slate-400">
                  {tenantPolicyEnabled ? `${tenantPolicyYears}年` : '無効'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-400 truncate">サイトポリシー:</span>
                <div className="flex-1 bg-slate-950 rounded h-4 overflow-hidden border border-slate-800 relative">
                  {sitePolicyEnabled && (
                    <div
                      className="bg-indigo-600/70 h-full"
                      style={{ width: `${(sitePolicyYears / 10) * 100}%` }}
                    />
                  )}
                </div>
                <span className="w-12 text-right font-mono text-slate-400">
                  {sitePolicyEnabled ? `${sitePolicyYears}年` : '無効'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-24 text-slate-400 truncate">保持ラベル:</span>
                <div className="flex-1 bg-slate-950 rounded h-4 overflow-hidden border border-slate-800 relative">
                  {hasRetentionLabel && (
                    <div
                      className={`${isRegulatoryRecord ? 'bg-rose-600/80' : 'bg-emerald-600/70'} h-full`}
                      style={{ width: `${(labelYears / 10) * 100}%` }}
                    />
                  )}
                </div>
                <span className="w-12 text-right font-mono text-slate-400">
                  {hasRetentionLabel ? `${labelYears}年` : '無効'}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                <span className="w-24 text-amber-400 truncate font-semibold">ユーザー削除:</span>
                <div className="flex-1 bg-slate-950 rounded h-4 overflow-hidden border border-slate-800 relative">
                  <div
                    className="bg-amber-500 h-full w-1 absolute"
                    style={{ left: `${(userDeletedAtYear / 10) * 100}%` }}
                  />
                </div>
                <span className="w-12 text-right font-mono text-amber-400">{userDeletedAtYear}年目</span>
              </div>
            </div>

            {/* File Physical Storage Location at Timeline Inspection Year */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-sky-400" />
                  <span>作成後 {timelineInspectionYear} 年目のファイル物理保管場所:</span>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-bold border bg-slate-900 border-slate-700 text-sky-300">
                  {fileStatusAtYear.location}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {fileStatusAtYear.note}
              </p>
            </div>
          </div>

          {/* Preservation Hold Library Deep-Dive */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>試験で問われる「保持保管庫 (Preservation Hold Library)」の動作</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
              <p>
                SharePointまたはOneDriveサイトで保持ポリシーまたはラベルが有効な場合、サイト内に非表示の「<strong>Preservation Hold Library</strong>」が自動作成されます。
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li>ユーザーがファイルを削除すると、通常のライブラリからは消えますが、保持保管庫にコピーされ保持期間満了まで存続します。</li>
                <li>ユーザーが既存ファイルを上書き編集した場合、<strong>変更前のバージョン</strong>が保持保管庫に保存されます。</li>
                <li>サイトコレクション管理者およびeDiscovery管理者のみが検索・参照可能です。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
