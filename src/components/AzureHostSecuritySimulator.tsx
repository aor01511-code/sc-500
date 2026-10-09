import React, { useState } from 'react';
import { DEFENDER_ALERTS, PAW_CONFIGS } from '../data/azureSecData';
import { DefenderAlert, PawDeviceConfig } from '../types/azureSec';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Server, 
  Laptop, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Info, 
  Cloud, 
  Database, 
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Cpu,
  Layers,
  Globe
} from 'lucide-react';

interface AzureHostSecuritySimulatorProps {
  onNavigateToQuiz?: (topic: string) => void;
}

export const AzureHostSecuritySimulator: React.FC<AzureHostSecuritySimulatorProps> = ({ onNavigateToQuiz }) => {
  const [activeTab, setActiveTab] = useState<'defender-cloud' | 'paw-devices' | 'mcsb-benchmark'>('defender-cloud');

  // Defender Alerts State
  const [alerts, setAlerts] = useState<DefenderAlert[]>(DEFENDER_ALERTS);
  const [selectedAlertId, setSelectedAlertId] = useState<string>('alert-acr-cve');
  const [remediatedAlertIds, setRemediatedAlertIds] = useState<string[]>([]);

  // PAW Devices State
  const [selectedDeviceType, setSelectedDeviceType] = useState<'privileged-paw' | 'enterprise' | 'specialized'>('privileged-paw');
  const [testPawAction, setTestPawAction] = useState<'browse-web' | 'ssh-prod-vm' | 'install-untrusted-app' | null>(null);

  const selectedAlert = alerts.find((a) => a.id === selectedAlertId) || alerts[0];
  const selectedDevice = PAW_CONFIGS.find((p) => p.deviceType === selectedDeviceType) || PAW_CONFIGS[0];

  // Remediation action
  const handleRemediateAlert = (alertId: string) => {
    if (!remediatedAlertIds.includes(alertId)) {
      setRemediatedAlertIds([...remediatedAlertIds, alertId]);
    }
  };

  // 1-Click Quick Demo Mission trigger
  const triggerMission = (mission: 'acr-cve' | 'sql-atp' | 'paw-web-block' | 'paw-prod-ssh' | 'multicloud-aws') => {
    if (mission === 'acr-cve') {
      setActiveTab('defender-cloud');
      setSelectedAlertId('alert-acr-cve');
    } else if (mission === 'sql-atp') {
      setActiveTab('defender-cloud');
      setSelectedAlertId('alert-sql-injection');
    } else if (mission === 'paw-web-block') {
      setActiveTab('paw-devices');
      setSelectedDeviceType('privileged-paw');
      setTestPawAction('browse-web');
    } else if (mission === 'paw-prod-ssh') {
      setActiveTab('paw-devices');
      setSelectedDeviceType('privileged-paw');
      setTestPawAction('ssh-prod-vm');
    } else if (mission === 'multicloud-aws') {
      setActiveTab('defender-cloud');
      setSelectedAlertId('alert-multicloud-s3');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>ホストセキュリティ & エンドポイント保護 & デバイス戦略</span>
              <span>·</span>
              <span>SC-300 / SC-500 / AZ-500 対策</span>
              <span>·</span>
              <span>Defender for Cloud (CSPM/CWPP) & PAW & MCSB</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Microsoft Defender for Cloud & PAW 特権端末検証スタジオ
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              コンテナレジストリ(ACR)・SQL・マルチクラウド・ハイブリッドArcの脅威検知と修復、PAW (特権アクセスワークステーション) のTPM 2.0・HVCIメモリ整合性、および一般PCとのセキュリティレベル差異を検証します。
            </p>
          </div>
        </div>

        {/* 3-Step Guided Navigation Banner */}
        <div className="mt-4 p-3 bg-slate-950/80 rounded border border-sky-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-sky-300 font-bold shrink-0">
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
            <span>【シミュレーターの使い方: 3ステップ実践手順】</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-slate-300 text-[11px]">
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">① 下のミッションを選択</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">② 脆弱性修復または端末操作テストを実行</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">③ Defender検知ログ & PAWの防御理由を確認</span>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>【1クリック体験ミッション】試したいセキュリティ課題をクリックしてください:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <button
              onClick={() => triggerMission('acr-cve')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ACR コンテナ脆弱性検知</div>
                <div className="text-[10px] text-rose-400 font-medium">重大CVEイメージの修復</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('sql-atp')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Defender for SQL ATP</div>
                <div className="text-[10px] text-amber-400 font-medium">SQLインジェクション異常検知</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('paw-web-block')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">PAW 端末 Web閲覧遮断</div>
                <div className="text-[10px] text-sky-400 font-medium">特権端末での一般Web禁止</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('paw-prod-ssh')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">PAW ➔ 本番管理アクセス</div>
                <div className="text-[10px] text-emerald-400 font-medium">専用閉域VNetへのみ接続許可</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('multicloud-aws')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-indigo-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-indigo-950 border border-indigo-700 text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">マルチクラウド (AWS) CSPM</div>
                <div className="text-[10px] text-indigo-400 font-medium">S3パブリック公開を即座に是正</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('defender-cloud')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'defender-cloud'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>1. Defender for Cloud (CWPP / CSPM / ACR / SQL / マルチクラウド)</span>
        </button>

        <button
          onClick={() => setActiveTab('paw-devices')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'paw-devices'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>2. 特権アクセスワークステーション (PAW) & デバイス戦略</span>
        </button>

        <button
          onClick={() => setActiveTab('mcsb-benchmark')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'mcsb-benchmark'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>3. Microsoft Cloud Security Benchmark (MCSB)</span>
        </button>
      </div>

      {/* TAB 1: Defender for Cloud Alerts & Remediation */}
      {activeTab === 'defender-cloud' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <span className="font-bold text-slate-300 text-xs">検知アラート一覧 (ワークロード別):</span>
            <div className="space-y-2">
              {alerts.map((alt) => {
                const isSelected = selectedAlertId === alt.id;
                const isRemediated = remediatedAlertIds.includes(alt.id);

                return (
                  <button
                    key={alt.id}
                    onClick={() => setSelectedAlertId(alt.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'bg-sky-950/50 border-sky-500 text-white ring-1 ring-sky-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-200 truncate">{alt.title}</span>
                      {isRemediated ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold text-[10px] border border-emerald-800 shrink-0">
                          修復済
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 font-bold text-[10px] border border-rose-800 shrink-0">
                          {alt.severity}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">リソース: {alt.resourceName}</div>
                    <div className="text-[10px] text-sky-400 font-mono mt-0.5">分類: {alt.examConcept}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-slate-500">ワークロード保護対象:</span>
                  <h3 className="text-sm font-bold text-white">{selectedAlert.resourceName}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                  remediatedAlertIds.includes(selectedAlert.id)
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}>
                  {remediatedAlertIds.includes(selectedAlert.id) ? '✓ 状態: 正常 (是正完了)' : `✕ 状態: 危険 (${selectedAlert.severity})`}
                </span>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">検知された脅威の概要:</label>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 text-slate-200 leading-relaxed text-[11px]">
                  {selectedAlert.description}
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">推奨される修復アクション (Remediation):</label>
                <div className="p-3 bg-slate-900 rounded border border-emerald-900/50 text-emerald-300 text-[11px]">
                  {selectedAlert.mitigation}
                </div>
              </div>

              {!remediatedAlertIds.includes(selectedAlert.id) ? (
                <button
                  onClick={() => handleRemediateAlert(selectedAlert.id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Defender for Cloud から自動修復 (Fix) を実行</span>
                </button>
              ) : (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded text-emerald-200 text-center font-bold">
                  ✓ 修復完了: コンプライアンス基準に合致し、セキュアスコアが向上しました。
                </div>
              )}

              <div className="p-3 bg-slate-900 rounded border border-amber-800/40 text-[11px] text-amber-200">
                <strong>💡 試験対策の要点:</strong> Defender for Containers はプッシュ時および定期的にACRを自動スキャンします。Defender for SQLは既知のSQL脆弱性評価(VA)と異常クエリ検知(ATP)を包括提供します。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAW Devices & Strategy */}
      {activeTab === 'paw-devices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Laptop className="w-5 h-5 text-sky-400" />
              <span>PAW (特権アクセスワークステーション) vs 一般エンタープライズ端末</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              特権管理者を狙うフィッシングや水飲み場攻撃から守るため、管理専用PC (Tier 0/1) を物理的に分離するデバイスセキュリティ戦略。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {PAW_CONFIGS.map((cfg) => (
              <button
                key={cfg.deviceType}
                onClick={() => {
                  setSelectedDeviceType(cfg.deviceType);
                  setTestPawAction(null);
                }}
                className={`p-4 rounded-lg border text-left transition-all ${
                  selectedDeviceType === cfg.deviceType
                    ? 'bg-sky-950/60 border-sky-500 text-white ring-1 ring-sky-500/40 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm text-slate-200">{cfg.nameJa}</div>
                <div className="text-[11px] text-slate-400 mt-1">対象: {cfg.targetRole}</div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-white text-sm">端末のハードウェアセキュリティ & 制限構成</span>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span>TPM 2.0 (暗号化プロセッサチップ):</span>
                    <span className="font-bold text-emerald-400">必須 (有効)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span>セキュアブート (Secure Boot):</span>
                    <span className="font-bold text-emerald-400">必須 (有効)</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span>HVCI (ハイパーバイザー保護コード整合性):</span>
                    <span className={`font-bold ${selectedDevice.features.hvciMemoryIntegrity ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {selectedDevice.features.hvciMemoryIntegrity ? '有効 (メモリ整合性ガード)' : '無効'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span>一般インターネット閲覧 (Webブラウジング):</span>
                    <span className={`font-bold ${selectedDevice.features.directInternetBrowsing ? 'text-amber-400' : 'text-rose-400'}`}>
                      {selectedDevice.features.directInternetBrowsing ? '許可 (Proxy経由)' : '完全禁止 (ブロック)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900">
                    <span>メールクライアント (Outlook等):</span>
                    <span className={`font-bold ${selectedDevice.features.emailClientAllowed ? 'text-amber-400' : 'text-rose-400'}`}>
                      {selectedDevice.features.emailClientAllowed ? '許可' : '完全禁止 (フィッシング根絶)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-white text-sm">この端末での操作シミュレーション:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTestPawAction('browse-web')}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                  >
                    一般Webサイト閲覧を試行
                  </button>
                  <button
                    onClick={() => setTestPawAction('ssh-prod-vm')}
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded border border-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                  >
                    本番管理VNetへSSH/Bastion接続
                  </button>
                </div>

                {testPawAction && (
                  <div className="p-3 bg-slate-900 rounded border border-slate-700 space-y-1">
                    {testPawAction === 'browse-web' ? (
                      selectedDevice.deviceType === 'privileged-paw' ? (
                        <div className="text-rose-300">
                          <strong className="block text-rose-400 mb-1">✕ アクセス拒否 (PAWポリシーにより遮断)</strong>
                          PAW端末では一般Webサイトや電子メールの利用がネットワークレベルおよびAppLockerで完全禁止されています。管理者PCがフィッシングや悪意ある広告で汚染されるリスクを根本からゼロにします。
                        </div>
                      ) : (
                        <div className="text-emerald-300">
                          <strong className="block text-emerald-400 mb-1">✓ アクセス成功</strong>
                          一般エンタープライズPCのため、プロキシおよびEDR監視下でWeb閲覧が許可されています。
                        </div>
                      )
                    ) : (
                      selectedDevice.deviceType === 'privileged-paw' ? (
                        <div className="text-emerald-300">
                          <strong className="block text-emerald-400 mb-1">✓ 特権接続許可 (PAWのみ許可)</strong>
                          本番インフラのBastionや管理プレーンへ、条件付きアクセスの「準拠デバイス + 専用PAW」ルールを満たして安全に接続できました。
                        </div>
                      ) : (
                        <div className="text-amber-300">
                          <strong className="block text-amber-400 mb-1">⚠️ 接続拒否 (条件付きアクセスによりブロック)</strong>
                          一般社員PCからの本番管理プレーンへの直接SSH/RDPは、条件付きアクセスで「PAW端末必須」とされているため遮断されました。
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MCSB Benchmark */}
      {activeTab === 'mcsb-benchmark' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>Microsoft Cloud Security Benchmark (MCSB) ガバナンス</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              CIS ControlsやNIST SP 800-53に基づき、クラウド環境全体のセキュリティ統制を包括的に標準化したフレームワーク。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-sm text-sky-300">MCSBの主要統制ドメイン</div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li><strong>ネットワークセキュリティ (NS):</strong> NSG、Azure Firewall、DDoS保護、Private Link。</li>
                <li><strong>アイデンティティ管理 (IM):</strong> Entra ID、MFA、パスワードレス、条件付きアクセス、PIM。</li>
                <li><strong>特権アクセス (PA):</strong> PAW、JIT昇格、最小特権RBAC。</li>
                <li><strong>データ保護 (DP):</strong> Purview感度ラベル、カスタマーマネージドキー (CMK)、保存時/転送時暗号化。</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-sm text-indigo-300">セキュアスコア (Secure Score) の改善</div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li>Defender for Cloud がMCSBに基づいてリアルタイムに環境を採点。</li>
                <li>「MFAの強制」「ポート3389の閉鎖」「暗号化の有効化」など、影響度の高い推奨事項を修復することでスコアが即座に上昇。</li>
                <li>マルチクラウド (AWS / GCP) にも同一のMCSB基準をマッピングして一元管理可能。</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
