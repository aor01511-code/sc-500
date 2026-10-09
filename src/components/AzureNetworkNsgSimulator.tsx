import React, { useState } from 'react';
import { NSG_RULES_PRESET } from '../data/azureSecData';
import { NsgRule } from '../types/azureSec';
import { 
  Network, 
  ShieldCheck, 
  ShieldAlert, 
  Server, 
  ArrowRight, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Laptop, 
  Lock, 
  Globe, 
  Layers,
  Sliders,
  Send,
  Info,
  ExternalLink,
  Cpu,
  ArrowDown
} from 'lucide-react';

interface AzureNetworkNsgSimulatorProps {
  onNavigateToQuiz?: (topic: string) => void;
}

export const AzureNetworkNsgSimulator: React.FC<AzureNetworkNsgSimulatorProps> = ({ onNavigateToQuiz }) => {
  const [activeTab, setActiveTab] = useState<'nsg-evaluator' | 'nsg-order' | 'vnet-peering' | 'privatelink-vs-se'>('nsg-evaluator');

  // NSG Rules State
  const [rules, setRules] = useState<NsgRule[]>(NSG_RULES_PRESET);

  // Packet Input State
  const [packetSource, setPacketSource] = useState<'Internet' | 'VirtualNetwork' | '10.0.1.0/24' | 'AzureLoadBalancer' | 'ASG-WebServers'>('Internet');
  const [packetPort, setPacketPort] = useState<number>(3389);
  const [packetProtocol, setPacketProtocol] = useState<'TCP' | 'UDP' | 'Any'>('TCP');

  // Subnet NSG vs NIC NSG Evaluation Pipeline State
  const [subnetNsgPass, setSubnetNsgPass] = useState<boolean>(true);
  const [nicNsgPass, setNicNsgPass] = useState<boolean>(true);

  // Packet Evaluation Result State
  const [evalResult, setEvalResult] = useState<{
    matchedRule: NsgRule;
    access: 'Allow' | 'Deny';
    reason: string;
    evaluatedRulesCount: number;
    stepDetail: string;
  } | null>(null);

  // Private Link vs Service Endpoint State
  const [selectedEndpointType, setSelectedEndpointType] = useState<'private-link' | 'service-endpoint'>('private-link');

  // Evaluate Packet against NSG
  const evaluatePacket = (source: string, port: number) => {
    // Sort rules by priority asc (100 -> 65500)
    const sorted = [...rules].sort((a, b) => a.priority - b.priority);

    let match: NsgRule | null = null;
    let count = 0;

    for (const rule of sorted) {
      count++;
      // Check Source match
      const sourceMatches =
        rule.sourceAddressPrefix === '*' ||
        rule.sourceAddressPrefix === 'Any' ||
        rule.sourceAddressPrefix === source ||
        (rule.sourceAddressPrefix === 'Internet' && source === 'Internet') ||
        (rule.sourceAddressPrefix === 'VirtualNetwork' && source === 'VirtualNetwork') ||
        (rule.sourceAddressPrefix === 'AzureLoadBalancer' && source === 'AzureLoadBalancer') ||
        (rule.sourceAddressPrefix === '10.0.1.0/24' && source === '10.0.1.0/24') ||
        (rule.sourceAddressPrefix === 'ASG-WebServers' && source === 'ASG-WebServers');

      // Check Dest Port
      const portMatches =
        rule.destinationPortRange === '*' ||
        rule.destinationPortRange === port.toString();

      if (sourceMatches && portMatches) {
        match = rule;
        break;
      }
    }

    if (match) {
      setEvalResult({
        matchedRule: match,
        access: match.access,
        reason: `優先度【${match.priority}】のルール「${match.name}」に合致しました。(アクション: ${match.access})`,
        evaluatedRulesCount: count,
        stepDetail: match.access === 'Allow'
          ? 'ルール評価はここで即座に終了し、パケットの通過が許可されます。後続のルールは無視されます。'
          : 'ルール評価はここで即座に終了し、パケットは破棄(Drop)されます。',
      });
    }
  };

  // 1-Click Quick Demo Mission trigger
  const triggerMission = (mission: 'rdp-deny' | 'https-allow' | 'asg-db-allow' | 'vnet-default' | 'eval-order') => {
    if (mission === 'rdp-deny') {
      setActiveTab('nsg-evaluator');
      setPacketSource('Internet');
      setPacketPort(3389);
      setTimeout(() => evaluatePacket('Internet', 3389), 50);
    } else if (mission === 'https-allow') {
      setActiveTab('nsg-evaluator');
      setPacketSource('Internet');
      setPacketPort(443);
      setTimeout(() => evaluatePacket('Internet', 443), 50);
    } else if (mission === 'asg-db-allow') {
      setActiveTab('nsg-evaluator');
      setPacketSource('ASG-WebServers');
      setPacketPort(1433);
      setTimeout(() => evaluatePacket('ASG-WebServers', 1433), 50);
    } else if (mission === 'vnet-default') {
      setActiveTab('nsg-evaluator');
      setPacketSource('VirtualNetwork');
      setPacketPort(8080);
      setTimeout(() => evaluatePacket('VirtualNetwork', 8080), 50);
    } else if (mission === 'eval-order') {
      setActiveTab('nsg-order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>Azure ネットワークセキュリティ & 多層防御</span>
              <span>·</span>
              <span>SC-300 / SC-500 / AZ-500 対策</span>
              <span>·</span>
              <span>NSG & ASG & Subnet/NIC評価順序 & Private Link</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              NSG パケット判定エンジン & VNet / Private Link 検証
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              優先度(100〜65500)の評価順序、サービスプロバイダ・ASG(アプリケーションセキュリティグループ)によるグループ化、サブネットNSG vs NIC NSGの評価フロー、Private Linkとサービスエンドポイントの違いを検証します。
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
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">① ミッションを選択</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">② 「パケット判定を実行」をクリック</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">③ 合致ルール・優先度・評価順序の理由を確認</span>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>【1クリック体験ミッション】試したいネットワーク通信をクリックしてください:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <button
              onClick={() => triggerMission('rdp-deny')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Internet ➔ RDP(3389) 送信</div>
                <div className="text-[10px] text-rose-400 font-medium">優先度300で明示的遮断(Deny)</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('https-allow')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Internet ➔ HTTPS(443) 送信</div>
                <div className="text-[10px] text-emerald-400 font-medium">優先度100で通過許可(Allow)</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('asg-db-allow')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ASG Web ➔ ASG DB (1433)</div>
                <div className="text-[10px] text-sky-400 font-medium">ASG間トラフィックのみ許可</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('vnet-default')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-indigo-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-indigo-950 border border-indigo-700 text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">VNet内部通信 ➔ ポート8080</div>
                <div className="text-[10px] text-indigo-400 font-medium">既定65000 AllowVnetで許可</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('eval-order')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Subnet NSG vs NIC NSG</div>
                <div className="text-[10px] text-amber-400 font-medium">評価順序と2段階審査を体験</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Packet Evaluation Result Banner */}
      {evalResult && (
        <div className={`p-5 rounded-lg border shadow-lg space-y-2 animate-in fade-in duration-200 ${
          evalResult.access === 'Allow'
            ? 'bg-emerald-950/40 border-emerald-600/70 text-emerald-200'
            : 'bg-rose-950/40 border-rose-600/70 text-rose-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {evalResult.access === 'Allow' ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
              )}
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                  【パケット判定結果】
                </span>
                <h3 className="text-base font-bold text-white">
                  {evalResult.access === 'Allow' ? '✓ パケットの通過が許可されました (Allow)' : '✕ パケットが破棄・遮断されました (Deny)'}
                </h3>
              </div>
            </div>

            <span className="text-xs font-mono bg-slate-950/80 px-2.5 py-1 rounded border border-slate-800">
              合致ルール: <strong className="text-sky-300 font-bold">{evalResult.matchedRule.name} (優先度 {evalResult.matchedRule.priority})</strong>
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed pl-8">
            {evalResult.reason} — {evalResult.stepDetail}
          </p>

          <div className="p-3 bg-slate-900/90 rounded border border-amber-900/50 text-xs space-y-1 mt-2">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>NSG ルール評価の重要原則:</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              NSGは優先度 (100〜4096) の数字が小さい順に上から評価され、<strong>条件に合致した最初のルールで判定が確定（即座に終了）</strong>します。後続のルールは一切評価されません。どのカスタムルールにも合致しなかった場合は既定ルール (65000〜65500) で処理されます。
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('nsg-evaluator')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'nsg-evaluator'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>1. NSG ルールエンジン & パケット送信</span>
        </button>

        <button
          onClick={() => setActiveTab('nsg-order')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'nsg-order'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2. サブネットNSG vs NIC NSG 評価フロー</span>
        </button>

        <button
          onClick={() => setActiveTab('vnet-peering')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'vnet-peering'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>3. VNetピアリング & ExpressRoute</span>
        </button>

        <button
          onClick={() => setActiveTab('privatelink-vs-se')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'privatelink-vs-se'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>4. Private Link vs サービスエンドポイント</span>
        </button>
      </div>

      {/* TAB 1: NSG Evaluator */}
      {activeTab === 'nsg-evaluator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Packet Injection Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>テストパケットの送信設定</span>
                </h3>
                <span className="text-slate-500 font-mono text-[11px]">Inbound Packet</span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">送信元 (Source):</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'Internet' as const, label: 'Internet (公衆インターネット / サービスタグ)' },
                    { id: 'VirtualNetwork' as const, label: 'VirtualNetwork (同一VNet / サービスタグ)' },
                    { id: 'ASG-WebServers' as const, label: 'ASG-WebServers (アプリケーションセキュリティグループ)' },
                    { id: '10.0.1.0/24' as const, label: '10.0.1.0/24 (Azure Bastion管理サブネット / IP範囲)' },
                    { id: 'AzureLoadBalancer' as const, label: 'AzureLoadBalancer (Azureヘルスプローブ)' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setPacketSource(s.id)}
                      className={`w-full text-left p-2 rounded border transition-colors ${
                        packetSource === s.id
                          ? 'bg-sky-950/50 border-sky-500 text-white ring-1 ring-sky-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">宛先ポート (Destination Port):</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { port: 443, label: '443 (HTTPS Web)' },
                    { port: 3389, label: '3389 (RDP リモートデスクトップ)' },
                    { port: 22, label: '22 (SSH Linux管理)' },
                    { port: 1433, label: '1433 (SQL Database)' },
                    { port: 8080, label: '8080 (内部Webアプリ)' },
                  ].map((p) => (
                    <button
                      key={p.port}
                      onClick={() => setPacketPort(p.port)}
                      className={`p-2 rounded border font-mono text-left ${
                        packetPort === p.port
                          ? 'bg-sky-950/50 border-sky-500 text-white ring-1 ring-sky-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => evaluatePacket(packetSource, packetPort)}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded transition-colors flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5" />
                <span>NSG パケット判定を実行する</span>
              </button>
            </div>
          </div>

          {/* NSG Rules Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white">受信規則一覧 (優先度 昇順 100〜65500)</span>
                <span className="text-slate-400 text-[11px]">数字が小さい順に評価</span>
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {rules.map((r) => {
                  const isWinning = evalResult?.matchedRule.id === r.id;
                  return (
                    <div
                      key={r.id}
                      className={`p-2.5 rounded border transition-colors ${
                        isWinning
                          ? 'bg-sky-950/60 border-sky-400 ring-2 ring-sky-500/40 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800/80 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sky-400 w-12">{r.priority}</span>
                          <span className="font-bold truncate">{r.name}</span>
                          {isWinning && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500 text-white font-bold">
                              WINNING RULE
                            </span>
                          )}
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          r.access === 'Allow'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950/60 text-rose-300 border-rose-800'
                        }`}>
                          {r.access}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap gap-x-3 font-mono">
                        <span>送信元: {r.sourceAddressPrefix} ({r.sourceType})</span>
                        <span>宛先ポート: {r.destinationPortRange}</span>
                        <span>プロトコル: {r.protocol}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <strong>【既定規則の3原則】:</strong> 65000: 同一VNet許可 ➔ 65001: ロードバランサー許可 ➔ 65500: それ以外をすべて拒否 (DenyAll)。既定ルールは削除不可ですが、より小さい数字のカスタムルール(例: 300)で上書きできます。
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Subnet NSG vs NIC NSG Order */}
      {activeTab === 'nsg-order' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-sky-400" />
              <span>サブネット NSG vs NIC (ネットワークインターフェース) NSG の評価順序</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              VMにトラフィックが到達する際、およびVMから送信される際、NSGがリンクされている場所によって評価される順序が逆転します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Inbound Evaluation Pipeline */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-sky-300 text-sm">【受信トラフィック (Inbound) の評価順序】</span>
                <span className="text-[10px] text-slate-400 font-mono">外部 ➔ VM</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded border bg-slate-900 border-sky-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">第1ステップ: サブネット NSG</span>
                    <button
                      onClick={() => setSubnetNsgPass(!subnetNsgPass)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        subnetNsgPass ? 'bg-emerald-800 text-white' : 'bg-rose-800 text-white'
                      }`}
                    >
                      {subnetNsgPass ? 'Allow (通過)' : 'Deny (ここで破棄)'}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    サブネット単位で設定されたNSGが最初にパケットを検査します。
                  </div>
                </div>

                <div className="flex justify-center text-slate-500">
                  <ArrowDown className="w-5 h-5 animate-bounce" />
                </div>

                <div className="p-3 rounded border bg-slate-900 border-indigo-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">第2ステップ: NIC (ネットワークインターフェース) NSG</span>
                    <button
                      onClick={() => setNicNsgPass(!nicNsgPass)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        nicNsgPass ? 'bg-emerald-800 text-white' : 'bg-rose-800 text-white'
                      }`}
                    >
                      {nicNsgPass ? 'Allow (通過)' : 'Deny (ここで破棄)'}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    サブネットNSGを通過したパケットのみ、VMのNICに割り当てられたNSGで再検査されます。
                  </div>
                </div>

                <div className="flex justify-center text-slate-500">
                  <ArrowDown className="w-5 h-5" />
                </div>

                <div className={`p-3 rounded border text-center font-bold ${
                  subnetNsgPass && nicNsgPass
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500 text-rose-200'
                }`}>
                  {subnetNsgPass && nicNsgPass
                    ? '✓ VM (仮想マシン) にパケットが正常に到達！'
                    : '✕ パケットが途中で破棄され、VMには到達しません！'}
                </div>
              </div>
            </div>

            {/* Outbound & Exam Tips */}
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-indigo-300 text-sm">【送信トラフィック (Outbound) の評価順序】</span>
                <span className="text-[10px] text-slate-400 font-mono">VM ➔ 外部</span>
              </div>

              <div className="space-y-3 text-slate-300 text-[11px] leading-relaxed">
                <div className="p-3 bg-slate-900 rounded border border-slate-800">
                  <strong className="text-white block mb-1">送信時は順序が完全に逆転します:</strong>
                  <span>VM ➔ ① <strong>NIC NSG</strong> (第1審査) ➔ ② <strong>サブネット NSG</strong> (第2審査) ➔ 外部</span>
                </div>

                <div className="p-3 bg-amber-950/40 rounded border border-amber-800/60 text-amber-200 space-y-1">
                  <div className="font-bold">💡 試験の落とし穴 (超頻出):</div>
                  <p>
                    「サブネットNSGでポート443をAllowにしていても、NIC NSGでDenyされていれば通信は失敗する」「どちらか一方でもDenyされればトラフィックは遮断される」という2段階評価の原則が問われます。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: VNet Peering & ExpressRoute */}
      {activeTab === 'vnet-peering' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Network className="w-5 h-5 text-sky-400" />
              <span>VNet ピアリング & ExpressRoute (専用線接続)</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              Microsoftバックボーン経由で暗号化・超低遅延で通信する仮想ネットワーク間接続の要点。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <span className="font-bold text-white text-sm">VNet ピアリング (VNet Peering) の特徴</span>
              <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>非推移的ルーティング (Non-transitive):</strong> VNet AとVNet B、VNet BとVNet Cがピアリングしていても、AとCは直接通信できません(ハブを経由するUDR/NVAが必要)。</li>
                <li><strong>アドレス重複禁止:</strong> ピアリングするVNet同士のCIDR IPアドレス空間が重複しているとピアリングを作成できません。</li>
                <li><strong>ゲートウェイ転送 (Gateway Transit):</strong> スポークVNetはハブVNet内のVPN/ExpressRouteゲートウェイを共有利用可能。</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <span className="font-bold text-white text-sm">ExpressRoute & ExpressRoute Direct</span>
              <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>公衆インターネットを非経由:</strong> 通信キャリアの専用閉域網を通り、最高峰の信頼性と一定の帯域を保証。</li>
                <li><strong>ExpressRoute Direct:</strong> プロバイダを挟まず、顧客がMicrosoftのエッジルーターに100 Gbpsで直接デュアル物理ポート接続する超エンタープライズ構成。</li>
                <li><strong>Microsoftピアリング:</strong> Office 365 / Microsoft 365 や PaaS への閉域アクセスを提供。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Private Link vs Service Endpoint */}
      {activeTab === 'privatelink-vs-se' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-sky-400" />
              <span>Azure Private Link vs サービスエンドポイント (徹底比較)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedEndpointType('private-link')}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedEndpointType === 'private-link'
                  ? 'bg-slate-950 border-sky-500 ring-1 ring-sky-500/40 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-sky-300">Azure Private Link (プライベートエンドポイント)</span>
                <span className="text-[10px] font-mono text-sky-400 font-bold">推奨・最高セキュリティ</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li><strong>IPアドレス:</strong> VNet内のプライベートIP (例: 10.0.2.5) を直接割り当て。</li>
                <li><strong>オンプレミス接続:</strong> ExpressRoute / VPN経由でオンプレミスからも直接通信可能！</li>
                <li><strong>データ流出防止:</strong> 特定のリソースインスタンス専用接続のため、他テナントへのデータ持ち出しが物理的に不可能。</li>
              </ul>
            </button>

            <button
              onClick={() => setSelectedEndpointType('service-endpoint')}
              className={`p-4 rounded-lg border text-left transition-all ${
                selectedEndpointType === 'service-endpoint'
                  ? 'bg-slate-950 border-sky-500 ring-1 ring-sky-500/40 text-white shadow-md'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm text-slate-200">サービスエンドポイント (Service Endpoint)</span>
                <span className="text-[10px] font-mono text-slate-400">レガシー / 無料</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-300">
                <li><strong>IPアドレス:</strong> PaaSサービスのパブリックIPのまま (Microsoftバックボーン内を通過)。</li>
                <li><strong>オンプレミス接続:</strong> ExpressRoute/VPN経由のオンプレミス直接アクセスは非対応。</li>
                <li><strong>リスク:</strong> サブネット単位での接続のため、悪意のユーザーが別テナントのStorageへコピーする流出リスクあり。</li>
              </ul>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
