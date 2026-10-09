import React, { useState } from 'react';
import { APP_GATEWAY_PATHS } from '../data/azureSecData';
import { AppGatewayPathRule } from '../types/azureSec';
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
  Send,
  Info,
  ExternalLink,
  Workflow,
  Cpu
} from 'lucide-react';

interface AzureAppGatewayFirewallSimulatorProps {
  onNavigateToQuiz?: (topic: string) => void;
}

export const AzureAppGatewayFirewallSimulator: React.FC<AzureAppGatewayFirewallSimulatorProps> = ({ onNavigateToQuiz }) => {
  const [activeTab, setActiveTab] = useState<'firewall-hub' | 'appgw-routing' | 'frontdoor-vs-appgw'>('firewall-hub');

  // Azure Firewall State
  const [fwThreatMode, setFwThreatMode] = useState<'Alert' | 'Deny'>('Deny');
  const [fwOutboundFqdn, setFwOutboundFqdn] = useState<string>('*.microsoft.com');
  const [targetFqdnTest, setTargetFqdnTest] = useState<string>('malicious-c2-botnet.ru');
  const [dnatTestPort, setDnatTestPort] = useState<number>(8080);
  const [fwTestResult, setFwTestResult] = useState<{
    status: 'allow' | 'deny';
    title: string;
    detail: string;
    logType: string;
  } | null>(null);

  // App Gateway State
  const [appGwPaths, setAppGwPaths] = useState<AppGatewayPathRule[]>(APP_GATEWAY_PATHS);
  const [wafMode, setWafMode] = useState<'Detection' | 'Prevention'>('Prevention');
  const [testRequestUrl, setTestRequestUrl] = useState<string>('https://contoso.com/api/orders?id=123');
  const [testPayloadType, setTestPayloadType] = useState<'Normal' | 'SQLi' | 'StaticMedia'>('SQLi');
  const [appGwResult, setAppGwResult] = useState<{
    status: 'routed' | 'blocked' | 'detected';
    title: string;
    backendPool: string;
    wafAction: string;
    explanation: string;
  } | null>(null);

  // Test Firewall inspection
  const handleTestFirewall = () => {
    if (targetFqdnTest.includes('malicious') || targetFqdnTest.includes('.ru')) {
      if (fwThreatMode === 'Deny') {
        setFwTestResult({
          status: 'deny',
          title: '【Azure Firewall 脅威インテリジェンス】悪意通信を即座に破棄 (Drop)',
          detail: `宛先「${targetFqdnTest}」はMicrosoft Cyber Signalsの最新ボットネット/C2悪意データベースに登録されています。UDR (0.0.0.0/0 ➔ 10.0.0.4) 経由でFirewallに到達した瞬間に通信がドロップされました。`,
          logType: 'AzureFirewallNetworkRuleLog / ThreatIntelligenceAction=Drop',
        });
      } else {
        setFwTestResult({
          status: 'allow',
          title: '【脅威インテリジェンス Alertモード】アラートログ記録のみで通信通過',
          detail: `脅威モードが「Alert」のため、Log Analyticsにアラートが記録されましたが、パケット自体はインターネットへ送出(SNAT)されました。`,
          logType: 'AzureFirewallNetworkRuleLog / ThreatIntelligenceAction=AlertOnly',
        });
      }
    } else if (targetFqdnTest.includes('microsoft.com')) {
      setFwTestResult({
        status: 'allow',
        title: '【アプリケーション規則 FQDN許可】正常送信 (SNAT適用)',
        detail: `宛先FQDN (*.microsoft.com) がアプリケーション規則に合致したため、社内プライベートIPからFirewallの静的パブリックIP (20.40.60.80) への送信SNATが行われ、正常に通信できました。`,
        logType: 'AzureFirewallApplicationRuleLog / Rule=Allow-Microsoft / Action=Allow',
      });
    } else {
      setFwTestResult({
        status: 'deny',
        title: '【既定のアウトバウンド拒否】許可ルールなしのため破棄',
        detail: `「${targetFqdnTest}」に対する許可ルールが存在しないため、ゼロトラストの原則に従いパケットがドロップされました。`,
        logType: 'AzureFirewallNetworkRuleLog / Action=DefaultDeny',
      });
    }
  };

  // Test App Gateway Routing & WAF
  const handleTestAppGateway = () => {
    if (testPayloadType === 'SQLi') {
      if (wafMode === 'Prevention') {
        setAppGwResult({
          status: 'blocked',
          title: 'WAF 403 Forbidden: SQLインジェクション攻撃を防御・遮断',
          backendPool: 'なし (リクエストはバックエンドへ送信されず破棄)',
          wafAction: 'Block (CRS 942100 SQL Injection Detection)',
          explanation: '【Preventionモード】OWASP Core Rule Set (CRS) により悪意あるSQL構文 (OR 1=1 等) が検知され、App Gateway のエッジでリクエストが遮断されました。バックエンドのAKSやDBには一切負荷がかかりません。',
        });
      } else {
        setAppGwResult({
          status: 'detected',
          title: 'WAF Detection: 攻撃を検知しましたがバックエンドへ転送しました (要対策)',
          backendPool: 'Backend-Pool-Microservices (AKS クラスター)',
          wafAction: 'Log/Detected Only (未遮断)',
          explanation: '【Detectionモード】検知ログは記録されますが通信は通過します。本番環境で攻撃を阻止するには必ず Prevention モードにする必要があります。',
        });
      }
    } else if (testPayloadType === 'StaticMedia') {
      setAppGwResult({
        status: 'routed',
        title: 'URLベースルーティング: /images/* パス規則に合致',
        backendPool: 'Backend-Pool-StaticMedia (Azure Storage / CDN)',
        wafAction: 'Pass (正常通信)',
        explanation: 'リクエストのパス「/images/...」を解析し、APIサーバーではなく静的ストレージ用のバックエンドプールへ最適に振り分けました。',
      });
    } else {
      setAppGwResult({
        status: 'routed',
        title: 'URLベースルーティング: /api/* パス規則に合致',
        backendPool: 'Backend-Pool-Microservices (AKS クラスター)',
        wafAction: 'Pass (正常通信)',
        explanation: 'リクエストのパス「/api/...」を解析し、AKSマイクロサービス群のバックエンドプールへ正常に振り分けました。SSLオフロードによりApp GatewayでSSLが終端されています。',
      });
    }
  };

  // 1-Click Quick Demo Mission trigger
  const triggerMission = (mission: 'fw-threat-deny' | 'fw-microsoft-allow' | 'waf-sqli-block' | 'appgw-url-routing' | 'frontdoor-compare') => {
    if (mission === 'fw-threat-deny') {
      setActiveTab('firewall-hub');
      setTargetFqdnTest('malicious-c2-botnet.ru');
      setFwThreatMode('Deny');
      setTimeout(() => handleTestFirewall(), 50);
    } else if (mission === 'fw-microsoft-allow') {
      setActiveTab('firewall-hub');
      setTargetFqdnTest('portal.azure.com');
      setTimeout(() => handleTestFirewall(), 50);
    } else if (mission === 'waf-sqli-block') {
      setActiveTab('appgw-routing');
      setTestPayloadType('SQLi');
      setWafMode('Prevention');
      setTestRequestUrl("https://contoso.com/api/users?name=' OR '1'='1");
      setTimeout(() => handleTestAppGateway(), 50);
    } else if (mission === 'appgw-url-routing') {
      setActiveTab('appgw-routing');
      setTestPayloadType('StaticMedia');
      setTestRequestUrl('https://contoso.com/images/hero-banner.png');
      setTimeout(() => handleTestAppGateway(), 50);
    } else if (mission === 'frontdoor-compare') {
      setActiveTab('frontdoor-vs-appgw');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>Azure 境界セキュリティ & L7/L4 トラフィック制御</span>
              <span>·</span>
              <span>SC-300 / SC-500 / AZ-500 対策</span>
              <span>·</span>
              <span>Azure Firewall & Application Gateway & WAF & Front Door</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Azure Firewall & Application Gateway (WAF) 検証スタジオ
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              ハブスポーク構成とUDR (ユーザー定義ルート)、Azure FirewallのFQDN・脅威インテリジェンス・SNAT/DNAT、Application GatewayのSSLオフロード・URLパスルーティング・OWASP WAF防御をリアルタイムに体験します。
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
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">② 「通信検査を実行」をクリック</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">③ ルーティング先 & WAF/FW遮断理由を確認</span>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>【1クリック体験ミッション】試したいシナリオをクリックしてください:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            <button
              onClick={() => triggerMission('fw-threat-deny')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Firewall 脅威検知遮断</div>
                <div className="text-[10px] text-rose-400 font-medium">悪意C2通信を自動Drop</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('fw-microsoft-allow')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">FQDNアウトバウンド許可</div>
                <div className="text-[10px] text-emerald-400 font-medium">*.microsoft.com SNAT送信</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('waf-sqli-block')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">App Gateway WAF防御</div>
                <div className="text-[10px] text-amber-400 font-medium">SQLインジェクション403遮断</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('appgw-url-routing')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">URLパスルーティング</div>
                <div className="text-[10px] text-sky-400 font-medium">/images/* ➔ Storageへ転送</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('frontdoor-compare')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-indigo-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-indigo-950 border border-indigo-700 text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Front Door vs App Gateway</div>
                <div className="text-[10px] text-indigo-400 font-medium">グローバル vs リージョン比較</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('firewall-hub')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'firewall-hub'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>1. ハブスポーク & Azure Firewall (UDR / FQDN / 脅威検知)</span>
        </button>

        <button
          onClick={() => setActiveTab('appgw-routing')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'appgw-routing'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" />
          <span>2. Application Gateway (URL振り分け & WAF)</span>
        </button>

        <button
          onClick={() => setActiveTab('frontdoor-vs-appgw')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'frontdoor-vs-appgw'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>3. Azure Front Door vs App Gateway 比較</span>
        </button>
      </div>

      {/* TAB 1: Azure Firewall & Hub-Spoke UDR */}
      {activeTab === 'firewall-hub' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Azure Firewall 通信検査サンドボックス</span>
                <span className="text-slate-400 font-mono">ハブ仮想ネットワーク (10.0.0.0/16)</span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">脅威インテリジェンスの動作モード:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFwThreatMode('Deny')}
                    className={`p-2 rounded border font-bold ${
                      fwThreatMode === 'Deny'
                        ? 'bg-rose-950 border-rose-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Alert and Deny (推奨: 即時破棄)
                  </button>
                  <button
                    onClick={() => setFwThreatMode('Alert')}
                    className={`p-2 rounded border font-bold ${
                      fwThreatMode === 'Alert'
                        ? 'bg-amber-950 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Alert Only (ログ記録のみ)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  社内VM (10.1.0.5) がアクセスを試行する宛先FQDN / ドメイン:
                </label>
                <input
                  type="text"
                  value={targetFqdnTest}
                  onChange={(e) => setTargetFqdnTest(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                />
              </div>

              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-slate-400 font-mono text-[11px] space-y-1">
                <div>UDRルートテーブル: <strong className="text-sky-300">0.0.0.0/0 ➔ Next Hop: 10.0.0.4 (Azure Firewall)</strong></div>
                <div>送信SNATパブリックIP: <strong className="text-emerald-300">20.40.60.80</strong></div>
              </div>

              <button
                onClick={handleTestFirewall}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Firewall 検査を実行</span>
              </button>

              {fwTestResult && (
                <div className={`p-4 rounded-lg border space-y-2 text-xs ${
                  fwTestResult.status === 'allow'
                    ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-600 text-rose-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    {fwTestResult.status === 'allow' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{fwTestResult.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {fwTestResult.detail}
                  </p>
                  <div className="p-2 bg-slate-950 rounded font-mono text-[10px] text-slate-400">
                    ログ出力: {fwTestResult.logType}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最頻出】Azure Firewall の機能 & 実装ポイント</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">ハブスポーク構成 & UDR:</strong>
                  スポークVNet内のサブネットに関連付けられたルートテーブル(UDR)に「0.0.0.0/0 ➔ 仮想アプライアンス(FirewallのプライベートIP)」を記述することで、すべてのインターネット向け通信を中央のFirewall経由に強制します。
                </li>
                <li>
                  <strong className="text-indigo-300">送信SNAT と 受信DNAT:</strong>
                  送信時は内部IPを隠蔽してFirewallのパブリックIPへ変換(SNAT)。受信時は外部アクセスを内部プライベートサーバーへポート変換転送(DNAT)。
                </li>
                <li>
                  <strong className="text-rose-300">脅威インテリジェンス (Threat Intelligence):</strong>
                  Microsoft Cyber Signalsが提供する最新の悪意のあるIP/ドメインからの攻撃や通信を、ルールを手動作成することなく自動検知・遮断。
                </li>
                <li>
                  <strong className="text-amber-300">DDoS Network Protection:</strong>
                  VNet全体を保護し、大規模なレイヤー3/4 DDoS攻撃(SYNフラッド、UDPリフレクション等)からリソースを保護。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Application Gateway (URL Routing & WAF) */}
      {activeTab === 'appgw-routing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">App Gateway (Layer 7) WAF & ルーティングテスト</span>
                <span className="text-slate-400 font-mono">静的VIP / SSLオフロード対応</span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">WAF (Web Application Firewall) モード:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setWafMode('Prevention')}
                    className={`p-2 rounded border font-bold ${
                      wafMode === 'Prevention'
                        ? 'bg-rose-950 border-rose-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Prevention (悪意通信を即座に403遮断)
                  </button>
                  <button
                    onClick={() => setWafMode('Detection')}
                    className={`p-2 rounded border font-bold ${
                      wafMode === 'Detection'
                        ? 'bg-amber-950 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Detection (検知ログ記録のみで通過)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">送信リクエストの種類を選択:</label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      setTestPayloadType('SQLi');
                      setTestRequestUrl("https://contoso.com/api/users?name=' OR '1'='1");
                    }}
                    className={`w-full text-left p-2 rounded border ${
                      testPayloadType === 'SQLi'
                        ? 'bg-rose-950/60 border-rose-500 text-white ring-1 ring-rose-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-rose-300">1. SQLインジェクション攻撃 (SQLi)</div>
                    <div className="text-[10px] font-mono text-slate-400">GET /api/users?name=&apos; OR &apos;1&apos;=&apos;1</div>
                  </button>

                  <button
                    onClick={() => {
                      setTestPayloadType('StaticMedia');
                      setTestRequestUrl('https://contoso.com/images/product-photo.jpg');
                    }}
                    className={`w-full text-left p-2 rounded border ${
                      testPayloadType === 'StaticMedia'
                        ? 'bg-sky-950/60 border-sky-500 text-white ring-1 ring-sky-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sky-300">2. 静的画像リクエスト (/images/*)</div>
                    <div className="text-[10px] font-mono text-slate-400">GET /images/product-photo.jpg ➔ Storageプールへ振り分け</div>
                  </button>

                  <button
                    onClick={() => {
                      setTestPayloadType('Normal');
                      setTestRequestUrl('https://contoso.com/api/v2/orders?id=5001');
                    }}
                    className={`w-full text-left p-2 rounded border ${
                      testPayloadType === 'Normal'
                        ? 'bg-emerald-950/60 border-emerald-500 text-white ring-1 ring-emerald-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-emerald-300">3. 正常なREST APIリクエスト (/api/*)</div>
                    <div className="text-[10px] font-mono text-slate-400">GET /api/v2/orders ➔ AKSマイクロサービスプールへ振り分け</div>
                  </button>
                </div>
              </div>

              <button
                onClick={handleTestAppGateway}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>L7 ルーティング & WAF検査を実行</span>
              </button>

              {appGwResult && (
                <div className={`p-4 rounded-lg border space-y-2 text-xs ${
                  appGwResult.status === 'blocked'
                    ? 'bg-rose-950/40 border-rose-600 text-rose-200'
                    : appGwResult.status === 'detected'
                    ? 'bg-amber-950/40 border-amber-600 text-amber-200'
                    : 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                }`}>
                  <div className="font-bold text-sm">{appGwResult.title}</div>
                  <div className="text-[11px] font-mono">転送先: {appGwResult.backendPool}</div>
                  <div className="text-[11px] font-mono">WAFアクション: {appGwResult.wafAction}</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    {appGwResult.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最頻出】Application Gateway の主要機能</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">URLパスベースルーティング:</strong>
                  HTTP/HTTPSのパス(例: /api/* はAKSプール、/images/* はStorageプール)に基づいてリクエストを異なるバックエンドに振り分け。
                </li>
                <li>
                  <strong className="text-indigo-300">複数サイトのホスティング (Multi-site):</strong>
                  単一のApplication Gatewayで、異なるホスト名(例: shop.contoso.com と blog.contoso.com)を最大100サイトまで個別のバックエンドに振り分け可能。
                </li>
                <li>
                  <strong className="text-emerald-300">SSL オフロード (SSL 終端):</strong>
                  App GatewayでHTTPS暗号化を終端し、バックエンドVMのCPU負荷を軽減。
                </li>
                <li>
                  <strong className="text-amber-300">AKS イングレスコントローラー (AGIC):</strong>
                  KubernetesクラスタのIngressリソースの変更を検知し、Azure Application Gatewayを直接Ingressとして設定管理。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Azure Front Door vs App Gateway */}
      {activeTab === 'frontdoor-vs-appgw' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" />
              <span>Azure Front Door vs Azure Application Gateway (決定版比較)</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              どちらもレイヤー7のロードバランサー & WAFですが、スコープ(グローバル vs リージョン)が決定的に異なります。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-950 border border-sky-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-sky-300">Azure Front Door</span>
                <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-400 font-mono text-[10px] font-bold">グローバル L7</span>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li><strong>スコープ:</strong> グローバル (世界中のエッジPOP Anycast IP)</li>
                <li><strong>CDN機能:</strong> エッジキャッシング (CDN) 機能を内蔵</li>
                <li><strong>フェールオーバー:</strong> 複数リージョンにまたがるアクティブ/アクティブ、アクティブ/パッシブの高可用性</li>
                <li><strong>プロトコル:</strong> HTTP / HTTPS のみ</li>
                <li><strong>試験キーワード:</strong> 「グローバル」「複数リージョン」「エッジキャッシュ」「Anycast」</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-950 border border-indigo-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-indigo-300">Azure Application Gateway</span>
                <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 font-mono text-[10px] font-bold">リージョン内 L7</span>
              </div>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li><strong>スコープ:</strong> リージョン内 (特定VNet内のサブネットにデプロイ)</li>
                <li><strong>VNet内連携:</strong> プライベートIPバックエンドやAKS (AGIC) との親和性が最高峰</li>
                <li><strong>機能:</strong> SSLオフロード、Cookieベースのセッションアフィニティ、URLルーティング</li>
                <li><strong>可用性ゾーン:</strong> ゾーン冗長性 (Zone Redundancy) による高可用性</li>
                <li><strong>試験キーワード:</strong> 「VNet内」「リージョン」「AGIC」「URLパスルーティング」</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
