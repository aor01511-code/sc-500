import React, { useState } from 'react';
import { 
  UserX, 
  AlertTriangle, 
  ArrowRight, 
  FileSearch, 
  ShieldAlert, 
  HardDrive, 
  CloudRain, 
  Lock, 
  Sparkles,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  Scale
} from 'lucide-react';

interface InsiderRiskSimulatorProps {
  onNavigateToQuiz?: (questionId: string) => void;
}

export const InsiderRiskSimulator: React.FC<InsiderRiskSimulatorProps> = ({ onNavigateToQuiz }) => {
  // Sequence steps state
  const [hasHrResignationTrigger, setHasHrResignationTrigger] = useState<boolean>(true);
  const [massDownloadTriggered, setMassDownloadTriggered] = useState<boolean>(true);
  const [fileRenameTriggered, setFileRenameTriggered] = useState<boolean>(true);
  const [usbCopyTriggered, setUsbCopyTriggered] = useState<boolean>(false);
  const [anonymizeUsers, setAnonymizeUsers] = useState<boolean>(false);
  const [isEscalatedToEdiscovery, setIsEscalatedToEdiscovery] = useState<boolean>(false);

  // Calculate dynamic risk score
  const score =
    (hasHrResignationTrigger ? 25 : 0) +
    (massDownloadTriggered ? 30 : 0) +
    (fileRenameTriggered ? 15 : 0) +
    (usbCopyTriggered ? 30 : 0);

  const riskLevel = score >= 70 ? 'High' : score >= 40 ? 'Medium' : 'Low';

  const displayedUserName = anonymizeUsers ? 'User AN-9042 (匿名化処理中)' : '佐藤 美咲 (m.sato@contoso.com)';

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>SC-500 スコープ 4</span>
              <span>·</span>
              <span>インサイダーリスク管理 & コンプライアンス調査</span>
              <span>·</span>
              <span>HR Connector & Sequence Detection & eDiscovery Escalation</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              インサイダーリスク管理 (Insider Risk) 異常行動シーケンス追跡
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              人事コネクタによる退職日トリガー、SharePointからの大量機密ダウンロード、ファイル圧縮・改名、USB持ち出しの連続行動(Sequence)からリスクスコアを算出し、eDiscovery(Premium)へのエスカレーションと法的ホールド(Hold)の連動を検証します。
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToQuiz?.('q7')}
              className="px-3 py-2 text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 rounded hover:bg-sky-900/50 transition-colors flex items-center gap-1.5"
            >
              <span>関連の試験問題を見る</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Action Sequence Controller (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <UserX className="w-4 h-4 text-sky-400" />
                <span>ユーザー行動シミュレーション (Sequence)</span>
              </h2>
              <button
                onClick={() => setAnonymizeUsers(!anonymizeUsers)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                title="Purviewインサイダーリスクの匿名化機能 (プライバシー保護)"
              >
                {anonymizeUsers ? <EyeOff className="w-3.5 h-3.5 text-sky-400" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{anonymizeUsers ? '匿名化 ON' : '実名表示'}</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {/* Step 1: HR Connector Trigger */}
              <div className={`p-3 rounded border transition-colors ${
                hasHrResignationTrigger
                  ? 'bg-sky-950/40 border-sky-600/50 text-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-sky-900 flex items-center justify-center text-[10px] text-sky-300 font-mono">1</span>
                    <span>HRコネクタ: 退職届提出イベント (トリガー)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={hasHrResignationTrigger}
                    onChange={(e) => setHasHrResignationTrigger(e.target.checked)}
                    className="rounded text-sky-600 focus:ring-sky-500 bg-slate-900 border-slate-700"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-7">
                  人事システム連携により退職予定日 (2026-10-31) を検知。ユーザーをインサイダーリスク監視プールに登録。
                </p>
              </div>

              {/* Step 2: Mass Download */}
              <div className={`p-3 rounded border transition-colors ${
                massDownloadTriggered
                  ? 'bg-amber-950/40 border-amber-600/50 text-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-amber-900 flex items-center justify-center text-[10px] text-amber-300 font-mono">2</span>
                    <span>SharePointからの異常な大量ダウンロード</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={massDownloadTriggered}
                    onChange={(e) => setMassDownloadTriggered(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-700"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-7">
                  機密案件ライブラリから通常の30倍となる350件のファイルを2時間以内に一括ダウンロード。
                </p>
              </div>

              {/* Step 3: File Rename / Obfuscation */}
              <div className={`p-3 rounded border transition-colors ${
                fileRenameTriggered
                  ? 'bg-amber-950/40 border-amber-600/50 text-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-amber-900 flex items-center justify-center text-[10px] text-amber-300 font-mono">3</span>
                    <span>拡張子変更・ZIP難読化 (Obfuscation)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={fileRenameTriggered}
                    onChange={(e) => setFileRenameTriggered(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-700"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-7">
                  ダウンロードしたExcel文書を「backup_temp.zip」に圧縮し、暗号化パスワードを設定。
                </p>
              </div>

              {/* Step 4: Exfiltration via USB */}
              <div className={`p-3 rounded border transition-colors ${
                usbCopyTriggered
                  ? 'bg-rose-950/40 border-rose-600/50 text-slate-200'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="font-semibold flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-rose-900 flex items-center justify-center text-[10px] text-rose-300 font-mono">4</span>
                    <span>未承認USBストレージへのコピー試行</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={usbCopyTriggered}
                    onChange={(e) => setUsbCopyTriggered(e.target.checked)}
                    className="rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1 pl-7">
                  暗号化ZIPを個人所有のUSBメモリへ書き込み。データ外部持ち出し(Exfiltration)成立。
                </p>
              </div>
            </div>
          </div>

          {/* Exam Reference Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>SC-500 試験で狙われるインサイダーリスク仕様</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong>シーケンス検出 (Sequence Detection):</strong> 単発のダウンロードだけでなく「退職通知 → 大量DL → 圧縮改名 → 外部転送」のような一連の文脈行動を自動相関分析して高スコアを付与します。
              </li>
              <li>
                <strong>匿名化表示 (Pseudonymization):</strong> デフォルトでは調査担当者の偏見を防ぐため、ユーザー名をマスクして表示可能。
              </li>
              <li>
                <strong>法的エスカレーション:</strong> インシデント調査から「eDiscovery (Premium)」にエスカレーションすると、対象ユーザーのメールボックスやOneDriveに即座にリーガルホールド(訴訟ホールド)をかけられます。
              </li>
            </ul>
          </div>
        </div>

        {/* Right Zone: Risk Score Meter & Case Management Console (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Risk Score Summary Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs text-slate-400">対象調査ユーザー</span>
                <div className="text-sm font-bold text-white mt-0.5">{displayedUserName}</div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">リスクレベル判定</span>
                <div className="mt-0.5">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono border ${
                    riskLevel === 'High'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-700/60'
                      : riskLevel === 'Medium'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-700/60'
                      : 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60'
                  }`}>
                    {riskLevel.toUpperCase()} RISK ({score}/100)
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Risk Gauge Meter */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">累積リスクスコア (Cumulative Risk Score):</span>
                <span className="font-mono text-sky-300 font-bold">{score} / 100 pt</span>
              </div>
              <div className="w-full bg-slate-950 rounded h-3 overflow-hidden border border-slate-800 relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    score >= 70 ? 'bg-rose-500' : score >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0 (低リスク)</span>
                <span>40 (中リスクしきい値)</span>
                <span>70 (高リスク発報)</span>
                <span>100 (重大インシデント)</span>
              </div>
            </div>

            {/* Sequence Detection Notice */}
            {score >= 70 && (
              <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-rose-300">
                    重大アラート発報: 「退職者による機密データの持ち出しシーケンス」検知
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    複数の疑わしいアクティビティが短期間に連続して実行されました。コンプライアンス調査チームによるケース作成を推奨します。
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Investigation Case & eDiscovery Escalation */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
                <FileSearch className="w-4 h-4 text-sky-400" />
                <span>インシデント調査ケース (Case Management)</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono">Case ID: #IR-2026-004</span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-2">
                <div className="font-semibold text-slate-200">ケース概要:</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  退職予定の営業シニア担当者によるSharePoint機密ファイルの大量ダウンロードおよびUSB外部コピー。競合他社への機密漏洩が疑われるため、法務および人事部と連携して証拠保全を実施。
                </div>
              </div>

              {/* Action: Escalate to eDiscovery */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-sky-400" />
                    <span>eDiscovery (Premium) へのエスカレーション</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ワンクリックで法務案件に昇格させ、対象ユーザーのメール・Teams・OneDriveを即座に「法的ホールド (Legal Hold)」で凍結します。
                  </div>
                </div>

                <button
                  onClick={() => setIsEscalatedToEdiscovery(!isEscalatedToEdiscovery)}
                  className={`px-4 py-2 text-xs font-semibold rounded transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isEscalatedToEdiscovery
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                      : 'bg-sky-600 hover:bg-sky-500 text-white'
                  }`}
                >
                  {isEscalatedToEdiscovery ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>法的ホールド適用中 (凍結済)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>eDiscovery へエスカレート</span>
                    </>
                  )}
                </button>
              </div>

              {isEscalatedToEdiscovery && (
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded text-[11px] text-emerald-300 space-y-1">
                  <div className="font-semibold">✓ 法的ホールド (Legal Hold) が確立されました:</div>
                  <div>・Exchange メールボックス: 削除・改ざんの試行があっても原本が自動保持されます。</div>
                  <div>・OneDrive 個人ストレージ: 保存データおよびバージョン履歴が法的に保全されました。</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
