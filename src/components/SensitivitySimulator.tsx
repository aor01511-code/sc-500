import React, { useState, useMemo } from 'react';
import { BUILT_IN_SITS, INITIAL_SENSITIVITY_LABELS, SAMPLE_TEXT_SNIPPETS } from '../data/purviewData';
import { SensitivityLabel, SensitiveInformationType } from '../types/purview';
import { 
  Lock, 
  Eye, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  FileText,
  Shield,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface SensitivitySimulatorProps {
  onNavigateToQuiz?: (questionId: string) => void;
}

export const SensitivitySimulator: React.FC<SensitivitySimulatorProps> = ({ onNavigateToQuiz }) => {
  const [content, setContent] = useState<string>(SAMPLE_TEXT_SNIPPETS[0].text);
  const [selectedLabelId, setSelectedLabelId] = useState<string>('pub');
  const [showDowngradeModal, setShowDowngradeModal] = useState<boolean>(false);
  const [pendingLabelId, setPendingLabelId] = useState<string | null>(null);
  const [downgradeReason, setDowngradeReason] = useState<string>('previous-incorrect');
  const [customDowngradeText, setCustomDowngradeText] = useState<string>('');
  const [autoLabelToast, setAutoLabelToast] = useState<{
    label: SensitivityLabel;
    mode: 'recommend' | 'auto';
    reason: string;
  } | null>(null);

  // Active label object
  const currentLabel = useMemo(() => {
    return INITIAL_SENSITIVITY_LABELS.find((l) => l.id === selectedLabelId) || INITIAL_SENSITIVITY_LABELS[0];
  }, [selectedLabelId]);

  // Sensitive Information Types evaluation
  const detectedSITs = useMemo(() => {
    const results: {
      sit: SensitiveInformationType;
      matchCount: number;
      matchedSamples: string[];
      hasKeywordProximity: boolean;
      calculatedConfidence: number;
    }[] = [];

    BUILT_IN_SITS.forEach((sit) => {
      try {
        const regex = new RegExp(sit.patterns.regex, 'gi');
        const matches = content.match(regex) || [];
        const matchCount = matches.length;

        if (matchCount > 0) {
          // Check supporting keyword proximity
          const lowerContent = content.toLowerCase();
          const hasKeyword = sit.patterns.supportingKeywords.some((kw) =>
            lowerContent.includes(kw.toLowerCase())
          );

          // Purview confidence calculation logic:
          // Match + Supporting Keywords = High confidence (e.g. 85%)
          // Match without Keywords = Low/Medium confidence (e.g. 65%)
          const calculatedConfidence = hasKeyword ? sit.defaultConfidence : Math.max(50, sit.defaultConfidence - 20);

          results.push({
            sit,
            matchCount,
            matchedSamples: matches.slice(0, 3),
            hasKeywordProximity: hasKeyword,
            calculatedConfidence,
          });
        }
      } catch {
        // regex error fallback
      }
    });

    return results;
  }, [content]);

  // Evaluate auto-labeling rules whenever detectedSITs changes
  const evaluationResult = useMemo(() => {
    // Check Highest Sensitivity Label first (priority desc)
    const sortedLabels = [...INITIAL_SENSITIVITY_LABELS].sort((a, b) => b.priority - a.priority);

    for (const label of sortedLabels) {
      if (!label.autoLabeling.enabled) continue;

      for (const cond of label.autoLabeling.conditionSITs) {
        const matched = detectedSITs.find((d) => d.sit.id === cond.sitId);
        if (
          matched &&
          matched.matchCount >= cond.minCount &&
          matched.calculatedConfidence >= cond.minConfidence
        ) {
          return {
            triggeredLabel: label,
            mode: label.autoLabeling.mode,
            reason: label.autoLabeling.justificationText || `${matched.sit.nameJa} が検出されました。`,
          };
        }
      }
    }
    return null;
  }, [detectedSITs]);

  // Handler for label change with downgrade check
  const handleSelectLabel = (targetLabelId: string) => {
    const targetLabel = INITIAL_SENSITIVITY_LABELS.find((l) => l.id === targetLabelId);
    if (!targetLabel) return;

    // Downgrade check: target priority < current priority
    if (targetLabel.priority < currentLabel.priority) {
      setPendingLabelId(targetLabelId);
      setShowDowngradeModal(true);
    } else {
      setSelectedLabelId(targetLabelId);
      setAutoLabelToast(null);
    }
  };

  const confirmDowngrade = () => {
    if (pendingLabelId) {
      setSelectedLabelId(pendingLabelId);
    }
    setShowDowngradeModal(false);
    setPendingLabelId(null);
    setCustomDowngradeText('');
  };

  const cancelDowngrade = () => {
    setShowDowngradeModal(false);
    setPendingLabelId(null);
  };

  const applySuggestedLabel = (label: SensitivityLabel) => {
    setSelectedLabelId(label.id);
    setAutoLabelToast(null);
  };

  const triggerMission = (mission: 'mynumber' | 'downgrade' | 'dke' | 'creditcard') => {
    if (mission === 'mynumber') {
      setContent(SAMPLE_TEXT_SNIPPETS[0].text);
      setSelectedLabelId('pub');
    } else if (mission === 'downgrade') {
      setSelectedLabelId('conf');
      setTimeout(() => {
        handleSelectLabel('pub');
      }, 200);
    } else if (mission === 'dke') {
      setContent(SAMPLE_TEXT_SNIPPETS[2].text);
      setSelectedLabelId('highly-conf');
    } else if (mission === 'creditcard') {
      setContent(SAMPLE_TEXT_SNIPPETS[1].text);
      setSelectedLabelId('pub');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>SC-500 スコープ 1</span>
              <span>·</span>
              <span>情報保護の実装と管理</span>
              <span>·</span>
              <span>Sensitive Information Types (SIT) & Sensitivity Labels</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              感度ラベル & 自動分類 パイプラインシミュレーター
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              文書テキスト内の機密情報(マイナンバー・カード番号・APIキー等)を正規表現とキーワード近接度で検査し、信頼度(Confidence)に基づく自動ラベル付与・推奨・暗号化(RMS/DKE)・ダウングレード理由要求の動作を検証できます。
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToQuiz?.('q2')}
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
            <Sparkles className="w-4 h-4" />
            <span>【迷ったらここを押すだけ！】感度ラベルの主要動作を1クリックで体験:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => triggerMission('mynumber')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">マイナンバーを検出 ➔ ラベル推奨</div>
                <div className="text-[10px] text-sky-400 font-medium">結果: 「機密」ラベルの推奨バナー表示</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('downgrade')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">機密から一般公開へ下げる (ダウングレード)</div>
                <div className="text-[10px] text-amber-400 font-medium">結果: 理由(Justification)要求ダイアログ</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('dke')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">極秘ラベル (DKE 二重暗号化) を適用</div>
                <div className="text-[10px] text-rose-400 font-medium">結果: DKE暗号化バッジ & 透かし表示</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('creditcard')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">カード番号を検出 ➔ 信頼度85%</div>
                <div className="text-[10px] text-emerald-400 font-medium">結果: キーワード近接度チェック成功</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Client Inspection & Document Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Sample Snippet Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300">
                テスト用サンプルテキストの選択:
              </span>
              <span className="text-xs text-slate-500">
                または下の枠内に直接日本語を入力・編集可能
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_TEXT_SNIPPETS.map((snippet, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setContent(snippet.text);
                    setAutoLabelToast(null);
                  }}
                  className={`text-left p-2.5 rounded border text-xs transition-colors ${
                    content === snippet.text
                      ? 'bg-sky-950/40 border-sky-500/50 text-sky-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-medium text-slate-200 truncate">{snippet.title}</div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {snippet.sitId === 'none' ? '機密情報なし' : `検知対象: ${snippet.sitId}`}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Document Editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-slate-300">
                  検査対象ドキュメントの内容 (リアルタイム検査)
                </span>
              </div>
              <div className="text-xs text-slate-500">
                文字数: <span className="tabular-nums font-mono text-slate-400">{content.length}</span>
              </div>
            </div>

            <div className="p-4">
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setAutoLabelToast(null);
                }}
                rows={7}
                placeholder="ここにテキストを入力すると、リアルタイムでSIT検知と自動ラベル判定が行われます..."
                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-xs sm:text-sm font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 transition-colors resize-y leading-relaxed"
              />
            </div>

            {/* SIT Detection Results Panel */}
            <div className="px-4 pb-4 border-t border-slate-800/80 pt-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>SIT (機密情報の種類) リアルタイム検出結果</span>
                </div>
                <span className="text-xs text-slate-500">
                  一致数: <span className="text-sky-400 font-mono font-medium">{detectedSITs.length} 種</span>
                </span>
              </div>

              {detectedSITs.length === 0 ? (
                <div className="bg-slate-950 border border-slate-800/60 rounded p-3 text-xs text-slate-500 flex items-center gap-2">
                  <Info className="w-4 h-4 text-slate-600 shrink-0" />
                  <span>既知の機密情報は検出されませんでした。（一般的な業務テキスト）</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {detectedSITs.map((item) => (
                    <div
                      key={item.sit.id}
                      className="bg-slate-950 border border-slate-800 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-200">{item.sit.nameJa}</span>
                          <span className="text-slate-500 text-[11px] font-mono">({item.sit.name})</span>
                        </div>
                        <div className="text-slate-400 text-[11px] mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span>検出件数: <strong className="text-sky-400 font-mono">{item.matchCount}件</strong></span>
                          <span>·</span>
                          <span>キーワード近接判定: <strong className={item.hasKeywordProximity ? 'text-emerald-400' : 'text-amber-400'}>{item.hasKeywordProximity ? '適合 (±300文字以内)' : '不一致 (単体検出)'}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500">算出信頼度 (Confidence)</div>
                          <div className="text-xs font-bold font-mono text-sky-300">
                            {item.calculatedConfidence}%
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                          item.calculatedConfidence >= 85
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                            : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
                        }`}>
                          {item.calculatedConfidence >= 85 ? '高信頼度 (High)' : '中信頼度 (Medium)'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Client Experience Simulation (Simulated Word/Excel with Purview Sensitivity Bar) */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-semibold text-slate-300">
                  クライアント体験シミュレーション (Microsoft 365 Apps)
                </span>
              </div>
              <span className="text-xs text-slate-500">Word / Excel / PowerPoint 動作画面</span>
            </div>

            {/* Office Sensitivity Bar */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">秘密度 (Sensitivity):</span>
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded border border-slate-800">
                  {INITIAL_SENSITIVITY_LABELS.map((lbl) => {
                    const isSelected = selectedLabelId === lbl.id;
                    return (
                      <button
                        key={lbl.id}
                        onClick={() => handleSelectLabel(lbl.id)}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: lbl.color }}
                        />
                        <span>{lbl.name}</span>
                        {lbl.encryption.enabled && <Lock className="w-3 h-3 text-amber-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status pill-less indicator */}
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>優先順位: 優先度 {currentLabel.priority}</span>
                <span>·</span>
                <span>暗号化: {currentLabel.encryption.enabled ? currentLabel.encryption.type.toUpperCase() : 'なし'}</span>
              </div>
            </div>

            {/* Auto-Labeling Policy Banner (Simulates Purview client prompt) */}
            {evaluationResult && evaluationResult.triggeredLabel.id !== selectedLabelId && (
              <div className="px-4 py-3 bg-sky-950/40 border-b border-sky-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-200">
                    <span className="font-semibold text-sky-300">
                      {evaluationResult.mode === 'auto'
                        ? '【自動適用】ポリシーによりラベルが更新されました:'
                        : '【ポリシーの推奨】このドキュメントへのラベル適用を推奨します:'}
                    </span>{' '}
                    {evaluationResult.reason}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={() => applySuggestedLabel(evaluationResult.triggeredLabel)}
                    className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium rounded transition-colors whitespace-nowrap"
                  >
                    「{evaluationResult.triggeredLabel.displayName}」を適用
                  </button>
                </div>
              </div>
            )}

            {/* Document Surface Preview (Shows Visual Markings, Watermark, RMS status) */}
            <div className="p-6 bg-slate-950 relative overflow-hidden min-h-[220px] flex flex-col justify-between border-t border-slate-900">
              {/* Watermark Rendering */}
              {currentLabel.visualMarking.watermark && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0"
                >
                  <span className="text-4xl sm:text-5xl font-extrabold text-slate-800/60 uppercase tracking-widest -rotate-25 border-4 border-dashed border-slate-800/40 px-6 py-2">
                    {currentLabel.visualMarking.watermark}
                  </span>
                </div>
              )}

              {/* Header Visual Marking */}
              {currentLabel.visualMarking.header && (
                <div className="relative z-10 text-center text-xs font-semibold text-amber-400 bg-amber-950/30 border border-amber-900/50 py-1 px-3 rounded mb-4">
                  {currentLabel.visualMarking.header}
                </div>
              )}

              {/* Document Mock Body */}
              <div className="relative z-10 space-y-2 text-xs text-slate-300 font-mono">
                <div className="text-slate-400 italic">--- Document Viewport ---</div>
                <div className="line-clamp-3 text-slate-300">{content}</div>
              </div>

              {/* Footer Visual Marking & Protection Badge */}
              <div className="relative z-10 mt-6 pt-3 border-t border-slate-800/80 space-y-2">
                {currentLabel.visualMarking.footer && (
                  <div className="text-center text-[11px] text-slate-400 font-mono">
                    {currentLabel.visualMarking.footer}
                  </div>
                )}

                {/* Encryption Security Status Bar */}
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-900">
                  <div className="flex items-center gap-1.5">
                    {currentLabel.encryption.enabled ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">RMS暗号化保護中:</span>
                        <span>権限: {currentLabel.encryption.rights}</span>
                        <span>·</span>
                        <span>オフライン猶予: {currentLabel.encryption.offlineAccessDays || 0}日</span>
                        <span>·</span>
                        <span>社外共有: {currentLabel.encryption.allowExternalSharing ? '許可' : '禁止'}</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>暗号化なし (平文保存)</span>
                      </>
                    )}
                  </div>
                  <div className="text-slate-500">
                    現在の適用ラベル: <strong className="text-slate-200">{currentLabel.displayName}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Zone: Control & Concept Deck (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Active Label Policy Inspector */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>選択中ラベルの構成情報 (Policy Inspector)</span>
              </h2>
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: currentLabel.color }}
              />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">表示名 (Display Name):</span>
                <div className="font-semibold text-slate-200 mt-0.5">{currentLabel.displayName}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60">
                <div>
                  <span className="text-slate-400">優先度 (Priority):</span>
                  <div className="font-mono text-slate-200 mt-0.5 font-medium">
                    レベル {currentLabel.priority} (0=低, 3=高)
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">暗号化方式 (Encryption):</span>
                  <div className="font-mono text-slate-200 mt-0.5 font-medium">
                    {currentLabel.encryption.type === 'dke'
                      ? 'DKE (Double Key Encryption)'
                      : currentLabel.encryption.type === 'rms'
                      ? 'Azure RMS (Microsoft-managed)'
                      : '暗号化なし'}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">視覚的マーキング (Visual Markings):</span>
                <div className="mt-1 space-y-1 text-[11px] text-slate-300">
                  <div>ヘッダー: {currentLabel.visualMarking.header || 'なし'}</div>
                  <div>フッター: {currentLabel.visualMarking.footer || 'なし'}</div>
                  <div>透かし: {currentLabel.visualMarking.watermark || 'なし'}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/60">
                <span className="text-slate-400">自動ラベル付けルール (Auto-labeling):</span>
                {currentLabel.autoLabeling.enabled ? (
                  <div className="mt-1 bg-slate-950 p-2.5 rounded border border-slate-800 space-y-1 text-[11px]">
                    <div className="text-sky-300 font-medium">
                      動作モード: {currentLabel.autoLabeling.mode === 'auto' ? '自動強制適用 (Auto-apply)' : 'ユーザーへの推奨 (Recommend)'}
                    </div>
                    <div className="text-slate-400">
                      条件: {currentLabel.autoLabeling.conditionSITs.map((c) => {
                        const s = BUILT_IN_SITS.find((x) => x.id === c.sitId);
                        return `${s?.nameJa || c.sitId} ≥ ${c.minCount}件 (信頼度≥${c.minConfidence}%)`;
                      }).join(' または ')}
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px] mt-0.5">自動ラベル付け未構成 (ユーザー手動選択のみ)</div>
                )}
              </div>
            </div>
          </div>

          {/* SC-500 Exam Mastery Callout */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>SC-500 試験で狙われる最重要ポイント</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">1.</span>
                <div>
                  <strong>ダウングレード時の理由要求:</strong> 高い優先順位のラベルから低いラベルに変更する場合、ユーザーに理由の入力を強制するか、Justificationをログに記録させることができます。
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">2.</span>
                <div>
                  <strong>クライアント側 vs サービス側自動ラベル:</strong> Officeアプリ内での自動ラベルはファイルを開いた・編集したタイミングで判定。Exchange/SPO等のサービス側自動ラベルはバックエンドで保存済みデータをクロールして自動適用。
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">3.</span>
                <div>
                  <strong>下位ラベル (Sublabels):</strong> 親ラベル自体は直接付与できず、必ず下位ラベルを選択する必要があります。下位ラベルは親の暗号化設定やスコープを継承します。
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sky-400 font-bold">4.</span>
                <div>
                  <strong>ダブルキー暗号化 (DKE):</strong> 最も厳格な規制環境下で自社のみが鍵を制御する方式。クラウド上のWord Online等では直接開けない（デスクトップアプリ必須）制約が出題されます。
                </div>
              </li>
            </ul>
          </div>

          {/* Quick Downgrade Test Trigger */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-xs">
            <div className="font-semibold text-slate-200 mb-1">
              💡 ダウングレード動作をテストする
            </div>
            <p className="text-slate-400 mb-3 text-[11px]">
              現在のラベルが「機密」または「極秘」の状態で「一般公開」へ変更しようとすると、Purviewポリシーによる理由入力ダイアログが発火します。
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedLabelId('conf')}
                className="px-2.5 py-1.5 bg-amber-950/60 border border-amber-800/60 text-amber-300 rounded hover:bg-amber-900/50 transition-colors"
              >
                一旦「機密」にする
              </button>
              <button
                onClick={() => handleSelectLabel('pub')}
                className="px-2.5 py-1.5 bg-slate-800 text-slate-200 border border-slate-700 rounded hover:bg-slate-700 transition-colors"
              >
                「一般公開」へ下げる (テスト)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Downgrade Justification Modal (Realistic Purview Compliance Prompt) */}
      {showDowngradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">秘密度ラベルのダウングレード理由</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  「{currentLabel.displayName}」から低いラベルへの変更が要求されました。
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              組織のコンプライアンス監査ポリシーに基づき、秘密度の引き下げを行うには正当な業務上の理由を入力する必要があります。この操作は監査ログに記録されます。
            </p>

            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="downgrade-reason"
                  value="previous-incorrect"
                  checked={downgradeReason === 'previous-incorrect'}
                  onChange={(e) => setDowngradeReason(e.target.value)}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <span>以前付与されていた秘密度ラベルが誤っていたため修正する。</span>
              </label>

              <label className="flex items-start gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="downgrade-reason"
                  value="content-removed"
                  checked={downgradeReason === 'content-removed'}
                  onChange={(e) => setDowngradeReason(e.target.value)}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <span>ドキュメント内から機密情報(SIT)を完全に削除したため。</span>
              </label>

              <label className="flex items-start gap-2 text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="downgrade-reason"
                  value="business-justification"
                  checked={downgradeReason === 'business-justification'}
                  onChange={(e) => setDowngradeReason(e.target.value)}
                  className="mt-0.5 text-sky-600 focus:ring-sky-500"
                />
                <span>その他の正当な業務上の理由がある (理由を入力):</span>
              </label>

              {downgradeReason === 'business-justification' && (
                <textarea
                  value={customDowngradeText}
                  onChange={(e) => setCustomDowngradeText(e.target.value)}
                  placeholder="具体的な業務理由を入力してください (例: 外部公表用のプレスリリースとして確定したため)..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 mt-2"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={cancelDowngrade}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={confirmDowngrade}
                disabled={downgradeReason === 'business-justification' && !customDowngradeText.trim()}
                className="px-4 py-2 text-xs font-medium bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded transition-colors"
              >
                理由を記録して変更
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
