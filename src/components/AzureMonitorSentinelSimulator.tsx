import React, { useState, useEffect } from 'react';
import { 
  MONITOR_AGENTS, 
  LOG_TYPES_DATA, 
  KQL_PRESETS, 
  MITRE_ATTACK_TACTICS, 
  SENTINEL_INCIDENTS_PRESET, 
  JIT_VM_PRESET 
} from '../data/azureSecData';
import { MONITOR_SENTINEL_DEEP_DIVE_ITEMS } from '../data/azureMonitorDeepDiveData';
import { FeatureMeaningItem } from '../types/monitorDeepDive';
import { 
  MonitorAgentInfo, 
  LogTypeComparison, 
  KqlQueryTemplate, 
  MitreTacticItem, 
  SentinelIncidentSimulation, 
  JitVmRequestState 
} from '../types/azureSec';
import { 
  Activity, 
  ShieldAlert, 
  Terminal, 
  Database, 
  Server, 
  Radio, 
  Lock, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Cpu, 
  FileCode, 
  Layers, 
  Workflow, 
  Send, 
  AlertTriangle, 
  Compass, 
  Target, 
  Bell, 
  Sliders, 
  Network, 
  ExternalLink,
  Laptop,
  Check,
  BookOpen,
  HelpCircle,
  Info,
  Search,
  Filter,
  X,
  Eye,
  ChevronDown,
  ChevronUp,
  BookMarked
} from 'lucide-react';

interface AzureMonitorSentinelSimulatorProps {
  onNavigateToQuiz?: (questionId?: string) => void;
}

