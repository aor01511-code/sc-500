export interface FeatureMeaningItem {
  id: string;
  term: string;
  termJa: string;
  category: 
    | 'monitor-telemetry'      // Azure Monitor 基盤 & 階層テレメトリ
    | 'agents-and-logs'        // エージェント & ログ種別 & 診断設定
    | 'alerts-action-groups'   // アラート & アクショングループ & 通知
    | 'defender-posture'       // Defender for Cloud & CSPM & JIT & コンプライアンス
    | 'sentinel-soc-hunting';  // Sentinel & SIEM/SOAR & 分析ルール & ハンティング
  categoryJa: string;
  badge: string;
  whatItIs: string;           // どういう機能なのか (仕組み・動作)
  whatItMeans: string;        // どういう意味なのか (意義・価値・なぜ必要か)
  riskWithoutIt: string;      // 使わないとどうなるか (リスク・課題)
  practicalScenario: string;  // 実務での具体例
  examKeyPoint: string;       // 資格試験 (SC-200 / AZ-500) での急所
  relatedSimulatorTab?: 'monitor' | 'kql' | 'defender-jit' | 'sentinel-soc';
}
