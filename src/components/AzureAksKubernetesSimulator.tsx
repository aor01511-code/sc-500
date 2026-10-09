import React, { useState, useEffect } from 'react';
import { 
  AKS_COMPONENTS, 
  AKS_SERVICE_TYPES, 
  AKS_STORAGE_TYPES, 
  AKS_RBAC_RULES 
} from '../data/azureSecData';
import { 
  AksComponent, 
  AksServiceTypeInfo, 
  AksStorageTypeInfo, 
  AksRbacRule 
} from '../types/azureSec';
import { 
  Server, 
  Network, 
  HardDrive, 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Cpu, 
  Terminal, 
  FileCode, 
  Box, 
  ChevronRight, 
  Info, 
  AlertTriangle, 
  Database, 
  ExternalLink,
  Users,
  Lock,
  Workflow
} from 'lucide-react';

interface AzureAksKubernetesSimulatorProps {
  onNavigateToQuiz?: (questionId?: string) => void;
}

export const AzureAksKubernetesSimulator: React.FC<AzureAksKubernetesSimulatorProps> = ({ 
  onNavigateToQuiz 
}) => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'architecture' | 'networking' | 'storage' | 'rbac'>('architecture');

  // Mission State
  const [activeMission, setActiveMission] = useState<number | null>(null);

  // Tab 1: Architecture State
  const [selectedComponentId, setSelectedComponentId] = useState<string>('kube-apiserver');
  const [deployStep, setDeployStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [nodePoolMode, setNodePoolMode] = useState<'system' | 'user'>('user');

  // Tab 2: Networking State
  const [selectedServiceType, setSelectedServiceType] = useState<'ClusterIP' | 'NodePort' | 'LoadBalancer'>('LoadBalancer');
  const [trafficClient, setTrafficClient] = useState<'external-internet' | 'internal-pod' | 'node-port-caller'>('external-internet');
  const [trafficPacketActive, setTrafficPacketActive] = useState<boolean>(false);
  const [trafficResult, setTrafficResult] = useState<string | null>(null);

  // Tab 3: Storage State
  const [selectedStorageId, setSelectedStorageId] = useState<string>('managed-csi');
  const [pvcRequestedSize, setPvcRequestedSize] = useState<number>(32);
  const [podCountToMount, setPodCountToMount] = useState<number>(2);
  const [storageMountStatus, setStorageMountStatus] = useState<{
    success: boolean;
    message: string;
    nodeAllocations: { podId: string; node: string; status: 'Mounted' | 'Failed' }[];
  } | null>(null);

  // Tab 4: RBAC State
  const [selectedSubject, setSelectedSubject] = useState<string>('dev-team@contoso.com');
  const [targetNamespace, setTargetNamespace] = useState<'development' | 'production'>('development');
  const [testAction, setTestAction] = useState<'get-pods' | 'create-pods' | 'delete-nodes' | 'get-secrets'>('create-pods');
  const [rbacEvaluationResult, setRbacEvaluationResult] = useState<{
    allowed: boolean;
    matchedRule: AksRbacRule | null;
    reason: string;
  } | null>(null);

  // Architecture Deploy Flow steps
  const deploySteps = [
    {
      step: 1,
      target: 'kube-apiserver',
      title: '1. kubectl によるマニフェスト送信 & 認証認可',
      action: '開発者が `kubectl apply -f app.yaml` を実行。apiserver が Entra ID / K8s RBAC で認証・認可し、スキーマを検証。',
      detail: 'TLS経由で受信。Admission Control (Azure Policy / Gatekeeper) がコンテナの特権実行や非承認レジストリからの取得をブロックしていないかを事前審査。',
    },
    {
      step: 2,
      target: 'etcd',
      title: '2. etcd への状態永続化 (Desired State の記録)',
      action: 'apiserver が「Pod: nginx, Replica: 1」の定義を分散KVSである etcd に保存。',
      detail: 'AKSでは etcd はAzureマネージドで保管され、保存時暗号化(SSE)および高可用性Raftクォーラムが自動維持。',
    },
    {
      step: 3,
      target: 'kube-scheduler',
      title: '3. kube-scheduler による最適ノード選定 (フィルタ & スコア)',
      action: 'スケジューラーが未割り当て (Pending) の Pod を検知し、CPU/メモリの空き容量、Taints/Tolerations、Node Affinity を計算。',
      detail: '最もスコアの高かったワーカーノード「aks-usernodepool-vm02」を選定し、apiserver へバインド結果を報告。',
    },
    {
      step: 4,
      target: 'kubelet',
      title: '4. ノード上の kubelet が PodSpec を受信',
      action: 'ノード常駐エージェント kubelet が apiserver を定期ポーリング(Watch)して自ノード宛ての PodSpec を取得。',
      detail: '必要なボリューム (PV/PVC) のアタッチをAzureクラウドプロバイダーに要求し、コンテナランタイムに起動を指示。',
    },
    {
      step: 5,
      target: 'container-runtime',
      title: '5. containerd が ACR からイメージをプルして起動',
      action: 'containerd がマネージドID認証で Azure Container Registry (ACR) からイメージを高速ダウンロード。',
      detail: 'Linux namespaces (PID, Net, IPC) と cgroups (CPU 200m, Memory 256Mi 制約) を作成し、Podコンテナプロセスを隔離起動。',
    },
    {
      step: 6,
      target: 'kube-proxy',
      title: '6. kube-proxy がルーティング (iptables/IPVS) を更新',
      action: '起動したPodに仮想IP (10.244.1.15) が割り当てられ、kube-proxy がノード上の iptables ルールを更新。',
      detail: 'Service (ClusterIP/LoadBalancer) 宛ての通信が新しいPodへ正しくロードバランスされる準備が完了。Podが Running 状態へ！',
    },
  ];

  // Auto-play timer for deploy flow
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying) {
      timer = setInterval(() => {
        setDeployStep((prev) => {
          if (prev >= deploySteps.length) {
            setIsAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Selected Component info
  const selectedComponent = AKS_COMPONENTS.find(c => c.id === selectedComponentId) || AKS_COMPONENTS[0];
  const selectedService = AKS_SERVICE_TYPES.find(s => s.type === selectedServiceType) || AKS_SERVICE_TYPES[0];
  const selectedStorage = AKS_STORAGE_TYPES.find(s => s.id === selectedStorageId) || AKS_STORAGE_TYPES[0];

  // Quick Mission Handler
  const handleStartMission = (missionNum: number) => {
    setActiveMission(missionNum);
    if (missionNum === 1) {
      setActiveTab('architecture');
      setDeployStep(1);
      setSelectedComponentId('kube-apiserver');
      setIsAutoPlaying(true);
    } else if (missionNum === 2) {
      setActiveTab('networking');
      setSelectedServiceType('LoadBalancer');
      setTrafficClient('external-internet');
      handleSendTraffic('LoadBalancer', 'external-internet');
    } else if (missionNum === 3) {
      setActiveTab('storage');
      setSelectedStorageId('managed-csi');
      setPodCountToMount(2);
      handleSimulateStorageMount('managed-csi', 2);
    } else if (missionNum === 4) {
      setActiveTab('rbac');
      setSelectedSubject('dev-team@contoso.com');
      setTargetNamespace('development');
      setTestAction('create-pods');
      handleEvaluateRbac('dev-team@contoso.com', 'development', 'create-pods');
    }
  };

  // Traffic Simulation Handler
  const handleSendTraffic = (serviceType: 'ClusterIP' | 'NodePort' | 'LoadBalancer', client: string) => {
    setTrafficPacketActive(true);
    setTrafficResult(null);

    setTimeout(() => {
      setTrafficPacketActive(false);
      if (serviceType === 'ClusterIP') {
        if (client === 'external-internet') {
          setTrafficResult('❌ 【接続拒否 (Timeout / Blocked)】ClusterIPはクラスター内部限定の仮想IPです。インターネットからの直接トラフィックは届きません。');
        } else {
          setTrafficResult('✅ 【到達成功】クラスター内部のPodから CoreDNS 経由で ClusterIP (10.0.12.45) を解決し、kube-proxy (iptables DNAT) を経由して正常にバックエンドPodへ分散到達しました。');
        }
      } else if (serviceType === 'NodePort') {
        if (client === 'external-internet') {
          setTrafficResult('⚠️ 【到達成功 (ポート制限あり)】ワーカーノードのパブリックIP:31250 を直接叩いてアクセス成功。ただし実稼働では各ノードのIPが変わるリスクとポート番号の制約があるため非推奨です。');
        } else {
          setTrafficResult('✅ 【到達成功】ノードポート宛てパケットがノード上の iptables を経由して該当Podへ正常にルーティングされました。');
        }
      } else if (serviceType === 'LoadBalancer') {
        setTrafficResult('🚀 【到達成功 (本番推奨)】Azure Load Balancer のパブリックIP (51.144.92.10:80) で受信後、Azure LBが正常なAKSノードへ均等分散し、kube-proxy経由でPodへ通信が届きました！');
      }
    }, 700);
  };

  // Storage Simulation Handler
  const handleSimulateStorageMount = (storageId: string, count: number) => {
    const isDisk = storageId === 'managed-csi';

    if (isDisk && count > 1) {
      setStorageMountStatus({
        success: false,
        message: '❌ 【Multi-Attach Error 発生！】Azure Managed Disk は「ReadWriteOnce (RWO)」のみ対応です。Pod 1 が Node-01 にアタッチしているため、別ノード (Node-02) の Pod 2 からの同時マウントはブロックされました！',
        nodeAllocations: [
          { podId: 'web-pod-replica-1', node: 'aks-usernodepool-vm01', status: 'Mounted' },
          { podId: 'web-pod-replica-2', node: 'aks-usernodepool-vm02', status: 'Failed' },
        ],
      });
    } else if (isDisk && count === 1) {
      setStorageMountStatus({
        success: true,
        message: '✅ 【マウント成功】Azure Managed Disk (RWO) が Node-01 にアタッチされ、単一のPodに高速ブロックストレージとして排他マウントされました。',
        nodeAllocations: [
          { podId: 'db-pod-primary', node: 'aks-usernodepool-vm01', status: 'Mounted' },
        ],
      });
    } else {
      // Azure Files / Azure Blob (RWX)
      setStorageMountStatus({
        success: true,
        message: '🎉 【複数ノード同時マウント成功！】Azure Files (RWX) は SMB / NFS プロトコルに対応しているため、Node-01 と Node-02 の両方のPodから同時に同一ボリュームへの安全な読み書きが可能です！',
        nodeAllocations: Array.from({ length: count }).map((_, i) => ({
          podId: `shared-pod-replica-${i + 1}`,
          node: `aks-usernodepool-vm0${(i % 2) + 1}`,
          status: 'Mounted',
        })),
      });
    }
  };

  // RBAC Evaluation Handler
  const handleEvaluateRbac = (
    subject: string, 
    namespace: 'development' | 'production', 
    action: 'get-pods' | 'create-pods' | 'delete-nodes' | 'get-secrets'
  ) => {
    let allowed = false;
    let matchedRule: AksRbacRule | null = null;
    let reason = '';

    // Check super admin
    if (subject === 'infra-admin-group') {
      matchedRule = AKS_RBAC_RULES.find(r => r.id === 'cluster-super-admin') || null;
      allowed = true;
      reason = 'ClusterRole 「cluster-admin」 (ClusterRoleBinding) により、全Namespaceおよびクラスター全体の全操作が許可されています。';
    } else if (subject === 'sec-auditor@contoso.com') {
      matchedRule = AKS_RBAC_RULES.find(r => r.id === 'cluster-security-auditor') || null;
      if (action === 'get-pods') {
        allowed = true;
        reason = 'ClusterRole 「security-auditor」 (ClusterRoleBinding) により、全Namespaceの pods リソースの get/list/watch が許可されています。';
      } else {
        allowed = false;
        reason = `ClusterRole 「security-auditor」 は参照専用 (get, list, watch) のため、操作「${action}」は権限不足で拒否されました。`;
      }
    } else if (subject === 'dev-team@contoso.com') {
      matchedRule = AKS_RBAC_RULES.find(r => r.id === 'dev-pod-reader') || null;
      if (namespace === 'development' && action === 'get-pods') {
        allowed = true;
        reason = 'Role 「pod-reader」 (RoleBinding in "development") により、development 内の Pod 参照が許可されています。';
      } else if (namespace === 'production') {
        allowed = false;
        reason = 'RoleBinding は "development" Namespace にのみ定義されているため、"production" Namespace に対するアクセスは全拒否されます。';
      } else {
        allowed = false;
        reason = `Role 「pod-reader」 は verbs: [get, list, watch] のみ許可されているため、操作「${action}」は拒否されました。`;
      }
    } else if (subject === 'ci-cd-service-account') {
      matchedRule = AKS_RBAC_RULES.find(r => r.id === 'dev-app-deployer') || null;
      if (namespace === 'development' && (action === 'get-pods' || action === 'create-pods')) {
        allowed = true;
        reason = 'Role 「app-deployer」 (RoleBinding in "development") により、development 内の deployments / pods の create/get が許可されています。';
      } else if (namespace === 'production') {
        allowed = false;
        reason = 'CI/CD ServiceAccount の権限は "development" Namespace 限定であり、"production" への直接デプロイはブロックされます。';
      } else {
        allowed = false;
        reason = `nodes などのクラスターレベルリソースの削除・変更権限はありません。`;
      }
    }

    setRbacEvaluationResult({
      allowed,
      matchedRule,
      reason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 rounded-xl border border-sky-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                AKS & Kubernetes 体系的実機ラボ
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
                AZ-500 / AZ-104 / CKA 準拠
              </span>
            </div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Workflow className="w-7 h-7 text-sky-400" />
              Azure Kubernetes Service (AKS) 徹底解剖シミュレーター
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              クラスターマスター (Control Plane: apiserver, etcd, scheduler, controller-manager) とワーカーノード (kubelet, containerd, kube-proxy, Pod)、
              ネットワーク (ClusterIP / NodePort / LoadBalancer)、ストレージ (Azure Disk vs Files & RWO vs RWX)、RBACの内部動作を可視化します。
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            {onNavigateToQuiz && (
              <button
                onClick={() => onNavigateToQuiz('q20')}
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
            <span>【何をすればいいか一目でわかる】AKS 3ステップ学習ガイド</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300">
            <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">1</span>
              <div>
                <strong className="text-white block mb-0.5">アーキテクチャの役割理解</strong>
                <span>下のミッション1で `kubectl apply` を実行し、API Serverから各ノードへ命令が伝わる全ステップを追体験。</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">2</span>
              <div>
                <strong className="text-white block mb-0.5">通信とストレージの制約比較</strong>
                <span>ミッション2・3で ClusterIP/LB のパケット到達性と、Disk(RWO) vs Files(RWX) のマウント制約を検証。</span>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0">3</span>
              <div>
                <strong className="text-white block mb-0.5">Role vs ClusterRole 判定</strong>
                <span>ミッション4で開発者・監査員の権限を切り替え、Namespace限定RoleとClusterRoleBindingの違いを確認。</span>
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
                <span>Mission 1: Podデプロイの旅</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300">制御フロー</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                apiserver ➔ etcd ➔ scheduler ➔ kubelet ➔ containerd ➔ kube-proxy
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
                <span>Mission 2: Serviceルーティング</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300">通信比較</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                ClusterIP vs NodePort vs Azure LoadBalancer
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
                <span>Mission 3: Disk vs Files制約</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">RWO vs RWX</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                複数NodeでDiskをマウントした際のエラー実験
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
                <span>Mission 4: K8s RBAC判定</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300">can-i 判定</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">
                Role(Namespace限定) と ClusterRole の権限評価
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('architecture')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'architecture'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>1. クラスターアーキテクチャ & デプロイフロー</span>
        </button>

        <button
          onClick={() => setActiveTab('networking')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'networking'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>2. AKS ネットワーク (ClusterIP / NodePort / LoadBalancer)</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'storage'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>3. AKS ストレージ (PV / PVC & RWO vs RWX)</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`pb-3 px-4 font-semibold text-sm flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'rbac'
              ? 'border-sky-500 text-sky-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>4. AKS セキュリティ & RBAC (Role vs ClusterRole)</span>
        </button>
      </div>

      {/* TAB 1: Architecture & Lifecycle */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* Interactive Flow Runner */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-sky-400" />
                  <span>Pod 作成の旅: `kubectl apply` から起動までの内部制御フロー</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kubernetesの内部コンポーネントがどのように協調動作するかを順次追跡できます。
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setDeployStep(1);
                    setIsAutoPlaying(true);
                  }}
                  className="px-3 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>最初から自動再生</span>
                </button>
                <button
                  onClick={() => {
                    setDeployStep(prev => (prev < deploySteps.length ? prev + 1 : 1));
                    setIsAutoPlaying(false);
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center gap-1"
                >
                  <span>次へ進む ({deployStep}/{deploySteps.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setDeployStep(0);
                    setIsAutoPlaying(false);
                  }}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700"
                  title="リセット"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step Pipeline Visualization */}
            <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2">
              {deploySteps.map((s) => {
                const isActive = deployStep === s.step;
                const isPassed = deployStep > s.step;
                return (
                  <div
                    key={s.step}
                    onClick={() => {
                      setDeployStep(s.step);
                      setSelectedComponentId(s.target);
                    }}
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                      isActive
                        ? 'bg-sky-950/70 border-sky-400 shadow-md ring-1 ring-sky-400'
                        : isPassed
                        ? 'bg-slate-900/90 border-emerald-800/60 text-slate-300'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className={isActive ? 'text-sky-300' : isPassed ? 'text-emerald-400' : 'text-slate-500'}>
                        Step {s.step}
                      </span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isActive && <div className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />}
                    </div>
                    <div className="font-mono text-xs font-semibold truncate text-white">
                      {s.target}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Step Detail Box */}
            {deployStep > 0 && deployStep <= deploySteps.length && (
              <div className="mt-4 p-4 rounded-lg bg-sky-950/30 border border-sky-800/40">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded bg-sky-600/20 text-sky-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {deploySteps[deployStep - 1].title}
                    </h4>
                    <p className="text-xs text-sky-200 mt-1 leading-relaxed">
                      {deploySteps[deployStep - 1].action}
                    </p>
                    <div className="mt-2 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded border border-slate-800">
                      <span className="font-bold text-amber-400 mr-1.5">💡 技術詳細:</span>
                      {deploySteps[deployStep - 1].detail}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Master vs Worker Nodes Visual Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Control Plane (Azure Managed) */}
            <div className="bg-slate-900 border border-sky-800/30 rounded-xl p-5 shadow">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-sky-600/20 text-sky-400 flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">クラスターマスター (Control Plane)</h3>
                    <span className="text-[10px] text-sky-400 font-mono">Microsoft Azure 完全マネージド (無償 / SLA付与)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-sky-500/10 text-sky-300 border border-sky-500/20">
                  OS管理不要
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {AKS_COMPONENTS.filter(c => c.plane === 'control-plane').map(c => {
                  const isSelected = selectedComponentId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedComponentId(c.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-sky-950/60 border-sky-400 shadow ring-1 ring-sky-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-sky-300">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.nameJa}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{c.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Worker Nodes & Node Pools (User Managed VMSS) */}
            <div className="bg-slate-900 border border-emerald-800/30 rounded-xl p-5 shadow">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ワーカーノード & ノードプール (Worker Nodes)</h3>
                    <span className="text-[10px] text-emerald-400 font-mono">VMSSベース (ユーザー課金対象)</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[10px]">
                  <button
                    onClick={() => setNodePoolMode('system')}
                    className={`px-2 py-0.5 rounded ${
                      nodePoolMode === 'system' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    System Pool
                  </button>
                  <button
                    onClick={() => setNodePoolMode('user')}
                    className={`px-2 py-0.5 rounded ${
                      nodePoolMode === 'user' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'
                    }`}
                  >
                    User Pool
                  </button>
                </div>
              </div>

              {/* Node Pool Description */}
              <div className="mt-3 p-2.5 rounded bg-slate-950/70 border border-slate-800 text-xs">
                {nodePoolMode === 'system' ? (
                  <div className="text-indigo-300">
                    <strong>システムノードプール (`mode: System`):</strong> CoreDNS、metrics-server、azure-cni などのクラスター必須Pod専用。業務Podの暴走でCoreDNSが共倒れしないよう分離します。
                  </div>
                ) : (
                  <div className="text-emerald-300">
                    <strong>ユーザーノードプール (`mode: User`):</strong> アプリケーションワークロード用。GPU搭載VM、スポットインスタンス、自動スケール (Cluster Autoscaler) を柔軟に適用可能。
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2.5">
                {AKS_COMPONENTS.filter(c => c.plane === 'worker-node').map(c => {
                  const isSelected = selectedComponentId === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedComponentId(c.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-950/60 border-emerald-400 shadow ring-1 ring-emerald-400'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-emerald-300">{c.name}</span>
                        <span className="text-[10px] text-slate-400">{c.nameJa}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{c.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Inspector Panel for Selected Component */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="text-base font-bold text-white">{selectedComponent.nameJa} ({selectedComponent.name})</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    所属: {selectedComponent.plane === 'control-plane' ? 'クラスターマスター (Azureマネージド)' : 'ワーカーノード (ホストOS/デーモン)'}
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                selectedComponent.azureManaged ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {selectedComponent.azureManaged ? 'Azure 管理 (No OS Access)' : 'ユーザー管理 (VMSS Node)'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  主な責務と機能
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {selectedComponent.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded border border-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  AZ-500 / SC-300 試験頻出ポイント & ベストプラクティス
                </h4>
                <div className="space-y-2">
                  {selectedComponent.keyExamPoints.map((ep, i) => (
                    <div key={i} className="p-2.5 rounded bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 leading-relaxed">
                      {ep}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Networking (ClusterIP, NodePort, LoadBalancer) */}
      {activeTab === 'networking' && (
        <div className="space-y-6">
          {/* Top Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AKS_SERVICE_TYPES.map(s => {
              const isSelected = selectedServiceType === s.type;
              return (
                <div
                  key={s.type}
                  onClick={() => {
                    setSelectedServiceType(s.type);
                    setTrafficResult(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-400 shadow-md ring-1 ring-sky-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-bold text-sky-300">{s.type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                      s.type === 'ClusterIP'
                        ? 'bg-slate-800 text-slate-300'
                        : s.type === 'NodePort'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {s.accessibility}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{s.nameJa}</h4>
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">{s.description}</p>
                  
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800/80 space-y-1">
                    <div>ポート範囲: <span className="text-white">{s.portRange}</span></div>
                    <div>割り当てIP: <span className="text-sky-300">{s.allocatedIp}</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Traffic & Packet Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-sky-400" />
                  <span>パケット到達フロー & kube-proxy ルーティングシミュレーター</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  クライアントの発信元を選び、選択中Service ({selectedService.type}) へトラフィックを送信して到達可否と経路を確認します。
                </p>
              </div>

              {/* Client Selector & Send Button */}
              <div className="flex items-center gap-2">
                <select
                  value={trafficClient}
                  onChange={(e) => setTrafficClient(e.target.value as any)}
                  className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white"
                >
                  <option value="external-internet">外部インターネット (パブリッククライアント)</option>
                  <option value="internal-pod">クラスター内部のPod (他マイクロサービス)</option>
                  <option value="node-port-caller">社内VNet内PC (ノードIP直接指定)</option>
                </select>

                <button
                  onClick={() => handleSendTraffic(selectedServiceType, trafficClient)}
                  disabled={trafficPacketActive}
                  className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>パケット送信テスト</span>
                </button>
              </div>
            </div>

            {/* Packet Path Visualizer */}
            <div className="mt-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                【{selectedService.type}】におけるパケットの物理・論理到達経路:
              </div>
              <div className="space-y-2">
                {selectedService.packetPath.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-mono text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5">{step}</span>
                  </div>
                ))}
              </div>

              {/* Simulation Result Box */}
              {trafficResult && (
                <div className="mt-4 p-3 rounded border text-xs font-medium animate-fadeIn bg-slate-900 border-sky-800/60 text-slate-200">
                  {trafficResult}
                </div>
              )}
            </div>

            {/* YAML Manifest & Exam Tip */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-sky-400" />
                    Service マニフェスト YAML (spec.type: {selectedService.type})
                  </span>
                </div>
                <pre className="p-3.5 rounded-lg bg-slate-950 font-mono text-xs text-sky-300 border border-slate-800 overflow-x-auto leading-relaxed">
                  {selectedService.yamlSnippet}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    試験重要ポイント & Azure 特有設定
                  </span>
                </div>
                <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 leading-relaxed h-full">
                  <p className="mb-2.5">{selectedService.examTips}</p>
                  
                  <div className="pt-2 border-t border-amber-800/40 text-[11px] text-slate-300">
                    <strong className="text-white block mb-1">【Kubenet vs Azure CNI の違い】:</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      <li><strong>Kubenet (Basic):</strong> PodのIPアドレスはAzure VNet外。ノードがNATして通信。VNetのIP枯渇を防げるが、外部からPodへ直接通信不可。</li>
                      <li><strong>Azure CNI (Advanced):</strong> 各PodがAzure VNetから直接本物のプライベートIPを取得。ExpressRouteや他VNetからPodへNATなしで直通可能。</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Storage (PV / PVC / StorageClass & RWO vs RWX) */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          {/* StorageClass Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {AKS_STORAGE_TYPES.map(st => {
              const isSelected = selectedStorageId === st.id;
              return (
                <div
                  key={st.id}
                  onClick={() => {
                    setSelectedStorageId(st.id);
                    setStorageMountStatus(null);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-950/60 border-sky-400 shadow-md ring-1 ring-sky-400'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-sky-300">{st.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      st.multiNodeShareable
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {st.accessModes.join(' / ')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{st.storageBackend}</h4>
                  <p className="text-xs text-slate-300 mb-2">用途: {st.recommendedUse}</p>
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800/80">
                    <div>Provisioner: <span className="text-sky-300">{st.provisioner}</span></div>
                    <div>性能: <span className="text-slate-200">{st.performance}</span></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Mount & Multi-Attach Test Simulator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-sky-400" />
                  <span>動的プロビジョニング & RWO vs RWX マウント制限検証実験</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  開発者が PVC (Persistent Volume Claim) を要求した際、複数ノードのPodへマウントできるかを検証します。
                </p>
              </div>

              {/* Simulation Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  <span>要求Pod台数:</span>
                  <select
                    value={podCountToMount}
                    onChange={(e) => setPodCountToMount(Number(e.target.value))}
                    className="bg-transparent text-white font-bold"
                  >
                    <option value={1}>1台 (単一ノード)</option>
                    <option value={2}>2台 (異なる2ノードで同時)</option>
                    <option value={3}>3台 (複数ノード)</option>
                  </select>
                </div>

                <button
                  onClick={() => handleSimulateStorageMount(selectedStorageId, podCountToMount)}
                  className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>PVCマウント実行</span>
                </button>
              </div>
            </div>

            {/* Mount Status Result */}
            {storageMountStatus && (
              <div className={`mt-4 p-4 rounded-lg border ${
                storageMountStatus.success 
                  ? 'bg-emerald-950/20 border-emerald-800/60' 
                  : 'bg-red-950/20 border-red-800/60'
              }`}>
                <div className="text-xs font-bold leading-relaxed mb-3">
                  {storageMountStatus.message}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {storageMountStatus.nodeAllocations.map((alloc, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded border text-xs ${
                        alloc.status === 'Mounted'
                          ? 'bg-slate-900 border-emerald-700/60 text-emerald-300'
                          : 'bg-slate-900 border-red-700/60 text-red-300'
                      }`}
                    >
                      <div className="font-mono font-bold flex items-center justify-between">
                        <span>{alloc.podId}</span>
                        <span>{alloc.status === 'Mounted' ? '✅ 成功' : '❌ 競合'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Node: {alloc.node}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Manifest Preview: PVC & StorageClass */}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-1.5">
                  1. 開発者が発行する PersistentVolumeClaim (PVC)
                </span>
                <pre className="p-3.5 rounded-lg bg-slate-950 font-mono text-xs text-sky-300 border border-slate-800 overflow-x-auto leading-relaxed">
{`apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-app-pvc
spec:
  accessModes:
  - ${selectedStorage.accessModes[0]} # ${selectedStorage.multiNodeShareable ? '複数Pod共有OK' : '単一ノード専用'}
  storageClassName: ${selectedStorage.name}
  resources:
    requests:
      storage: ${pvcRequestedSize}Gi`}
                </pre>
              </div>

              <div>
                <span className="text-xs font-bold text-amber-300 block mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  試験最重要: {selectedStorage.storageBackend} の特性
                </span>
                <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-800/40 text-xs text-amber-200 leading-relaxed h-full">
                  <p className="font-semibold mb-2">{selectedStorage.examNote}</p>
                  <div className="pt-2 border-t border-amber-800/30 text-[11px] text-slate-300 space-y-1">
                    <div><strong>動的プロビジョニング (Dynamic Provisioning):</strong> PVを事前に管理者が手動作成しなくても、PVCが作成された瞬間にCSIドライバーがAzure上にDiskまたはFiles共有を自動作成して自動バインドします。</div>
                    <div><strong>ボリュームマウント:</strong> Podの `volumeMounts` にマウントパス (`/data`) を指定するだけで、コンテナ内のアプリからはローカルディレクトリとして透過的にアクセス可能です。</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: RBAC & Security (Role, ClusterRole, RoleBinding, ClusterRoleBinding) */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          {/* RBAC Concept Blueprint Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span>Kubernetes RBAC 4大構成要素のスコープ関係</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Kubernetesでは「権限定義 (Role / ClusterRole)」と「紐付け (RoleBinding / ClusterRoleBinding)」が厳密に分離されています。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-sky-800/50">
                <div className="font-mono font-bold text-sky-400 mb-1">Role</div>
                <div className="text-[11px] font-bold text-slate-200">Namespace スコープの権限定義</div>
                <p className="text-[11px] text-slate-400 mt-1">特定名前空間 (例: `dev`) 内の pods, services に対する get, create, delete などの操作を定義。</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-indigo-800/50">
                <div className="font-mono font-bold text-indigo-400 mb-1">ClusterRole</div>
                <div className="text-[11px] font-bold text-slate-200">クラスター全体 または 全Namespace</div>
                <p className="text-[11px] text-slate-400 mt-1">ノード (nodes) や PV などのクラスタレベルリソース、または全名前空間にまたがるリソース操作を定義。</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-emerald-800/50">
                <div className="font-mono font-bold text-emerald-400 mb-1">RoleBinding</div>
                <div className="text-[11px] font-bold text-slate-200">特定 Namespace 内での束縛</div>
                <p className="text-[11px] text-slate-400 mt-1">ユーザーやAzure ADグループに、そのNamespace内だけでRole(またはClusterRole)を付与。</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-purple-800/50">
                <div className="font-mono font-bold text-purple-400 mb-1">ClusterRoleBinding</div>
                <div className="text-[11px] font-bold text-slate-200">クラスター全体での束縛</div>
                <p className="text-[11px] text-slate-400 mt-1">クラスター全体の全Namespaceおよび非Namespaceリソースに対してClusterRoleを付与。</p>
              </div>
            </div>
          </div>

          {/* Interactive kubectl auth can-i Evaluator */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <span>対話型 `kubectl auth can-i` リアルタイム権限判定シミュレーター</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  実行主体 (User / Group / ServiceAccount) と対象Namespace、操作を選び、許可されるかを検証します。
                </p>
              </div>

              <button
                onClick={() => handleEvaluateRbac(selectedSubject, targetNamespace, testAction)}
                className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5" />
                <span>kubectl auth can-i 実行</span>
              </button>
            </div>

            {/* Test Configuration Selector */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">実行主体 (Principal):</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value);
                    setRbacEvaluationResult(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="dev-team@contoso.com">dev-team@contoso.com (開発者グループ)</option>
                  <option value="ci-cd-service-account">ci-cd-service-account (CI/CD ServiceAccount)</option>
                  <option value="sec-auditor@contoso.com">sec-auditor@contoso.com (セキュリティ監査員)</option>
                  <option value="infra-admin-group">infra-admin-group (クラスター運用管理者)</option>
                </select>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">対象 Namespace (-n):</label>
                <select
                  value={targetNamespace}
                  onChange={(e) => {
                    setTargetNamespace(e.target.value as any);
                    setRbacEvaluationResult(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="development">development (開発環境名前空間)</option>
                  <option value="production">production (本番環境名前空間)</option>
                </select>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">試行操作 (Verb & Resource):</label>
                <select
                  value={testAction}
                  onChange={(e) => {
                    setTestAction(e.target.value as any);
                    setRbacEvaluationResult(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                >
                  <option value="get-pods">get pods (Pod一覧の参照)</option>
                  <option value="create-pods">create pods / deployments (Pod作成)</option>
                  <option value="delete-nodes">delete nodes (クラスターノード削除)</option>
                  <option value="get-secrets">get secrets (機密情報参照)</option>
                </select>
              </div>
            </div>

            {/* CLI Command Preview */}
            <div className="mt-3 p-2.5 rounded bg-black/60 border border-slate-800 font-mono text-xs text-emerald-400">
              $ kubectl auth can-i {testAction.replace('-', ' ')} -n {targetNamespace} --as={selectedSubject}
            </div>

            {/* Evaluation Result Display */}
            {rbacEvaluationResult && (
              <div className={`mt-4 p-4 rounded-lg border ${
                rbacEvaluationResult.allowed
                  ? 'bg-emerald-950/20 border-emerald-800/60'
                  : 'bg-red-950/20 border-red-800/60'
              }`}>
                <div className="flex items-center gap-2 mb-1.5 font-bold text-sm">
                  {rbacEvaluationResult.allowed ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-emerald-300">yes (許可 - Allowed)</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-300">no (拒否 - Forbidden)</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-slate-200 leading-relaxed mb-2">
                  {rbacEvaluationResult.reason}
                </p>

                {rbacEvaluationResult.matchedRule && (
                  <div className="text-[11px] font-mono text-slate-400 bg-slate-900/80 p-2.5 rounded border border-slate-800">
                    <div>評価対象Role: <span className="text-sky-300">{rbacEvaluationResult.matchedRule.roleName} ({rbacEvaluationResult.matchedRule.roleKind})</span></div>
                    <div>束縛種別: <span className="text-white">{rbacEvaluationResult.matchedRule.bindingKind}</span></div>
                    <div>許可Verbs: <span className="text-emerald-300">[{rbacEvaluationResult.matchedRule.allowedVerbs.join(', ')}]</span></div>
                  </div>
                )}
              </div>
            )}

            {/* Entra ID & Workload Identity Best Practice */}
            <div className="mt-4 p-4 rounded-lg bg-indigo-950/20 border border-indigo-800/40 text-xs">
              <h4 className="font-bold text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-400" />
                AKS × Microsoft Entra ID (Azure AD) 統合 & Workload Identity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                <div>
                  <strong className="text-white block mb-1">Entra ID統合 (Azure RBAC vs K8s RBAC):</strong>
                  <span>AKSではEntra IDのセキュリティグループを直接Kubernetes RoleBinding / ClusterRoleBindingのSubjectに指定可能。社員の入退社に合わせてEntraグループを追加/除外するだけでkubectl権限が自動反映されます。</span>
                </div>
                <div>
                  <strong className="text-white block mb-1">Microsoft Entra Workload Identity:</strong>
                  <span>Pod内のコンテナがAzure Key VaultやBlob Storageにアクセスする際、シークレット文字列を埋め込まず、Kubernetes ServiceAccountとAzureマネージドIDをフェデレーション連携して安全にトークン取得します。</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
