/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useCallback } from 'react';
import { Loader2, Menu, BookOpen, Settings2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { useNavigate, useParams, useLocation, Routes, Route, Navigate } from 'react-router-dom';

import './registerStrategies.ts';

import SiteNav from './components/layout/SiteNav.tsx';
import HomePage from './pages/HomePage.tsx';
import AboutPage from './pages/AboutPage.tsx';
import ContactPage from './pages/ContactPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import PracticePage from './pages/PracticePage.tsx';
import ExamRoomPage from './pages/ExamRoomPage.tsx';
import AdminPage from './pages/AdminPage.tsx';

import QuizView from './components/QuizView.tsx';
import FlashcardView from './components/FlashcardView.tsx';
import Sidebar from './components/layout/Sidebar.tsx';
import SubjectDashboard from './components/subject/SubjectDashboard.tsx';
import NoteView from './components/notes/NoteView.tsx';

import SettingsModal from './components/modals/SettingsModal.tsx';
import HistoryContextMenu from './components/modals/HistoryContextMenu.tsx';
import Toast from './components/Toast.tsx';

import { useAppData } from './hooks/useAppData.ts';
import { useSubjectResources } from './hooks/useSubjectResources.ts';
import { useQuizSession } from './hooks/useQuizSession.ts';
import { useSettings } from './hooks/useSettings.ts';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subjectId, examName, noteName, attemptId, "*": splat } = useParams();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const selectedSubjectId = useMemo(() => subjectId ? decodeURIComponent(subjectId) : null, [subjectId]);
  const selectedNote = useMemo(() => {
    const raw = noteName || splat;
    return raw ? decodeURIComponent(raw) : null;
  }, [noteName, splat]);
  const selectedAttemptId = useMemo(() => attemptId ? decodeURIComponent(attemptId) : null, [attemptId]);
  const decodedExamName = useMemo(() => {
    const raw = examName || splat;
    return raw ? decodeURIComponent(raw) : null;
  }, [examName, splat]);

  const activeTab = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/exam/') || path.includes('/quiz/') || path.includes('/history/')) {
      return 'quiz';
    }
    if (path.includes('/flashcard/')) {
      return 'flashcard';
    }
    if (path.includes('/note/')) {
      return 'note';
    }
    if (path.includes('/subject/')) {
      return 'subject';
    }
    return 'dashboard';
  }, [location.pathname]);

  const quizMode = activeTab === 'quiz';

  const { state, setState, isLoadingData, setIsLoadingData, loadError } = useAppData();

  const {
    copyConfig,
    enableAIGrading,
    activeProfileId,
    aiProfiles,
    showSettingsModal,
    setShowSettingsModal,
    toastMessage,
    allSubjectsForConfig,
    isLoadingAllSubjects,
    selectedSubjectIdForConfig,
    setSelectedSubjectIdForConfig,
    tempSubjectConfigs,
    setTempSubjectConfigs,
    activeSettingsTab,
    setActiveSettingsTab,
    tempCopyConfig,
    setTempCopyConfig,
    defaultQuizConfig,
    handleSaveSettings,
    openSettings,
  } = useSettings({ selectedSubjectId, setState });

  const {
    selectedExam,
    setSelectedExam,
    examQuestions,
    isLoadingExamData,
    setIsLoadingExamData,
    subjectStats,
    isLoadingStats,
    notes,
    noteContent,
    isLoadingNotes,
    isLoadingNoteContent,
    exams,
    isLoadingExams,
    mostMissedPage,
    setMostMissedPage,
    recentErrorsPage,
    setRecentErrorsPage,
    historyPage,
    setHistoryPage,
    PAGE_SIZE,
    contextMenu,
    setContextMenu,
    handleDeleteAttempt,
    resetPagination,
  } = useSubjectResources({
    selectedSubjectId,
    selectedNote,
    activeTab,
    selectedAttemptId,
    setState,
  });

  const {
    activeAttempt,
    quizParams,
    timeLimit,
    setTimeLimit,
    timeLeft,
    setTimeLeft,
    activeQuizQuestions,
    activeExamName,
    quizAnswers,
    setQuizAnswers,
    essayFeedbacks,
    showResult,
    isGrading,
    handleStartQuiz,
    handleStartExam,
    handleFinishQuiz,
  } = useQuizSession({
    selectedSubjectId,
    decodedExamName,
    selectedAttemptId,
    attempts: state.attempts,
    setState,
    setIsLoadingData,
    setIsLoadingExamData,
    enableAIGrading,
    selectedExam,
    defaultQuizConfig,
  });

  const activeSubject = useMemo(() => {
    return state.subjects.find(s => s.id === selectedSubjectId);
  }, [state.subjects, selectedSubjectId]);

  const handleCloseMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] supports-[height:100dvh]:h-[calc(100dvh-3.5rem)] bg-slate-50 text-slate-900 font-sans overflow-hidden">
      <Sidebar
        subjects={state.subjects}
        selectedSubjectId={selectedSubjectId}
        activeTab={activeTab}
        isOpen={isMobileNavOpen}
        onClose={handleCloseMobileNav}
        onSelectSubject={(id) => {
          navigate(`/subject/${id}`);
          resetPagination();
        }}
        onOpenSettings={openSettings}
      />

      <main className="flex-1 min-h-0 overflow-auto bg-slate-50 relative flex flex-col">
        {/* Mobile Header (md:hidden) for Dashboard/Subject */}
        {(activeTab === 'subject' || activeTab === 'dashboard') && (
          <header className="sticky top-0 z-20 md:hidden bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 pb-3 [padding-top:max(0.75rem,env(safe-area-inset-top))] flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                aria-label="Mở danh sách môn học"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-base font-bold text-slate-800 italic font-serif truncate max-w-[55vw]">
                {activeSubject?.name || 'EduQuest'}
              </h1>
            </div>
            <button
              type="button"
              onClick={openSettings}
              className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              aria-label="Cấu hình hệ thống"
            >
              <Settings2 size={18} />
            </button>
          </header>
        )}

        {loadError && (
          <div className="sticky top-0 z-40 bg-red-50 border-b border-red-100 text-red-800 px-6 py-3 text-sm flex flex-wrap items-center justify-between gap-3">
            <span>Không tải được dữ liệu: {loadError}</span>
            <button
              type="button"
              className="shrink-0 px-3 py-1 rounded-lg bg-white border border-red-200 text-red-700 text-xs font-bold uppercase tracking-widest hover:bg-red-100/50"
              onClick={() => window.location.reload()}
            >
              Tải lại trang
            </button>
          </div>
        )}
        {isLoadingData && (
          <div className="absolute inset-0 z-50 bg-white/85 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={36} />
            <span className="text-slate-600 text-sm">Đang tải dữ liệu từ máy chủ...</span>
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm">
                <BookOpen size={32} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 italic font-serif mb-2">Chào mừng đến với EduQuest</h2>
              <p className="text-slate-500 text-sm max-w-sm mb-6">
                Chọn một môn học từ danh sách bên trái để bắt đầu ôn tập các câu hỏi trắc nghiệm, tự luận và thẻ ghi nhớ.
              </p>
              <button
                type="button"
                onClick={() => setIsMobileNavOpen(true)}
                className="md:hidden px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm cursor-pointer"
              >
                Mở danh sách môn học
              </button>
            </div>
          )}

          {activeTab === 'subject' && activeSubject && (
            <SubjectDashboard
              key="subject-view"
              activeSubject={activeSubject}
              selectedSubjectId={selectedSubjectId!}
              subjectStats={subjectStats}
              isLoadingStats={isLoadingStats}
              mostMissedPage={mostMissedPage}
              setMostMissedPage={setMostMissedPage}
              recentErrorsPage={recentErrorsPage}
              setRecentErrorsPage={setRecentErrorsPage}
              historyPage={historyPage}
              setHistoryPage={setHistoryPage}
              pageSize={PAGE_SIZE}
              exams={exams}
              isLoadingExams={isLoadingExams}
              selectedExam={selectedExam}
              setSelectedExam={setSelectedExam}
              examQuestions={examQuestions}
              isLoadingExamData={isLoadingExamData}
              timeLimit={timeLimit}
              setTimeLimit={setTimeLimit}
              onStartExam={handleStartExam}
              attempts={state.attempts}
              onOpenHistory={(attId) => navigate(`/subject/${selectedSubjectId}/history/${attId}`)}
              onContextMenu={setContextMenu}
              quizParams={quizParams}
              onStartQuiz={handleStartQuiz}
              notes={notes}
              isLoadingNotes={isLoadingNotes}
              onOpenNote={(noteName) => navigate(`/subject/${encodeURIComponent(selectedSubjectId!)}/note/${encodeURIComponent(noteName)}`)}
            />
          )}

          {activeTab === 'quiz' && quizMode && (
            <QuizView
              questions={activeQuizQuestions}
              onFinish={handleFinishQuiz}
              answers={quizAnswers}
              setAnswers={setQuizAnswers}
              showResult={showResult}
              onClose={() => { navigate(`/subject/${selectedSubjectId}`); }}
              isGrading={isGrading}
              feedbacks={essayFeedbacks}
              copyConfig={copyConfig}
              timeLimit={timeLimit}
              examName={activeExamName || 'Đề ngẫu nhiên'}
              timeLeft={timeLeft}
              setTimeLeft={setTimeLeft}
              activeAttempt={activeAttempt}
            />
          )}

          {activeTab === 'note' && (
            <NoteView
              notes={notes}
              selectedNote={selectedNote}
              noteContent={noteContent}
              isLoadingNoteContent={isLoadingNoteContent}
              subjectName={activeSubject?.name}
              onBack={() => navigate(`/subject/${selectedSubjectId}`)}
              onSelectNote={(noteName) => navigate(`/subject/${encodeURIComponent(selectedSubjectId!)}/note/${encodeURIComponent(noteName)}`)}
              onBackToList={() => navigate(`/subject/${encodeURIComponent(selectedSubjectId!)}/note`)}
            />
          )}

          {activeTab === 'flashcard' && (
            <FlashcardView
              questions={activeQuizQuestions}
              isLoading={isLoadingExamData}
              subjectId={selectedSubjectId!}
              examName={decodedExamName || ''}
              onClose={() => navigate(`/subject/${selectedSubjectId}`)}
              setState={setState}
            />
          )}
        </AnimatePresence>



        {contextMenu && (
          <HistoryContextMenu
            contextMenu={contextMenu}
            onDelete={handleDeleteAttempt}
            onClose={() => setContextMenu(null)}
          />
        )}

        {showSettingsModal && (
          <SettingsModal
            activeSettingsTab={activeSettingsTab}
            setActiveSettingsTab={setActiveSettingsTab}
            tempCopyConfig={tempCopyConfig}
            setTempCopyConfig={setTempCopyConfig}
            activeProfileId={activeProfileId}
            aiProfiles={aiProfiles}
            enableAIGrading={enableAIGrading}
            allSubjectsForConfig={allSubjectsForConfig}
            isLoadingAllSubjects={isLoadingAllSubjects}
            selectedSubjectIdForConfig={selectedSubjectIdForConfig}
            setSelectedSubjectIdForConfig={setSelectedSubjectIdForConfig}
            tempSubjectConfigs={tempSubjectConfigs}
            setTempSubjectConfigs={setTempSubjectConfigs}
            defaultQuizConfig={defaultQuizConfig}
            onClose={() => setShowSettingsModal(false)}
            onSave={(aiConfig, copyConfig, quizConfig) => handleSaveSettings(aiConfig, copyConfig, quizConfig)}
          />
        )}

        <Toast message={toastMessage} />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SiteNav />
      <div className="flex-1 min-h-0 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/gioi-thieu" element={<AboutPage />} />
          <Route path="/luyen-thi" element={<PracticePage />} />
          <Route path="/phong-thi" element={<ExamRoomPage />} />
          <Route path="/lien-he" element={<ContactPage />} />
          <Route path="/dang-nhap" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/subject/:subjectId" element={<AppContent />} />
          <Route path="/subject/:subjectId/note/*" element={<AppContent />} />
          <Route path="/subject/:subjectId/exam/*" element={<AppContent />} />
          <Route path="/subject/:subjectId/flashcard/*" element={<AppContent />} />
          <Route path="/subject/:subjectId/quiz/random" element={<AppContent />} />
          <Route path="/subject/:subjectId/history/:attemptId" element={<AppContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
