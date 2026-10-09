import React, { useState } from 'react';
import { DlpPolicyRule } from '../types/purview';
import { 
  ShieldCheck, 
  Mail, 
  HardDrive, 
  Share2, 
  MessageSquare, 
  Laptop, 
  Cloud, 
  AlertCircle, 
  Send, 
  Printer, 
  Copy, 
  Usb, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  ShieldAlert,
  Bell
} from 'lucide-react';

interface DlpSimulatorProps {
  onNavigateToQuiz?: (questionId: string) => void;
}

interface IncidentLog {
  id: string;
  timestamp: string;
  source: string;
  activity: string;
  actor: string;
  sitDetected: string;
  actionTaken: string;
  severity: 'Low' | 'Medium' | 'High';
  justification?: string;
}

export const DlpSimulator: React.FC<DlpSimulatorProps> = ({ onNavigateToQuiz }) => {
  // DLP Policy Configuration State
  const [policy, setPolicy] = useState<DlpPolicyRule>({
    id: 'dlp-rule-01',
    name: '金融・個人情報 外部漏洩防止ポリシー (PCI-DSS & マイナンバー)',
    locations: {
      exchange: true,
      sharepoint: true,
      onedrive: true,
      teams: true,
      endpoints: true,
      cloudApps: true,
    },
    conditions: {
      sitId: 'jp-mynumber',
      minCount: 1,
      isExternal: true,
    },
    actions: {
      blockAccess: true,
      allowOverride: true,
      requireJustification: true,
      notifyUser: true,
      policyTip: 'このアイテムにはマイナンバー等の保護された個人情報が含まれています。外部への共有は制限されています。',
      generateIncidentAlert: true,
      alertSeverity: 'High',
    },
    endpointRestrictions: {
      usbCopy: 'block-with-override',
      clipboard: 'block',
      unallowedBrowsers: 'block',
      printing: 'block',
    },
    mode: 'enforce',
  });

  // Client Simulation State
  const [activeTab, setActiveTab] = useState<'exchange' | 'endpoint' | 'incidents'>('exchange');

  // Exchange Email Simulator State
  const [emailTo, setEmailTo] = useState<string>('partner@external-vendor.com');
  const [emailSubject, setEmailSubject] = useState<string>('【至急】従業員番号リスト送付の件');
  const [emailBody, setEmailBody] = useState<string>(
    '業務委託手続きのため、従業員個人番号を送付します。\nマイナンバー: 1234-5678-9012\n確認よろしくお願いいたします。'
  );
  const [showOverrideModal, setShowOverrideModal] = useState<boolean>(false);
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [exchangeSentStatus, setExchangeSentStatus] = useState<string | null>(null);

  // Endpoint Toast Notification State
  const [toastNotification, setToastNotification] = useState<{
    title: string;
    message: string;
    type: 'blocked' | 'override' | 'audited';
  } | null>(null);

  // Incidents Log Table
  const [incidentLogs, setIncidentLogs] = useState<IncidentLog[]>([
    {
      id: 'INC-2026-081',
      timestamp: '2026-10-02 09:15',
      source: 'Exchange Online',
      activity: '外部宛てメール送信試行',
      actor: 'm.sato@contoso.com',
      sitDetected: 'クレジット カード番号 (12件)',
      actionTaken: 'ブロック (上書き未承認)',
      severity: 'High',
    },
    {
      id: 'INC-2026-082',
      timestamp: '2026-10-02 10:42',
      source: 'Endpoint DLP (Win11)',
      activity: 'USBストレージへのコピー試行',
      actor: 'm.sato@contoso.com',
      sitDetected: '日本 個人番号 (マイナンバー)',
      actionTaken: 'ブロック (業務理由により上書き実行)',
      severity: 'Medium',
      justification: '顧客オンサイト監査のため、オフラインストレージへ一時移行',
    },
  ]);

  // Evaluate whether email has sensitive content
  const hasMyNumber = emailBody.includes('1234-5678-9012') || emailBody.includes('マイナンバー');
  const isExternalRecipient = !emailTo.endsWith('@contoso.com');
  const dlpTriggersOnEmail = hasMyNumber && isExternalRecipient && policy.locations.exchange;

  // Handle Send Email
  const handleSendEmail = () => {
    if (dlpTriggersOnEmail) {
      if (policy.mode === 'test-no-notif') {
        // Just audit, no block
        recordIncident('Exchange Online', '外部宛てメール送信', 'テストモード: 監査ログ記録のみ (送信許可)');
        setExchangeSentStatus('テストモード: メールは正常に送信されました (管理者に監査ログが記録されました)');
        return;
      }

      if (policy.actions.blockAccess) {
        if (policy.actions.allowOverride) {
          setShowOverrideModal(true);
        } else {
          recordIncident('Exchange Online', '外部宛てメール送信', '送信完全ブロック (ポリシー違反)');
          setExchangeSentStatus('【送信失敗】DLPポリシー違反により、外部への送信が完全にブロックされました。');
        }
        return;
      }
    }

    setExchangeSentStatus('メールが正常に外部送信されました。');
  };

  const handleConfirmOverride = () => {
    recordIncident('Exchange Online', '外部宛てメール送信', '上書き送信実行 (理由記録済み)', overrideReason);
    setShowOverrideModal(false);
    setExchangeSentStatus('【上書き送信成功】正当な業務理由を記録し、メールを送信しました。');
    setOverrideReason('');
  };

  // Endpoint Action Simulator
  const triggerEndpointAction = (
    actionName: string,
    restriction: 'allow' | 'audit' | 'block' | 'block-with-override'
  ) => {
    let actionResult = '';
    let toastType: 'blocked' | 'override' | 'audited' = 'blocked';

    if (policy.mode === 'test-no-notif') {
      actionResult = 'テストモード: 動作許可 (監査ログ記録)';
      toastType = 'audited';
      setToastNotification({
        title: 'Microsoft Purview (テストモード)',
        message: `${actionName} が実行されました。ポリシー監査ログに記録されました。`,
        type: 'audited',
      });
    } else if (restriction === 'block') {
      actionResult = 'ブロック (操作禁止)';
      toastType = 'blocked';
      setToastNotification({
        title: 'Microsoft Purview 組織ポリシー違反',
        message: `保護されたマイナンバーが含まれるため、${actionName} はブロックされました。`,
        type: 'blocked',
      });
    } else if (restriction === 'block-with-override') {
      actionResult = '上書き許可により実行';
      toastType = 'override';
      setToastNotification({
        title: 'Microsoft Purview: 上書き要求',
        message: `この操作 (${actionName}) は制限されています。業務上の正当な理由を記録して続行しました。`,
        type: 'override',
      });
    } else if (restriction === 'audit') {
      actionResult = '監査ログ記録のみ (操作許可)';
      toastType = 'audited';
      setToastNotification({
        title: 'Microsoft Purview 監査通知',
        message: `${actionName} がログに記録されました。`,
        type: 'audited',
      });
    } else {
      actionResult = '許可 (制限なし)';
      toastType = 'audited';
      setToastNotification(null);
    }

    recordIncident('Endpoint DLP (Windows 11)', actionName, actionResult);

    setTimeout(() => {
      setToastNotification(null);
    }, 6000);
  };

  const recordIncident = (source: string, activity: string, actionTaken: string, justification?: string) => {
    const newLog: IncidentLog = {
      id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source,
      activity,
      actor: 't.tanaka@contoso.com',
      sitDetected: '日本 個人番号 (マイナンバー)',
      actionTaken,
      severity: policy.actions.alertSeverity,
      justification,
    };
    setIncidentLogs((prev) => [newLog, ...prev]);
  };

  const triggerMission = (mission: 'exchange-tip' | 'usb-block' | 'chrome-block' | 'incidents') => {
    if (mission === 'exchange-tip') {
      setActiveTab('exchange');
      setEmailTo('partner@external-vendor.com');
      setEmailBody('業務委託手続きのため、従業員個人番号を送付します。\nマイナンバー: 1234-5678-9012\n確認よろしくお願いいたします。');
      setExchangeSentStatus(null);
    } else if (mission === 'usb-block') {
      setActiveTab('endpoint');
      triggerEndpointAction('USBメモリへの保存・コピー', 'block');
    } else if (mission === 'chrome-block') {
      setActiveTab('endpoint');
      triggerEndpointAction('Google Chrome から個人用クラウドへUL', 'block');
    } else if (mission === 'incidents') {
      setActiveTab('incidents');
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>SC-500 スコープ 2</span>
              <span>·</span>
              <span>データ損失防止 (DLP) の実装と管理</span>
              <span>·</span>
              <span>Endpoint DLP & Policy Tips & Incident Alerting</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              DLP (データ損失防止) & エンドポイント検証シミュレーター
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Exchange Online・Teams・SharePointおよびWindows 11端末(Endpoint DLP)におけるUSBメモリ書き出し・印刷・Chrome Webアップロード制限・Outlookポリシーヒント・管理者インシデント発報の挙動を検証できます。
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToQuiz?.('q3')}
              className="px-3 py-2 text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 rounded hover:bg-sky-900/50 transition-colors flex items-center gap-1.5"
            >
              <span>関連の試験問題を見る</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 1-Click Quick Demo Mission Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
            <ShieldAlert className="w-4 h-4" />
            <span>【迷ったらここを押すだけ！】DLPの主要動作を1クリックで体験:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => triggerMission('exchange-tip')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-sky-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-sky-950 border border-sky-700 text-sky-400 font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">Outlook メール送信 ➔ ポリシーヒント</div>
                <div className="text-[10px] text-sky-400 font-medium">結果: 外部宛先で警告バナー表示</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('usb-block')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-rose-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-rose-950 border border-rose-700 text-rose-400 font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">USBへコピー ➔ Windows 11 ブロック</div>
                <div className="text-[10px] text-rose-400 font-medium">結果: トースト通知 & インシデント発報</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('chrome-block')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-amber-900/60 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-amber-950 border border-amber-700 text-amber-400 font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">ChromeでWebアップロード ➔ 制限</div>
                <div className="text-[10px] text-amber-400 font-medium">結果: 拡張機能/非許可ブラウザ制御</div>
              </div>
            </button>

            <button
              onClick={() => triggerMission('incidents')}
              className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded text-left transition-colors flex items-start gap-2"
            >
              <span className="w-5 h-5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-bold text-[11px] flex items-center justify-center shrink-0">4</span>
              <div>
                <div className="text-xs font-semibold text-slate-200">管理者コンソールで違反ログを確認</div>
                <div className="text-[10px] text-slate-400 font-medium">結果: 上書き理由や重大度の一覧</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout: Policy Settings Deck & Interactive Client Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: DLP Policy Configuration Builder (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-400" />
                <span>DLP ポリシー構成 (Policy Engine)</span>
              </h2>
              {/* Policy Mode Selector */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                <button
                  onClick={() => setPolicy({ ...policy, mode: 'test-no-notif' })}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                    policy.mode === 'test-no-notif'
                      ? 'bg-slate-800 text-sky-300 border border-slate-700'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  テスト(通知無)
                </button>
                <button
                  onClick={() => setPolicy({ ...policy, mode: 'enforce' })}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded ${
                    policy.mode === 'enforce'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  強制有効化 (Enforce)
                </button>
              </div>
            </div>

            {/* Scope / Locations */}
            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-2">
                  保護の適用場所 (Locations):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'exchange', label: 'Exchange メール', icon: <Mail className="w-3.5 h-3.5" /> },
                    { key: 'endpoints', label: 'Windows 端末 (Endpoint)', icon: <Laptop className="w-3.5 h-3.5" /> },
                    { key: 'sharepoint', label: 'SharePoint サイト', icon: <HardDrive className="w-3.5 h-3.5" /> },
                    { key: 'onedrive', label: 'OneDrive アカウント', icon: <Share2 className="w-3.5 h-3.5" /> },
                    { key: 'teams', label: 'Teams チャット・チャネル', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                    { key: 'cloudApps', label: 'Cloud Apps (Defender)', icon: <Cloud className="w-3.5 h-3.5" /> },
                  ].map((loc) => {
                    const isChecked = policy.locations[loc.key as keyof typeof policy.locations];
                    return (
                      <button
                        key={loc.key}
                        onClick={() =>
                          setPolicy({
                            ...policy,
                            locations: {
                              ...policy.locations,
                              [loc.key]: !isChecked,
                            },
                          })
                        }
                        className={`p-2 rounded border text-left flex items-center justify-between transition-colors ${
                          isChecked
                            ? 'bg-sky-950/40 border-sky-500/40 text-sky-200'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {loc.icon}
                          <span className="truncate">{loc.label}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {isChecked ? 'ON' : 'OFF'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Endpoint DLP Action Controls */}
              <div className="pt-3 border-t border-slate-800">
                <label className="text-slate-300 font-semibold block mb-2 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5 text-sky-400" />
                  <span>エンドポイント DLP 制御ルール (Endpoint Restrictions):</span>
                </label>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Usb className="w-3.5 h-3.5" /> USBメモリ書出:
                    </span>
                    <select
                      value={policy.endpointRestrictions.usbCopy}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          endpointRestrictions: {
                            ...policy.endpointRestrictions,
                            usbCopy: e.target.value as any,
                          },
                        })
                      }
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                    >
                      <option value="allow">許可 (Allow)</option>
                      <option value="audit">監査のみ (Audit)</option>
                      <option value="block-with-override">上書きを許可してブロック</option>
                      <option value="block">完全にブロック (Block)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Copy className="w-3.5 h-3.5" /> クリップボード共有:
                    </span>
                    <select
                      value={policy.endpointRestrictions.clipboard}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          endpointRestrictions: {
                            ...policy.endpointRestrictions,
                            clipboard: e.target.value as any,
                          },
                        })
                      }
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                    >
                      <option value="allow">許可 (Allow)</option>
                      <option value="audit">監査のみ</option>
                      <option value="block">ブロック (非許可アプリへの貼付禁止)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Printer className="w-3.5 h-3.5" /> ローカル印刷:
                    </span>
                    <select
                      value={policy.endpointRestrictions.printing}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          endpointRestrictions: {
                            ...policy.endpointRestrictions,
                            printing: e.target.value as any,
                          },
                        })
                      }
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                    >
                      <option value="allow">許可</option>
                      <option value="audit">監査のみ</option>
                      <option value="block">印刷ブロック</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5" /> 非許可ブラウザ (Chrome等):
                    </span>
                    <select
                      value={policy.endpointRestrictions.unallowedBrowsers}
                      onChange={(e) =>
                        setPolicy({
                          ...policy,
                          endpointRestrictions: {
                            ...policy.endpointRestrictions,
                            unallowedBrowsers: e.target.value as any,
                          },
                        })
                      }
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 focus:outline-none focus:border-sky-500 font-mono text-[11px]"
                    >
                      <option value="allow">許可</option>
                      <option value="audit">監査のみ</option>
                      <option value="block">ブロック (Edge以外を制限)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Enforcement & Override Toggles */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="flex items-center justify-between text-slate-300">
                  <span>アクセス制限/ブロック (Block Access):</span>
                  <input
                    type="checkbox"
                    checked={policy.actions.blockAccess}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        actions: { ...policy.actions, blockAccess: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500 bg-slate-950 border-slate-800"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300">
                  <span>正当な業務理由による上書きを許可:</span>
                  <input
                    type="checkbox"
                    checked={policy.actions.allowOverride}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        actions: { ...policy.actions, allowOverride: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500 bg-slate-950 border-slate-800"
                  />
                </label>
                <label className="flex items-center justify-between text-slate-300">
                  <span>管理者にインシデントアラートを発報:</span>
                  <input
                    type="checkbox"
                    checked={policy.actions.generateIncidentAlert}
                    onChange={(e) =>
                      setPolicy({
                        ...policy,
                        actions: { ...policy.actions, generateIncidentAlert: e.target.checked },
                      })
                    }
                    className="rounded text-sky-600 focus:ring-sky-500 bg-slate-950 border-slate-800"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Exam Knowledge Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>DLP 試験頻出ポイント (SC-500)</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li>
                <strong>ポリシーモードの3形態:</strong> 「テストモード(通知無)」「テストモード(通知有)」「強制有効化(Enforce)」。本番稼働前に影響度を測るためテストモードで運用することがMicrosoftベストプラクティス。
              </li>
              <li>
                <strong>サードパーティブラウザ:</strong> Chromeでアップロードを検査するには「Microsoft Purview Extension」の展開が不可欠。展開していない場合は「非許可ブラウザ」グループでアクセス自体を遮断する。
              </li>
              <li>
                <strong>ポリシーヒント (Policy Tips):</strong> ユーザー教育のための情報通知。上書き理由(Justification)の入力有無を切り替え可能。
              </li>
            </ul>
          </div>
        </div>

        {/* Right Zone: Interactive Client Stage & Live Incident Table (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Segmented Tab Bar */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              onClick={() => setActiveTab('exchange')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'exchange'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Exchange メール送信テスト</span>
            </button>
            <button
              onClick={() => setActiveTab('endpoint')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'endpoint'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Endpoint DLP デバイス検証</span>
            </button>
            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === 'incidents'
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>インシデント調査ログ ({incidentLogs.length})</span>
            </button>
          </div>

          {/* TAB 1: Exchange Mail Client Simulator (Outlook UI Mock) */}
          {activeTab === 'exchange' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    Outlook on the web (送信テスト環境)
                  </span>
                </div>
                <div className="text-xs text-slate-500">差出人: t.tanaka@contoso.com</div>
              </div>

              {/* Policy Tip Banner (Real-time Purview Outlook Tip) */}
              {dlpTriggersOnEmail && policy.actions.notifyUser && (
                <div className="px-4 py-3 bg-amber-950/40 border-b border-amber-800/60 flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-amber-300">
                      ポリシーヒント: 組織のデータ損失防止 (DLP) 警告
                    </div>
                    <div className="text-slate-300 mt-0.5">{policy.actions.policyTip}</div>
                    <div className="text-slate-400 mt-1 flex items-center gap-2 text-[11px]">
                      <span>検出項目: 日本 個人番号 (マイナンバー)</span>
                      <span>·</span>
                      <span>外部送信先: {emailTo}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Form */}
              <div className="p-4 space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400 font-medium">宛先 (To):</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEmailTo('partner@external-vendor.com')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          isExternalRecipient
                            ? 'bg-amber-950/50 text-amber-300 border-amber-800/50'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        社外アドレス (外部共有)
                      </button>
                      <button
                        onClick={() => setEmailTo('i.suzuki@contoso.com')}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          !isExternalRecipient
                            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                            : 'bg-slate-950 text-slate-500 border-slate-800'
                        }`}
                      >
                        社内アドレス (@contoso.com)
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">件名 (Subject):</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">本文 (Body):</label>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>

                {exchangeSentStatus && (
                  <div className={`p-3 rounded text-xs flex items-center gap-2 ${
                    exchangeSentStatus.includes('失敗') || exchangeSentStatus.includes('ブロック')
                      ? 'bg-rose-950/40 text-rose-300 border border-rose-800/50'
                      : 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
                  }`}>
                    {exchangeSentStatus.includes('失敗') ? (
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    )}
                    <span>{exchangeSentStatus}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-500">
                    現在のDLP評価: {dlpTriggersOnEmail ? (
                      <strong className="text-amber-400">ポリシー違反条件に合致 (制限対象)</strong>
                    ) : (
                      <strong className="text-emerald-400">合格 (制限なし)</strong>
                    )}
                  </div>
                  <button
                    onClick={handleSendEmail}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded transition-colors flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>メールを送信する</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Endpoint DLP Simulator (Windows 11 Workspace) */}
          {activeTab === 'endpoint' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-sky-400" />
                    <span>Windows 11 クライアント端末操作シミュレーター</span>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    対象端末: <span className="font-mono text-slate-300">CONTOSO-PC-042 (Intune & Defender オンボード済)</span>
                  </div>
                </div>
                <div className="text-xs text-slate-500">
                  検査ファイル: <span className="font-mono text-slate-300">2026_マイナンバー台帳.xlsx</span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                機密情報(マイナンバー)を含むファイルを操作する際、Endpoint DLPポリシーがどのように動作するかテストしてください。
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => triggerEndpointAction('USBメモリへの保存・コピー', policy.endpointRestrictions.usbCopy)}
                  className="p-3 bg-slate-950 border border-slate-800 rounded text-left hover:border-slate-700 hover:bg-slate-900/80 transition-colors flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
                    <Usb className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">USBメモリへコピー</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      設定値: <span className="font-mono text-sky-300">{policy.endpointRestrictions.usbCopy}</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => triggerEndpointAction('クリップボード共有 (メモ帳/非管理アプリへ)', policy.endpointRestrictions.clipboard)}
                  className="p-3 bg-slate-950 border border-slate-800 rounded text-left hover:border-slate-700 hover:bg-slate-900/80 transition-colors flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
                    <Copy className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">クリップボードをペースト</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      設定値: <span className="font-mono text-sky-300">{policy.endpointRestrictions.clipboard}</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => triggerEndpointAction('Google Chrome から個人用クラウドへUL', policy.endpointRestrictions.unallowedBrowsers)}
                  className="p-3 bg-slate-950 border border-slate-800 rounded text-left hover:border-slate-700 hover:bg-slate-900/80 transition-colors flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">ChromeでWebアップロード</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      設定値: <span className="font-mono text-sky-300">{policy.endpointRestrictions.unallowedBrowsers}</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => triggerEndpointAction('社内複合機へのローカル印刷', policy.endpointRestrictions.printing)}
                  className="p-3 bg-slate-950 border border-slate-800 rounded text-left hover:border-slate-700 hover:bg-slate-900/80 transition-colors flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded bg-sky-950/60 border border-sky-800/60 flex items-center justify-center text-sky-400 shrink-0">
                    <Printer className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-200">ファイルを印刷</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      設定値: <span className="font-mono text-sky-300">{policy.endpointRestrictions.printing}</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Windows 11 Toast Notification Mockup */}
              {toastNotification && (
                <div className="mt-4 p-4 bg-slate-950 border-2 border-sky-500/80 rounded-lg shadow-2xl flex items-start gap-3 animate-in fade-in slide-in-from-bottom duration-200">
                  <div className="w-8 h-8 rounded bg-sky-900/60 flex items-center justify-center text-sky-300 shrink-0">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{toastNotification.title}</span>
                      <span className="text-[10px] text-slate-500 font-mono">今</span>
                    </div>
                    <div className="text-slate-300 mt-1 leading-relaxed">
                      {toastNotification.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Incident Explorer Table */}
          {activeTab === 'incidents' && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-300">
                    Purview コンプライアンス インシデント一覧
                  </span>
                </div>
                <span className="text-xs text-slate-500">合計 {incidentLogs.length} 件</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 text-[11px]">
                    <tr>
                      <th className="py-2 px-3">時刻</th>
                      <th className="py-2 px-3">発生場所</th>
                      <th className="py-2 px-3">操作内容</th>
                      <th className="py-2 px-3">検出機密情報</th>
                      <th className="py-2 px-3">アクション結果</th>
                      <th className="py-2 px-3">重大度</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                    {incidentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                        <td className="py-2.5 px-3 text-slate-200 whitespace-nowrap">{log.source}</td>
                        <td className="py-2.5 px-3 text-slate-300">{log.activity}</td>
                        <td className="py-2.5 px-3 text-sky-300 font-sans">{log.sitDetected}</td>
                        <td className="py-2.5 px-3 text-slate-300 font-sans">
                          <div>{log.actionTaken}</div>
                          {log.justification && (
                            <div className="text-[10px] text-amber-400 italic font-mono mt-0.5">
                              理由: {log.justification}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`px-1.5 py-0.5 rounded font-medium border text-[10px] ${
                            log.severity === 'High'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                              : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Override Business Justification Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">DLP ポリシー上書き要求 (Justification)</h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  外部宛てメールの送信には承認された業務上の理由が必要です。
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              このメッセージには組織の機密データ（個人番号）が含まれています。上書きを許可して送信する場合、管理者に通知され監査証跡として保存されます。
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-slate-400 block font-medium">正当な業務理由を入力してください:</label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="例: 社外顧問税理士との機密保持契約(NDA)に基づく法定届出業務のため..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded p-2.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
              >
                送信を中止する
              </button>
              <button
                onClick={handleConfirmOverride}
                disabled={!overrideReason.trim()}
                className="px-4 py-2 text-xs font-medium bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:pointer-events-none text-white rounded transition-colors"
              >
                理由を記録して上書き送信
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
