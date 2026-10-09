import React, { useState } from 'react';
import { 
  Lock, 
  Smartphone, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  ArrowRight,
  Globe,
  Laptop,
  Fingerprint,
  Layers
} from 'lucide-react';

export const EntraAuthAndSSOSimulator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sso' | 'mfa-passwordless'>('mfa-passwordless');

  // Interactive Sign-in Simulation State
  const [selectedMethod, setSelectedMethod] = useState<'password' | 'sms' | 'authenticator-push' | 'number-matching' | 'fido2'>('number-matching');
  const [signInState, setSignInState] = useState<'idle' | 'challenging' | 'authenticated'>('idle');
  const [targetNumber, setTargetNumber] = useState<number>(48);
  const [enteredNumber, setEnteredNumber] = useState<string>('');
  const [ssoProtocol, setSsoProtocol] = useState<'saml' | 'oidc' | 'seamless'>('saml');

  const handleStartSignIn = () => {
    setSignInState('challenging');
    setEnteredNumber('');
    setTargetNumber(Math.floor(10 + Math.random() * 89));
  };

  const handleVerifyNumber = () => {
    if (parseInt(enteredNumber, 10) === targetNumber) {
      setSignInState('authenticated');
    } else {
      alert('番号が一致しません！スマートフォンに入力された番号を確認してください。');
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
              <span>認証基盤 & シングルサインオン</span>
              <span>·</span>
              <span>SSO & MFA & Passwordless Authentication</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              シングルサインオン (SSO) & 多要素認証・パスワードレス検証
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              SAML 2.0 / OIDCトークン連携の仕組みや、SMS認証からAuthenticatorナンバーマッチング、FIDO2セキュリティキー/Windows Helloによるフィッシング耐性(Phishing-resistant)認証までの強度差を体験できます。
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
        <button
          onClick={() => setActiveTab('mfa-passwordless')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'mfa-passwordless'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Fingerprint className="w-4 h-4 text-sky-400" />
          <span>多要素認証 (MFA) & パスワードレス体験</span>
        </button>

        <button
          onClick={() => setActiveTab('sso')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'sso'
              ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-400" />
          <span>シングルサインオン (SSO) プロトコル連携</span>
        </button>
      </div>

      {/* TAB 1: MFA & Passwordless Playground */}
      {activeTab === 'mfa-passwordless' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Method Selection & Strength Pyramid (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>認証強度のピラミッド (選択してサインインテスト)</span>
                </h3>
              </div>

              <div className="space-y-2">
                {[
                  {
                    id: 'fido2' as const,
                    name: 'FIDO2 / Passkey / Windows Hello for Business',
                    level: 'フィッシング耐性 (最高強度)',
                    desc: '秘密鍵がデバイス内のTPM/セキュリティキーに保管され、ドメインバインディングにより偽サイトへの情報流出が物理的に不可能。',
                    strengthColor: 'text-emerald-400 border-emerald-800 bg-emerald-950/40',
                  },
                  {
                    id: 'number-matching' as const,
                    name: 'Microsoft Authenticator (ナンバーマッチング)',
                    level: '高強度 (推奨)',
                    desc: '画面に表示された2桁の数字をアプリに入力。夜間の無差別通知による誤承認 (MFA疲弊攻撃 / MFA Fatigue) を完全防止。',
                    strengthColor: 'text-sky-400 border-sky-800 bg-sky-950/40',
                  },
                  {
                    id: 'authenticator-push' as const,
                    name: 'Authenticator (単純プッシュ通知「承認」のみ)',
                    level: '中強度 (非推奨へ移行)',
                    desc: 'ボタンを1回タップするだけで承認。攻撃者が深夜に連打すると誤タップで侵入されるリスクあり。',
                    strengthColor: 'text-amber-400 border-amber-800 bg-amber-950/40',
                  },
                  {
                    id: 'sms' as const,
                    name: 'SMS / 音声通話 コード認証',
                    level: '低強度 (レガシーMFA)',
                    desc: 'SIMスワップ詐欺や通信傍受、フィッシングサイトでの中間者転送 (AiTM) に脆弱。',
                    strengthColor: 'text-orange-400 border-orange-800 bg-orange-950/40',
                  },
                  {
                    id: 'password' as const,
                    name: 'パスワード単体認証 (MFAなし)',
                    level: '危険 (脆弱)',
                    desc: 'パスワードスプレー攻撃や漏洩資格情報の使い回しですぐに破られる。',
                    strengthColor: 'text-rose-400 border-rose-800 bg-rose-950/40',
                  },
                ].map((m) => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedMethod(m.id);
                        setSignInState('idle');
                      }}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-slate-900 shadow-md ring-1 ring-sky-500/40 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold">{m.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${m.strengthColor}`}>
                          {m.level}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed mt-1">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Interactive Sign-in Device Simulation Stage (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-sky-400" />
                  <span>クライアント サインイン体験シミュレーション</span>
                </h3>
                <span className="text-xs text-slate-500">ログイン先: portal.azure.com</span>
              </div>

              {signInState === 'idle' && (
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 text-center space-y-4 text-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-sky-400">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">サインインの開始</h4>
                    <p className="text-slate-400 mt-1">
                      選択された認証方式: <strong className="text-sky-300">{selectedMethod}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleStartSignIn}
                    className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded transition-colors inline-flex items-center gap-2"
                  >
                    <span>サインインを実行</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {signInState === 'challenging' && (
                <div className="bg-slate-950 border border-sky-500/60 rounded-lg p-6 space-y-5 text-xs animate-in fade-in duration-200">
                  {/* Number Matching Experience */}
                  {selectedMethod === 'number-matching' && (
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <span className="text-slate-400">ブラウザ画面 (PC)</span>
                        <h4 className="text-sm font-bold text-white">
                          Microsoft Authenticator アプリを開き、以下の数値を入力してください:
                        </h4>
                        <div className="inline-block px-6 py-3 bg-slate-900 border-2 border-sky-400 rounded-lg font-mono text-3xl font-extrabold text-sky-300 tracking-wider">
                          {targetNumber}
                        </div>
                      </div>

                      {/* Mocked Smartphone Modal Screen */}
                      <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 text-slate-300 font-semibold">
                          <Smartphone className="w-4 h-4 text-sky-400" />
                          <span>スマートフォン側の Authenticator 画面:</span>
                        </div>
                        <p className="text-slate-400 text-[11px]">
                          「サインインを承認しますか？ PC画面に表示されている番号を入力してください」
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="数字を入力"
                            value={enteredNumber}
                            onChange={(e) => setEnteredNumber(e.target.value)}
                            className="bg-slate-950 border border-slate-700 rounded p-2 text-center text-lg font-mono text-white w-24 focus:outline-none focus:border-sky-500"
                          />
                          <button
                            onClick={handleVerifyNumber}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded"
                          >
                            送信して承認
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FIDO2 Experience */}
                  {selectedMethod === 'fido2' && (
                    <div className="text-center space-y-4 p-4">
                      <Fingerprint className="w-12 h-12 text-emerald-400 mx-auto animate-pulse" />
                      <h4 className="text-sm font-bold text-white">
                        Windows Hello または FIDO2 セキュリティキーをタッチしてください
                      </h4>
                      <p className="text-slate-400 text-[11px]">
                        パスワードは一切ネットワーク送信されず、端末内部の公開鍵暗号チャレンジで署名されます。
                      </p>
                      <button
                        onClick={() => setSignInState('authenticated')}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                      >
                        生体認証 / キーをタッチ (シミュレート)
                      </button>
                    </div>
                  )}

                  {/* Password alone or SMS */}
                  {(selectedMethod === 'password' || selectedMethod === 'sms' || selectedMethod === 'authenticator-push') && (
                    <div className="text-center space-y-4 p-4">
                      <CheckCircle2 className="w-10 h-10 text-sky-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">
                        {selectedMethod === 'password' ? 'パスワード認証完了' : '承認リクエストを受信'}
                      </h4>
                      <button
                        onClick={() => setSignInState('authenticated')}
                        className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded"
                      >
                        完了して続行
                      </button>
                    </div>
                  )}
                </div>
              )}

              {signInState === 'authenticated' && (
                <div className="bg-emerald-950/30 border border-emerald-800/60 rounded-lg p-6 text-center space-y-3 text-xs animate-in zoom-in-95 duration-200">
                  <div className="w-12 h-12 rounded-full bg-emerald-900/60 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-300">
                    サインイン成功 (Authenticated)
                  </h4>
                  <p className="text-slate-300 text-[11px] max-w-sm mx-auto">
                    Entra ID によりユーザーの身元が安全に検証され、有効なPRT (プライマリ更新トークン) が発行されました。
                  </p>
                  <button
                    onClick={() => setSignInState('idle')}
                    className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs"
                  >
                    別の認証方式をテストする
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SSO Architecture */}
      {activeTab === 'sso' && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-5 text-xs">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" />
              <span>シングルサインオン (SSO) プロトコル比較 & トークンフロー</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                id: 'saml' as const,
                title: 'SAML 2.0 (Security Assertion Markup Language)',
                desc: 'レガシーおよび主要エンタープライズSaaS (Salesforce, ServiceNow, Box等) で広く使われるXMLベースのSSO標準。',
                flow: 'ユーザー → サービス(SP) → Entra ID(IdP)で認証 → SAMLアサーション発行 → SPにPOST',
              },
              {
                id: 'oidc' as const,
                title: 'OpenID Connect (OIDC) / OAuth 2.0',
                desc: 'モダンWebアプリ・モバイルアプリ向けのJSON/JWTベースの軽量認証プロトコル。',
                flow: 'ブラウザ → 認可コード取得 → Entra IDからIDトークン(JWT) & アクセストークンを取得',
              },
              {
                id: 'seamless' as const,
                title: 'シームレスSSO (Seamless SSO)',
                desc: '社内LANのオンプレミスAD参加PCにおいて、パスワードの再入力を一切不要にするKerberosチケット連携。',
                flow: 'PC → Entra IDからKerberos認証要求を受信 → Active Directoryと連携して自動ログイン',
              },
            ].map((proto) => (
              <div key={proto.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <span className="font-bold text-white">{proto.title}</span>
                <p className="text-slate-400 text-[11px] leading-relaxed">{proto.desc}</p>
                <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-sky-300">
                  {proto.flow}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>SC-300 / SC-500 試験で問われるSSOのポイント</span>
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px] list-disc list-inside leading-relaxed">
              <li><strong>Entra ID Freeでも無制限のSSOアプリ登録が可能:</strong> 以前の10アプリ上限は撤廃されています。</li>
              <li><strong>IdP-Initiated vs SP-Initiated:</strong> ユーザーが直接SaaSのURLにアクセスしてEntra IDへリダイレクトされるのが「SP-Initiated」。マイアプリポータル (myapps.microsoft.com) からアイコンをクリックして開くのが「IdP-Initiated」。</li>
              <li><strong>パスワードベースのSSO:</strong> SAMLやOIDCをサポートしない旧式Webアプリに対し、管理者が認証情報をEntra IDに暗号化保存してブラウザ拡張機能で自動代行入力する方式。</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
