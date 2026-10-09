import React, { useState } from 'react';
import { EXAM_QUESTIONS } from '../data/examQuestions';
import { ExamQuestion, PurviewDomain } from '../types/purview';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sparkles, 
  BookOpen, 
  Play, 
  Award,
  Layers
} from 'lucide-react';

interface ExamQuizLabProps {
  onJumpToLab: (labId: PurviewDomain) => void;
  preselectedQuestionId?: string | null;
}

export const ExamQuizLab: React.FC<ExamQuizLabProps> = ({ onJumpToLab, preselectedQuestionId }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [revealedExplanations, setRevealedExplanations] = useState<{ [qId: string]: boolean }>({});

  // Filter questions
  const filteredQuestions = EXAM_QUESTIONS.filter((q) => {
    if (selectedDomain === 'all') return true;
    return q.domain === selectedDomain;
  });

  const activeQuestion = filteredQuestions[currentIndex] || filteredQuestions[0];

  const handleSelectOption = (qId: string, optionId: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionId }));
    setRevealedExplanations((prev) => ({ ...prev, [qId]: true }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setRevealedExplanations({});
    setCurrentIndex(0);
  };

  // Score calculation
  const totalAnswered = Object.keys(userAnswers).length;
  const totalCorrect = Object.entries(userAnswers).filter(([qId, ans]) => {
    const q = EXAM_QUESTIONS.find((item) => item.id === qId);
    return q && q.correctOptionId === ans;
  }).length;

  const currentAnswer = activeQuestion ? userAnswers[activeQuestion.id] : null;
  const isAnswered = Boolean(currentAnswer);
  const isCorrect = currentAnswer === activeQuestion?.correctOptionId;

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-semibold mb-1">
              <span>SC-500 実戦対策</span>
              <span>·</span>
              <span>シナリオベース問題演習</span>
              <span>·</span>
              <span>Interactive Rationale & Simulator Verification</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              SC-500 実戦シナリオ問題集 & 動作検証ナビゲーター
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              実際の認定試験で頻出するケーススタディ形式の問題を解き、解説を確認できます。各問題の正答ロジックは「シミュレーターで確認」ボタンからワンクリックで実機同等のラボ環境へ遷移して挙動を直接検証できます。
            </p>
          </div>

          {/* Score Counter */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 shrink-0 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[11px] text-slate-400">正答率</div>
                <div className="text-sm font-bold font-mono text-white">
                  {totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0}%
                  <span className="text-xs text-slate-400 font-normal ml-1">
                    ({totalCorrect}/{totalAnswered} 問)
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleResetQuiz}
              className="text-slate-400 hover:text-slate-200 text-xs p-1"
              title="回答をリセット"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Domain Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: '全分野の出題' },
          { id: 'retention', label: '保持の4大原則・レコード' },
          { id: 'sensitivity', label: '感度ラベル・SIT・EDM' },
          { id: 'dlp', label: 'DLP・エンドポイント' },
          { id: 'insider-risk', label: 'インサイダーリスク' },
          { id: 'governance', label: 'アダプティブスコープ' },
        ].map((domain) => (
          <button
            key={domain.id}
            onClick={() => {
              setSelectedDomain(domain.id);
              setCurrentIndex(0);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap ${
              selectedDomain === domain.id
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {domain.label}
          </button>
        ))}
      </div>

      {/* Active Question Container */}
      {activeQuestion && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question & Option Card (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
              {/* Question Header & Meta */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-400 font-mono">
                    QUESTION {currentIndex + 1} / {filteredQuestions.length}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs text-slate-400">{activeQuestion.keyExamConcept}</span>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  難易度: <strong className="text-slate-300 font-medium">{activeQuestion.difficulty}</strong>
                </span>
              </div>

              {/* Title & Scenario */}
              <div>
                <h2 className="text-base font-bold text-white mb-2">
                  {activeQuestion.title}
                </h2>
                <div className="p-4 bg-slate-950 border border-slate-800/80 rounded text-xs text-slate-300 leading-relaxed font-sans">
                  <strong className="text-slate-200 block mb-1">【シナリオ】</strong>
                  {activeQuestion.scenario}
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm font-semibold text-white pt-2">
                {activeQuestion.question}
              </div>

              {/* Options List */}
              <div className="space-y-2.5 pt-2">
                {activeQuestion.options.map((opt) => {
                  const isSelected = currentAnswer === opt.id;
                  const isThisCorrect = opt.id === activeQuestion.correctOptionId;

                  let optionStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
                  if (isAnswered) {
                    if (isThisCorrect) {
                      optionStyle = 'bg-emerald-950/40 border-emerald-600 text-emerald-200 font-medium';
                    } else if (isSelected) {
                      optionStyle = 'bg-rose-950/40 border-rose-600 text-rose-200';
                    } else {
                      optionStyle = 'bg-slate-950 border-slate-800/60 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(activeQuestion.id, opt.id)}
                      className={`w-full text-left p-3.5 rounded border text-xs sm:text-sm transition-colors flex items-start gap-3 ${optionStyle}`}
                    >
                      <div className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        {opt.id.toUpperCase()}
                      </div>
                      <div className="flex-1 leading-relaxed">{opt.text}</div>
                      {isAnswered && isThisCorrect && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                      {isAnswered && isSelected && !isThisCorrect && (
                        <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Rationale Card */}
              {isAnswered && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div className={`p-4 rounded-lg border ${
                    isCorrect
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-slate-200'
                      : 'bg-rose-950/30 border-rose-800/50 text-slate-200'
                  }`}>
                    <div className="flex items-center gap-2 font-bold text-sm mb-2">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span className="text-emerald-400">正解です！ (Correct)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-400" />
                          <span className="text-rose-400">不正解 (Incorrect)</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                      {activeQuestion.explanation}
                    </div>

                    {activeQuestion.licenseRequirement && (
                      <div className="mt-3 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-sky-400" />
                        <span>必要ライセンス: <strong>{activeQuestion.licenseRequirement}</strong></span>
                      </div>
                    )}
                  </div>

                  {/* Verification CTA: Jump to matching lab */}
                  <div className="p-3 bg-sky-950/30 border border-sky-800/50 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-semibold text-sky-300">シミュレーターでこの動作を直接検証する:</span>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        この問題のシナリオ条件を再現したラボへ遷移して、実際の動作を確認できます。
                      </div>
                    </div>
                    <button
                      onClick={() => onJumpToLab(activeQuestion.relatedLab)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>シミュレーターを開く</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  ← 前の問題
                </button>
                <span className="text-xs text-slate-500 font-mono">
                  {currentIndex + 1} / {filteredQuestions.length}
                </span>
                <button
                  disabled={currentIndex === filteredQuestions.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(filteredQuestions.length - 1, prev + 1))}
                  className="px-3 py-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold disabled:opacity-40 disabled:pointer-events-none transition-colors"
                >
                  次の問題 →
                </button>
              </div>
            </div>
          </div>

          {/* Right Question Index Navigator (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-semibold text-white mb-3">
                問題一覧ナビゲーター ({filteredQuestions.length}問)
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {filteredQuestions.map((q, idx) => {
                  const ans = userAnswers[q.id];
                  const hasAnswered = Boolean(ans);
                  const isQCorrect = ans === q.correctOptionId;
                  const isCurrent = idx === currentIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`p-2 rounded text-xs font-mono font-bold flex flex-col items-center justify-center border transition-colors ${
                        isCurrent
                          ? 'border-sky-400 ring-2 ring-sky-500/20'
                          : 'border-slate-800'
                      } ${
                        hasAnswered
                          ? isQCorrect
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950/60 text-rose-300 border-rose-800'
                          : 'bg-slate-950 text-slate-400 hover:bg-slate-900'
                      }`}
                    >
                      <span>Q{idx + 1}</span>
                      <span className="text-[10px] font-sans font-normal mt-0.5 truncate max-w-full">
                        {q.domain}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exam Success Tips */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
              <h3 className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>SC-500 合格のための着眼点</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <li>
                  <strong>「最も管理負荷が低いものを選べ」:</strong> 静的スコープではなく「アダプティブスコープ」、手動分類ではなく「自動ラベル付け」が正解になりやすい。
                </li>
                <li>
                  <strong>「誤検知(偽陽性)を最小化したい」:</strong> 通常の正規表現SITではなく「完全データ一致 (EDM)」を選択する。
                </li>
                <li>
                  <strong>「削除できないように絶対保護したい」:</strong> 標準レコードではなく「規制レコード (Regulatory Record)」を選択する。
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
