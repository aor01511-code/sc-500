import React, { useState } from 'react';
import { 
  BookOpen, 
  Check, 
  X, 
  AlertTriangle, 
  Layers, 
  ShieldCheck, 
  Clock, 
  Lock, 
  Key, 
  Search,
  ExternalLink,
  Laptop,
  Cpu,
  Boxes,
  Activity
} from 'lucide-react';

export const PurviewCheatSheet: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'license' | 'principles' | 'azure-sec' | 'traps' | 'architecture'>('azure-sec');

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
          <span>Microsoft セキュリティ対策リソース</span>
          <span>·</span>
          <span>試験要点チートシート</span>
          <span>·</span>
          <span>Architecture & Licensing & Exam Traps</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Microsoft Entra ID & Azure Security 対策要点チートシート
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-3xl">
          試験直前の確認に役立つAzure PIM・リソースロック・NSG多層評価・Firewall/WAF・PAW端末の要点、ライセンス要件マトリックス (E3 vs E5)、保持の4原則デシジョンツリーを網羅しています。
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
        {[
          { id: 'azure-sec', label: 'Azure セキュリティ & PIM & ネットワーク要点' },
          { id: 'license', label: 'ライセンス要件マトリックス (E3 vs E5)' },
          { id: 'principles', label: '保持の4大原則 完全フローチャート' },
          { id: 'traps', label: '試験の落とし穴 10箇条 (Exam Traps)' },
          { id: 'architecture', label: '主要機能用語・アーキテクチャ解説' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveSection(sec.id as any)}
            className={`flex-1 py-2 px-3 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              activeSection === sec.id
                ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>

      {/* SECTION: Azure Security & Infrastructure */}
      {activeSection === 'azure-sec' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Azure ガバナンス・ネットワーク・ホストセキュリティ試験頻出要点</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* PIM */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-sky-300 flex items-center gap-1.5 text-sm">
                <Key className="w-4 h-4 text-sky-400" />
                <span>PIM (Privileged Identity Management) & JIT 昇格</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>適格(Eligible)割り当て:</strong> 常時特権を廃止し、作業時のみ申請・昇格。</li>
                <li><strong>アクティブ化要件:</strong> MFA強制、正当な業務理由の入力、上長承認、最大有効期間(最大8時間)。</li>
                <li><strong>Azureリソースオンボード:</strong> Entra IDロールだけでなく、サブスクリプション/RGのOwner/Contributorも一元管理。</li>
                <li><strong>アクセスのレビュー (Access Reviews):</strong> 四半期ごとに特権保持者の棚卸しを行い、放置管理者を自動剥奪。</li>
              </ul>
            </div>

            {/* Resource Locks & Policy */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                <Lock className="w-4 h-4 text-amber-400" />
                <span>リソースロック (Locks) vs Azure Policy</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>ロックのRBAC優先原則:</strong> 最高特権の「所有者 (Owner)」であっても、ロック解除しない限り削除・変更不可！</li>
                <li><strong>CanNotDelete vs ReadOnly:</strong> CanNotDeleteは「削除のみ禁止(変更は可)」。ReadOnlyは「変更も削除も両方禁止」。</li>
                <li><strong>下方継承:</strong> サブスクリプションやRGに設定されたロック・ポリシーは子リソースへ自動継承。</li>
                <li><strong>ポリシー定義 vs イニシアチブ:</strong> 単一ルールが「ポリシー」、複数ポリシーのパッケージが「イニシアチブ」。</li>
              </ul>
            </div>

            {/* NSG & VNet */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5 text-sm">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>NSG ルール優先度 & サブネット/NIC 多層評価</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>評価順序:</strong> 優先度 100〜4096 (小さい順)。最初に合致したルールで確定(後続は無視)。</li>
                <li><strong>既定ルール:</strong> 65000 AllowVnet ➔ 65001 AllowAzureLoadBalancer ➔ 65500 DenyAll。</li>
                <li><strong>受信(Inbound)の直列評価:</strong> ① サブネットNSG ➔ ② NIC NSG (両方AllowでVM到達)。</li>
                <li><strong>送信(Outbound)の直列評価:</strong> ① NIC NSG ➔ ② サブネットNSG (順序が逆転！)。</li>
                <li><strong>Private Link vs サービスエンドポイント:</strong> Private LinkはVNet内プライベートIP付与＆オンプレミス閉域接続可＆データ流出防止。</li>
              </ul>
            </div>

            {/* Firewall & App Gateway & PAW */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-rose-300 flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>Azure Firewall & App Gateway & PAW 端末</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>ハブスポーク & UDR:</strong> ルートテーブルで「0.0.0.0/0 ➔ 次ホップ: 仮想アプライアンス(Firewall)」を指定して強制転送。</li>
                <li><strong>Application Gateway:</strong> L7ロードバランサー、URLパスルーティング(/api/*, /images/*)、WAF PreventionモードでSQLi/XSS遮断。</li>
                <li><strong>Defender for Containers:</strong> ACRイメージプッシュ時のエージェントレス自動CVE脆弱性スキャン。</li>
                <li><strong>PAW (特権アクセスワークステーション):</strong> TPM 2.0、HVCI(メモリ整合性)、一般Web・メール完全禁止。</li>
              </ul>
            </div>

            {/* Intune & Autopilot & Bastion & ADE */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-sky-300 flex items-center gap-1.5 text-sm">
                <Laptop className="w-4 h-4 text-sky-400" />
                <span>Intune & Autopilot & Bastion & ADE</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>Windows Autopilot:</strong> ハードウェアハッシュによるゼロタッチOOBE展開。自己展開モードはTPM 2.0で完全無人キオスク化。</li>
                <li><strong>Azure Bastion:</strong> 「AzureBastionSubnet」(/26以上) 必須。PortalからHTTPS 443経由でパブリックIP不要のプライベートRDP/SSH。</li>
                <li><strong>Azure Disk Encryption (ADE):</strong> BitLocker/DM-CryptによるOS暗号化。Key Vaultの「ディスク暗号化用」有効化とKEK二重保護。</li>
                <li><strong>DSC / LCM:</strong> ApplyAndAutoCorrectモードで意図せぬ変更(構成ドリフト)を自動是正。</li>
              </ul>
            </div>

            {/* Containers & ACI & ACR */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5 text-sm">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <span>コンテナ基盤 (ACI / AKS / ACA) & ACR SKU</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>ACI (Container Instances):</strong> サーバーレス高速起動。コンテナグループ単位で同一ホスト・ローカルネットワーク共有。VNet専用サブネット委任必須。</li>
                <li><strong>Azure Container Apps (ACA):</strong> KEDAによるゼロスケール(0台待機)自動スケーリングとDapr統合。</li>
                <li><strong>ACR Premium SKU:</strong> Geoレプリケーション、VNet Private Link、Content Trust(イメージ署名)にはPremiumが必須！</li>
                <li><strong>ACRセキュリティ:</strong> 管理者アカウント無効化推奨。マネージドIDとAcrPullロールによる安全な認証。</li>
              </ul>
            </div>

            {/* AKS & Kubernetes Architecture & Storage & RBAC */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-sky-300 flex items-center gap-1.5 text-sm">
                <Boxes className="w-4 h-4 text-sky-400" />
                <span>AKS & Kubernetes アーキテクチャ & ストレージ & RBAC</span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>クラスターマスター (Control Plane):</strong> Azure完全管理。apiserver(認証認可/唯一のAPI口)、etcd(全メタデータ保存)、kube-scheduler(最適ノード選定)、kube-controller-manager(期待状態維持)。</li>
                <li><strong>ワーカーノード:</strong> kubelet(ノードエージェント)、containerd(コンテナ実行)、kube-proxy(iptablesによるServiceルーティング)。</li>
                <li><strong>Serviceタイプ:</strong> ClusterIP(内部限定)、NodePort(ノードIP:30000-32767)、LoadBalancer(Azure LB自動配備)。社内限定は `azure-load-balancer-internal: true` アノテーション。</li>
                <li><strong>ストレージ制約 (RWO vs RWX):</strong> Azure Diskは単一ノード専用(ReadWriteOnce)。複数ノードのPodから同時マウント共有するにはAzure Files(ReadWriteMany)が必須！</li>
                <li><strong>Kubernetes RBAC:</strong> Role(特定Namespace限定) vs ClusterRole(クラスター全体/全Namespace)。RoleBindingとClusterRoleBindingによる紐付け分離。</li>
              </ul>
            </div>

            {/* Azure Monitor & Microsoft Sentinel & JIT VM Access */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
              <div className="font-bold text-emerald-300 flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Azure Monitor & Sentinel (SIEM/SOAR) & Defender (どういう機能でどういう意味か)</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  全52概念対応
                </span>
              </div>
              <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
                <li><strong>階層テレメトリ (アプリ/OS/コンピュート):</strong> App Insights (コードAPM) ➔ AMA/Syslog (OSログ・プロセス) ➔ ハイパーバイザーメトリック (基盤健全性)。Data Collector APIでカスタムログもLog Analyticsへ集約。</li>
                <li><strong>AMA (新標準) vs MMA (廃止):</strong> AMAはデータ収集ルール(DCR)で送信するEventID/ファシリティを厳密フィルタしコスト激減。マネージドID認証。MMAは2024年8月廃止。</li>
                <li><strong>アクティビティログ vs リソースログ:</strong> アクティビティログはARM操作(誰が何を変更したか)で90日自動保持。リソースログはKey Vault等の内部データプレーン動作で各リソースの「診断設定」が必須！</li>
                <li><strong>CSPM vs CWP & セキュアスコア:</strong> CSPMは構成ミス・脆弱性の事前予防(セキュアスコア・MCSB/NIST準拠)。CWPは稼働中ワークロードへのリアルタイム攻撃検知・防御。Azure Arcでマルチクラウド/オンプレミスも一元保護。</li>
                <li><strong>JIT (Just-In-Time) VM アクセス:</strong> RDP(3389)/SSH(22)を普段はNSGで全閉鎖。承認時のみ管理者の送信元IP限定で最大3時間動的開放し自動クローズ。</li>
                <li><strong>Sentinel 分析ルール (5大エンジン):</strong> ①スケジュール済みKQL、②NRT(最速1分評価)、③Fusion(多段階ML自動相関)、④ML行動分析(UEBA)、⑤異常検出(統計AI)。</li>
                <li><strong>SOAR (オートメーションルール & プレイブック):</strong> インシデント作成時にLogic Appsが自動実行され、悪意あるIPを即時NSG遮断＆侵害ユーザーセッション強制失効。</li>
                <li><strong>ハンティング & ブックマーク:</strong> アラート待受ではなく能動的仮説検証。不審なログをブックマークして公式インシデントへ昇格・証拠保全。</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 1: Licensing Matrix */}
      {activeSection === 'license' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Microsoft 365 E3 vs E5 ライセンス境界線</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                SC-500では「どの機能がE5またはE5 Complianceアドオンを必要とするか」が頻出します。
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Purview 機能カテゴリー</th>
                  <th className="py-2.5 px-3">具体的な機能</th>
                  <th className="py-2.5 px-3 text-center">Microsoft 365 E3</th>
                  <th className="py-2.5 px-3 text-center text-sky-300">Microsoft 365 E5 / Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-[11px]">
                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-200" rowSpan={3}>
                    感度ラベル (Sensitivity Labels)
                  </td>
                  <td className="py-3 px-3">手動でのラベル付け (Officeアプリ)</td>
                  <td className="py-3 px-3 text-center text-emerald-400">○ 対応</td>
                  <td className="py-3 px-3 text-center text-emerald-400">○ 対応</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">クライアント/サービス側 自動ラベル付け (Auto-labeling)</td>
                  <td className="py-3 px-3 text-center text-slate-500">✕ 不可</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">○ 必須 (E5)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">ダブルキー暗号化 (DKE)</td>
                  <td className="py-3 px-3 text-center text-slate-500">✕ 不可</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">○ 必須 (E5)</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-200" rowSpan={3}>
                    データ損失防止 (DLP)
                  </td>
                  <td className="py-3 px-3">Exchange, SharePoint, OneDrive でのDLP</td>
                  <td className="py-3 px-3 text-center text-emerald-400">○ 対応</td>
                  <td className="py-3 px-3 text-center text-emerald-400">○ 対応</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">Teams チャット & チャネルメッセージのDLP</td>
                  <td className="py-3 px-3 text-center text-slate-500">✕ 不可</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">○ 必須 (E5)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">エンドポイント DLP (Windows 11/10 USB・印刷制限)</td>
                  <td className="py-3 px-3 text-center text-slate-500">✕ 不可</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">○ 必須 (E5)</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-200" rowSpan={3}>
                    データ保持 & レコード管理
                  </td>
                  <td className="py-3 px-3">静的スコープ保持ポリシー (手動指定)</td>
                  <td className="py-3 px-3 text-center text-emerald-400">○ 対応</td>
                  <td className="py-3 px-3 text-center text-emerald-400">○ 対応</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">アダプティブスコープ (Adaptive Scopes)</td>
                  <td className="py-3 px-3 text-center text-slate-500">✕ 不可</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">○ 必須 (E5)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">規制レコード (Regulatory Records) & イベントベース保持</td>
                  <td className="py-3 px-3 text-center text-slate-500">✕ 不可</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">○ 必須 (E5)</td>
                </tr>

                <tr>
                  <td className="py-3 px-3 font-semibold text-slate-200" rowSpan={2}>
                    インサイダー & 調査
                  </td>
                  <td className="py-3 px-3">インサイダーリスク管理 (Insider Risk)</td>
                  <td className="py-3 px-3 text-center text-slate-500">✕ 不可</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">○ 必須 (E5)</td>
                </tr>
                <tr>
                  <td className="py-3 px-3">eDiscovery (Premium) / 監査 (Premium 1年〜10年)</td>
                  <td className="py-3 px-3 text-center text-slate-500">✕ (Standardのみ)</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-bold">○ 必須 (E5)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 2: 4 Retention Principles Flowchart */}
      {activeSection === 'principles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>保持の4大原則 (Principles of Retention) デシジョンフロー</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Microsoft公式の競合解決ロジックです。試験では必ず「7年ポリシー vs 3年ラベル」といった競合問題が出題されます。
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-4">
              <div className="w-7 h-7 rounded bg-sky-900 text-sky-300 font-mono font-bold flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">第1原則: 保持は削除に優先する (Retention wins over deletion)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  あるポリシーが「7年間保持」を指示し、別のポリシーが「3年後に削除」を指示している場合、保持が勝ちます。ファイルは7年間削除されません。
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-4">
              <div className="w-7 h-7 rounded bg-sky-900 text-sky-300 font-mono font-bold flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">第2原則: 最長保持期間が優先される (Longest retention period wins)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  複数の保持ルールが存在する場合 (例: 全社ポリシー7年保持 vs サイトポリシー3年保持)、期間が最も長い方 (7年間) が最終的な保持期間として採用されます。
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-4">
              <div className="w-7 h-7 rounded bg-sky-900 text-sky-300 font-mono font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">第3原則: 明示的な適用は暗黙的な適用に優先する (Explicit wins over implicit)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  「保持ラベル」(個別のファイルに手動または自動で直接付与されたもの) は「明示的」であり、サイトやテナント全体に適用された「包括的保持ポリシー」(暗黙的) よりも優先されます。(※保持期間が同じ場合や、削除のみの競合時に効果を発揮します)
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex items-start gap-4">
              <div className="w-7 h-7 rounded bg-sky-900 text-sky-300 font-mono font-bold flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">第4原則: 最短削除期間が優先される (Shortest deletion period wins)</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  どのルールにも「保持」が含まれず、削除ルールのみが存在する場合 (例: 5年後に削除 vs 3年後に削除)、最も短い期間 (3年間) で削除されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Exam Traps 10 Points */}
      {activeSection === 'traps' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>SC-500 受験者が最も引っかかりやすい「出題の落とし穴」10箇条</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {[
              {
                num: '01',
                title: '規制レコードはグローバル管理者でも削除不可',
                desc: '標準レコードはロック解除できますが、「規制レコード (Regulatory Record)」はWORM準拠のため、テナント全体管理者であっても期間満了までラベル解除やファイル削除は絶対に行えません。',
              },
              {
                num: '02',
                title: '親ラベル単体では付与できない (下位ラベル必須)',
                desc: '親ラベルに下位ラベル(Sublabels)が存在する場合、親ラベル自体をファイルに直接適用することはできません。必ずいずれかの下位ラベルを選択する必要があります。',
              },
              {
                num: '03',
                title: 'Google Chrome での Endpoint DLP には拡張機能が必須',
                desc: 'Microsoft EdgeはWindows 10/11ネイティブでDLPが効きますが、Google Chromeの場合は「Microsoft Purview Extension」をインストールしないとWebアップロードの監視・制限はできません。',
              },
              {
                num: '04',
                title: 'DKE (ダブルキー暗号化) は Office Online 非対応',
                desc: 'DKEで暗号化された文書は、ブラウザ上のWord Online / Excel Onlineでは開けません。必ずデスクトップ版のOfficeアプリが必要です。',
              },
              {
                num: '05',
                title: '保持保管庫 (Preservation Hold Library) の自動生成',
                desc: 'SharePointやOneDriveで保持ポリシーが効いていると、ユーザーがファイルを削除・上書きした瞬間に保持保管庫へコピーされます。管理者が手動でライブラリを作る必要はありません。',
              },
              {
                num: '06',
                title: 'EDM (完全データ一致) はローカルでハッシュ化する',
                desc: 'EDMで顧客マスターをアップロードする際、平文のCSVを直接クラウドに送るのではなく、「EDM Upload Agent」を用いてオンプレミス側でソルト付きSHA-256ハッシュ化してからアップロードします。',
              },
              {
                num: '07',
                title: 'アダプティブスコープの更新サイクル',
                desc: 'ユーザーの属性変更後、アダプティブスコープに反映されるまでには通常最大24時間かかります。(即時反映を期待する選択肢は誤り)',
              },
              {
                num: '08',
                title: '監査ログの標準保持期間 (Standard vs Premium)',
                desc: 'Purview Audit (Standard) はデフォルトで180日間保持されます。1年間以上の保持や「MailItemsAccessed (メール開封)」などの高感度イベントには Audit (Premium) が必須です。',
              },
              {
                num: '09',
                title: '情報バリア (Information Barriers) とTeams',
                desc: '投資銀行部門と株式調査部門など、利益相反を防ぐための情報バリアポリシーを設定すると、1対1チャット、グループチャット、会議、チーム共有が自動的に遮断されます。',
              },
              {
                num: '10',
                title: '自動ラベル付けのシミュレーションモード',
                desc: 'サービス側の自動ラベル付けポリシーを作成した場合、本番適用する前に必ず「シミュレーションモード」で影響度を検証することがベストプラクティスとして推奨されます。',
              },
            ].map((trap) => (
              <div key={trap.num} className="p-3.5 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sky-400 font-bold text-[11px]">{trap.num}.</span>
                  <span className="font-bold text-slate-200">{trap.title}</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed pl-5">
                  {trap.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Architecture Terms */}
      {activeSection === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span>Microsoft Purview 主要アーキテクチャ用語集</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1.5">
              <div className="font-bold text-sky-300">SIT (Sensitive Information Type: 機密情報の種類)</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                正規表現、キーワード、チェックサム、近接度を組み合わせて特定のデータ(マイナンバー、クレジットカード等)を識別する定義体。低(65%)・中(75%)・高(85%)の信頼度を返します。
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1.5">
              <div className="font-bold text-sky-300">EDM (Exact Data Match: 完全データ一致)</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                構造化データベースから抽出した顧客レコードをハッシュ値テーブルとして登録し、完全一致で検出する仕組み。誤検知(偽陽性)を極小化できます。
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1.5">
              <div className="font-bold text-sky-300">DKE (Double Key Encryption: ダブルキー暗号化)</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Microsoft管理キーとオンプレミス顧客管理キーの2つを用いてデータを暗号化。Microsoftであっても復号不可能にする最高峰のセキュリティ方式。
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1.5">
              <div className="font-bold text-sky-300">Preservation Hold Library (保持保管庫)</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                SharePoint/OneDriveサイトにおいて、保持ポリシーまたは保持ラベル対象のファイルが削除・更新された際に、原本および変更前バージョンを退避・保持する非表示ライブラリ。
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1.5">
              <div className="font-bold text-sky-300">Trainable Classifier (訓練可能な分類子)</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                AI/機械学習モデルを用いて、ドキュメントの文脈や構造(ソースコード、契約書、秘密保持契約、履歴書など)を学習・識別する分類子。
              </p>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded space-y-1.5">
              <div className="font-bold text-sky-300">Disposition Review (廃棄レビュー)</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                保持期間が満了したドキュメントを即座に自動削除するのではなく、レコード管理者や指定レビュアーに手動承認プロセスを要求するワークフロー。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
