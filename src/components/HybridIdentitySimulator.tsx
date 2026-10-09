import React, { useState } from 'react';
import { HYBRID_AUTH_METHODS, SYNC_RULES_PRESETS } from '../data/hybridData';
import { HybridAuthMethod, SyncRuleItem } from '../types/hybrid';
import { 
  Network, 
  Server, 
  Cloud, 
  Lock, 
  Key, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Laptop, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  Globe
} from 'lucide-react';

interface HybridIdentitySimulatorProps {
  onNavigateToQuiz?: (topic: string) => void;
}

export const HybridIdentitySimulator: React.FC<HybridIdentitySimulatorProps> = ({ onNavigateToQuiz }) => {
  const [activeSubTab, setActiveSubTab] = useState<'auth-methods' | 'aadc-sync' | 'writeback' | 'ca-session'>('auth-methods');

  // Hybrid Auth Simulation State
  const [selectedMethodId, setSelectedMethodId] = useState<HybridAuthMethod>('phs');
  const [isOnPremOffline, setIsOnPremOffline] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<number>(0);
  const [isSimulatingAuth, setIsSimulatingAuth] = useState<boolean>(false);
  const [authSimulationResult, setAuthSimulationResult] = useState<string | null>(null);

  // Sync Rules Editor State
  const [rules, setRules] = useState<SyncRuleItem[]>(SYNC_RULES_PRESETS);
  const [testUpnInput, setTestUpnInput] = useState<string>('tanaka@corp.contoso.local');
  const [testMailInput, setTestMailInput] = useState<string>('t.tanaka@contoso.com');

  // Password Writeback State
  const [newSsprPassword, setNewSsprPassword] = useState<string>('P@ssw0rd2026!Sec');
  const [writebackStep, setWritebackStep] = useState<number>(0);
  const [isWritebackRunning, setIsWritebackRunning] = useState<boolean>(false);

  // Conditional Access Session Control State
  const [caPlatform, setCaPlatform] = useState<'windows' | 'ios' | 'android'>('windows');
  const [caClientApp, setCaClientApp] = useState<'browser' | 'modern' | 'legacy'>('browser');
  const [persistentBrowser, setPersistentBrowser] = useState<'never' | 'always' | 'default'>('never');
  const [sessionEvaluationResult, setSessionEvaluationResult] = useState<string | null>(null);

  const currentAuthMethod = HYBRID_AUTH_METHODS.find((m) => m.id === selectedMethodId) || HYBRID_AUTH_METHODS[0];

  // Run Auth Flow Simulation
  const handleStartAuthFlow = () => {
    setIsSimulatingAuth(true);
    setAuthStep(1);
    setAuthSimulationResult(null);

    setTimeout(() => {
      setAuthStep(2);
      setTimeout(() => {
        setAuthStep(3);
        setTimeout(() => {
          setAuthStep(4);
          setIsSimulatingAuth(false);

          if (isOnPremOffline) {
            if (selectedMethodId === 'phs') {
              setAuthSimulationResult('【認証成功】オンプレミスADが停止中ですが、クラウドに同期済みのパスワードハッシュ(PHS)が存在するため、Office 365 / Azureへのサインインが継続できました！(高可用性)');
            } else {
              setAuthSimulationResult(`【認証失敗 (503 Service Unavailable)】オンプレミスのDC / エージェントに到達できないため、${currentAuthMethod.nameJa} ではサインインできません！`);
            }
          } else {
            setAuthSimulationResult(`【認証成功】${currentAuthMethod.nameJa} により、ユーザーの資格情報が正常に検証されました。`);
          }
        }, 800);
      }, 800);
    }, 800);
  };

  // Run Password Writeback Flow
  const handleRunWriteback = () => {
    setIsWritebackRunning(true);
    setWritebackStep(1);

    setTimeout(() => {
      setWritebackStep(2);
      setTimeout(() => {
        setWritebackStep(3);
        setTimeout(() => {
          setWritebackStep(4);
          setIsWritebackRunning(false);
        }, 900);
      }, 900);
    }, 900);
  };

  // Evaluate CA Session control
  const handleEvaluateSession = () => {
    if (caClientApp === 'legacy') {
      setSessionEvaluationResult('【アクセスブロック】レガシー認証 (POP/IMAP/SMTP) は多要素認証やセッション制御に対応していないため、ゼロトラストポリシーに基づき即座に遮断されました。');
      return;
    }

    if (persistentBrowser === 'never') {
      setSessionEvaluationResult('【セッション制御適用】永続的なブラウザーセッションが「永続化しない (Never Persistent)」に構成されています。ユーザーがブラウザウィンドウを閉じた瞬間にセッションCookieが破棄され、次回起動時に再認証が強制されます (キオスク/共有PC保護)。');
    } else {
      setSessionEvaluationResult('【セッション制御適用】「常に永続化 (Always Persistent)」に構成されています。ブラウザを再起動してもセッションCookieが維持され、サインイン頻度(Sign-in Frequency)の期限まで再認証なしで作業を継続できます。');
    }
  };

  // Evaluate Custom Precedence in Sync Rules Editor
  const activeCustomRule = rules.find((r) => r.id === 'rule-custom-mail-as-upn');
  const evaluatedCloudUpn = activeCustomRule && activeCustomRule.precedence < 100 ? testMailInput : testUpnInput;

  const triggerMission = (mission: 'phs-disaster' | 'pta-disaster' | 'sspr' | 'sync-rule' | 'never-persist') => {
    if (mission === 'phs-disaster') {
      setActiveSubTab('auth-methods');
      setSelectedMethodId('phs');
      setIsOnPremOffline(true);
      setTimeout(() => handleStartAuthFlow(), 100);
    } else if (mission === 'pta-disaster') {
      setActiveSubTab('auth-methods');
      setSelectedMethodId('pta');
      setIsOnPremOffline(true);
      setTimeout(() => handleStartAuthFlow(), 100);
    } else if (mission === 'sspr') {
      setActiveSubTab('writeback');
      setTimeout(() => handleRunWriteback(), 100);
    } else if (mission === 'sync-rule') {
      setActiveSubTab('aadc-sync');
    } else if (mission === 'never-persist') {
      setActiveSubTab('ca-session');
      setPersistentBrowser('never');
      setCaClientApp('browser');
      setTimeout(() => handleEvaluateSession(), 100);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>Microsoft Hybrid Identity</span>
              <span>·</span>
              <span>オンプレミスAD & Microsoft Entra Connect</span>
              <span>·</span>
              <span>PHS vs PTA vs AD FS & SSPR Writeback & CA Sessions</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              ハイブリッドID & 認証連携・同期ルール動作検証スタジオ
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              オンプレミスActive DirectoryとEntra IDを接続する「パスワードハッシュ同期(PHS)」「パススルー認証(PTA)」「AD FS」、同期ルールエディターの優先度(Precedence)、パスワードライトバック、および永続ブラウザーセッション制御の動作を検証します。
            </p>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>【迷ったらここを押すだけ！】ハイブリッドIDの最頻出シナリオを1クリックで体験:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => triggerMission('phs-disaster')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">オンプレ全停止 ➔ PHSでログイン</div>
                <div className="text-[10px] text-emerald-400 font-medium">結果: クラウド単体で成功 (BCP最強)</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('pta-disaster')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">オンプレ全停止 ➔ PTAだとどうなる？</div>
                <div className="text-[10px] text-rose-400 font-medium">結果: エージェント不通で完全失敗</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('sspr')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">SSPR パスワード書き戻しテスト</div>
                <div className="text-[10px] text-sky-400 font-medium">結果: 443送信のみでオンプレ同期</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('never-persist')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">共有端末: 永続化しないセッション</div>
                <div className="text-[10px] text-amber-400 font-medium">結果: ブラウザ終了で即ログアウト</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveSubTab('auth-methods')}
          className={`py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeSubTab === 'auth-methods'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>1. 認証方式 (PHS/PTA/ADFS)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('aadc-sync')}
          className={`py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeSubTab === 'aadc-sync'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>2. 同期ルール (Precedence)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('writeback')}
          className={`py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeSubTab === 'writeback'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>3. SSPR パスワードライトバック</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ca-session')}
          className={`py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeSubTab === 'ca-session'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>4. 永続セッション & リスク</span>
        </button>
      </div>

      {/* SUB-TAB 1: Hybrid Authentication Methods */}
      {activeSubTab === 'auth-methods' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {HYBRID_AUTH_METHODS.map((m) => {
              const isSelected = selectedMethodId === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMethodId(m.id);
                    setAuthStep(0);
                    setAuthSimulationResult(null);
                  }}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500/40 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{m.nameJa}</span>
                    {isSelected && <span className="text-[10px] text-sky-400 font-mono font-bold">SELECTED</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mb-2">{m.name}</div>
                  <div className="space-y-1 text-[11px] text-slate-300">
                    <div><strong>インフラ要件:</strong> {m.infrastructureRequirement}</div>
                    <div><strong>オフライン継続:</strong> {m.offlineCloudLogin ? '○ 可能 (高耐障害)' : '✕ 不可 (オンプレ依存)'}</div>
                    <div><strong>漏洩資格情報検知:</strong> {m.supportsLeakedCredentials ? '○ 対応 (PHS必須)' : '✕ 未対応'}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Flow Architecture */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Network className="w-4 h-4 text-sky-400" />
                  <span>{currentAuthMethod.nameJa} の認証パケット通信フロー</span>
                </h3>
                <span className="text-xs text-slate-400 mt-0.5">
                  シームレスSSO (Kerberos) との組み合わせも可能
                </span>
              </div>

              {/* On-prem offline simulator toggle */}
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-xs text-slate-400">オンプレミス回線障害テスト:</span>
                <button
                  onClick={() => setIsOnPremOffline(!isOnPremOffline)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                    isOnPremOffline
                      ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {isOnPremOffline ? '⚠ オンプレミス全停止中' : '● オンプレミス正常稼働'}
                </button>
              </div>
            </div>

            {/* Architecture Node Diagram */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              {/* Node 1: Client */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <Laptop className="w-8 h-8 text-sky-400 mx-auto" />
                <div className="font-bold text-white text-xs">ユーザー端末 (Client PC)</div>
                <div className="text-[11px] text-slate-400">login.microsoftonline.com へアクセス</div>
              </div>

              {/* Node 2: Microsoft Entra ID (Cloud) */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <Cloud className="w-8 h-8 text-sky-400 mx-auto" />
                <div className="font-bold text-white text-xs">Microsoft Entra ID (クラウド)</div>
                <div className="text-[11px] text-slate-400">
                  {selectedMethodId === 'phs' ? 'ハッシュをクラウド内で直接検証' : 'キュー/リダイレクトを発行'}
                </div>
              </div>

              {/* Node 3: On-Premises AD */}
              <div className={`p-4 rounded-lg border space-y-2 transition-colors ${
                isOnPremOffline
                  ? 'bg-rose-950/20 border-rose-800/80 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}>
                <Server className={`w-8 h-8 mx-auto ${isOnPremOffline ? 'text-rose-500' : 'text-indigo-400'}`} />
                <div className="font-bold text-xs">
                  オンプレミス AD / {selectedMethodId === 'pta' ? 'PTAエージェント' : selectedMethodId === 'adfs' ? 'AD FSファーム' : 'AADC同期'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isOnPremOffline ? '回線断・障害発生中！' : '社内ドメインコントローラー稼働'}
                </div>
              </div>
            </div>

            {/* Step list & execution button */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">認証プロセスのステップ:</span>
                <button
                  onClick={handleStartAuthFlow}
                  disabled={isSimulatingAuth}
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold text-xs rounded transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>認証フローを実行テスト</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs">
                {currentAuthMethod.stepFlow.map((step, idx) => {
                  const stepNumber = idx + 1;
                  const isCurrent = authStep === stepNumber;
                  const isCompleted = authStep > stepNumber;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded border transition-all ${
                        isCurrent
                          ? 'bg-sky-950/40 border-sky-500 text-white shadow-sm'
                          : isCompleted
                          ? 'bg-slate-950 border-slate-800 text-slate-300'
                          : 'bg-slate-950/60 border-slate-900 text-slate-500'
                      }`}
                    >
                      {step}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Result Toast */}
            {authSimulationResult && (
              <div className={`p-4 rounded-lg border text-xs leading-relaxed ${
                authSimulationResult.includes('成功')
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-800 text-rose-200'
              }`}>
                {authSimulationResult}
              </div>
            )}

            {/* Exam Tip Card */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded text-xs text-slate-300 space-y-1">
              <div className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>試験対策の着眼点:</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentAuthMethod.examSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: AADC Synchronization Rules Editor */}
      {activeSubTab === 'aadc-sync' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <span>Synchronization Rules Editor (同期ルールエディター & 優先順位)</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              Enterprise Admins グループ権限でAADCを初期構成後、同期ルールで属性変換・競合解決を行います。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Rules list (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <span className="font-semibold text-slate-200">構成済み同期ルール一覧 (Precedence 昇順):</span>
              <div className="space-y-2">
                {rules.map((r) => (
                  <div key={r.id} className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{r.name}</span>
                      <span className="font-mono text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                        Precedence: {r.precedence}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-3">
                      <span>方向: <strong>{r.direction}</strong></span>
                      <span>·</span>
                      <span>ソース: <code className="text-slate-300">{r.sourceAttribute}</code> ➔ ターゲット: <code className="text-emerald-400">{r.targetAttribute}</code></span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                      {r.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Simulation on Attribute transformation (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-white">【実戦テスト】非ルーティングドメイン (.local) のUPN上書き</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  オンプレミスADのUPNが「.local」でクラウドで検証できない場合、メールアドレス(mail)をクラウドUPNとして採用するカスタム規則(Precedence: 50)の適用結果を検証します。
                </p>

                <div>
                  <label className="text-slate-400 block mb-1">オンプレミス UPN (userPrincipalName):</label>
                  <input
                    type="text"
                    value={testUpnInput}
                    onChange={(e) => setTestUpnInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">オンプレミス Mail (mail):</label>
                  <input
                    type="text"
                    value={testMailInput}
                    onChange={(e) => setTestMailInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[11px]">クラウド側 (Entra ID) に生成される UPN:</span>
                  <div className="font-mono text-emerald-400 font-bold text-sm bg-slate-900 p-2.5 rounded border border-emerald-900/60 mt-1">
                    {evaluatedCloudUpn}
                  </div>
                </div>
              </div>

              {/* Enterprise Admins Note */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  <span>Enterprise Admins グループの必要性</span>
                </span>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  AADCの初回ウィザードで「Enterprise Admins (エンタープライズ管理者)」権限が求められる理由は、フォレスト全体のActive Directory内に同期専用アカウント (MSOL_xxxx) を作成し、パスワード書き戻しなどのアクセス制御リスト(ACL)を一括構成するためです。セットアップ完了後はEnterprise Admins権限は不要です。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: SSPR Password Writeback */}
      {activeSubTab === 'writeback' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-sky-400" />
              <span>セルフサービスパスワードリセット (SSPR) + パスワードライトバック (Writeback)</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              クラウドで変更したパスワードが、Azure Service Busリレーを通じて即座にオンプレミスADへ同期されます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                <span className="font-bold text-white">SSPR クラウドパスワード変更シミュレーター</span>
                <p className="text-slate-400 text-[11px]">
                  ユーザーが Web (myaccount.microsoft.com) 上でMFAを突破し、新しいパスワードを入力します。
                </p>

                <div>
                  <label className="text-slate-400 block mb-1">新しいパスワード:</label>
                  <input
                    type="text"
                    value={newSsprPassword}
                    onChange={(e) => setNewSsprPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                  />
                </div>

                <button
                  onClick={handleRunWriteback}
                  disabled={isWritebackRunning}
                  className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-semibold rounded flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isWritebackRunning ? 'animate-spin' : ''}`} />
                  <span>パスワードをリセットしてオンプレミスへ書き戻す</span>
                </button>
              </div>
            </div>

            {/* Writeback Steps Pipeline */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3">
              <span className="font-bold text-slate-200">リアルタイム同期パイプライン:</span>

              <div className="space-y-2">
                {[
                  '1. ユーザーがクラウド上でMFA認証をクリアし、パスワード変更を要求',
                  '2. Entra IDのPassword Writebackサービスが暗号化キーでハッシュ化し、Service Busリレーに送信',
                  '3. 社内AADCサーバーが「アウトバウンド 443 (HTTPS)」でメッセージを取得 (インバウンドポート開放不要！)',
                  '4. AADCが社内ドメインコントローラーに対してSetPassword APIを呼び出し、オンプレミスADを即時更新！',
                ].map((st, i) => {
                  const num = i + 1;
                  const isDone = writebackStep >= num;
                  const isCurrent = writebackStep === num;
                  return (
                    <div
                      key={i}
                      className={`p-2.5 rounded border text-[11px] transition-colors flex items-center gap-2 ${
                        isCurrent
                          ? 'bg-sky-950/40 border-sky-500 text-white'
                          : isDone
                          ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[9px] shrink-0">{num}</span>
                      )}
                      <span>{st}</span>
                    </div>
                  );
                })}
              </div>

              {writebackStep === 4 && (
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded text-emerald-200 text-xs">
                  ✓ パスワードライトバック完了: オンプレミスADとクラウドのパスワードが1秒未満で同期されました！
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Conditional Access Session Controls */}
      {activeTabSessionControls(
        caPlatform,
        setCaPlatform,
        caClientApp,
        setCaClientApp,
        persistentBrowser,
        setPersistentBrowser,
        sessionEvaluationResult,
        handleEvaluateSession
      )}
    </div>
  );
};

function activeTabSessionControls(
  caPlatform: 'windows' | 'ios' | 'android',
  setCaPlatform: (v: 'windows' | 'ios' | 'android') => void,
  caClientApp: 'browser' | 'modern' | 'legacy',
  setCaClientApp: (v: 'browser' | 'modern' | 'legacy') => void,
  persistentBrowser: 'never' | 'always' | 'default',
  setPersistentBrowser: (v: 'never' | 'always' | 'default') => void,
  sessionEvaluationResult: string | null,
  handleEvaluateSession: () => void
) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
      <div className="pb-3 border-b border-slate-800">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5 text-sky-400" />
          <span>条件付きアクセス: 永続的なブラウザーセッション & レガシー認証遮断</span>
        </h3>
        <p className="text-slate-400 mt-0.5">
          デバイスプラットフォーム、クライアントアプリ、セッション制御（永続化しない）を組み合わせたゼロトラスト設計。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">デバイスプラットフォーム (Device Platforms):</label>
            <div className="grid grid-cols-3 gap-2">
              {(['windows', 'ios', 'android'] as const).map((plat) => (
                <button
                  key={plat}
                  onClick={() => setCaPlatform(plat)}
                  className={`p-2 rounded border uppercase font-mono ${
                    caPlatform === plat ? 'bg-sky-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {plat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">クライアントアプリ (Client Apps):</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'browser', label: 'ブラウザー' },
                { id: 'modern', label: 'モダンアプリ' },
                { id: 'legacy', label: 'レガシー認証 (POP/IMAP)' },
              ].map((app) => (
                <button
                  key={app.id}
                  onClick={() => setCaClientApp(app.id as any)}
                  className={`p-2 rounded border text-[11px] ${
                    caClientApp === app.id ? 'bg-sky-600 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {app.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">
              セッション制御: 永続的なブラウザーセッション (Persistent Browser Session):
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPersistentBrowser('never')}
                className={`p-2.5 rounded border text-left ${
                  persistentBrowser === 'never'
                    ? 'bg-amber-950/50 border-amber-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold">永続化しない (Never Persistent)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">ブラウザを閉じるとセッション終了 (共有端末向け)</div>
              </button>

              <button
                onClick={() => setPersistentBrowser('always')}
                className={`p-2.5 rounded border text-left ${
                  persistentBrowser === 'always'
                    ? 'bg-sky-950/50 border-sky-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="font-bold">常に永続化 (Always Persistent)</div>
                <div className="text-[10px] text-slate-400 mt-0.5">再起動後もログイン維持 (会社支給PC向け)</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleEvaluateSession}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded"
          >
            セッションポリシーを評価する
          </button>
        </div>

        {/* Evaluation Output */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-4">
          <span className="font-bold text-white">ポリシー評価 & ゼロトラスト解説:</span>

          {sessionEvaluationResult ? (
            <div className="p-4 bg-slate-900 border border-slate-700 rounded text-slate-200 text-xs leading-relaxed">
              {sessionEvaluationResult}
            </div>
          ) : (
            <p className="text-slate-500 text-[11px]">
              左側の条件を選択し、「セッションポリシーを評価する」をクリックしてください。
            </p>
          )}

          <div className="pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400">
            <div className="font-semibold text-slate-300">【試験頻出ポイント】</div>
            <div>・レガシー認証 (POP/IMAP/SMTP) は基本認証(Basic Auth)を使用するため、条件付きアクセスでブロックするのがセキュリティの鉄則。</div>
            <div>・共有PC環境では「永続的なブラウザーセッション: 永続化しない」を構成し、離席時や終了時のセッション乗っ取りを防止する。</div>
          </div>
        </div>
      </div>
    </div>
  );
}
