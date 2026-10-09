import React, { useState } from 'react';
import { ENDPOINT_MGMT_TOPICS } from '../data/azureSecData';
import { 
  Laptop, 
  Layers, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Play, 
  Info, 
  Lock, 
  Key, 
  Terminal, 
  RefreshCw, 
  Server, 
  Sliders, 
  ExternalLink,
  Cpu,
  Workflow
} from 'lucide-react';

interface AzureEndpointUpdateSimulatorProps {
  onNavigateToQuiz?: (topic: string) => void;
}

export const AzureEndpointUpdateSimulator: React.FC<AzureEndpointUpdateSimulatorProps> = ({ onNavigateToQuiz }) => {
  const [activeTab, setActiveTab] = useState<'autopilot' | 'bastion' | 'ade' | 'update-dsc' | 'comanagement'>('autopilot');

  // Autopilot State
  const [autopilotMode, setAutopilotMode] = useState<'user-driven' | 'self-deploying' | 'pre-provisioned'>('user-driven');
  const [hardwareHashEnrolled, setHardwareHashEnrolled] = useState<boolean>(true);
  const [autopilotProgress, setAutopilotProgress] = useState<'idle' | 'running' | 'completed'>('idle');

  // Bastion State
  const [bastionSubnetConfigured, setBastionSubnetConfigured] = useState<boolean>(true);
  const [vmPublicIp, setVmPublicIp] = useState<boolean>(false);
  const [bastionSessionStatus, setBastionSessionStatus] = useState<string | null>(null);

  // ADE State
  const [keyVaultLinked, setKeyVaultLinked] = useState<boolean>(true);
  const [useKek, setUseKek] = useState<boolean>(true);
  const [encryptionStatus, setEncryptionStatus] = useState<'unencrypted' | 'encrypting' | 'encrypted'>('unencrypted');

  // DSC Drift State
  const [driftDetected, setDriftDetected] = useState<boolean>(false);
  const [lcmMode, setLcmMode] = useState<'ApplyAndAutoCorrect' | 'ApplyAndMonitor'>('ApplyAndAutoCorrect');
  const [dscLog, setDscLog] = useState<string | null>(null);

  // Co-management workload slider (0: SCCM, 1: Pilot Intune, 2: Intune)
  const [updateWorkload, setUpdateWorkload] = useState<number>(2);

  // Run Autopilot simulation
  const handleRunAutopilot = () => {
    setAutopilotProgress('running');
    setTimeout(() => {
      setAutopilotProgress('completed');
    }, 600);
  };

  // Run Bastion connection test
  const handleConnectBastion = () => {
    if (!bastionSubnetConfigured) {
      setBastionSessionStatus('【接続エラー】仮想ネットワークに「AzureBastionSubnet」(/26以上) が存在しないため、Bastionインスタンスをデプロイできません。');
      return;
    }
    setBastionSessionStatus('【ブラウザRDPセッション確立成功】クライアントからHTTPS (ポート443) 経由でAzure Bastionに接続し、パブリックIPを持たないプライベートVM (10.0.1.4:3389) へのセキュアなHTML5 RDP画面が開きました！インターネットからのポート露出はゼロです。');
  };

  // Run ADE test
  const handleRunEncryption = () => {
    if (!keyVaultLinked) {
      alert('Azure Key Vault とのアクセス権限が必要です');
      return;
    }
    setEncryptionStatus('encrypting');
    setTimeout(() => {
      setEncryptionStatus('encrypted');
    }, 500);
  };

  // Run DSC drift simulation
  const handleSimulateDrift = () => {
    setDriftDetected(true);
    if (lcmMode === 'ApplyAndAutoCorrect') {
      setDscLog('【構成ドリフト検知 ➔ 自動修復完了】管理者が手動でWebサーバーのポートを変更しましたが、Local Configuration Manager (LCM) がDSCマニフェストとの差異を検知し、即座に正しい状態(ポート8080)に書き戻しました！');
    } else {
      setDscLog('【構成ドリフト検知 ➔ 警告ログ記録のみ】LCMモードが「ApplyAndMonitor」のため、不正な変更を検知しましたが自動修復は行われませんでした。');
    }
  };

  // 1-Click Demo Missions
  const triggerMission = (mission: 'autopilot-oobe' | 'bastion-connect' | 'ade-encrypt' | 'dsc-drift' | 'comgmt-shift') => {
    if (mission === 'autopilot-oobe') {
      setActiveTab('autopilot');
      setAutopilotMode('user-driven');
      setHardwareHashEnrolled(true);
      setTimeout(() => handleRunAutopilot(), 50);
    } else if (mission === 'bastion-connect') {
      setActiveTab('bastion');
      setVmPublicIp(false);
      setBastionSubnetConfigured(true);
      setTimeout(() => handleConnectBastion(), 50);
    } else if (mission === 'ade-encrypt') {
      setActiveTab('ade');
      setKeyVaultLinked(true);
      setUseKek(true);
      setTimeout(() => handleRunEncryption(), 50);
    } else if (mission === 'dsc-drift') {
      setActiveTab('update-dsc');
      setLcmMode('ApplyAndAutoCorrect');
      setTimeout(() => handleSimulateDrift(), 50);
    } else if (mission === 'comgmt-shift') {
      setActiveTab('comanagement');
      setUpdateWorkload(2);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>エンドポイント管理 & 更新・構成管理 & ホスト暗号化</span>
              <span>·</span>
              <span>SC-300 / SC-500 / AZ-500 対策</span>
              <span>·</span>
              <span>Intune & Autopilot & Bastion & Update & ADE</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Microsoft Intune & Azure Bastion & 更新管理・ADE 検証スタジオ
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Windows Autopilotのゼロタッチ展開、Azure BastionによるプライベートRDP、Azure Disk Encryption (BitLocker/Key Vault)、DSC構成ドリフト自動修復、SCCMとIntuneの共同管理をリアルタイムに体験します。
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
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">② シミュレーション実行ボタンをクリック</span>
            <span>➔</span>
            <span className="px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700 font-bold">③ 実行ログ & 試験頻出の技術仕様を確認</span>
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
              onClick={() => triggerMission('autopilot-oobe')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Autopilot ゼロタッチ展開</div>
                <div className="text-[10px] text-sky-400 font-medium">OOBEから自動キッティング</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('bastion-connect')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Azure Bastion ブラウザ接続</div>
                <div className="text-[10px] text-emerald-400 font-medium">パブリックIP不要でRDP</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('ade-encrypt')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Azure Disk Encryption</div>
                <div className="text-[10px] text-amber-400 font-medium">BitLocker + Key Vault暗号化</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('dsc-drift')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">DSC 構成ドリフト自己修復</div>
                <div className="text-[10px] text-rose-400 font-medium">不正変更をLCMが自動是正</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('comgmt-shift')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-indigo-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-indigo-950 border border-indigo-700 text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0">5</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">共同管理 (Co-management)</div>
                <div className="text-[10px] text-indigo-400 font-medium">SCCMからIntuneへスライダー移行</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('autopilot')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'autopilot'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Laptop className="w-3.5 h-3.5" />
          <span>1. Windows Autopilot (OOBE展開)</span>
        </button>

        <button
          onClick={() => setActiveTab('bastion')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'bastion'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>2. Azure Bastion vs ジャンプボックス</span>
        </button>

        <button
          onClick={() => setActiveTab('ade')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'ade'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>3. Azure Disk Encryption (ADE)</span>
        </button>

        <button
          onClick={() => setActiveTab('update-dsc')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'update-dsc'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>4. 更新管理 (WSUS/Update) & DSC ドリフト</span>
        </button>

        <button
          onClick={() => setActiveTab('comanagement')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'comanagement'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>5. 共同管理 & Desktop Analytics</span>
        </button>
      </div>

      {/* TAB 1: Windows Autopilot */}
      {activeTab === 'autopilot' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Autopilot プロファイル構成サンドボックス</span>
                <span className="text-sky-400 font-mono">ゼロタッチプロビジョニング</span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">展開プロファイルの種類:</label>
                <div className="space-y-1.5">
                  {[
                    { id: 'user-driven' as const, label: 'ユーザー主導モード (User-Driven)', desc: '社員が自ら会社のUPN/パスワードを入力してEntra参加＆初期設定' },
                    { id: 'self-deploying' as const, label: '自己展開モード (Self-Deploying)', desc: 'TPM 2.0を利用し、ユーザーのサインインなしでキオスク/共有PC化' },
                    { id: 'pre-provisioned' as const, label: '事前プロビジョニング (Pre-provisioned / 旧White Glove)', desc: 'IT管理者や調達ベンダーがOSや大容量アプリを事前インストールして配送' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setAutopilotMode(m.id);
                        setAutopilotProgress('idle');
                      }}
                      className={`w-full text-left p-2.5 rounded border transition-colors ${
                        autopilotMode === m.id
                          ? 'bg-sky-950/60 border-sky-500 text-white ring-1 ring-sky-500/40'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold">{m.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800">
                <div>
                  <div className="font-semibold text-slate-200">ハードウェアハッシュ (Hardware Hash) の登録:</div>
                  <div className="text-[10px] text-slate-400">マザーボード固有のハッシュ値を事前にIntuneへ登録済み</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                  登録済 (4k-csv)
                </span>
              </div>

              <button
                onClick={handleRunAutopilot}
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Autopilot OOBE 起動シミュレーションを実行</span>
              </button>

              {autopilotProgress !== 'idle' && (
                <div className={`p-4 rounded-lg border space-y-2 text-xs ${
                  autopilotProgress === 'completed'
                    ? 'bg-emerald-950/40 border-emerald-600 text-emerald-200'
                    : 'bg-sky-950/40 border-sky-600 text-sky-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Autopilot 登録・セットアップ完了 (ESP画面通過)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    1. ハードウェアハッシュ照合 ➔ 2. Microsoft Entra 参加 (Azure AD Join) ➔ 3. Intune MDM登録 ➔ 4. セキュリティベースラインポリシー適用 ➔ 5. M365 Apps (Word/Excel) 自動インストールが完了し、デスクトップ画面が立ち上がりました！
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最頻出】Windows Autopilot の仕様</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">カスタムイメージ再作成が不要:</strong>
                  従来のSysprepやWIMカスタムイメージによる重厚なOS再インストールではなく、OEMの工場出荷時クリーンOSをそのまま利用してクラウドから設定を流し込みます。
                </li>
                <li>
                  <strong className="text-indigo-300">ESP (登録ステータスページ):</strong>
                  必要なポリシーや業務アプリのインストールが完了するまで、ユーザーにデスクトップ操作を許可せずブロックする進捗画面。
                </li>
                <li>
                  <strong className="text-amber-300">Autopilot Reset:</strong>
                  既存端末を初期化し、即座に新しい社員向けにビジネス対応状態へリセット可能。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Azure Bastion */}
      {activeTab === 'bastion' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Azure Bastion セキュアRDP接続テスト</span>
                <span className="text-emerald-400 font-mono">PaaSマネージド踏み台</span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span>対象VMのパブリックIPアドレス:</span>
                  <span className="font-bold text-emerald-400">なし (完全プライベート 10.0.1.4)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span>必須サブネット名 (必須予約名):</span>
                  <span className="font-mono font-bold text-sky-400">AzureBastionSubnet (/26以上)</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <span>クライアントからのインバウンド要件:</span>
                  <span className="font-bold text-emerald-400">HTTPS (TCP 443) のみ</span>
                </div>
              </div>

              <button
                onClick={handleConnectBastion}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Azure Portal から Bastion RDP 接続を実行</span>
              </button>

              {bastionSessionStatus && (
                <div className="p-4 rounded-lg border bg-slate-950 border-emerald-600/70 text-slate-200 text-xs space-y-2">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>セッション確立</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {bastionSessionStatus}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最頻出】Azure Bastion vs ジャンプボックス</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">パブリックIPの完全排除:</strong>
                  ジャンプボックス(IaaS VM)は自前のパブリックIPやポート開放が必要で攻撃対象(アタックサーフェス)になりやすいのに対し、BastionはMicrosoft管理のPaaSであり、VM側のパブリックIPやNSG穴あけは不要。
                </li>
                <li>
                  <strong className="text-amber-300">サブネット要件の厳格さ:</strong>
                  サブネット名は必ず大文字小文字を含め「AzureBastionSubnet」でなければならず、サブネットプレフィックスは「/26以上」(/26, /25等) が必須です。
                </li>
                <li>
                  <strong className="text-indigo-300">エージェントレス:</strong>
                  対象のWindows/Linux VMに特別なエージェントやクライアントソフトウェアを追加インストールする必要はありません。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Azure Disk Encryption (ADE) */}
      {activeTab === 'ade' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Azure Disk Encryption (ADE) 構成テスト</span>
                <span className="text-amber-400 font-mono">BitLocker / DM-Crypt</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">Azure Key Vault 連携:</div>
                    <div className="text-[10px] text-slate-400">「ディスク暗号化用のAzure仮想マシン」アクセス許可</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-800">
                    有効 (kv-prod-sec)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
                  <div>
                    <div className="font-semibold text-slate-200">キー暗号化キー (KEK: Key Encryption Key):</div>
                    <div className="text-[10px] text-slate-400">BitLockerキー(BEK)をRSAキーでさらにラップ暗号化</div>
                  </div>
                  <button
                    onClick={() => setUseKek(!useKek)}
                    className={`px-2.5 py-1 rounded font-bold text-xs ${
                      useKek ? 'bg-amber-800 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {useKek ? 'KEK 二重保護有効' : 'BEK 単体'}
                  </button>
                </div>
              </div>

              <button
                onClick={handleRunEncryption}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>OSディスク & データディスク暗号化を開始</span>
              </button>

              {encryptionStatus === 'encrypted' && (
                <div className="p-4 rounded-lg border bg-emerald-950/40 border-emerald-600 text-emerald-200 text-xs space-y-2">
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>BitLocker 暗号化完了 (ADE ステータス: Encrypted)</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    OSディスク(Cドライブ)およびデータディスク(Fドライブ)がBitLockerにより暗号化されました。暗号化キー(BEK)はKey Vault内に格納され、VM起動時にマネージドID/Key Vault連携により自動アンロックされます。
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最重要】ADE vs SSE (ストレージ側暗号化)</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">サーバー側暗号化 (SSE):</strong>
                  Azureストレージ基盤が透過的に実施するデフォルトの暗号化。VMのCPUやOSには負荷がかかりませんが、OS内部からは暗号化を意識できません。
                </li>
                <li>
                  <strong className="text-amber-300">Azure Disk Encryption (ADE):</strong>
                  VMのゲストOS内でBitLocker (Windows) または DM-Crypt (Linux) を実行して暗号化。メモリからディスクへの書き込み時に常に暗号化されるため、より厳格なコンプライアンス要件に合致します。
                </li>
                <li>
                  <strong className="text-rose-300">Key Vaultの必須設定:</strong>
                  Key Vaultのアクセス構成で「ディスク暗号化用の Azure Virtual Machines (Azure Disk Encryption for volume encryption)」にチェックが入っていないとエラーになります。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Update Management & DSC */}
      {activeTab === 'update-dsc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Desired State Configuration (DSC) 構成ドリフト自己修復</span>
                <span className="text-sky-400 font-mono">LCM (Local Configuration Manager)</span>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">LCM の動作モード:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setLcmMode('ApplyAndAutoCorrect')}
                    className={`p-2 rounded border font-bold text-center ${
                      lcmMode === 'ApplyAndAutoCorrect'
                        ? 'bg-emerald-950 border-emerald-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ApplyAndAutoCorrect (自動是正・推奨)
                  </button>
                  <button
                    onClick={() => setLcmMode('ApplyAndMonitor')}
                    className={`p-2 rounded border font-bold text-center ${
                      lcmMode === 'ApplyAndMonitor'
                        ? 'bg-amber-950 border-amber-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    ApplyAndMonitor (検知のみ)
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded border border-slate-800 text-slate-300 text-[11px] space-y-1">
                <div>正規DSCマニフェスト: <strong className="text-emerald-300">WebPort = 8080 (IIS Web サーバー)</strong></div>
                <div>現在のOS状態: <strong className={driftDetected ? 'text-rose-400 font-bold' : 'text-emerald-400'}>{driftDetected ? '不正変更 (WebPort = 9999)' : '正常準拠 (WebPort = 8080)'}</strong></div>
              </div>

              <button
                onClick={handleSimulateDrift}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>構成ドリフト(不正な手動変更)を発生させLCMで検査</span>
              </button>

              {dscLog && (
                <div className="p-4 rounded-lg border bg-slate-950 border-sky-600/70 text-slate-200 text-xs space-y-1">
                  <div className="font-bold text-sky-300">LCM 実行結果:</div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {dscLog}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white text-sm">【試験最頻出】Azure Update Management & WSUS</span>
              <ul className="space-y-2.5 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">Azure Update Manager (最新):</strong>
                  エージェントレス(MMA/Log Analyticsエージェント不要)でAzureリソースマネージャーの制御プレーンから直接VMのパッチ評価とスケジュール更新を実行。
                </li>
                <li>
                  <strong className="text-indigo-300">従来のUpdate Management (Automation Account):</strong>
                  Azure Automation AccountとLog Analytics Workspace、MMAエージェントを使用してオンプレミスやAWS VMも一元管理。
                </li>
                <li>
                  <strong className="text-amber-300">WSUS (Windows Server Update Services):</strong>
                  社内に配置したWSUSサーバーから承認済みパッチのみを取得するようにグループポリシーで構成し、帯域節約と事前検証を両立。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Co-management & Desktop Analytics */}
      {activeTab === 'comanagement' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-6 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-sky-400" />
              <span>共同管理 (Co-management) ワークロード移行スライダー</span>
            </h3>
            <p className="text-slate-400 mt-0.5">
              既存のオンプレミスConfiguration Manager (SCCM) からクラウドIntuneへ、ワークロード単位で段階的に権限を移行します。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
              <span className="font-bold text-white text-sm">「更新プログラム ポリシー」の管理権限スライダー</span>
              
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="2"
                  value={updateWorkload}
                  onChange={(e) => setUpdateWorkload(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span className={updateWorkload === 0 ? 'text-sky-400' : ''}>Configuration Manager (オンプレ)</span>
                  <span className={updateWorkload === 1 ? 'text-amber-400' : ''}>パイロット Intune (テスト端末)</span>
                  <span className={updateWorkload === 2 ? 'text-emerald-400' : ''}>Intune (完全クラウド)</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1">
                <div className="font-bold text-white">現在の動作:</div>
                <div className="text-[11px] text-slate-300">
                  {updateWorkload === 0 && 'Windows Updateの配信は社内SCCM / WSUSによって制御されています。'}
                  {updateWorkload === 1 && '指定されたパイロットコレクションのデバイスのみ、IntuneのWindows品質更新プログラムポリシーが適用されます。'}
                  {updateWorkload === 2 && '全デバイスの更新管理がクラウドIntuneに完全移行され、テレワーク環境でも直接クラウドから安全にパッチが適用されます。'}
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <span className="font-bold text-white text-sm">Desktop Analytics & テナントアタッチ</span>
              <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong className="text-sky-300">Desktop Analytics:</strong>
                  組織全体のWindows PCの診断データ(テレメトリ)を分析し、Windows 11へのアップグレード互換性、ドライバの競合、キラーアプリの動作可否をAI判定。
                </li>
                <li>
                  <strong className="text-indigo-300">テナントアタッチ (Tenant Attach):</strong>
                  SCCMのデバイスインベントリをクラウドのIntune管理センターへ同期。IT管理者は単一のブラウザ画面からオンプレPCに対しても「マルウェアスキャン」「再起動」などのアクションを即座に指示可能。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
