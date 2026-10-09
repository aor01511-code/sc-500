/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PurviewDomain } from './types/purview';
import { Header } from './components/Header';
import { EntraRoleSimulator } from './components/EntraRoleSimulator';
import { HybridIdentitySimulator } from './components/HybridIdentitySimulator';
import { EntraLicenseSimulator } from './components/EntraLicenseSimulator';
import { EntraAuthAndSSOSimulator } from './components/EntraAuthAndSSOSimulator';
import { EntraManagementSimulator } from './components/EntraManagementSimulator';
import { AzureRbacPimSimulator } from './components/AzureRbacPimSimulator';
import { AzureNetworkNsgSimulator } from './components/AzureNetworkNsgSimulator';
import { AzureAppGatewayFirewallSimulator } from './components/AzureAppGatewayFirewallSimulator';
import { AzureHostSecuritySimulator } from './components/AzureHostSecuritySimulator';
import { AzureEndpointUpdateSimulator } from './components/AzureEndpointUpdateSimulator';
import { AzureContainerSecuritySimulator } from './components/AzureContainerSecuritySimulator';
import { AzureAksKubernetesSimulator } from './components/AzureAksKubernetesSimulator';
import { AzureMonitorSentinelSimulator } from './components/AzureMonitorSentinelSimulator';
import { SensitivitySimulator } from './components/SensitivitySimulator';
import { DlpSimulator } from './components/DlpSimulator';
import { RetentionSimulator } from './components/RetentionSimulator';
import { InsiderRiskSimulator } from './components/InsiderRiskSimulator';
import { AdaptiveScopeSimulator } from './components/AdaptiveScopeSimulator';
import { ExamQuizLab } from './components/ExamQuizLab';
import { PurviewCheatSheet } from './components/PurviewCheatSheet';
import { PortalTourModal } from './components/PortalTourModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<PurviewDomain>('azure-appgw-firewall');
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [preselectedQuestionId, setPreselectedQuestionId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState<number>(0);

  const handleResetAll = () => {
    setResetKey((prev) => prev + 1);
    setCurrentTab('azure-rbac-pim');
    setPreselectedQuestionId(null);
  };

  const handleNavigateToQuiz = (questionId?: string) => {
    setPreselectedQuestionId(questionId || null);
    setCurrentTab('exam-quiz');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToLab = (labId: PurviewDomain) => {
    setCurrentTab(labId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Navigation */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onResetAll={handleResetAll}
        onOpenTour={() => setIsTourOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div key={resetKey} className="transition-opacity duration-200">
          {/* Entra ID (Azure AD) Labs */}
          {currentTab === 'hybrid-id' && (
            <HybridIdentitySimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'entra-roles' && (
            <EntraRoleSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'entra-licenses' && (
            <EntraLicenseSimulator />
          )}

          {currentTab === 'entra-auth' && (
            <EntraAuthAndSSOSimulator />
          )}

          {currentTab === 'entra-mgmt' && (
            <EntraManagementSimulator />
          )}

          {/* Azure Infrastructure & Security Labs */}
          {currentTab === 'azure-rbac-pim' && (
            <AzureRbacPimSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'azure-network-nsg' && (
            <AzureNetworkNsgSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'azure-appgw-firewall' && (
            <AzureAppGatewayFirewallSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'azure-host-sec' && (
            <AzureHostSecuritySimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'azure-endpoint-mgmt' && (
            <AzureEndpointUpdateSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'azure-container-sec' && (
            <AzureContainerSecuritySimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'azure-aks-k8s' && (
            <AzureAksKubernetesSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'azure-monitor-sentinel' && (
            <AzureMonitorSentinelSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {/* Purview Labs */}
          {currentTab === 'sensitivity' && (
            <SensitivitySimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'dlp' && (
            <DlpSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'retention' && (
            <RetentionSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'insider-risk' && (
            <InsiderRiskSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {currentTab === 'adaptive-scope' && (
            <AdaptiveScopeSimulator onNavigateToQuiz={handleNavigateToQuiz} />
          )}

          {/* Shared Quiz & Cheat Sheet */}
          {currentTab === 'exam-quiz' && (
            <ExamQuizLab
              onJumpToLab={handleJumpToLab}
              preselectedQuestionId={preselectedQuestionId}
            />
          )}

          {currentTab === 'cheatsheet' && (
            <PurviewCheatSheet />
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 text-slate-500 text-xs py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Microsoft Entra ID & Azure Security 実機検証プラットフォーム</span>
            <span>·</span>
            <span>SC-300 / SC-500 / AZ-500 対策</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsTourOpen(true)}
              className="hover:text-slate-200 transition-colors"
            >
              機能ツアー
            </button>
            <button
              onClick={() => setCurrentTab('azure-rbac-pim')}
              className="hover:text-slate-200 transition-colors"
            >
              PIM & ガバナンス
            </button>
            <button
              onClick={() => setCurrentTab('azure-network-nsg')}
              className="hover:text-slate-200 transition-colors"
            >
              NSG & ネットワーク
            </button>
            <button
              onClick={() => setCurrentTab('azure-appgw-firewall')}
              className="hover:text-slate-200 transition-colors"
            >
              Firewall & WAF
            </button>
            <button
              onClick={() => setCurrentTab('azure-endpoint-mgmt')}
              className="hover:text-slate-200 transition-colors"
            >
              Intune & Bastion
            </button>
            <button
              onClick={() => setCurrentTab('azure-container-sec')}
              className="hover:text-slate-200 transition-colors"
            >
              コンテナ & ACR
            </button>
            <button
              onClick={() => setCurrentTab('exam-quiz')}
              className="hover:text-slate-200 transition-colors"
            >
              実戦問題演習
            </button>
          </div>
        </div>
      </footer>

      {/* Guided Tour Modal */}
      <PortalTourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onNavigateToTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
