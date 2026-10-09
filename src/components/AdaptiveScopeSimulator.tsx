import React, { useState, useMemo } from 'react';
import { INITIAL_USERS } from '../data/purviewData';
import { UserProfile } from '../types/purview';
import { 
  Layers, 
  Users, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  AlertTriangle, 
  RefreshCw,
  Clock,
  ShieldCheck,
  Building
} from 'lucide-react';

interface AdaptiveScopeSimulatorProps {
  onNavigateToQuiz?: (questionId: string) => void;
}

export const AdaptiveScopeSimulator: React.FC<AdaptiveScopeSimulatorProps> = ({ onNavigateToQuiz }) => {
  // Roster of users in Microsoft Entra ID
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);

  // Dynamic Query Filter Configuration
  const [targetDepartment, setTargetDepartment] = useState<string>('Finance');
  const [targetCountry, setTargetCountry] = useState<string>('JP');
  const [applyCountryFilter, setApplyCountryFilter] = useState<boolean>(true);

  // Evaluate which users match the Adaptive Scope Query
  const matchedUsers = useMemo(() => {
    return users.filter((u) => {
      const deptMatches = targetDepartment === 'ALL' || u.department.toLowerCase() === targetDepartment.toLowerCase();
      const countryMatches = !applyCountryFilter || u.country.toLowerCase() === targetCountry.toLowerCase();
      return deptMatches && countryMatches;
    });
  }, [users, targetDepartment, targetCountry, applyCountryFilter]);

  // Handler to mutate user department (simulates HR transfer in Entra ID)
  const updateUserDepartment = (userId: string, newDept: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, department: newDept } : u))
    );
  };

  const updateUserCountry = (userId: string, newCountry: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, country: newCountry } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>SC-500 スコープ 5</span>
              <span>·</span>
              <span>データガバナンスとスコープ設計</span>
              <span>·</span>
              <span>Adaptive Scopes vs Static Scopes & Entra ID Attributes</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              アダプティブスコープ (Adaptive Scopes) 動的評価シミュレーター
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Microsoft Entra ID (旧Azure AD) のユーザー属性クエリに基づいて、保持ポリシーやDLPポリシーの対象メンバーシップが自動的に変動する仕組みを検証します。静的スコープ(手動管理)との運用負荷の違いを体感できます。
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToQuiz?.('q5')}
              className="px-3 py-2 text-xs font-medium text-sky-300 bg-sky-950/60 border border-sky-800/60 rounded hover:bg-sky-900/50 transition-colors flex items-center gap-1.5"
            >
              <span>関連の試験問題を見る</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Zone Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Zone: Adaptive Scope Query Builder (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Filter className="w-4 h-4 text-sky-400" />
                <span>アダプティブスコープ クエリ定義 (OPATH)</span>
              </h2>
              <span className="text-xs text-slate-500">Purview 管理センター</span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1.5">
                  スコープ対象の部署属性 (Department -eq):
                </label>
                <select
                  value={targetDepartment}
                  onChange={(e) => setTargetDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                >
                  <option value="Finance">Finance (財務部)</option>
                  <option value="Sales">Sales (営業部)</option>
                  <option value="Legal">Legal (法務部)</option>
                  <option value="HR">HR (人事部)</option>
                  <option value="Engineering">Engineering (開発部)</option>
                  <option value="ALL">すべて (All Departments)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-semibold">
                    国・地域属性 (CountryOrRegion -eq):
                  </label>
                  <label className="flex items-center gap-1.5 text-slate-400">
                    <input
                      type="checkbox"
                      checked={applyCountryFilter}
                      onChange={(e) => setApplyCountryFilter(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500 bg-slate-950 border-slate-700"
                    />
                    <span className="text-[11px]">国条件を有効化</span>
                  </label>
                </div>
                <select
                  value={targetCountry}
                  disabled={!applyCountryFilter}
                  onChange={(e) => setTargetCountry(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500 disabled:opacity-40"
                >
                  <option value="JP">JP (日本)</option>
                  <option value="US">US (米国)</option>
                </select>
              </div>

              {/* Generated OPATH Query representation */}
              <div className="pt-2">
                <div className="text-[11px] text-slate-400 mb-1">自動生成された OPATH クエリ:</div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded font-mono text-[11px] text-sky-300 break-all">
                  {`(Department -eq "${targetDepartment}") ${applyCountryFilter ? `-and (CountryOrRegion -eq "${targetCountry}")` : ''}`}
                </div>
              </div>

              {/* Policy Bound to this scope */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded space-y-1.5">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span>バインドされている保持ポリシー:</span>
                </div>
                <div className="text-slate-400 text-[11px]">
                  ポリシー名: <strong className="text-slate-200">「特定部門 10年メール保持ポリシー」</strong>
                </div>
                <div className="text-slate-500 text-[11px]">
                  スコープにマッチしたユーザーのメールボックスおよびOneDriveが即座に10年間保護されます。
                </div>
              </div>
            </div>
          </div>

          {/* Exam Reference Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>SC-500 試験で狙われるスコープの違い</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                <strong>静的スコープ (Static Scope):</strong> 管理者が対象メールボックスを個別に指定。異動時にポリシーを再編集しなければならず、規模拡大時に破綻します。
              </p>
              <p>
                <strong>アダプティブスコープ (Adaptive Scope):</strong> 属性クエリでメンバーを自動解決。ユーザーの所属部署が変わるだけでポリシー対象が自動更新されるため、管理者の日常作業がゼロになります。
              </p>
              <p className="text-slate-400 text-[11px]">
                ※ライセンス要件: アダプティブスコープの使用には Microsoft 365 E5 または Purview Compliance E5 が必要です。
              </p>
            </div>
          </div>
        </div>

        {/* Right Zone: Interactive User Directory Roster (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Microsoft Entra ID ユーザー一覧 (リアルタイム属性変更)</span>
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  属性ドロップダウンを変更すると、アダプティブスコープの適用可否が即座に切り替わります。
                </div>
              </div>
              <span className="text-xs text-sky-300 font-mono font-medium">
                対象合致: {matchedUsers.length} / {users.length} 名
              </span>
            </div>

            {/* User Roster Cards */}
            <div className="space-y-2.5">
              {users.map((user) => {
                const isMatched = matchedUsers.some((m) => m.id === user.id);
                return (
                  <div
                    key={user.id}
                    className={`p-3.5 rounded border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                      isMatched
                        ? 'bg-sky-950/30 border-sky-600/60'
                        : 'bg-slate-950 border-slate-800/80 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{user.displayName}</span>
                        <span className="font-mono text-slate-500 text-[11px]">{user.email}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-1 flex items-center gap-3">
                        <span>役職: {user.jobTitle}</span>
                        <span>·</span>
                        <span>
                          保持ポリシー適用状態: <strong className={isMatched ? 'text-emerald-400' : 'text-slate-500'}>
                            {isMatched ? '適用中 (10年保持)' : '対象外'}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* Department selector to mutate */}
                      <select
                        value={user.department}
                        onChange={(e) => updateUserDepartment(user.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-sky-500"
                        title="部署属性を変更"
                      >
                        <option value="Finance">Finance</option>
                        <option value="Sales">Sales</option>
                        <option value="Legal">Legal</option>
                        <option value="HR">HR</option>
                        <option value="Engineering">Engineering</option>
                      </select>

                      {/* Country selector to mutate */}
                      <select
                        value={user.country}
                        onChange={(e) => updateUserCountry(user.id, e.target.value)}
                        className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-[11px] focus:outline-none focus:border-sky-500"
                        title="国属性を変更"
                      >
                        <option value="JP">JP</option>
                        <option value="US">US</option>
                      </select>

                      <div className="w-7 flex justify-center" title={isMatched ? 'スコープ合致' : 'スコープ対象外'}>
                        {isMatched ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Static vs Adaptive Comparison Matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h4 className="text-xs font-bold text-white mb-3">
              比較: 静的スコープ (Static) vs アダプティブスコープ (Adaptive)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-500 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="py-2 px-3">評価項目</th>
                    <th className="py-2 px-3">静的スコープ (Static)</th>
                    <th className="py-2 px-3 text-sky-400">アダプティブスコープ (Adaptive)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-[11px]">
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-medium">メンバーシップ決定</td>
                    <td className="py-2 px-3 text-slate-300">管理者が手動で個別指定</td>
                    <td className="py-2 px-3 text-sky-300 font-medium">Entra ID属性クエリで自動評価</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-medium">組織異動時の対応</td>
                    <td className="py-2 px-3 text-amber-400">ポリシー再編集・手動追加が必要</td>
                    <td className="py-2 px-3 text-emerald-400">属性更新のみで完全自動追従</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-medium">適用可能サービス</td>
                    <td className="py-2 px-3 text-slate-300">Exchange, SharePoint, OneDrive</td>
                    <td className="py-2 px-3 text-slate-300">ユーザー, サイト, Microsoft 365グループ</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 text-slate-400 font-medium">必要ライセンス</td>
                    <td className="py-2 px-3 text-slate-300">Microsoft 365 E3 / E5</td>
                    <td className="py-2 px-3 text-sky-300 font-semibold">Microsoft 365 E5 / E5 Compliance</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
