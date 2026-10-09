import React, { useState } from 'react';
import { LICENSE_FEATURES } from '../data/entraData';
import { EntraLicenseTier } from '../types/entra';
import { 
  Layers, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Users, 
  Key, 
  ArrowRight,
  ShieldAlert,
  Play
} from 'lucide-react';

export const EntraLicenseSimulator: React.FC = () => {
  const [activeTier, setActiveTier] = useState<EntraLicenseTier>('p1');
  const [activeMiniLab, setActiveMiniLab] = useState<'ca' | 'protection' | 'pim'>('ca');

  // Conditional Access Playground State
  const [caUserType, setCaUserType] = useState<'internal' | 'guest'>('internal');
  const [caLocation, setCaLocation] = useState<'trusted' | 'untrusted'>('untrusted');
  const [caDeviceStatus, setCaDeviceStatus] = useState<'compliant' | 'unmanaged'>('unmanaged');
  const [caSignInRisk, setCaSignInRisk] = useState<'none' | 'high'>('none');

  // PIM Playground State
  const [pimStatus, setPimStatus] = useState<'eligible' | 'activating' | 'active'>('eligible');
  const [pimJustification, setPimJustification] = useState<string>('緊急の障害調査および条件付きアクセス修正のため');
  const [pimRemainingHours, setPimRemainingHours] = useState<number>(4);

  // Identity Protection State
  const [simulatedRiskScenario, setSimulatedRiskScenario] = useState<'none' | 'impossible-travel' | 'leaked-creds'>('none');

  // Evaluate Conditional Access
  const evaluateCA = () => {
    if (activeTier === 'free') {
      return {
        allowed: true,
        action: 'セキュリティの既定値群 (Security Defaults) のみ適用可能',
        details: 'Entra ID Free では条件付きアクセスポリシーは使用できません。全ユーザーに一括で基本MFAが要求されます。',
        badge: 'Free: ポリシー評価不可',
        badgeColor: 'amber',
      };
    }

    if (caSignInRisk === 'high') {
      if (activeTier === 'p1') {
        return {
          allowed: true,
          action: 'P1ではサインインリスク条件が未サポート',
          details: 'Entra ID P1 ではリスクベース条件付きアクセスが使えないため、リスクに関わらず基本MFAのみで通過します。',
          badge: 'P1: リスク検知不可',
          badgeColor: 'amber',
        };
      } else {
        // P2 has Identity Protection
        return {
          allowed: false,
          action: '高サインインリスク検知によりアクセスブロック または パスワード再設定要求',
          details: 'Entra ID P2 の Identity Protection により高リスクを検知。即座にセッションを遮断し、SSPRによるパスワードリセットを強制しました。',
          badge: 'P2: リスクベース遮断',
          badgeColor: 'rose',
        };
      }
    }

    if (caLocation === 'untrusted' && caDeviceStatus === 'unmanaged') {
      return {
        allowed: false,
        action: '社外 untrusted からの非準拠端末アクセスのためブロック',
        details: '条件付きアクセスポリシー「社外からはIntune準拠端末のみ許可」に基づきアクセスが拒否されました。',
        badge: 'ブロック (アクセス拒否)',
        badgeColor: 'rose',
      };
    }

    if (caLocation === 'untrusted' && caDeviceStatus === 'compliant') {
      return {
        allowed: true,
        action: '多要素認証 (MFA) 成功後にアクセス許可',
        details: '社外からのアクセスですが、Intune準拠デバイスを満たしており、MFAの要求に成功したためアクセスを許可しました。',
        badge: 'MFA要求で許可',
        badgeColor: 'emerald',
      };
    }

    return {
      allowed: true,
      action: '社内信頼ネットワーク (Trusted IP) のため直接許可',
      details: '本社オフィスの固定IPからのアクセスのため、追加MFAなしでスムーズにサインインしました。',
      badge: '信頼済みアクセス',
      badgeColor: 'emerald',
    };
  };

  const caResult = evaluateCA();

  const triggerMission = (mission: 'ca-blocked' | 'ca-risk' | 'identity-protection' | 'pim-elevation') => {
    if (mission === 'ca-blocked') {
      setActiveTier('p1');
      setActiveMiniLab('ca');
      setCaLocation('untrusted');
      setCaDeviceStatus('unmanaged');
      setCaSignInRisk('none');
    } else if (mission === 'ca-risk') {
      setActiveTier('p2');
      setActiveMiniLab('ca');
      setCaSignInRisk('high');
    } else if (mission === 'identity-protection') {
      setActiveTier('p2');
      setActiveMiniLab('protection');
      setSimulatedRiskScenario('impossible-travel');
    } else if (mission === 'pim-elevation') {
      setActiveTier('p2');
      setActiveMiniLab('pim');
      setPimStatus('active');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>Microsoft Entra ID (Azure AD)</span>
              <span>·</span>
              <span>エディション別機能差 (Free vs P1 vs P2)</span>
              <span>·</span>
              <span>Conditional Access & Identity Protection & PIM</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              ライセンスによって実現できるもの (Free / P1 / P2) 動作検証
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              「グループに対するアクセス許可」「条件付きアクセス」「Identity Protection」「Privileged Identity Management (PIM)」がどのライセンスで解放され、どのように動くかをインタラクティブに検証できます。
            </p>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <Sparkles className="w-4 h-4" />
            <span>【迷ったらここを押すだけ！】ライセンスの境界線を1クリックで体験:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => triggerMission('ca-blocked')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">社外から未登録PC ➔ ブロック</div>
                <div className="text-[10px] text-sky-400 font-medium">条件付きアクセス (P1必須)</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('ca-risk')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">高リスクサインイン検知 ➔ 遮断</div>
                <div className="text-[10px] text-rose-400 font-medium">リスクベースCA (P2必須)</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('identity-protection')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">異常移動検知 ➔ パスワード変更</div>
                <div className="text-[10px] text-amber-400 font-medium">Identity Protection (P2必須)</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('pim-elevation')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-indigo-950 border border-indigo-700 text-indigo-400 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">PIMで特権をJIT昇格してみる</div>
                <div className="text-[10px] text-indigo-400 font-medium">特権アクセス管理 (P2必須)</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* License Tier Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          {
            id: 'free' as EntraLicenseTier,
            title: 'Entra ID Free (無償版)',
            subtitle: 'Azure/M365 付属の標準ID基盤',
            highlights: ['無制限のSAML/OIDC SSO', 'セキュリティの既定値群 (MFA一括強制)', 'セルフサービスパスワード変更(クラウド)'],
            color: 'slate',
          },
          {
            id: 'p1' as EntraLicenseTier,
            title: 'Entra ID P1 (約750円/月)',
            subtitle: 'エンタープライズゼロトラスト基幹',
            highlights: ['条件付きアクセス (Conditional Access)', '動的グループ & 動的デバイス', 'グループベースのライセンス付与', 'SSPR + オンプレ書き戻し'],
            color: 'sky',
          },
          {
            id: 'p2' as EntraLicenseTier,
            title: 'Entra ID P2 (約1,120円/月)',
            subtitle: '最上位セキュリティ & ガバナンス',
            highlights: ['Identity Protection (AIリスクベース認証)', 'Privileged Identity Management (PIM)', 'アクセスレビュー (定期棚卸し)', 'エンタイトルメント管理'],
            color: 'indigo',
          },
        ].map((tier) => {
          const isSelected = activeTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id)}
              className={`text-left p-4 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-slate-900 border-sky-500 shadow-md ring-1 ring-sky-500/30'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {tier.title}
                </span>
                {isSelected && <span className="text-xs text-sky-400 font-mono font-bold">ACTIVE</span>}
              </div>
              <div className="text-[11px] text-slate-500 mb-3">{tier.subtitle}</div>
              <ul className="space-y-1 text-xs text-slate-300">
                {tier.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px]">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-sky-400' : 'text-slate-600'}`} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>

      {/* Mini-Labs Navigation */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveMiniLab('ca')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeMiniLab === 'ca'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
          <span>1. 条件付きアクセス (Conditional Access) 検証</span>
        </button>

        <button
          onClick={() => setActiveMiniLab('protection')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeMiniLab === 'protection'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>2. Identity Protection (リスク検知: P2専用)</span>
        </button>

        <button
          onClick={() => setActiveMiniLab('pim')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeMiniLab === 'pim'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5 text-indigo-400" />
          <span>3. Privileged Identity Management (PIM: P2専用)</span>
        </button>
      </div>

      {/* LAB 1: Conditional Access Playground */}
      {activeMiniLab === 'ca' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-sky-400" />
                <span>条件付きアクセス (Conditional Access) ポリシー判定エンジン</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                必要ライセンス: <strong className="text-sky-300">Entra ID P1 以上</strong>（現在選択中: <span className="font-mono uppercase">{activeTier}</span>）
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Condition Controls */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">ユーザー種別 (Users):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCaUserType('internal')}
                    className={`p-2 rounded border text-left ${
                      caUserType === 'internal'
                        ? 'bg-sky-950/40 border-sky-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    社内従業員 (Members)
                  </button>
                  <button
                    onClick={() => setCaUserType('guest')}
                    className={`p-2 rounded border text-left ${
                      caUserType === 'guest'
                        ? 'bg-sky-950/40 border-sky-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    外部ゲスト (B2B Guests)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">接続元ネットワーク場所 (Locations):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCaLocation('trusted')}
                    className={`p-2 rounded border text-left ${
                      caLocation === 'trusted'
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    社内信頼IP (Trusted Location)
                  </button>
                  <button
                    onClick={() => setCaLocation('untrusted')}
                    className={`p-2 rounded border text-left ${
                      caLocation === 'untrusted'
                        ? 'bg-amber-950/40 border-amber-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    社外・公衆回線 (Untrusted IP)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">デバイス状態 (Device Compliance):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCaDeviceStatus('compliant')}
                    className={`p-2 rounded border text-left ${
                      caDeviceStatus === 'compliant'
                        ? 'bg-sky-950/40 border-sky-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    Intune 準拠デバイス (Compliant)
                  </button>
                  <button
                    onClick={() => setCaDeviceStatus('unmanaged')}
                    className={`p-2 rounded border text-left ${
                      caDeviceStatus === 'unmanaged'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    個人未登録端末 (Unmanaged)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">サインインリスク (Sign-in Risk: P2専用):</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCaSignInRisk('none')}
                    className={`p-2 rounded border text-left ${
                      caSignInRisk === 'none'
                        ? 'bg-slate-900 border-slate-700 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    通常 (No Risk)
                  </button>
                  <button
                    onClick={() => setCaSignInRisk('high')}
                    className={`p-2 rounded border text-left ${
                      caSignInRisk === 'high'
                        ? 'bg-rose-950/40 border-rose-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    高リスク (High Risk: 異常移動)
                  </button>
                </div>
              </div>
            </div>

            {/* Evaluation Outcome Display */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs text-slate-400">ポリシー判定結果 (Access Resolution)</span>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                    caResult.badgeColor === 'emerald'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                      : caResult.badgeColor === 'rose'
                      ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                  }`}>
                    {caResult.badge}
                  </span>
                </div>
                <h4 className="text-base font-bold text-white mt-3">
                  {caResult.action}
                </h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {caResult.details}
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-400 space-y-1">
                <div className="font-semibold text-slate-300">💡 試験ワンポイント:</div>
                <div>・条件付きアクセスの評価順序: 「除外(Exclude)」は「含める(Include)」よりも常に優先される。</div>
                <div>・非常時用緊急アカウント (Break-glass account) は必ずポリシーの除外リストに設定しておくこと！</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LAB 2: Identity Protection Playground */}
      {activeMiniLab === 'protection' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <span>Microsoft Entra ID Protection (機械学習リスク検知: P2専用)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              必要ライセンス: <strong className="text-indigo-300">Entra ID P2 必須</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <span className="font-semibold text-slate-200 block">脅威シナリオの発生シミュレーション:</span>
              <div className="space-y-2">
                {[
                  { id: 'none', title: 'リスクなし (正常サインイン)', desc: '通常の勤務場所・デバイスからのアクセス。' },
                  { id: 'impossible-travel', title: '移動不可 (Atypical travel / Impossible travel)', desc: '10:00に東京からサインインし、10:30にニューヨークのIPからサインインが試行された異常を検知。' },
                  { id: 'leaked-creds', title: '資格情報の漏洩 (Leaked Credentials)', desc: 'ダークウェブに流出した資格情報リストとハッシュ照合で一致。ユーザーリスクを高に設定。' },
                ].map((scen) => (
                  <button
                    key={scen.id}
                    onClick={() => setSimulatedRiskScenario(scen.id as any)}
                    className={`w-full text-left p-3 rounded border transition-colors ${
                      simulatedRiskScenario === scen.id
                        ? 'bg-amber-950/40 border-amber-500/60 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold">{scen.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{scen.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-4 text-xs">
              <span className="font-semibold text-slate-200 block">リアルタイム検知 & 自動修復フロー:</span>
              {simulatedRiskScenario === 'none' ? (
                <div className="p-4 bg-slate-900 border border-slate-800 rounded text-slate-400 text-center">
                  脅威は検知されていません。ユーザーリスク・サインインリスクともに「低 (Low / None)」です。
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded space-y-1">
                    <div className="font-bold text-rose-300">▲ リスクレベル: 高 (High Risk)</div>
                    <div className="text-slate-300 text-[11px]">
                      検知項目: {simulatedRiskScenario === 'impossible-travel' ? '移動不可 (サインインリスク)' : 'ダークウェブ資格情報流出 (ユーザーリスク)'}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded space-y-1.5 text-[11px] text-slate-300">
                    <div className="font-semibold text-sky-300">自動修復 (Self-Remediation) の動作:</div>
                    <div>1. ユーザーリスクポリシーにより、次回サインイン時に「SSPR (セルフサービスパスワードリセット)」を強制。</div>
                    <div>2. 安全に新パスワードへ変更完了後、ユーザーリスクスコアが自動的に「修復済み (Remediated)」へリセットされます。</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LAB 3: PIM Playground */}
      {activeMiniLab === 'pim' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" />
              <span>Privileged Identity Management (PIM: Just-In-Time 昇格ワークフロー)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              必要ライセンス: <strong className="text-indigo-300">Entra ID P2 必須</strong>（常時特権アクセスの排除）
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <span className="text-slate-400 font-semibold">対象ロール:</span>
                <div className="text-sm font-bold text-white">セキュリティ管理者 (Security Administrator)</div>
                <div className="text-slate-400 text-[11px]">
                  現在の割り当てタイプ: <strong className="text-indigo-300 font-mono">適格 (Eligible)</strong>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  PIMでは通常時は一般ユーザー権限のまま過ごし、作業が必要な時だけ申請して「アクティブ (Active)」に昇格します。
                </p>
              </div>

              {pimStatus === 'eligible' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">昇格理由 (Justification):</label>
                    <input
                      type="text"
                      value={pimJustification}
                      onChange={(e) => setPimJustification(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">希望アクティブ化時間:</label>
                    <select
                      value={pimRemainingHours}
                      onChange={(e) => setPimRemainingHours(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono"
                    >
                      <option value={1}>1時間</option>
                      <option value={2}>2時間</option>
                      <option value={4}>4時間 (標準)</option>
                      <option value={8}>8時間 (最大)</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setPimStatus('active')}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>ロールのアクティブ化 (JIT昇格) を実行</span>
                  </button>
                </div>
              )}

              {pimStatus === 'active' && (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded text-emerald-200 space-y-1">
                    <div className="font-bold">✓ ロールが正常にアクティブ化されました！</div>
                    <div className="text-[11px]">有効期限: あと {pimRemainingHours} 時間で自動失効します。</div>
                  </div>

                  <button
                    onClick={() => setPimStatus('eligible')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded transition-colors"
                  >
                    作業完了: 権限を早期返上 (Deactivate)
                  </button>
                </div>
              )}
            </div>

            {/* PIM Key Concepts for Exam */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-5 space-y-3 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>SC-300 / SC-500 試験で狙われる PIM の重要設定</span>
              </span>

              <ul className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
                <li>
                  <strong>「適格(Eligible)」vs「アクティブ(Active)」:</strong> 試験で「管理者に常時権限を与えず、必要時のみ有効化させたい」とあれば、割り当てを「適格」にするのが正解。
                </li>
                <li>
                  <strong>承認者の指定:</strong> アクティブ化に特権ロール管理者などの承認者ワークフローを設定可能。
                </li>
                <li>
                  <strong>アクティブ化時のMFA強制:</strong> 昇格ボタンを押した瞬間にAuthenticatorによるMFA認証を強制できる。
                </li>
                <li>
                  <strong>チケット番号の入力強制:</strong> サービスデスクのインシデント番号(例: ServiceNowチケット)の入力を必須化可能。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
