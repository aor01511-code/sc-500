import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  Layers, 
  Network,
  Lightbulb
} from 'lucide-react';
import { PurviewDomain } from '../types/purview';

interface PortalTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: PurviewDomain) => void;
}

export const PortalTourModal: React.FC<PortalTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
}) => {
  const [step, setStep] = useState<number>(0);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: '🎯 シミュレーターの使い方 (迷ったらここを読む！)',
      domain: null,
      desc: 'このサイトは、Microsoft Entra ID (Azure AD) や Purview の「設定すると実際にどう動くのか」をボタンを押して体験できる学習ツールです。教科書を読むだけではイメージしづらい権限拒否や障害時の挙動がすぐに分かります。',
      highlights: [
        '【最速の遊び方】各画面の上部にある「🚀 1クリックで試す」ボタンを押すだけ！',
        '設定が自動で切り替わり、成功/失敗の理由が画面中央に大きく表示されます。',
        '手動でロールや条件を変えて「自分だけのテスト」を行うことも可能です。',
      ],
    },
    {
      title: 'Lab 1: Entra ID ロール権限 & パスワードリセット',
      domain: 'entra-roles' as PurviewDomain,
      desc: '「ヘルプデスク管理者は一般社員をリセットできるが、ユーザー管理者はリセットできない」など、試験頻出の権限階層を体験します。',
      highlights: [
        '画面上部の「ヘルプデスク ➔ ユーザー管理者リセット」ボタンを押してみてください。',
        '「403 権限不足 (拒否)」と判定され、なぜ拒否されたのかの解説が出ます。',
        '左側でロールを「ユーザー管理者」に変えると、今度はリセットできるようになります！',
      ],
    },
    {
      title: 'Lab 2: ハイブリッドID & AADC 同期 (PHS vs PTA)',
      domain: 'hybrid-id' as PurviewDomain,
      desc: 'オンプレミスADとクラウドの認証連携です。オンプレミスの回線が切れた時に、どの方式ならクラウドで仕事が続けられるかをテストします。',
      highlights: [
        '「オンプレ全停止 ➔ PHSでログイン」を押すと、クラウド単体で認証成功！',
        '「オンプレ全停止 ➔ PTA」を押すと、社内エージェント不通で完全失敗！',
        'パスワードライトバックで、クラウド変更が1秒でオンプレへ戻る様子も確認できます。',
      ],
    },
    {
      title: 'Lab 3: ライセンスによって実現できるもの (Free / P1 / P2)',
      domain: 'entra-licenses' as PurviewDomain,
      desc: '条件付きアクセス (P1必須)、Identity Protection (P2必須)、PIM (P2必須) の違いを実機のように操作できます。',
      highlights: [
        '「社外から未登録PC」ボタンを押すと、条件付きアクセスで即ブロック！',
        '「高リスクサインイン検知」を押すと、P2のIdentity Protectionが発火！',
        '「PIMで特権をJIT昇格」を押すと、時間制限付きで管理者になれる仕組みを体感。',
      ],
    },
    {
      title: 'Lab 4: 保持の4大原則 (Purview 競合判定)',
      domain: 'retention' as PurviewDomain,
      desc: '「7年保持ポリシー」と「3年保持ポリシー」が同時にかかったファイルは、何年残るのか？ 4大原則の自動判定をテストします。',
      highlights: [
        '「7年 vs 3年」ボタンを押すと、最長の「7年間保持」が勝つ様子がわかります。',
        'ユーザーが2年目に削除しても、ファイルは「保持保管庫」に守られ続けます。',
        '規制レコードにすると、管理者でも削除できないWORMの不変性を体験できます。',
      ],
    },
    {
      title: 'Lab 5: Azure PIM & リソースロック (CanNotDelete / ReadOnly)',
      domain: 'azure-rbac-pim' as PurviewDomain,
      desc: '最高特権の所有者(Owner)であっても、リソースロックがかかっていると削除できない試験頻出ルールや、PIMのJIT時限昇格を体験します。',
      highlights: [
        '「所有者による削除試行」ボタンを押すと、CanNotDeleteロックで即座に拒否！',
        '「PIM JIT特権昇格」で理由と有効期限を指定して一時的に権限を取得。',
        'カスタムロールのNotActionsが「単なる引き算」である動作も確認できます。',
      ],
    },
    {
      title: 'Lab 6: NSG パケット判定 & Azure Firewall (UDR強制検査)',
      domain: 'azure-network-nsg' as PurviewDomain,
      desc: 'NSGの優先度評価順序、サブネットNSG vs NIC NSGの多層評価、およびAzure Firewallの脅威インテリジェンス遮断を検証します。',
      highlights: [
        '「Internet ➔ RDP(3389)」ボタンで、優先度300のDenyルールで即座に破棄される様子をテスト！',
        '受信(Inbound)は「サブネットNSG ➔ NIC NSG」の2段階審査になる原則を視覚的に理解。',
        'Firewall画面では、UDRによる0.0.0.0/0の強制転送とWAFのSQLi遮断も体験できます。',
      ],
    },
    {
      title: 'Lab 7: Intune & Autopilot & Azure Bastion & ADE',
      domain: 'azure-endpoint-mgmt' as PurviewDomain,
      desc: 'Windows Autopilotによるゼロタッチ自動展開、Azure BastionによるプライベートRDP、Key Vault連携によるAzure Disk Encryption (BitLocker) を検証します。',
      highlights: [
        '「Autopilot ゼロタッチ展開」で、OOBEからEntra参加とIntune登録が完了する流れを体感！',
        '「Azure Bastion」でパブリックIPを持たないVMへ443経由でブラウザ接続。',
        '「DSC 構成ドリフト」で手動の不正変更をLCMが自動是正する動作を確認できます。',
      ],
    },
    {
      title: 'Lab 8: コンテナ基盤 & ACI構成 & ACRセキュリティ',
      domain: 'azure-container-sec' as PurviewDomain,
      desc: 'ACI、AKS、Container Apps (ACA) の選定基準、ACIコンテナグループのVNet委任、ACR Premium SKU (Geoレプリケーション/Private Link) を体験します。',
      highlights: [
        '「ACI コンテナグループ作成」でVNet委任とマネージドIDプルの安全な構成をシミュレート！',
        '「ACR Premium SKU」でエンタープライズ機能の要件を比較判定。',
        '「イメージ脆弱性検知」でDefender for ContainersがCVE脆弱性を検知・自動パッチする動作を確認。',
      ],
    },
    {
      title: 'Lab 9: AKS & Kubernetes アーキテクチャ & RBAC・ストレージ',
      domain: 'azure-aks-k8s' as PurviewDomain,
      desc: 'マスター (apiserver, etcd, scheduler) とワーカーノード (kubelet, containerd, kube-proxy, Pod) の連携、Service通信 (ClusterIP vs LB)、ストレージ制約 (RWO vs RWX)、Role vs ClusterRole を実機体験。',
      highlights: [
        '「Podデプロイの旅」で、kubectl applyから各コンポーネントが動く内部6ステップをアニメーション再生！',
        '「Service通信比較」で、ClusterIP(内部限定)とLoadBalancer(外部公開)のパケット到達性の違いを送信テスト。',
        '「ストレージマウント実験」で、Azure Disk (RWO) を複数ノードでマウントした際の Multi-Attach Error を体感！',
        '「kubectl auth can-i」で、開発者や監査員のNamespace限定RoleとClusterRoleの権限差をシミュレーション。',
      ],
    },
    {
      title: 'Lab 10: Azure Monitor & Sentinel (SIEM/SOAR) & JIT VM',
      domain: 'azure-monitor-sentinel' as PurviewDomain,
      desc: 'AMAエージェントとDCRによるログ収集、Log Analytics KQLクエリ実行、アラートルール&アクショングループ、Defender JIT VMアクセス、およびSentinelでのインシデント調査とLogic Appsプレイブック自動封じ込めを体感。',
      highlights: [
        '「KQL クエリ実行」で、SigninLogsからブルートフォース攻撃を即座に特定！',
        '「アクショングループ発火」で、CPU高負荷や攻撃検知時のメール・Webhook・Logic Apps連携をテスト。',
        '「JIT VM アクセス」で、RDP 3389を自社IP限定で3時間だけNSG自動開放しカウントダウン。',
        '「Sentinel SOAR 封じ込め」で、Fusionインシデントから攻撃元IPを即時NSG遮断しユーザーセッション失効！',
      ],
    },
  ];

  const current = tourSteps[step];

  const handleNext = () => {
    if (step < tourSteps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleJumpAndClose = (domain: PurviewDomain) => {
    onNavigateToTab(domain);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>かんたん操作ガイド (STEP {step + 1} / {tourSteps.length})</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 text-xs p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-white">
          {current.title}
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {current.desc}
        </p>

        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded space-y-2 text-xs">
          <div className="font-semibold text-amber-300">💡 操作のコツ & 見どころ:</div>
          <ul className="space-y-1.5 text-slate-300 text-[11px]">
            {current.highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={step === 0}
            className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            ← 戻る
          </button>

          <div className="flex items-center gap-2">
            {current.domain && (
              <button
                onClick={() => handleJumpAndClose(current.domain!)}
                className="px-3 py-1.5 text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 rounded hover:bg-sky-900/50 transition-colors"
              >
                このラボを開く
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors"
            >
              {step === tourSteps.length - 1 ? '学習を開始する' : '次へ →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
