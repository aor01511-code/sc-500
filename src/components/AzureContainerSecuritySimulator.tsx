import React, { useState } from 'react';
import { CONTAINER_PLATFORMS, ACR_SKUS } from '../data/azureSecData';
import { ContainerPlatformInfo, AcrSkuInfo, AciDeploymentConfig } from '../types/azureSec';
import { 
  Cpu, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Play, 
  Info, 
  Lock, 
  Key, 
  Server, 
  Workflow, 
  Globe, 
  FileCode, 
  Check, 
  Terminal,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface AzureContainerSecuritySimulatorProps {
  onNavigateToQuiz?: (topic: string) => void;
}

export const AzureContainerSecuritySimulator: React.FC<AzureContainerSecuritySimulatorProps> = ({ onNavigateToQuiz }) => {
  const [activeTab, setActiveTab] = useState<'platform-comparison' | 'aci-config' | 'acr-sku-sec' | 'image-security'>('platform-comparison');

  // Platform selection state
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('aci');
  const selectedPlatform = CONTAINER_PLATFORMS.find((p) => p.id === selectedPlatformId) || CONTAINER_PLATFORMS[0];

  // ACI Config state
  const [aciConfig, setAciConfig] = useState<AciDeploymentConfig>({
    containerGroupName: 'cg-order-processor',
    osType: 'Linux',
    cpuCores: 2,
    memoryGb: 4,
    restartPolicy: 'Always',
    ipAddressType: 'Private (VNet委任)',
    dnsNameLabel: 'order-api-prod',
    port: 8080,
    imageRegistry: 'Azure Container Registry (Private)',
    imageName: 'myacrprod.azurecr.io/order-service:v2.1',
    managedIdentity: true,
    secureEnvironmentVariables: true,
  });

  const [aciDeployStatus, setAciDeployStatus] = useState<string | null>(null);

  // ACR SKU state
  const [selectedAcrSku, setSelectedAcrSku] = useState<'Basic' | 'Standard' | 'Premium'>('Premium');
  const currentSku = ACR_SKUS.find((s) => s.sku === selectedAcrSku) || ACR_SKUS[2];

  // ACR Security toggles
  const [adminUserDisabled, setAdminUserDisabled] = useState<boolean>(true);
  const [privateEndpointEnabled, setPrivateEndpointEnabled] = useState<boolean>(true);
  const [contentTrustEnabled, setContentTrustEnabled] = useState<boolean>(true);

  // Image scan state
  const [imageScanned, setImageScanned] = useState<boolean>(false);
  const [remediated, setRemediated] = useState<boolean>(false);

  // Deploy ACI simulation
  const handleDeployAci = () => {
    setAciDeployStatus(`【コンテナグループ デプロイ成功】
・コンテナグループ名: ${aciConfig.containerGroupName} (同一ホスト内でネットワーク・ストレージを共有)
・ネットワーク: ${aciConfig.ipAddressType} (サブネット委任: Microsoft.ContainerInstance/containerGroups)
・認証方式: ${aciConfig.managedIdentity ? 'システム割り当てマネージドID (AcrPull ロール適用・認証情報埋め込みゼロ)' : 'ACR管理者アカウント'}
・環境変数: ${aciConfig.secureEnvironmentVariables ? 'SecureValue (ポータルやCLIから値が隠蔽される安全なシークレット)' : '平文環境変数'}
・ステータス: Running (秒単位で即座にプロビジョニング完了)`);
  };

  // 1-Click Demo Missions
  const triggerMission = (mission: 'aci-deploy' | 'acr-premium' | 'image-cve' | 'aca-compare' | 'managed-id-pull') => {
    if (mission === 'aci-deploy') {
      setActiveTab('aci-config');
      setAciConfig((prev) => ({
        ...prev,
        ipAddressType: 'Private (VNet委任)',
        managedIdentity: true,
        secureEnvironmentVariables: true,
      }));
      setTimeout(() => handleDeployAci(), 50);
    } else if (mission === 'acr-premium') {
      setActiveTab('acr-sku-sec');
      setSelectedAcrSku('Premium');
      setPrivateEndpointEnabled(true);
      setContentTrustEnabled(true);
    } else if (mission === 'image-cve') {
      setActiveTab('image-security');
      setImageScanned(true);
      setRemediated(false);
    } else if (mission === 'aca-compare') {
      setActiveTab('platform-comparison');
      setSelectedPlatformId('aca');
    } else if (mission === 'managed-id-pull') {
      setActiveTab('acr-sku-sec');
      setAdminUserDisabled(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>コンテナー基盤 & マイクロサービス & コンテナセキュリティ</span>
              <span>·</span>
              <span>SC-300 / SC-500 / AZ-500 対策</span>
              <span>·</span>
              <span>ACI & AKS & ACA & ACR SKU & Defender for Containers</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Azure コンテナー基盤 & ACR セキュリティ・ACI 構成検証スタジオ
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              ACI、AKS、Container Apps (ACA)、Web App for Containersの実行基盤比較、ACIコンテナグループのVNet委任・シークレット環境変数、ACRのSKU選定 (Basic/Standard/Premium) とPrivate Link、Defenderによる脆弱性スキャンを検証します。
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
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">② コンテナ構成やSKU切り替えを実行</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">③ セキュリティ仕様 & 試験頻出の判定理由を確認</span>
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
              onClick={() => triggerMission('aci-deploy')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ACI コンテナグループ作成</div>
                <div className="text-[10px] text-sky-400 font-medium">VNet委任 + マネージドIDプル</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('acr-premium')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-indigo-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-indigo-950 border border-indigo-700 text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ACR Premium SKU 判定</div>
                <div className="text-[10px] text-indigo-400 font-medium">Geoレプリケーション/Private Link</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('managed-id-pull')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ACR 安全プル (Admin無効)</div>
                <div className="text-[10px] text-emerald-400 font-medium">マネージドIDでAcrPull権限付与</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('image-cve')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">イメージ脆弱性検知</div>
                <div className="text-[10px] text-rose-400 font-medium">Defender for Containers スキャン</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('aca-compare')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Container Apps (ACA) 選定</div>
                <div className="text-[10px] text-amber-400 font-medium">KEDAゼロスケール & Dapr連携</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('platform-comparison')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'platform-comparison'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>1. コンテナ実行基盤の比較 & 選択基準</span>
        </button>

        <button
          onClick={() => setActiveTab('aci-config')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'aci-config'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>2. ACI (Container Instances) 構成 & セキュリティ</span>
        </button>

        <button
          onClick={() => setActiveTab('acr-sku-sec')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'acr-sku-sec'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>3. ACR SKU機能差 & プライベートアクセス</span>
        </button>

        <button
          onClick={() => setActiveTab('image-security')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'image-security'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>4. コンテナイメージの安全性 (Defender & タスク)</span>
        </button>
      </div>

      {/* TAB 1: Platform Comparison */}
      {activeTab === 'platform-comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3">
            <span className="font-bold text-slate-300 text-xs">コンテナ基盤一覧 (選択して仕様確認):</span>
            <div className="space-y-1.5">
              {CONTAINER_PLATFORMS.map((plat) => (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatformId(plat.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                    selectedPlatformId === plat.id
                      ? 'bg-sky-950/60 border-sky-500 text-white ring-1 ring-sky-500/40'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{plat.nameJa}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-sky-400">
                      {plat.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 truncate">用途: {plat.idealUseCases}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white">{selectedPlatform.nameJa}</h3>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-400 font-mono text-[11px]">
                  管理負荷: {selectedPlatform.managementOverhead}
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">最適なユースケース:</span>
                  <span className="font-semibold text-slate-200">{selectedPlatform.idealUseCases}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">起動速度:</span>
                    <span className="font-semibold text-emerald-400">{selectedPlatform.startupTime}</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block mb-0.5">スケーリング方式:</span>
                    <span className="font-semibold text-sky-300">{selectedPlatform.scalingModel}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block mb-0.5">セキュリティ分離方式:</span>
                  <span className="font-semibold text-indigo-300">{selectedPlatform.securityIsolation}</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded border border-amber-800/40 text-[11px] text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>試験頻出ポイント:</span>
                </div>
                <p className="leading-relaxed">
                  {selectedPlatform.examHighlight}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACI Configuration */}
      {activeTab === 'aci-config' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">ACI コンテナグループ構成サンドボックス</span>
                <span className="text-sky-400 font-mono">サーバーレスコンテナ</span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">コンテナグループ名:</label>
                <input
                  type="text"
                  value={aciConfig.containerGroupName}
                  onChange={(e) => setAciConfig({ ...aciConfig, containerGroupName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">CPU コア数:</label>
                  <select
                    value={aciConfig.cpuCores}
                    onChange={(e) => setAciConfig({ ...aciConfig, cpuCores: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value={1}>1 vCPU</option>
                    <option value={2}>2 vCPU (推奨)</option>
                    <option value={4}>4 vCPU</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">メモリ (GB):</label>
                  <select
                    value={aciConfig.memoryGb}
                    onChange={(e) => setAciConfig({ ...aciConfig, memoryGb: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-200"
                  >
                    <option value={2}>2 GB</option>
                    <option value={4}>4 GB (推奨)</option>
                    <option value={8}>8 GB</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">ネットワーク割り当て (IP種類):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAciConfig({ ...aciConfig, ipAddressType: 'Private (VNet委任)' })}
                    className={`p-2 rounded border font-bold text-center ${
                      aciConfig.ipAddressType.includes('Private')
                        ? 'bg-emerald-950 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Private (VNet委任・推奨)
                  </button>
                  <button
                    onClick={() => setAciConfig({ ...aciConfig, ipAddressType: 'Public' })}
                    className={`p-2 rounded border font-bold text-center ${
                      aciConfig.ipAddressType === 'Public'
                        ? 'bg-amber-950 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Public (パブリックIP公開)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">マネージドID (Managed Identity) の割り当て:</div>
                    <div className="text-[10px] text-slate-400">ACRからのイメージプルおよびKey Vaultアクセスに利用</div>
                  </div>
                  <button
                    onClick={() => setAciConfig({ ...aciConfig, managedIdentity: !aciConfig.managedIdentity })}
                    className={`px-2.5 py-1 rounded font-bold text-xs ${
                      aciConfig.managedIdentity ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {aciConfig.managedIdentity ? '有効 (推奨)' : '無効'}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">保護された環境変数 (Secure Environment Variables):</div>
                    <div className="text-[10px] text-slate-400">APIキーやDB接続文字列をポータルから見えないように保護</div>
                  </div>
                  <button
                    onClick={() => setAciConfig({ ...aciConfig, secureEnvironmentVariables: !aciConfig.secureEnvironmentVariables })}
                    className={`px-2.5 py-1 rounded font-bold text-xs ${
                      aciConfig.secureEnvironmentVariables ? 'bg-emerald-800 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {aciConfig.secureEnvironmentVariables ? '有効 (SecureValue)' : '無効'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleDeployAci}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>ACI コンテナグループをプロビジョニング</span>
              </button>

              {aciDeployStatus && (
                <div className="p-4 rounded-lg border bg-slate-950 border-emerald-600/70 text-slate-200 text-xs whitespace-pre-line leading-relaxed font-mono">
                  {aciDeployStatus}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最頻出】ACI コンテナグループの概念</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">コンテナグループ (Container Group):</strong>
                  Kubernetesの「Pod」に相当する概念。同一グループ内の複数のコンテナは、同一ホスト上で実行され、同じライフサイクル、ローカルネットワーク(localhost)、ストレージボリュームを共有します（例: メインアプリ + ロギング収集サイドカー）。
                </li>
                <li>
                  <strong className="text-emerald-300">VNetサブネット委任:</strong>
                  ACIをプライベートVNetに配置する場合、そのサブネットは「Microsoft.ContainerInstance/containerGroups」に委任されている必要があります。他のタイプのリソース(VM等)を同じサブネットに混在させることはできません。
                </li>
                <li>
                  <strong className="text-amber-300">SecureValue:</strong>
                  コンテナの環境変数にパスワードを指定する場合、`secureValue`属性を指定すると、作成後ポータルやARMテンプレートの出力結果で値が隠蔽され、漏洩を防ぐことができます。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ACR SKU & Security */}
      {activeTab === 'acr-sku-sec' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Azure Container Registry (ACR) SKU選定</span>
                <span className="text-sky-400 font-mono">プライベートレジストリ</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['Basic', 'Standard', 'Premium'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedAcrSku(s)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      selectedAcrSku === s
                        ? 'bg-sky-950/60 border-sky-500 text-white ring-1 ring-sky-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-sm">{s}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {s === 'Basic' ? '開発用' : s === 'Standard' ? '標準本番' : '最高機能'}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">ストレージ容量:</span>
                  <span className="font-bold text-white">{currentSku.storageLimitGb} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Geoレプリケーション (マルチリージョン複製):</span>
                  <span className={`font-bold ${currentSku.geoReplication ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {currentSku.geoReplication ? '○ 対応 (Premium必須)' : '✕ 非対応'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Private Link (プライベートエンドポイント):</span>
                  <span className={`font-bold ${currentSku.privateLinkSupport ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {currentSku.privateLinkSupport ? '○ 対応 (Premium必須)' : '✕ 非対応'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">コンテンツの信頼性 (Content Trust / イメージ署名):</span>
                  <span className={`font-bold ${currentSku.contentTrustSupport ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {currentSku.contentTrustSupport ? '○ 対応 (Premium必須)' : '✕ 非対応'}
                  </span>
                </div>
              </div>

              {/* Security controls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">管理者ユーザー (Admin User) アカウント:</div>
                    <div className="text-[10px] text-slate-400">単一パスワードによる認証（本番では無効化推奨）</div>
                  </div>
                  <button
                    onClick={() => setAdminUserDisabled(!adminUserDisabled)}
                    className={`px-2.5 py-1 rounded font-bold text-xs ${
                      adminUserDisabled ? 'bg-emerald-800 text-white' : 'bg-rose-800 text-white'
                    }`}
                  >
                    {adminUserDisabled ? '無効 (ベストプラクティス)' : '有効 (非推奨)'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最重要】ACR のセキュリティ推奨事項</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-rose-300">管理者ユーザー(Admin Account)の無効化:</strong>
                  ACR作成直後の管理者ユーザーは共有パスワード認証であり、漏洩リスクがあります。本番環境では必ず無効化し、AKSやACIには「マネージドID (AcrPull ロール)」または「サービスプリンシパル」を使用します。
                </li>
                <li>
                  <strong className="text-sky-300">Premium SKU が必須となる3大要件:</strong>
                  試験で「複数リージョンへの自動イメージ複製 (Geo-replication)」「VNet経由の閉域Private Linkアクセス」「Docker Content Trustによる署名済みイメージのみプル許可」が登場した場合、正解は必ず **Premium SKU** です。
                </li>
                <li>
                  <strong className="text-indigo-300">リポジトリとアーティファクト:</strong>
                  レジストリの中に複数のリポジトリ(例: web-front, order-api)があり、その中にタグ付きアーティファクト(OCIイメージやHelmチャート)が保存されます。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Image Security & Defender */}
      {activeTab === 'image-security' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">コンテナイメージの脆弱性検査 & 自動パッチ</span>
                <span className="text-rose-400 font-mono">Defender for Containers</span>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-1">
                <div className="text-slate-400">検査対象コンテナイメージ:</div>
                <div className="font-mono text-white font-bold">myacrprod.azurecr.io/webfrontend:v1.2</div>
              </div>

              <button
                onClick={() => {
                  setImageScanned(true);
                  setRemediated(false);
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Defender for Containers による脆弱性スキャンを実行</span>
              </button>

              {imageScanned && (
                <div className="space-y-3">
                  <div className={`p-4 rounded-lg border space-y-2 text-xs ${
                    remediated
                      ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-600 text-rose-200'
                  }`}>
                    <div className="font-bold flex items-center gap-1.5 text-sm">
                      {remediated ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                      <span>
                        {remediated
                          ? '✓ 脆弱性が修正され、安全なイメージとして承認されました'
                          : '✕ 重大なCVE脆弱性 (CVE-2021-44228 Log4Shell) を検出'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {remediated
                        ? 'ACR Tasks がベースOSイメージの更新を検知し、安全なパッチ適用済みバージョンに自動リビルドしました。'
                        : 'ベースOSイメージおよびJavaライブラリに未パッチの重大なリモートコード実行(RCE)脆弱性が含まれています。このイメージの本番AKSへのデプロイをブロックすることが推奨されます。'}
                    </p>
                  </div>

                  {!remediated && (
                    <button
                      onClick={() => setRemediated(true)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded transition-colors"
                    >
                      ACR Tasks で最新ベースイメージから自動リビルド (修復)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最頻出】コンテナサプライチェーンセキュリティ</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">エージェントレススキャン:</strong>
                  Defender for Containers は、ACRにイメージがプッシュされた瞬間に、VMエージェントを介さずクラウド側で直接イメージレイヤーをスキャンします。
                </li>
                <li>
                  <strong className="text-emerald-300">ACR Tasks (ベースイメージ自動更新):</strong>
                  親イメージ(例: node:alpine, ubuntu)にセキュリティ更新パッチが当たった際、Webhookやタイマーを介して子アプリケーションイメージを自動的に再ビルドするタスク機能。
                </li>
                <li>
                  <strong className="text-amber-300">CI/CD デプロイゲート:</strong>
                  Azure PipelinesやGitHub Actionsで、Defenderのスキャン結果に重大脆弱性が残っている場合はAKSへのデプロイパイプラインを自動失敗させるゼロトラスト統制。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
