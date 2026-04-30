"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Trophy,
  Clock,
  Flame,
  CheckCircle,
  XCircle,
  Play,
  RotateCcw,
  Zap,
  ChevronRight,
  Star,
  Target,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SLANG_DATA,
  CATEGORIES,
  RISK_CONFIG,
  type SlangTerm,
  type RiskLevel,
} from "@/lib/slang-data";

// =============================================================================
// Types
// =============================================================================

interface QuizSectionProps {
  onSearchTerm: (term: string) => void;
}

type QuizPhase = "setup" | "playing" | "feedback" | "finished";

type DifficultyFilter = "all" | "easy" | "medium" | "hard";

interface QuizSettings {
  difficulty: DifficultyFilter;
  category: string | null;
  questionCount: number;
}

interface QuizQuestion {
  term: SlangTerm;
  options: string[];
  correctIndex: number;
}

interface QuizResult {
  questionIndex: number;
  term: SlangTerm;
  selectedAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  pointsEarned: number;
  timeRemaining: number;
  speedBonus: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const TIMER_DURATION = 15; // seconds
const POINTS_CORRECT = 10;
const POINTS_SPEED_BONUS = 5;
const SPEED_THRESHOLD = 5; // seconds

const DIFFICULTY_OPTIONS: {
  value: DifficultyFilter;
  label: string;
  color: string;
  activeColor: string;
}[] = [
  { value: "all", label: "Todos", color: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300", activeColor: "bg-emerald-600 text-white" },
  { value: "easy", label: "Fácil", color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400", activeColor: "bg-green-600 text-white" },
  { value: "medium", label: "Médio", color: "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400", activeColor: "bg-yellow-600 text-white" },
  { value: "hard", label: "Difícil", color: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400", activeColor: "bg-orange-600 text-white" },
];

const QUESTION_COUNT_OPTIONS = [5, 10, 15, 20] as const;

// =============================================================================
// Helpers
// =============================================================================

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function filterTermsByDifficulty(terms: SlangTerm[], difficulty: DifficultyFilter): SlangTerm[] {
  if (difficulty === "all") return terms;
  if (difficulty === "easy") return terms.filter((t) => t.riskLevel === "green");
  if (difficulty === "medium") return terms.filter((t) => t.riskLevel === "yellow");
  // hard = orange + red
  return terms.filter((t) => t.riskLevel === "orange" || t.riskLevel === "red");
}

function generateQuestion(correctTerm: SlangTerm, allTerms: SlangTerm[]): QuizQuestion {
  // Gather wrong answers (distinct meanings)
  const wrongTerms = allTerms.filter(
    (t) =>
      t.term !== correctTerm.term &&
      t.meaning !== correctTerm.meaning &&
      t.meaning.trim().length > 0
  );

  const shuffledWrong = shuffleArray(wrongTerms);
  const wrongMeanings = shuffledWrong
    .slice(0, 3)
    .map((t) => t.meaning);

  const options = shuffleArray([correctTerm.meaning, ...wrongMeanings]);
  const correctIndex = options.indexOf(correctTerm.meaning);

  return { term: correctTerm, options, correctIndex };
}

function getTimerColor(percentage: number): string {
  if (percentage > 66) return "from-emerald-500 to-teal-500";
  if (percentage > 33) return "from-yellow-500 to-amber-500";
  return "from-red-500 to-rose-500";
}

function getTimerBg(percentage: number): string {
  if (percentage > 66) return "bg-emerald-100 dark:bg-emerald-950/50";
  if (percentage > 33) return "bg-yellow-100 dark:bg-yellow-950/50";
  return "bg-red-100 dark:bg-red-950/50";
}

function getCategoryInfo(name: string) {
  return CATEGORIES.find((c) => c.name === name);
}

// =============================================================================
// Component
// =============================================================================

export default function QuizSection({ onSearchTerm }: QuizSectionProps) {
  // --- Phase & settings state ---
  const [phase, setPhase] = useState<QuizPhase>("setup");
  const [settings, setSettings] = useState<QuizSettings>({
    difficulty: "all",
    category: null,
    questionCount: 10,
  });

  // --- Quiz play state ---
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATION);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [lastPointsEarned, setLastPointsEarned] = useState(0);
  const [lastSpeedBonus, setLastSpeedBonus] = useState(false);
  const [showCategoryScroll, setShowCategoryScroll] = useState(false);

  // --- Refs ---
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const answerStartTimeRef = useRef<number>(Date.now());

  // --- Derived values ---
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const totalQuestions = questions.length;
  const progressPercent = totalQuestions > 0 ? ((currentQuestionIndex + (phase === "feedback" ? 1 : 0)) / totalQuestions) * 100 : 0;
  const timerPercent = (timeRemaining / TIMER_DURATION) * 100;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const accuracy = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;

  // --- Filtered pool of terms for quiz generation ---
  const filteredPool = useMemo(() => {
    let pool = SLANG_DATA.filter((t) => t && t.meaning && t.meaning.trim().length > 0);

    if (settings.category) {
      pool = pool.filter((t) => t.category === settings.category);
    }

    pool = filterTermsByDifficulty(pool, settings.difficulty);

    // Need at least 4 terms to generate a question
    return pool;
  }, [settings.difficulty, settings.category]);

  // =============================================================================
  // Timer logic
  // =============================================================================

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    setTimeRemaining(TIMER_DURATION);
    answerStartTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimer]);

  // =============================================================================
  // Answer handling
  // =============================================================================

  const handleAnswerTimeout = useCallback(() => {
    if (!currentQuestion || isAnswerLocked) return;

    setIsAnswerLocked(true);
    setSelectedAnswer(null);
    setLastPointsEarned(0);
    setLastSpeedBonus(false);
    setStreak(0);

    const result: QuizResult = {
      questionIndex: currentQuestionIndex,
      term: currentQuestion.term,
      selectedAnswer: null,
      correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
      isCorrect: false,
      pointsEarned: 0,
      timeRemaining: 0,
      speedBonus: false,
    };

    setResults((prev) => [...prev, result]);
    clearTimer();

    // Short delay before showing feedback
    setTimeout(() => setPhase("feedback"), 100);
  }, [currentQuestion, isAnswerLocked, currentQuestionIndex, clearTimer]);

  const handleSelectAnswer = useCallback(
    (answer: string) => {
      if (isAnswerLocked || !currentQuestion || phase !== "playing") return;

      const elapsed = (Date.now() - answerStartTimeRef.current) / 1000;
      const isCorrect = answer === currentQuestion.options[currentQuestion.correctIndex];

      setIsAnswerLocked(true);
      setSelectedAnswer(answer);
      clearTimer();

      let pointsEarned = 0;
      let speedBonus = false;

      if (isCorrect) {
        pointsEarned = POINTS_CORRECT;
        const newStreak = streak + 1;
        const streakBonus = Math.min(newStreak * 2, 20); // cap streak bonus
        pointsEarned += streakBonus;

        if (elapsed <= SPEED_THRESHOLD) {
          pointsEarned += POINTS_SPEED_BONUS;
          speedBonus = true;
        }

        setScore((prev) => prev + pointsEarned);
        setStreak(newStreak);
        setBestStreak((prev) => Math.max(prev, newStreak));
      } else {
        setStreak(0);
      }

      setLastPointsEarned(pointsEarned);
      setLastSpeedBonus(speedBonus);

      const result: QuizResult = {
        questionIndex: currentQuestionIndex,
        term: currentQuestion.term,
        selectedAnswer: answer,
        correctAnswer: currentQuestion.options[currentQuestion.correctIndex],
        isCorrect,
        pointsEarned,
        timeRemaining: Math.max(0, Math.round(elapsed)),
        speedBonus,
      };

      setResults((prev) => [...prev, result]);
      setPhase("feedback");
    },
    [isAnswerLocked, currentQuestion, phase, streak, currentQuestionIndex, clearTimer]
  );

  // --- Handle timer running out ---
  useEffect(() => {
    if (phase === "playing" && timeRemaining === 0 && !isAnswerLocked && currentQuestion) {
      handleAnswerTimeout();
    }
  }, [timeRemaining, phase, isAnswerLocked, currentQuestion, handleAnswerTimeout]);

  // =============================================================================
  // Navigation
  // =============================================================================

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex + 1 >= totalQuestions) {
      setPhase("finished");
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswerLocked(false);
      setPhase("playing");
      startTimer();
    }
  }, [currentQuestionIndex, totalQuestions, startTimer]);

  const startQuiz = useCallback(() => {
    if (filteredPool.length < 4) return;

    const shuffled = shuffleArray(filteredPool);
    const count = Math.min(settings.questionCount, Math.floor(shuffled.length / 4) * 1);
    const quizTerms = shuffled.slice(0, Math.max(count, 4));

    const newQuestions = quizTerms.map((term) =>
      generateQuestion(term, filteredPool)
    );

    setQuestions(newQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setResults([]);
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
    setLastPointsEarned(0);
    setLastSpeedBonus(false);
    setPhase("playing");
    startTimer();
  }, [filteredPool, settings.questionCount, startTimer]);

  const resetQuiz = useCallback(() => {
    clearTimer();
    setPhase("setup");
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setResults([]);
    setSelectedAnswer(null);
    setIsAnswerLocked(false);
  }, [clearTimer]);

  // --- Cleanup timer on unmount ---
  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  // =============================================================================
  // Render: Setup Screen
  // =============================================================================

  const renderSetup = () => (
    <div className="space-y-6">
      {/* Hero card */}
      <div className="relative max-w-lg mx-auto">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl blur-sm opacity-50" />
        <Card className="relative overflow-hidden border-0 shadow-xl">
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Quiz de Gírias</h2>
            <p className="text-emerald-100 text-sm sm:text-base max-w-sm mx-auto">
              Teste seus conhecimentos sobre as gírias mais usadas pelos jovens brasileiros!
            </p>
          </div>
          <CardContent className="p-6 space-y-6">
            {/* How it works */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide">
                Como funciona
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Target className="h-5 w-5" />, label: "Veja a gíria", desc: "Uma gíria aparece na tela" },
                  { icon: <CheckCircle className="h-5 w-5" />, label: "Escolha o significado", desc: "4 opções para escolher" },
                  { icon: <Trophy className="h-5 w-5" />, label: "Pontue!", desc: "Acerte e ganhe pontos" },
                ].map((item) => (
                  <div key={item.label} className="text-center space-y-1.5">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                      {item.icon}
                    </div>
                    <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">{item.label}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Scoring info */}
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                Pontuação
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="h-3 w-3" /> +10 acerto
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 dark:bg-teal-900/40 px-2.5 py-1 text-teal-700 dark:text-teal-400">
                  <Timer className="h-3 w-3" /> +5 velocidade
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-900/40 px-2.5 py-1 text-orange-700 dark:text-orange-400">
                  <Flame className="h-3 w-3" /> +2x streak
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card className="max-w-lg mx-auto border-gray-200 dark:border-gray-800">
        <CardContent className="p-6 space-y-5">
          {/* Difficulty filter */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Dificuldade
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, difficulty: opt.value }))
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    settings.difficulty === opt.value
                      ? opt.activeColor
                      : `${opt.color} hover:opacity-80`
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Categoria
              </label>
              <button
                onClick={() => setShowCategoryScroll(!showCategoryScroll)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {showCategoryScroll ? "Mostrar menos" : "Ver todas"}
              </button>
            </div>
            <div className={`flex flex-wrap gap-1.5 ${!showCategoryScroll ? "max-h-24 overflow-y-auto" : "max-h-48 overflow-y-auto"}`}>
              <button
                onClick={() =>
                  setSettings((prev) => ({ ...prev, category: null }))
                }
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  !settings.category
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                Todas
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      category: prev.category === cat.name ? null : cat.name,
                    }))
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                    settings.category === cat.name
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Número de perguntas
            </label>
            <div className="grid grid-cols-4 gap-2">
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, questionCount: count }))
                  }
                  className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                    settings.questionCount === count
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Available terms info */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {filteredPool.length >= 4 ? (
                <>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filteredPool.length}</span> gírias disponíveis
                </>
              ) : (
                <span className="text-red-500 dark:text-red-400">
                  Apenas {filteredPool.length} gírias disponíveis. Selecione filtros menos restritivos.
                </span>
              )}
            </p>
          </div>

          {/* Start button */}
          <Button
            onClick={startQuiz}
            disabled={filteredPool.length < 4}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-base rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Play className="h-5 w-5 mr-2" />
            Começar
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // =============================================================================
  // Render: Playing Screen (active question)
  // =============================================================================

  const renderPlaying = () => {
    if (!currentQuestion) return null;

    const catInfo = getCategoryInfo(currentQuestion.term.category);

    return (
      <div className="max-w-lg mx-auto space-y-4">
        {/* Top bar: score + streak + question counter */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Score */}
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-full px-3 py-1.5">
              <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                {score}
              </span>
            </div>
            {/* Streak */}
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/50 rounded-full px-3 py-1.5 animate-pulse">
                <span className="text-sm">{streak > 2 ? "🔥" : "✨"}</span>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">
                  {streak}x
                </span>
              </div>
            )}
          </div>

          {/* Question counter */}
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
            <span className="text-gray-900 dark:text-gray-100 font-bold">
              {currentQuestionIndex + 1}
            </span>
            /{totalQuestions}
          </div>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercent} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" />

        {/* Timer bar */}
        <div className={`rounded-full p-0.5 transition-colors duration-500 ${getTimerBg(timerPercent)}`}>
          <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-linear ${getTimerColor(timerPercent)}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-center mt-1">
            <Clock className={`h-3.5 w-3.5 mr-1 ${timerPercent > 33 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`} />
            <span className={`text-xs font-bold ${timerPercent > 33 ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {timeRemaining}s
            </span>
          </div>
        </div>

        {/* Question card */}
        <Card className="overflow-hidden border-0 shadow-lg">
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 py-6 text-center relative">
            <div className="absolute top-3 right-3">
              {catInfo && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 backdrop-blur-sm px-2.5 py-1 text-xs font-medium text-white">
                  {catInfo.icon} {catInfo.label}
                </span>
              )}
            </div>
            <div className="absolute top-3 left-3">
              <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-sm ${RISK_CONFIG[currentQuestion.term.riskLevel].bgColor} ${RISK_CONFIG[currentQuestion.term.riskLevel].textColor}`}>
                {RISK_CONFIG[currentQuestion.term.riskLevel].label}
              </span>
            </div>
            <p className="text-xs uppercase tracking-wider text-emerald-200 mb-2 mt-2">
              Qual o significado de
            </p>
            <h3 className="text-3xl sm:text-4xl font-bold text-white">
              &ldquo;{currentQuestion.term.term}&rdquo;
            </h3>
          </div>
        </Card>

        {/* Options grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {currentQuestion.options.map((option, index) => {
            const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
            return (
              <button
                key={`${option}-${index}`}
                onClick={() => handleSelectAnswer(option)}
                disabled={isAnswerLocked}
                className={`group relative w-full text-left rounded-xl border-2 p-4 transition-all duration-200 ${
                  isAnswerLocked
                    ? "cursor-default"
                    : "cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md active:scale-[0.98]"
                } bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs font-bold text-gray-600 dark:text-gray-400 shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    {optionLabel}
                  </span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pt-0.5">
                    {option}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // =============================================================================
  // Render: Feedback Screen (after answering)
  // =============================================================================

  const renderFeedback = () => {
    if (!currentQuestion) return null;

    const lastResult = results[results.length - 1];
    if (!lastResult) return null;

    const isCorrect = lastResult.isCorrect;
    const isTimeout = lastResult.selectedAnswer === null;

    return (
      <div className="max-w-lg mx-auto space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-full px-3 py-1.5">
              <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{score}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-950/50 rounded-full px-3 py-1.5">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-bold text-orange-700 dark:text-orange-400">{streak}x</span>
              </div>
            )}
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {currentQuestionIndex + 1}/{totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercent} className="h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" />

        {/* Result card */}
        <Card className={`overflow-hidden border-0 shadow-lg ${isCorrect ? "ring-2 ring-green-400 dark:ring-green-600" : "ring-2 ring-red-400 dark:ring-red-600"}`}>
          {/* Result header */}
          <div
            className={`px-6 py-4 text-center ${
              isCorrect
                ? "bg-gradient-to-r from-green-500 to-emerald-500"
                : "bg-gradient-to-r from-red-500 to-rose-500"
            }`}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              {isCorrect ? (
                <>
                  <CheckCircle className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Correto!</h3>
                </>
              ) : (
                <>
                  {isTimeout ? (
                    <>
                      <Clock className="h-6 w-6 text-white" />
                      <h3 className="text-xl font-bold text-white">Tempo esgotado!</h3>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6 text-white" />
                      <h3 className="text-xl font-bold text-white">Errado!</h3>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Points earned */}
            {isCorrect && lastPointsEarned > 0 && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <Badge className="bg-white/20 text-white border-0 text-sm font-bold px-3 py-0.5">
                  +{lastPointsEarned} pontos
                </Badge>
                {lastSpeedBonus && (
                  <Badge className="bg-yellow-400/30 text-white border-0 text-sm font-bold px-3 py-0.5">
                    <Zap className="h-3 w-3 mr-1" /> Rápido!
                  </Badge>
                )}
              </div>
            )}
          </div>

          <CardContent className="p-5 space-y-4">
            {/* The term */}
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                A gíria era
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                &ldquo;{currentQuestion.term.term}&rdquo;
              </p>
            </div>

            {/* Correct answer */}
            <div className={`rounded-xl p-4 ${isCorrect ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"}`}>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                Resposta correta
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                {lastResult.correctAnswer}
              </p>
            </div>

            {/* Wrong answer highlighted */}
            {!isCorrect && lastResult.selectedAnswer && (
              <div className="rounded-xl p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900">
                <p className="text-xs font-semibold text-red-500 mb-1.5">
                  Sua resposta
                </p>
                <p className="text-sm text-red-700 dark:text-red-400 line-through leading-relaxed">
                  {lastResult.selectedAnswer}
                </p>
              </div>
            )}

            {/* Explanation */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Saiba mais
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {currentQuestion.term.context}
              </p>
              {currentQuestion.term.safeExample && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">Exemplo:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    {currentQuestion.term.safeExample}
                  </p>
                </div>
              )}
            </div>

            {/* Action: search term */}
            <button
              onClick={() => onSearchTerm(currentQuestion.term.term)}
              className="w-full flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline transition-colors py-1"
            >
              Ver detalhes completos
              <ChevronRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>

        {/* Next button */}
        <Button
          onClick={handleNextQuestion}
          className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25"
        >
          {currentQuestionIndex + 1 >= totalQuestions ? (
            <>
              <Trophy className="h-5 w-5 mr-2" />
              Ver Resultado Final
            </>
          ) : (
            <>
              Próxima Pergunta
              <ChevronRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    );
  };

  // =============================================================================
  // Render: Finished Screen
  // =============================================================================

  const renderFinished = () => {
    // Grade calculation
    let grade = "F";
    let gradeColor = "text-gray-500";
    let gradeBg = "bg-gray-100 dark:bg-gray-800";
    let emoji = "😅";
    let message = "Continue praticando!";

    if (accuracy >= 90) {
      grade = "S";
      gradeColor = "text-emerald-600 dark:text-emerald-400";
      gradeBg = "bg-emerald-100 dark:bg-emerald-900/40";
      emoji = "🏆";
      message = "Você é um mestre das gírias!";
    } else if (accuracy >= 75) {
      grade = "A";
      gradeColor = "text-teal-600 dark:text-teal-400";
      gradeBg = "bg-teal-100 dark:bg-teal-900/40";
      emoji = "🎯";
      message = "Muito bom! Quase perfeito!";
    } else if (accuracy >= 60) {
      grade = "B";
      gradeColor = "text-blue-600 dark:text-blue-400";
      gradeBg = "bg-blue-100 dark:bg-blue-900/40";
      emoji = "👍";
      message = "Bom trabalho! Continue assim!";
    } else if (accuracy >= 40) {
      grade = "C";
      gradeColor = "text-yellow-600 dark:text-yellow-400";
      gradeBg = "bg-yellow-100 dark:bg-yellow-900/40";
      emoji = "💪";
      message = "Você está aprendendo! Tente de novo!";
    }

    return (
      <div className="max-w-lg mx-auto space-y-6">
        {/* Results hero */}
        <div className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-2xl blur-sm opacity-50" />
          <Card className="relative overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 px-6 py-8 text-center">
              <p className="text-5xl mb-3">{emoji}</p>
              <h2 className="text-2xl font-bold text-white mb-1">Quiz Finalizado!</h2>
              <p className="text-emerald-100 text-sm">{message}</p>
            </div>
            <CardContent className="p-6">
              {/* Grade */}
              <div className="flex justify-center mb-6">
                <div className={`flex flex-col items-center gap-1 ${gradeBg} rounded-2xl px-8 py-4`}>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Nota
                  </p>
                  <p className={`text-5xl font-black ${gradeColor}`}>{grade}</p>
                  <p className={`text-sm font-bold ${gradeColor}`}>{accuracy}%</p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <Trophy className="h-5 w-5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{score}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Pontos</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <Target className="h-5 w-5 mx-auto mb-1 text-blue-600 dark:text-blue-400" />
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {correctCount}/{totalQuestions}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Acertos</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <Flame className="h-5 w-5 mx-auto mb-1 text-orange-600 dark:text-orange-400" />
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{bestStreak}x</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Melhor Streak</p>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <Star className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{accuracy}%</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Precisão</p>
                </div>
              </div>

              {/* Review: correct vs wrong breakdown */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-green-700 dark:text-green-400">
                      <CheckCircle className="inline h-3 w-3 mr-1" />{correctCount} corretas
                    </span>
                    <span className="text-xs font-medium text-red-700 dark:text-red-400">
                      {totalQuestions - correctCount} erradas
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex">
                    {correctCount > 0 && (
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-full transition-all"
                        style={{ width: `${(correctCount / totalQuestions) * 100}%` }}
                      />
                    )}
                    {(totalQuestions - correctCount) > 0 && (
                      <div
                        className="bg-gradient-to-r from-red-400 to-rose-500 h-full transition-all"
                        style={{ width: `${((totalQuestions - correctCount) / totalQuestions) * 100}%` }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Terms review list */}
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Reviso das Perguntas
            </h3>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => onSearchTerm(result.term.term)}
                  className="w-full text-left flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${
                    result.isCorrect
                      ? "bg-green-100 dark:bg-green-900/40"
                      : "bg-red-100 dark:bg-red-900/40"
                  }`}>
                    {result.isCorrect ? (
                      <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      &ldquo;{result.term.term}&rdquo;
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {result.correctAnswer}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={resetQuiz}
            variant="outline"
            className="h-12 rounded-xl border-gray-200 dark:border-gray-700 font-semibold"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Mudar Config
          </Button>
          <Button
            onClick={startQuiz}
            className="h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25"
          >
            <Play className="h-4 w-4 mr-2" />
            Jogar Novamente
          </Button>
        </div>
      </div>
    );
  };

  // =============================================================================
  // Main render
  // =============================================================================

  return (
    <section aria-label="Quiz de Gírias" className="w-full">
      {phase === "setup" && renderSetup()}
      {phase === "playing" && renderPlaying()}
      {phase === "feedback" && renderFeedback()}
      {phase === "finished" && renderFinished()}
    </section>
  );
}