export const AzureMonitorSentinelSimulator: React.FC<AzureMonitorSentinelSimulatorProps> = ({ 
  onNavigateToQuiz 
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'monitor' | 'kql' | 'defender-jit' | 'sentinel-soc' | 'knowledge-base'>('monitor');

  // Deep Dive Knowledge Base State
  const [deepDiveSearchTerm, setDeepDiveSearchTerm] = useState<string>('');
  const [deepDiveCategory, setDeepDiveCategory] = useState<string>('all');
  const [modalItem, setModalItem] = useState<FeatureMeaningItem | null>(null);
  const [expandedConceptId, setExpandedConceptId] = useState<string | null>('azure-monitor-core');

  // Mission State
  const [activeMission, setActiveMission] = useState<number | null>(null);

  // Tab 1: Monitor State
  const [selectedAgentId, setSelectedAgentId] = useState<string>('ama');
  const [selectedLogTypeId, setSelectedLogTypeId] = useState<string>('activity-log');
  const [alertRuleMetric, setAlertRuleMetric] = useState<string>('Percentage CPU > 85%');
  const [actionGroupChannels, setActionGroupChannels] = useState<{
    email: boolean;
    sms: boolean;
    webhook: boolean;
    logicApps: boolean;
  }>({ email: true, sms: false, webhook: true, logicApps: true });
  const [alertFiredState, setAlertFiredState] = useState<boolean>(false);
  const [alertNotificationLogs, setAlertNotificationLogs] = useState<string[]>([]);

  // Tab 2: KQL State
  const [selectedKqlId, setSelectedKqlId] = useState<string>('kql-brute-force');
  const [isQueryExecuting, setIsQueryExecuting] = useState<boolean>(false);
  const [queryExecutionCompleted, setQueryExecutionCompleted] = useState<boolean>(false);

  // Tab 3: Defender & JIT State
  const [secureScore, setSecureScore] = useState<number>(64);
  const [remediatedRecommendations, setRemediatedRecommendations] = useState<{ [key: string]: boolean }>({
    mfa: false,
    jit: false,
    endpointProtection: false,
    sqlEncryption: false,
  });
  const [jitRequest, setJitRequest] = useState<JitVmRequestState>(JIT_VM_PRESET);
  const [jitActive, setJitActive] = useState<boolean>(false);
  const [jitTimeLeft, setJitTimeLeft] = useState<number>(180);

  // Tab 4: Sentinel SOC State
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-2026-001');
  const [selectedMitreTacticId, setSelectedMitreTacticId] = useState<string>('initial-access');
  const [isPlaybookExecuting, setIsPlaybookExecuting] = useState<boolean>(false);
  const [playbookExecutionLogs, setPlaybookExecutionLogs] = useState<string[]>([]);
  const [incidentResolvedState, setIncidentResolvedState] = useState<boolean>(false);

  // JIT Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (jitActive && jitTimeLeft > 0) {
      timer = setInterval(() => {
        setJitTimeLeft(prev => {
          if (prev <= 1) {
            setJitActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [jitActive, jitTimeLeft]);

  // Quick Mission Handler
  const handleStartMission = (missionNum: number) => {
    setActiveMission(missionNum);
    if (missionNum === 1) {
      setActiveTab('kql');
      setSelectedKqlId('kql-brute-force');
      handleExecuteKql('kql-brute-force');
    } else if (missionNum === 2) {
      setActiveTab('monitor');
      setAlertRuleMetric('Percentage CPU > 85%');
      handleFireAlertTest();
    } else if (missionNum === 3) {
      setActiveTab('defender-jit');
      handleRequestJitAccess();
    } else if (missionNum === 4) {
      setActiveTab('sentinel-soc');
      setSelectedIncidentId('INC-2026-001');
      handleRunPlaybook('Playbook-BlockIP-And-RevokeUser');
    }
  };

  // KQL Query Execution Handler
  const handleExecuteKql = (kqlId: string) => {
    setIsQueryExecuting(true);
    setQueryExecutionCompleted(false);
    setTimeout(() => {
      setIsQueryExecuting(false);
      setQueryExecutionCompleted(true);
    }, 450);
  };

  // Alert Rule Fire Simulation Handler
  const handleFireAlertTest = () => {
    setAlertFiredState(true);
    const logs: string[] = [
      `[${new Date().toLocaleTimeString()}] ⚠️ アラートルール「CPU > 85% or 不審なサインイン急増」が評価条件を満たしました (しきい値超過)。`,
      `[${new Date().toLocaleTimeString()}] 📡 アクショングループ「AG-Security-Ops」を呼び出し中...`,
    ];

    if (actionGroupChannels.email) {
      logs.push(`[${new Date().toLocaleTimeString()}] 📧 [Email通知] sec-ops@contoso.com 宛てにアラートメールを送信完了`);
    }
    if (actionGroupChannels.sms) {
      logs.push(`[${new Date().toLocaleTimeString()}] 📱 [SMS通知] +81-90-XXXX-XXXX 宛てに緊急SMSを送信完了`);
    }
    if (actionGroupChannels.webhook) {
      logs.push(`[${new Date().toLocaleTimeString()}] 🔗 [Webhook] https://api.itsm.contoso.com/incidents へチケット自動起票ペイロード送信完了 (HTTP 200 OK)`);
    }
    if (actionGroupChannels.logicApps) {
      logs.push(`[${new Date().toLocaleTimeString()}] ⚡ [Logic Apps] 自動修復ワークフロー「Workflow-AutoRestartOrBlock」をトリガーしました`);
    }

    setAlertNotificationLogs(logs);
  };

  // JIT Access Request Handler
  const handleRequestJitAccess = () => {
    setJitActive(true);
    setJitTimeLeft(180);
    setJitRequest(prev => ({
      ...prev,
      approved: true,
      nsgRuleApplied: true,
      expiresInMinutes: 180,
    }));
  };

  // Defender Recommendation Remediation Handler
  const handleRemediateRecommendation = (key: string, points: number) => {
    if (!remediatedRecommendations[key]) {
      setRemediatedRecommendations(prev => ({ ...prev, [key]: true }));
      setSecureScore(prev => Math.min(100, prev + points));
    }
  };

  // Sentinel Playbook Execution Handler
  const handleRunPlaybook = (playbookName: string) => {
    setIsPlaybookExecuting(true);
    setIncidentResolvedState(false);
    setPlaybookExecutionLogs([
      `[${new Date().toLocaleTimeString()}] 🤖 Sentinel オートメーションルールがトリガーされました: ${playbookName}`,
      `[${new Date().toLocaleTimeString()}] 🔍 エンティティ抽出: 悪意ある送信元 IP (185.220.101.5), 被害ユーザー (victim-dev@contoso.com)`,
    ]);

    setTimeout(() => {
      setPlaybookExecutionLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] 🛡️ [Azure Firewall / NSG] 攻撃元 IP「185.220.101.5」をインバウンド拒否ルール (Priority 100) に自動登録しました。`,
        `[${new Date().toLocaleTimeString()}] 🔐 [Microsoft Entra ID] 侵害されたアカウント「victim-dev@contoso.com」の全アクティブトークンを強制失効 (Revoke Sessions) し、パスワードリセット要求フラグを設定しました。`,
        `[${new Date().toLocaleTimeString()}] 📢 [Microsoft Teams] #soc-security-alerts チャンネルに封じ込め完了カードを通知しました。`,
        `[${new Date().toLocaleTimeString()}] ✅ インシデントのステータスを「解決済み (Closed - 自動修復完了)」に更新しました。`,
      ]);
      setIsPlaybookExecuting(false);
      setIncidentResolvedState(true);
    }, 900);
  };

  // Selected Item lookups
  const selectedAgent = MONITOR_AGENTS.find(a => a.id === selectedAgentId) || MONITOR_AGENTS[0];
  const selectedLogType = LOG_TYPES_DATA.find(l => l.id === selectedLogTypeId) || LOG_TYPES_DATA[0];
  const selectedKql = KQL_PRESETS.find(k => k.id === selectedKqlId) || KQL_PRESETS[0];
  const selectedMitreTactic = MITRE_ATTACK_TACTICS.find(m => m.id === selectedMitreTacticId) || MITRE_ATTACK_TACTICS[0];
  const selectedIncident = SENTINEL_INCIDENTS_PRESET.find(i => i.id === selectedIncidentId) || SENTINEL_INCIDENTS_PRESET[0];

  // Filtered Deep Dive items for Tab 5
  const filteredDeepDiveItems = MONITOR_SENTINEL_DEEP_DIVE_ITEMS.filter(item => {
    const matchesCat = deepDiveCategory === 'all' || item.category === deepDiveCategory;
    const q = deepDiveSearchTerm.toLowerCase();
    const matchesSearch = !q || 
      item.term.toLowerCase().includes(q) || 
      item.termJa.toLowerCase().includes(q) || 
      item.whatItIs.toLowerCase().includes(q) || 
      item.whatItMeans.toLowerCase().includes(q) ||
      item.practicalScenario.toLowerCase().includes(q) ||
      item.badge.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 rounded-xl border border-sky-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Azure Monitor & SOC 統合検証スタジオ
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                SC-200 / AZ-500 / SC-500 対策実機シミュレーター
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Activity className="w-7 h-7 text-sky-400" />
              Azure Monitor & Defender & Microsoft Sentinel (SIEM/SOAR)
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              エージェント変遷 (AMA vs レガシーMMA/WAD/LAD)、ログ種別、KQLクエリ、アクショングループ、
              Defender CSPM & JIT VMアクセス、MITRE ATT&CK 14戦術、および Sentinel インシデント調査 & SOARプレイブック自動封じ込めを完全可視化します。
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {onNavigateToQuiz && (
              <button
                onClick={() => onNavigateToQuiz('q30')}
                className="px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-colors"
              >
                <span>関連試験問題を解く</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3-Step Practice Guide */}
        <div className="mt-5 p-3.5 rounded-lg bg-slate-950/70 border border-sky-700/30 text-xs">
          <div className="text-sky-300 font-bold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>【何をすればいいか一目でわかる】監視 & セキュリティ運用 3ステップ学習ガイド</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
            <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
              <div>
                <strong className="text-white block mb-0.5">ログ収集とエージェント選定</strong>
                <span>新標準 AMA (DCR) と旧 MMA の違い、アクティビティログ vs リソースログの送信先と設定箇所を把握。</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
              <div>
                <strong className="text-white block mb-0.5">KQL分析 & アラート発火</strong>
                <span>KQLで総当たり攻撃や特権付与を抽出し、アクショングループでメールやLogic Apps自動修復を発火。</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
              <div>
                <strong className="text-white block mb-0.5">Sentinel SOAR プレイブック自動封じ込め</strong>
                <span>Fusion/NRTルールが検知したインシデントから、Logic Appsで悪意あるIPを即時NSG遮断するSOARを体験。</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Missions Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Play className="w-3 h-3 text-sky-400" />
              ワンクリック実機体験ミッション:
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => handleStartMission(1)}
              className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                activeMission === 1 
                  ? 'bg-sky-900/40 border-sky-400 text-white shadow-sm ring-1 ring-sky-400' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="font-bold flex items-center justify-between mb-1">
                <span>Mission 1: KQL 総当たり検知</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">クエリ実行</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                SigninLogs から複数回失敗した攻撃元IPを特定
              </p>
            </button>

            <button
              onClick={() => handleStartMission(2)}
              className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                activeMission === 2 
                  ? 'bg-sky-900/40 border-sky-400 text-white shadow-sm ring-1 ring-sky-400' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="font-bold flex items-center justify-between mb-1">
                <span>Mission 2: アラート & ActionGroup</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">自動通知</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                CPU超過/攻撃検知でメール & Webhook自動送信
              </p>
            </button>

            <button
              onClick={() => handleStartMission(3)}
              className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                activeMission === 3 
                  ? 'bg-sky-900/40 border-sky-400 text-white shadow-sm ring-1 ring-sky-400' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="font-bold flex items-center justify-between mb-1">
                <span>Mission 3: JIT VMアクセス</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">3389一時開放</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                NSGでRDPを自社IP限定で3時間だけ開放
              </p>
            </button>

            <button
              onClick={() => handleStartMission(4)}
              className={`p-2.5 rounded-lg text-left text-xs transition-all border ${
                activeMission === 4 
                  ? 'bg-sky-900/40 border-sky-400 text-white shadow-sm ring-1 ring-sky-400' 
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div className="font-bold flex items-center justify-between mb-1">
                <span>Mission 4: Sentinel SOAR自動遮断</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">プレイブック</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                Fusion検知インシデントから悪意あるIPを即時NSG遮断
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'monitor'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>1. Azure Monitor & エージェント & ログ種別 & アラート</span>
        </button>

        <button
          onClick={() => setActiveTab('kql')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'kql'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>2. Log Analytics & KQL クエリ実行スタジオ</span>
        </button>

        <button
          onClick={() => setActiveTab('defender-jit')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'defender-jit'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>3. Defender for Cloud (CSPM / CWP) & JIT VM アクセス</span>
        </button>

        <button
          onClick={() => setActiveTab('sentinel-soc')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'sentinel-soc'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-4 h-4" />
          <span>4. Microsoft Sentinel (SIEM / SOAR) & MITRE ATT&CK</span>
        </button>

        <button
          onClick={() => setActiveTab('knowledge-base')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'knowledge-base'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-amber-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>5. 📚 どういう機能？どういう意味？ 全52概念・機能の徹底解説</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            全網羅
          </span>
        </button>
      </div>

      {/* TAB 1: Azure Monitor, Agents, Log Types, Alert Rules & Action Groups */}
      {activeTab === 'monitor' && (
        <div className="space-y-6">
          {/* Quick Concept Explanations Strip for Tab 1 */}
          <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-sky-400" />
                <span>【このタブで登場する重要用語】どういう機能でどういう意味なのか？ (クリックで詳細解説)</span>
              </span>
              <button
                onClick={() => {
                  setActiveTab('knowledge-base');
                  setDeepDiveCategory('agents-and-logs');
                }}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1 shrink-0"
              >
                <span>全52用語の解説百科を見る</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'azure-monitor-core',
                'vm-insights',
                'metrics-vs-logs',
                'application-code-telemetry',
                'operating-system-telemetry',
                'computing-resources-telemetry',
                'azure-monitor-agent-ama',
                'log-analytics-agent-mma',
                'dependency-agent',
                'azure-diagnostics-extension-wad-lad',
                'telegraf-agent',
                'resource-logs',
                'activity-log',
                'aad-logs',
                'diagnostic-settings-config',
                'alert-rules',
                'action-groups',
                'notification-types',
                'action-types',
              ].map(id => {
                const item = MONITOR_SENTINEL_DEEP_DIVE_ITEMS.find(i => i.id === id);
                if (!item) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setModalItem(item)}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-sky-400 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Info className="w-3 h-3 text-sky-400 shrink-0" />
                    <span>{item.termJa}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Agent Evolution Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-sky-400" />
                  <span>エージェント変遷マトリックス: AMA (新標準) vs レガシー (MMA / WAD / LAD / Dependency)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Microsoft は従来の MMA (Log Analytics Agent) を廃止し、データ収集ルール (DCR) に対応した AMA (Azure Monitor Agent) への移行を義務化しています。
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {MONITOR_AGENTS.map(agent => {
                const isSelected = selectedAgentId === agent.id;
                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 shadow ring-1 ring-sky-400'
                        : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-white">{agent.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold block w-fit mb-2 ${
                      agent.status.includes('新標準')
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : agent.status.includes('廃止')
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}>
                      {agent.status}
                    </span>
                    <div className="text-[11px] text-slate-300 line-clamp-2 mb-2">
                      {agent.nameJa}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 bg-black/40 p-1.5 rounded">
                      構成: <span className="text-sky-300">{agent.configurationModel}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Agent Inspector */}
            <div className="mt-4 p-4 rounded-lg bg-sky-950/30 border border-sky-800/40">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedAgent.nameJa}</span>
                    <span className="text-xs font-mono text-sky-400">({selectedAgent.osSupported})</span>
                  </h4>
                  <p className="text-xs text-sky-200 mt-1">{selectedAgent.architecture}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                {selectedAgent.keyExamPoints.map((point, idx) => (
                  <div key={idx} className="p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Log Types Comparison: Tenant, Subscription Activity, Resource Diagnostics */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Azure ログのスコープ階層 (テナント vs サブスクリプション vs リソース vs ゲストOS)</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Azureのログは発生場所によって設定手順と送信先が異なります。特に「アクティビティログ」と「リソースログ」の違いは試験頻出です。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {LOG_TYPES_DATA.map(lt => {
                const isSelected = selectedLogTypeId === lt.id;
                return (
                  <div
                    key={lt.id}
                    onClick={() => setSelectedLogTypeId(lt.id)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-400 shadow ring-1 ring-indigo-400'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300 block w-fit mb-1.5">
                      {lt.scope}
                    </span>
                    <h4 className="text-xs font-bold text-white mb-1">{lt.nameJa}</h4>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-2">{lt.description}</p>
                    <div className="text-[10px] font-mono text-slate-400 bg-black/40 p-2 rounded space-y-1">
                      <div>設定: <span className="text-slate-200">{lt.setupLocation}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Log Type Detail */}
            <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
              <div className="font-bold text-white mb-1.5 flex items-center justify-between">
                <span>【詳細】{selectedLogType.nameJa}</span>
                <span className="font-mono text-indigo-400 text-xs">送信先: {selectedLogType.destination}</span>
              </div>
              <p className="leading-relaxed mb-2.5">{selectedLogType.description}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-slate-400 font-bold mr-1">代表的なテーブル/イベント:</span>
                {selectedLogType.examples.map((ex, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 font-mono text-[11px]">
                    {ex}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Alert Rules & Action Groups Interactive Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <span>アラートルール & アクショングループ (Action Groups) 自動発火テスト</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  アラート発火時の通知設定 (Email, SMS, Push, Voice) と自動修復アクション (Webhook, Logic Apps, Runbook) をシミュレートします。
                </p>
              </div>

              <button
                onClick={handleFireAlertTest}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5" />
                <span>アラート発火テスト実行</span>
              </button>
            </div>

            {/* Channel Configuration */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={actionGroupChannels.email}
                  onChange={(e) => setActionGroupChannels(prev => ({ ...prev, email: e.target.checked }))}
                  className="rounded text-amber-500 bg-slate-900"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Email 通知</span>
                  <span className="text-[10px] text-slate-400">sec-ops@contoso.com</span>
                </div>
              </label>

              <label className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={actionGroupChannels.sms}
                  onChange={(e) => setActionGroupChannels(prev => ({ ...prev, sms: e.target.checked }))}
                  className="rounded text-amber-500 bg-slate-900"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">SMS / Voice 通知</span>
                  <span className="text-[10px] text-slate-400">オンコール担当者携帯</span>
                </div>
              </label>

              <label className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={actionGroupChannels.webhook}
                  onChange={(e) => setActionGroupChannels(prev => ({ ...prev, webhook: e.target.checked }))}
                  className="rounded text-amber-500 bg-slate-950"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Webhook (ITSM チケット)</span>
                  <span className="text-[10px] text-slate-400">ServiceNow / Jira API</span>
                </div>
              </label>

              <label className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={actionGroupChannels.logicApps}
                  onChange={(e) => setActionGroupChannels(prev => ({ ...prev, logicApps: e.target.checked }))}
                  className="rounded text-amber-500 bg-slate-900"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block">Azure Logic Apps (SOAR)</span>
                  <span className="text-[10px] text-slate-400">VM再起動・IP遮断自動化</span>
                </div>
              </label>
            </div>

            {/* Fired Logs Display */}
            {alertFiredState && (
              <div className="mt-4 p-3.5 rounded-lg bg-black/60 border border-amber-800/50 font-mono text-xs text-amber-300 space-y-1.5">
                {alertNotificationLogs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Log Analytics & KQL Query Studio */}
      {activeTab === 'kql' && (
        <div className="space-y-6">
          {/* Quick Concept Explanations Strip for Tab 2 */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>【このタブで登場する重要用語】どういう機能でどういう意味なのか？ (クリックで詳細解説)</span>
              </span>
              <button
                onClick={() => {
                  setActiveTab('knowledge-base');
                  setDeepDiveCategory('monitor-telemetry');
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0"
              >
                <span>全52用語の解説百科を見る</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'kql-query',
                'nrt-queries',
                'log-analytics-workspace',
                'data-collector-api',
                'metrics-vs-logs',
              ].map(id => {
                const item = MONITOR_SENTINEL_DEEP_DIVE_ITEMS.find(i => i.id === id);
                if (!item) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setModalItem(item)}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{item.termJa}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span>KQL (Kusto Query Language) 実践クエリ実行スタジオ</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Log Analytics ワークスペース (Workspace ID / Key) に集約されたログから、セキュリティインシデントや性能ボトルネックを瞬時に検索します。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecuteKql(selectedKqlId)}
                  disabled={isQueryExecuting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>KQL 実行 (Run)</span>
                </button>
              </div>
            </div>

            {/* Presets List */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {KQL_PRESETS.map(preset => {
                const isSelected = selectedKqlId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedKqlId(preset.id);
                      setQueryExecutionCompleted(false);
                    }}
                    className={`p-3 rounded-lg text-left text-xs transition-all border ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-400 text-white shadow ring-1 ring-emerald-400'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-emerald-500/20 text-emerald-300 block w-fit mb-1">
                      {preset.category}
                    </span>
                    <span className="font-bold line-clamp-2">{preset.title}</span>
                  </button>
                );
              })}
            </div>

            {/* KQL Code Window */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  Kusto Query (Log Analytics Workspace):
                </span>
                <span className="text-[11px] font-mono text-slate-500">Workspace: law-security-production</span>
              </div>
              <pre className="p-4 rounded-lg bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800 overflow-x-auto leading-relaxed">
                {selectedKql.query}
              </pre>
              <p className="text-xs text-slate-300 mt-2 p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <strong className="text-amber-400 mr-1.5">💡 クエリ解説:</strong>
                {selectedKql.explanation}
              </p>
            </div>

            {/* Query Result Table */}
            {queryExecutionCompleted && (
              <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 animate-fadeIn">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    実行結果: {selectedKql.sampleRows.length} 件抽出 (Completed in 42ms)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                        {selectedKql.sampleColumns.map((col, idx) => (
                          <th key={idx} className="pb-2 pr-4">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200 text-[11px]">
                      {selectedKql.sampleRows.map((row, rIdx) => (
                        <tr key={rIdx} className="hover:bg-slate-900/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-2.5 pr-4 truncate max-w-xs">{String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Defender for Cloud & JIT VM Access */}
      {activeTab === 'defender-jit' && (
        <div className="space-y-6">
          {/* Quick Concept Explanations Strip for Tab 3 */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>【このタブで登場する重要用語】どういう機能でどういう意味なのか？ (クリックで詳細解説)</span>
              </span>
              <button
                onClick={() => {
                  setActiveTab('knowledge-base');
                  setDeepDiveCategory('defender-posture');
                }}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 shrink-0"
              >
                <span>全52用語の解説百科を見る</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'cspm-vs-cwp',
                'secure-score',
                'auto-provisioning',
                'azure-arc-connected-machine',
                'asb-mcsb-compliance',
                'jit-vm-access',
              ].map(id => {
                const item = MONITOR_SENTINEL_DEEP_DIVE_ITEMS.find(i => i.id === id);
                if (!item) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setModalItem(item)}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Info className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{item.termJa}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CSPM Secure Score Dashboard */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                  <span>Microsoft Defender for Cloud: CSPM セキュアスコア & 規制コンプライアンス</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Microsoft Cloud Security Benchmark (MCSB) / NIST / CIS に基づきセキュリティ態勢を評価し、ワンクリック修復でセキュアスコアを向上させます。
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">セキュアスコア (Secure Score)</span>
                  <span className="text-2xl font-black text-emerald-400">{secureScore}%</span>
                </div>
                <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${secureScore}%` }} />
                </div>
              </div>
            </div>

            {/* Recommendations Action List */}
            <div className="mt-4 space-y-2.5">
              {[
                { key: 'mfa', title: '特権管理者アカウントへの多要素認証 (MFA) の適用', points: 12, standard: 'ASB / CIS 1.1' },
                { key: 'jit', title: '管理ポート (3389/22) に対する Just-In-Time (JIT) VM アクセスの有効化', points: 10, standard: 'ASB / NIST 800-53' },
                { key: 'endpointProtection', title: '全サーバーへの Microsoft Defender for Servers (MDE) 統合展開', points: 8, standard: 'ASB / PCI-DSS' },
                { key: 'sqlEncryption', title: 'Azure SQL Database での Transparent Data Encryption (TDE) 有効化', points: 6, standard: 'CIS 4.1' },
              ].map(rec => {
                const isRemediated = remediatedRecommendations[rec.key];
                return (
                  <div
                    key={rec.key}
                    className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{rec.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                          {rec.standard}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">改善時付与スコア: +{rec.points}%</span>
                    </div>

                    <button
                      onClick={() => handleRemediateRecommendation(rec.key, rec.points)}
                      disabled={isRemediated}
                      className={`px-3 py-1.5 rounded font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 ${
                        isRemediated
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                      }`}
                    >
                      {isRemediated ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Play className="w-3 h-3" />}
                      <span>{isRemediated ? '修復済み (Remediated)' : 'ワンクリック修復実行'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Just-In-Time (JIT) VM Access Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-400" />
                  <span>Just-In-Time (JIT) 仮想マシンアクセス (RDP 3389 / SSH 22 一時開放)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  普段はNSGでポート3389/22を全閉鎖し、承認された管理者のIP限定で指定時間 (最大3時間) だけ自動開放するゼロトラスト防御です。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRequestJitAccess}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>JIT アクセス要求 (3時間承認)</span>
                </button>
              </div>
            </div>

            {/* JIT State Cards */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">対象仮想マシン / プロトコル:</span>
                <div className="font-mono font-bold text-white text-sm">{jitRequest.vmName}</div>
                <div className="text-sky-300 font-mono mt-0.5">{jitRequest.protocol} (Port {jitRequest.port})</div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">要求元IP / 許可スコープ:</span>
                <div className="font-mono text-white text-xs">{jitRequest.sourceIp}</div>
                <div className="text-[11px] text-emerald-400 mt-0.5">※管理者の送信元IPのみをNSGで許可</div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">NSG 開放ステータス:</span>
                {jitActive ? (
                  <div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      🔓 一時開放中 ({jitTimeLeft} 分残り)
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">期限切れ時にNSGルールが自動削除されます。</div>
                  </div>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold">
                    🔒 全閉鎖 (DenyAll - 安全)
                  </span>
                )}
              </div>
            </div>

            {/* NSG Rule Preview */}
            <div className="mt-3 p-3 rounded bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
              <div className="text-[11px] text-slate-400 mb-1">動的NSGインバウンド規則のプレビュー:</div>
              {jitActive ? (
                <div className="text-emerald-300">
                  Priority: 100 | Name: <span className="text-white">JIT-Allow-RDP-3389</span> | Source: <span className="text-white">203.0.113.50</span> | Port: 3389 | Action: <span className="font-bold text-emerald-400">Allow</span> (有効期限あり)
                </div>
              ) : (
                <div className="text-red-300">
                  Priority: 65000 | Name: <span className="text-white">DenyAllInBound</span> | Source: <span className="text-white">*</span> | Port: * | Action: <span className="font-bold text-red-400">Deny</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Microsoft Sentinel SIEM/SOAR & MITRE ATT&CK */}
      {activeTab === 'sentinel-soc' && (
        <div className="space-y-6">
          {/* Quick Concept Explanations Strip for Tab 4 */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
              <span className="font-bold text-purple-300 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span>【このタブで登場する重要用語】どういう機能でどういう意味なのか？ (クリックで詳細解説)</span>
              </span>
              <button
                onClick={() => {
                  setActiveTab('knowledge-base');
                  setDeepDiveCategory('sentinel-soc-hunting');
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 shrink-0"
              >
                <span>全52用語の解説百科を見る</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'cyber-kill-chain',
                'mitre-attack-framework',
                'pre-attack',
                'microsoft-sentinel-core',
                'data-connectors-understanding',
                'aad-identity-protection',
                'cef-syslog',
                'sentinel-workbooks',
                'sentinel-incidents',
                'analytics-rules-all',
                'threat-detection-rules',
                'nrt-queries',
                'fusion-ml-correlation',
                'ml-behavioral-analytics-ueba',
                'anomaly-detection',
                'sentinel-playbooks-logic-apps',
                'automation-rules',
                'threat-hunting',
                'hunting-bookmarks',
              ].map(id => {
                const item = MONITOR_SENTINEL_DEEP_DIVE_ITEMS.find(i => i.id === id);
                if (!item) return null;
                return (
                  <button
                    key={id}
                    onClick={() => setModalItem(item)}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Info className="w-3 h-3 text-purple-400 shrink-0" />
                    <span>{item.termJa}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MITRE ATT&CK 14 Tactics Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              <span>MITRE ATT&CK エンタープライズ 14 戦術 & Sentinel 分析ルール種別マッピング</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              攻撃のフェーズ (サイバーキルチェーン) に応じて、Sentinelの「スケジュール済みKQLルール」「NRT (準リアルタイム)」「Fusion (ML相関)」「異常検出」が自動連携します。
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {MITRE_ATTACK_TACTICS.map(tactic => {
                const isSelected = selectedMitreTacticId === tactic.id;
                return (
                  <div
                    key={tactic.id}
                    onClick={() => setSelectedMitreTacticId(tactic.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all text-xs ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-400 shadow ring-1 ring-purple-400 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-purple-300 block mb-0.5">{tactic.tacticNumber}</span>
                    <span className="font-bold block truncate">{tactic.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{tactic.nameJa}</span>
                  </div>
                );
              })}
            </div>

            {/* Selected Tactic Inspector */}
            <div className="mt-4 p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-white text-sm">
                  {selectedMitreTactic.nameJa} ({selectedMitreTactic.tacticNumber})
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                  推奨分析ルール: {selectedMitreTactic.sentinelAnalyticsType}
                </span>
              </div>
              <p className="text-slate-300 mb-2 leading-relaxed">{selectedMitreTactic.description}</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-slate-400 font-bold mr-1">代表的手法 (Techniques):</span>
                {selectedMitreTactic.techniques.map((tech, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-300 font-mono text-[11px]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sentinel Incidents & Investigation Graph & Playbook SOAR */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-sky-400" />
                  <span>Sentinel インシデント調査 & SOAR プレイブック自動封じ込め</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  データコネクタ (CEF/Entra/Defender) から集約されたインシデントを選択し、調査グラフの相関確認とLogic Appsプレイブックによる即時自動遮断を検証します。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunPlaybook(selectedIncident.automatedPlaybook)}
                  disabled={isPlaybookExecuting || incidentResolvedState}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>プレイブック自動実行 (封じ込め)</span>
                </button>
              </div>
            </div>

            {/* Incidents Selection */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              {SENTINEL_INCIDENTS_PRESET.map(inc => {
                const isSelected = selectedIncidentId === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncidentId(inc.id);
                      setIncidentResolvedState(false);
                      setPlaybookExecutionLogs([]);
                    }}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-950/60 border-sky-400 shadow ring-1 ring-sky-400'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-white">{inc.id}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        inc.severity === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-2 mb-2">{inc.title}</h4>
                    <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                      <div>ソース: <span className="text-sky-300">{inc.source}</span></div>
                      <div>戦術: <span className="text-purple-300">{inc.tactics.join(', ')}</span></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Incident Details & Entity Graph */}
            <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm">
                  【インシデント詳細】{selectedIncident.title}
                </span>
                <span className={`px-2 py-0.5 rounded font-bold ${
                  incidentResolvedState ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  ステータス: {incidentResolvedState ? '解決済み (Closed)' : selectedIncident.status}
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed mb-3">{selectedIncident.description}</p>

              {/* Entity Mapping */}
              <div className="p-3 rounded bg-slate-900 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  抽出された調査エンティティ (Investigation Graph):
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedIncident.entities.map((ent, idx) => (
                    <div key={idx} className="px-2.5 py-1 rounded bg-black/60 border border-slate-700 text-xs font-mono">
                      <span className="text-slate-400">{ent.type}: </span>
                      <span className="text-sky-300 font-bold">{ent.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Playbook SOAR Logs Output */}
              {playbookExecutionLogs.length > 0 && (
                <div className="mt-3 p-3.5 rounded bg-black/80 border border-sky-800/60 font-mono text-xs text-sky-300 space-y-1.5 animate-fadeIn">
                  {playbookExecutionLogs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Deep Dive Knowledge Base (All 52 Concepts: What it is & What it means) */}
      {activeTab === 'knowledge-base' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    完全百科辞典 & 比較ナビ
                  </span>
                  <span className="text-xs text-slate-400">全52概念の機能と実務・セキュリティ上の意味</span>
                </div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  <span>「どういう機能でどういう意味なのか？」徹底深掘り解説</span>
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                  各技術について「<span className="text-sky-400 font-semibold">どういう機能なのか（仕組み・何をするのか）</span>」と「<span className="text-purple-400 font-semibold">どういう意味なのか（なぜ必要か・実務やセキュリティ上の意義）</span>」を対比で完全整理。
                  さらに「使わないとどうなるか」「実務での現場シナリオ」「試験の急所」をワンストップで確認できます。
                </p>
              </div>

              {/* Search Box */}
              <div className="relative min-w-[280px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={deepDiveSearchTerm}
                  onChange={(e) => setDeepDiveSearchTerm(e.target.value)}
                  placeholder="用語や機能名で検索 (例: AMA, JIT, KQL, Fusion)..."
                  className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
                {deepDiveSearchTerm && (
                  <button
                    onClick={() => setDeepDiveSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="mt-4 flex flex-wrap gap-2 items-center text-xs">
              <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
                <Filter className="w-3.5 h-3.5" /> カテゴリ絞り込み:
              </span>
              {[
                { id: 'all', label: 'すべて表示', count: MONITOR_SENTINEL_DEEP_DIVE_ITEMS.length },
                { id: 'monitor-telemetry', label: 'Azure Monitor 基盤 & テレメトリ', count: MONITOR_SENTINEL_DEEP_DIVE_ITEMS.filter(i => i.category === 'monitor-telemetry').length },
                { id: 'agents-and-logs', label: 'エージェント & ログ種別 & 診断設定', count: MONITOR_SENTINEL_DEEP_DIVE_ITEMS.filter(i => i.category === 'agents-and-logs').length },
                { id: 'alerts-action-groups', label: 'アラート & アクショングループ & 通知', count: MONITOR_SENTINEL_DEEP_DIVE_ITEMS.filter(i => i.category === 'alerts-action-groups').length },
                { id: 'defender-posture', label: 'Defender & CSPM & JIT & 規制', count: MONITOR_SENTINEL_DEEP_DIVE_ITEMS.filter(i => i.category === 'defender-posture').length },
                { id: 'sentinel-soc-hunting', label: 'Sentinel SIEM/SOAR & 分析ルール & ハンティング', count: MONITOR_SENTINEL_DEEP_DIVE_ITEMS.filter(i => i.category === 'sentinel-soc-hunting').length },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setDeepDiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                    deepDiveCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    deepDiveCategory === cat.id ? 'bg-black/30 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Concepts Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredDeepDiveItems.map(item => {
              return (
                <div
                  key={item.id}
                  id={item.id}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow transition-all space-y-4"
                >
                  {/* Item Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-sky-400 font-bold">{item.term}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300 font-mono">
                          {item.badge}
                        </span>
                        <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded">
                          {item.categoryJa}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <span>{item.termJa}</span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.relatedSimulatorTab && (
                        <button
                          onClick={() => {
                            setActiveTab(item.relatedSimulatorTab!);
                            window.scrollTo({ top: 200, behavior: 'smooth' });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>シミュレーターで試す</span>
                        </button>
                      )}
                      <button
                        onClick={() => setModalItem(item)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="ポップアップで集中閲覧"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Core Dual Explanation: What it is VS What it means */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Blue: どういう機能なのか */}
                    <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 space-y-2">
                      <div className="flex items-center gap-2 text-sky-300 font-bold text-xs uppercase tracking-wide">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs">①</span>
                        <span>どういう機能なのか？ (仕組み・動作)</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {item.whatItIs}
                      </p>
                    </div>

                    {/* Purple: どういう意味なのか */}
                    <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-2">
                      <div className="flex items-center gap-2 text-purple-300 font-bold text-xs uppercase tracking-wide">
                        <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">②</span>
                        <span>どういう意味なのか？ (実務・セキュリティ上の意義・なぜ必要か)</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {item.whatItMeans}
                      </p>
                    </div>
                  </div>

                  {/* Secondary Details: Risk without it, Real-world scenario, Exam tip */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                      <strong className="text-red-400 block mb-1 flex items-center gap-1 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>使わないとどうなるか (リスク):</span>
                      </strong>
                      <p className="text-slate-300 leading-relaxed">{item.riskWithoutIt}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                      <strong className="text-emerald-400 block mb-1 flex items-center gap-1 font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>実務での現場シナリオ:</span>
                      </strong>
                      <p className="text-slate-300 leading-relaxed">{item.practicalScenario}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
                      <strong className="text-amber-400 block mb-1 flex items-center gap-1 font-bold">
                        <Target className="w-3.5 h-3.5" />
                        <span>試験・運用の急所:</span>
                      </strong>
                      <p className="text-slate-300 leading-relaxed">{item.examKeyPoint}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDeepDiveItems.length === 0 && (
              <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">
                <p className="text-base font-bold text-white mb-1">一致する用語が見つかりませんでした</p>
                <p className="text-xs">別のキーワードで検索するか、カテゴリ絞り込みを「すべて表示」に戻してください。</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Global Concept Deep Dive Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-sky-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-sky-400 font-bold">{modalItem.term}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-indigo-500/20 text-indigo-300">
                    {modalItem.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-black/40 px-2 py-0.5 rounded">
                    {modalItem.categoryJa}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{modalItem.termJa}</h3>
              </div>
              <button
                onClick={() => setModalItem(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* What it is vs What it means */}
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/40 space-y-1.5">
                <div className="text-sky-300 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-[10px]">1</span>
                  <span>どういう機能なのか？ (仕組み・動作)</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{modalItem.whatItIs}</p>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/40 space-y-1.5">
                <div className="text-purple-300 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px]">2</span>
                  <span>どういう意味なのか？ (実務・セキュリティ上の意義・なぜ必要か)</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">{modalItem.whatItMeans}</p>
              </div>
            </div>

            {/* Extra details */}
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/30">
                <strong className="text-red-400 block mb-0.5">⚠️ 使わないとどうなるか (リスク):</strong>
                <p className="text-slate-300 leading-relaxed">{modalItem.riskWithoutIt}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <strong className="text-emerald-400 block mb-0.5">💼 現場での具体例:</strong>
                <p className="text-slate-300 leading-relaxed">{modalItem.practicalScenario}</p>
              </div>

              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30">
                <strong className="text-amber-400 block mb-0.5">🎯 試験・運用の急所:</strong>
                <p className="text-slate-300 leading-relaxed">{modalItem.examKeyPoint}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {modalItem.relatedSimulatorTab ? (
                <button
                  onClick={() => {
                    setActiveTab(modalItem.relatedSimulatorTab!);
                    setModalItem(null);
                    window.scrollTo({ top: 200, behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>この機能をシミュレーターで試す</span>
                </button>
              ) : <div />}

              <button
                onClick={() => setModalItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
