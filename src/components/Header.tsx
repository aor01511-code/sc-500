import React, { useState } from 'react';
import { PurviewDomain } from '../types/purview';
import { 
  ShieldCheck, 
  UserCheck, 
  Key, 
  Layers, 
  Server, 
  Fingerprint, 
  Lock, 
  Clock, 
  HelpCircle, 
  BookOpen, 
  RotateCcw, 
  Sparkles, 
  Users,
  Network,
  Workflow,
  Laptop,
  ShieldAlert,
  ChevronDown,
  FolderTree,
  Cpu,
  Boxes,
  Activity
} from 'lucide-react';

interface HeaderProps {
  currentTab: PurviewDomain;
  onSelectTab: (tab: PurviewDomain) => void;
  onResetAll: () => void;
  onOpenTour: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onResetAll,
  onOpenTour,
}) => {
  const entraTabs: PurviewDomain[] = ['hybrid-id', 'entra-roles', 'entra-licenses', 'entra-auth', 'entra-mgmt'];
  const azureSecTabs: PurviewDomain[] = [
    'azure-rbac-pim', 
    'azure-network-nsg', 
    'azure-appgw-firewall', 
    'azure-host-sec',
    'azure-endpoint-mgmt',
    'azure-container-sec',
    'azure-aks-k8s',
    'azure-monitor-sentinel'
  ];
  const purviewTabs: PurviewDomain[] = ['sensitivity', 'dlp', 'retention'];
  const commonTabs: PurviewDomain[] = ['exam-quiz', 'cheatsheet'];

  // Identify current category
  const activeCategory: 'entra' | 'azure-sec' | 'purview' | 'common' = 
    entraTabs.includes(currentTab) ? 'entra' :
    azureSecTabs.includes(currentTab) ? 'azure-sec' :
    purviewTabs.includes(currentTab) ? 'purview' : 'common';

  const [selectedCategory, setSelectedCategory] = useState<'entra' | 'azure-sec' | 'purview' | 'common'>(activeCategory);

  // Sync category if tab changes externally
  React.useEffect(() => {
    setSelectedCategory(activeCategory);
  }, [activeCategory]);

  const entraNavItems: { id: PurviewDomain; label: string; icon: React.ReactNode }[] = [
    { id: 'hybrid-id', label: 'ハイブリッドID & AADC', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'entra-roles', label: 'ロール権限 & 委任', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'entra-licenses', label: 'ライセンス (CA / PIM)', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'entra-auth', label: 'SSO & パスワードレス', icon: <Fingerprint className="w-3.5 h-3.5" /> },
    { id: 'entra-mgmt', label: 'ゲスト・マネージドID', icon: <Server className="w-3.5 h-3.5" /> },
  ];

  const azureSecNavItems: { id: PurviewDomain; label: string; icon: React.ReactNode }[] = [
    { id: 'azure-rbac-pim', label: 'PIM & 階層・Policy・ロック', icon: <FolderTree className="w-3.5 h-3.5" /> },
    { id: 'azure-network-nsg', label: 'NSG & VNet & Private Link', icon: <Network className="w-3.5 h-3.5" /> },
    { id: 'azure-appgw-firewall', label: 'Firewall & AppGW (WAF)', icon: <Workflow className="w-3.5 h-3.5" /> },
    { id: 'azure-host-sec', label: 'Defender & PAW特権端末', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'azure-endpoint-mgmt', label: 'Intune & Bastion & ADE', icon: <Laptop className="w-3.5 h-3.5" /> },
    { id: 'azure-container-sec', label: 'コンテナ & ACI & ACR', icon: <Cpu className="w-3.5 h-3.5" /> },
    { id: 'azure-aks-k8s', label: 'AKS & Kubernetes基盤', icon: <Boxes className="w-3.5 h-3.5" /> },
    { id: 'azure-monitor-sentinel', label: 'Monitor & Sentinel (SIEM)', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  const purviewNavItems: { id: PurviewDomain; label: string; icon: React.ReactNode }[] = [
    { id: 'sensitivity', label: '感度ラベル & SIT', icon: <Lock className="w-3.5 h-3.5" /> },
    { id: 'dlp', label: 'DLP & エンドポイント', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'retention', label: '保持の4大原則', icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  const commonNavItems: { id: PurviewDomain; label: string; icon: React.ReactNode }[] = [
    { id: 'exam-quiz', label: '実戦シナリオ問題', icon: <HelpCircle className="w-3.5 h-3.5" /> },
    { id: 'cheatsheet', label: '要点チートシート', icon: <BookOpen className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Tier 1: Brand & Category Switcher */}
        <div className="flex items-center justify-between h-14 border-b border-slate-900">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-sky-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-white leading-tight">
                Microsoft セキュリティ & Entra ID 検証スタジオ
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                SC-300 / SC-500 / AZ-500 対策実機シミュレーター
              </span>
            </div>
          </div>

          {/* Category Switcher Tabs */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => {
                setSelectedCategory('entra');
                if (!entraTabs.includes(currentTab)) onSelectTab('hybrid-id');
              }}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'entra'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Entra ID</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 opacity-80">5</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('azure-sec');
                if (!azureSecTabs.includes(currentTab)) onSelectTab('azure-rbac-pim');
              }}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'azure-sec'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Azure セキュリティ & PIM</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 opacity-80">8</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('purview');
                if (!purviewTabs.includes(currentTab)) onSelectTab('sensitivity');
              }}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'purview'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Purview</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 opacity-80">3</span>
            </button>

            <button
              onClick={() => {
                setSelectedCategory('common');
                if (!commonTabs.includes(currentTab)) onSelectTab('exam-quiz');
              }}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1.5 ${
                selectedCategory === 'common'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>演習・要点</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-black/30 opacity-80">2</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenTour}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>ツアー</span>
            </button>
            <button
              onClick={onResetAll}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 rounded border border-transparent hover:bg-slate-900 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tier 2: Sub-navigation based on selected Category */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar text-xs">
          {selectedCategory === 'entra' &&
            entraNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

          {selectedCategory === 'azure-sec' &&
            azureSecNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

          {selectedCategory === 'purview' &&
            purviewNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

          {selectedCategory === 'common' &&
            commonNavItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
        </div>
      </div>
    </header>
  );
};
