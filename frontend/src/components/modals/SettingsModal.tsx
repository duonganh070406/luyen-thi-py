import { useState, useMemo } from 'react';
import { GraduationCap, Loader2, Settings2, Sparkles, X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CopyConfig, QuizParams } from '../../types.ts';
import { testAIConfig, AIProfile, AIConfig } from '../../services/api.ts';
import SearchBar from '../SearchBar.tsx';

interface SettingsModalProps {
  activeSettingsTab: 'general' | 'ai' | 'subjects';
  setActiveSettingsTab: (tab: 'general' | 'ai' | 'subjects') => void;
  tempCopyConfig: CopyConfig;
  setTempCopyConfig: React.Dispatch<React.SetStateAction<CopyConfig>>;
  enableAIGrading: boolean;
  activeProfileId: string | null;
  aiProfiles: AIProfile[];
  allSubjectsForConfig: any[];
  isLoadingAllSubjects: boolean;
  selectedSubjectIdForConfig: string | null;
  setSelectedSubjectIdForConfig: (id: string | null) => void;
  tempSubjectConfigs: Record<string, any>;
  setTempSubjectConfigs: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  defaultQuizConfig: QuizParams;
  onClose: () => void;
  onSave: (aiConfig: AIConfig, copyConfig: CopyConfig, defaultQuizConfig: QuizParams) => void;
}

export default function SettingsModal({
  activeSettingsTab,
  setActiveSettingsTab,
  tempCopyConfig,
  setTempCopyConfig,
  enableAIGrading,
  activeProfileId,
  aiProfiles,
  allSubjectsForConfig,
  isLoadingAllSubjects,
  selectedSubjectIdForConfig,
  setSelectedSubjectIdForConfig,
  tempSubjectConfigs,
  setTempSubjectConfigs,
  defaultQuizConfig,
  onClose,
  onSave,
}: SettingsModalProps) {
  // Local form states to draft values inside the modal
  const [localEnableAIGrading, setLocalEnableAIGrading] = useState<boolean>(enableAIGrading);
  const [localActiveProfileId, setLocalActiveProfileId] = useState<string | null>(activeProfileId);
  const [localProfiles, setLocalProfiles] = useState<AIProfile[]>(() => {
    // Deep clone initial profiles
    return aiProfiles.map(p => ({ ...p }));
  });
  const [localDefaultQuizConfigStr, setLocalDefaultQuizConfigStr] = useState<string>(() => {
    return JSON.stringify(defaultQuizConfig, null, 2);
  });

  // Track the ID of the profile currently being edited in the subform
  const [selectedProfileIdToEdit, setSelectedProfileIdToEdit] = useState<string | null>(() => {
    if (activeProfileId) return activeProfileId;
    return aiProfiles.length > 0 ? aiProfiles[0].id : null;
  });

  // Connection testing states
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; response: string; error?: string } | null>(null);

  // Subject search query state & memoized filtered list
  const [subjectSearchQuery, setSubjectSearchQuery] = useState<string>('');

  const filteredSubjects = useMemo(() => {
    const sorted = [...allSubjectsForConfig].sort((a, b) =>
      a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
    );
    if (!subjectSearchQuery.trim()) return sorted;
    const query = subjectSearchQuery.toLowerCase();
    return sorted.filter(s =>
      s.name.toLowerCase().includes(query) || s.id.toLowerCase().includes(query)
    );
  }, [allSubjectsForConfig, subjectSearchQuery]);

  // Retrieve the profile currently being edited
  const currentEditingProfile = localProfiles.find(p => p.id === selectedProfileIdToEdit) || null;

  const handleUpdateProfileField = (field: keyof AIProfile, value: string) => {
    if (!selectedProfileIdToEdit) return;
    setLocalProfiles(prev =>
      prev.map(p => (p.id === selectedProfileIdToEdit ? { ...p, [field]: value } : p))
    );
  };

  const handleAddProfile = () => {
    const newId = `profile_${Date.now()}`;
    const newProfile: AIProfile = {
      id: newId,
      name: `Cấu hình mới #${localProfiles.length + 1}`,
      aiApiKey: "",
      aiBaseUrl: "",
      aiModel: "",
    };
    setLocalProfiles(prev => [...prev, newProfile]);
    setSelectedProfileIdToEdit(newId);
    if (!localActiveProfileId) {
      setLocalActiveProfileId(newId);
    }
  };

  const handleDeleteProfile = (idToDelete: string) => {
    if (localProfiles.length <= 1) {
      alert("Bạn phải giữ lại ít nhất một cấu hình AI!");
      return;
    }
    const filtered = localProfiles.filter(p => p.id !== idToDelete);
    setLocalProfiles(filtered);

    // Update active profile if deleted
    if (localActiveProfileId === idToDelete) {
      setLocalActiveProfileId(filtered[0].id);
    }
    // Update current editor panel if deleted
    if (selectedProfileIdToEdit === idToDelete) {
      setSelectedProfileIdToEdit(filtered[0].id);
    }
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    if (!currentEditingProfile) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testAIConfig(currentEditingProfile);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({
        success: false,
        response: "",
        error: e.message || "Lỗi không xác định khi kết nối với máy chủ.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    let parsedQuizConfig;
    try {
      parsedQuizConfig = JSON.parse(localDefaultQuizConfigStr);
    } catch (e) {
      alert("Cấu hình JSON mặc định không hợp lệ: " + (e as Error).message);
      return;
    }
    onSave(
      {
        enableAIGrading: localEnableAIGrading,
        activeProfileId: localActiveProfileId,
        profiles: localProfiles,
      },
      tempCopyConfig,
      parsedQuizConfig
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white rounded-2xl sm:rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-5xl h-[92vh] md:h-[640px] flex flex-col md:flex-row overflow-hidden relative"
        >
          {/* Always visible top-right close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 z-50 w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200/60 transition-colors shadow-sm cursor-pointer"
            aria-label="Đóng cài đặt"
          >
            <X size={18} />
          </button>

          {/* Left Panel - Navigation Tabs */}
          <div className="w-full md:w-[260px] bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-row md:flex-col p-3 sm:p-4 md:p-6 shrink-0 justify-start overflow-x-auto custom-scrollbar gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setActiveSettingsTab('general')}
              className={`flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${activeSettingsTab === 'general'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-b-2 md:border-b-0 md:border-l-4 border-indigo-600'
                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'
                }`}
            >
              <Settings2 size={16} />
              <span>Cấu hình chung</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSettingsTab('ai')}
              className={`flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${activeSettingsTab === 'ai'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-b-2 md:border-b-0 md:border-l-4 border-indigo-600'
                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'
                }`}
            >
              <Sparkles size={16} />
              <span>Cấu hình AI</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSettingsTab('subjects')}
              className={`flex items-center gap-2 sm:gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${activeSettingsTab === 'subjects'
                ? 'bg-indigo-50 text-indigo-700 shadow-sm border-b-2 md:border-b-0 md:border-l-4 border-indigo-600'
                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-800'
                }`}
            >
              <GraduationCap size={16} />
              <span>Quản lý môn học</span>
            </button>
          </div>

          {/* Right Panel - Configuration Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="p-4 sm:p-6 md:p-8 pr-14 border-b border-slate-100 shrink-0">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight italic">
                {activeSettingsTab === 'general' ? 'Cấu hình chung' : activeSettingsTab === 'ai' ? 'Quản lý cấu hình AI' : 'Quản lý môn học'}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {activeSettingsTab === 'general'
                  ? 'Lưu trữ tại browser localStorage (copyConfig).'
                  : activeSettingsTab === 'ai'
                  ? 'Lưu trữ tại backend/config/ai_config.json.'
                  : 'Lưu trữ tại data/[tên môn]/subject_config.json.'
                }
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 min-h-0 custom-scrollbar">
              {activeSettingsTab === 'general' && (
                <div className="space-y-6">
                  <div className="flex flex-col p-4 sm:p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all space-y-4 sm:space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">Định dạng sao chép</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Chọn định dạng dữ liệu (JSON hoặc Markdown) khi copy câu hỏi.</p>
                      </div>
                      <select
                        value={tempCopyConfig.format}
                        onChange={(e) => setTempCopyConfig(prev => ({ ...prev, format: e.target.value as 'json' | 'markdown' }))}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all shadow-sm shrink-0"
                      >
                        <option value="json">JSON</option>
                        <option value="markdown">Markdown</option>
                      </select>
                    </div>

                    <div className="border-t border-slate-100/80 pt-4">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Các trường thông tin muốn sao chép</h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { key: 'id', label: 'Mã câu hỏi (ID)' },
                          { key: 'name', label: 'Tên câu hỏi (Name)' },
                          { key: 'type', label: 'Loại câu hỏi (Type)' },
                          { key: 'question', label: 'Nội dung (Question)' },
                          { key: 'options', label: 'Các lựa chọn (Options)' },
                          { key: 'correctAnswer', label: 'Đáp án đúng' },
                          { key: 'userAnswer', label: 'Câu trả lời của bạn' },
                          { key: 'isCorrect', label: 'Trạng thái Đúng/Sai' },
                          { key: 'explanation', label: 'Lời giải thích' },
                          { key: 'feedback', label: 'Nhận xét của AI' },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center gap-3 p-3 bg-white border border-slate-150 rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
                            <input
                              type="checkbox"
                              checked={tempCopyConfig.fields[key as keyof typeof tempCopyConfig.fields]}
                              onChange={(e) => setTempCopyConfig(prev => ({
                                ...prev,
                                fields: {
                                  ...prev.fields,
                                  [key]: e.target.checked
                                }
                              }))}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                            />
                            <span className="text-xs font-semibold text-slate-700">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col p-6 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Cấu hình Đề thi mặc định (JSON)</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Cấu hình mặc định khi bắt đầu ôn tập tổng hợp.</p>
                    </div>
                    <textarea
                      value={localDefaultQuizConfigStr}
                      onChange={(e) => setLocalDefaultQuizConfigStr(e.target.value)}
                      className="w-full h-40 px-4 py-3 rounded-xl border border-slate-200 bg-white text-xs font-mono focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-400 transition-all"
                      placeholder="Nhập cấu hình JSON mặc định..."
                    />
                  </div>
                </div>
              )}

              {activeSettingsTab === 'ai' && (
                <div className="space-y-6 h-full flex flex-col min-h-0">
                  {/* Toggle AI grading activation */}
                  <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all shrink-0">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Chấm bài tự luận bằng AI</h4>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Tự động gửi câu trả lời tự luận cho AI chấm điểm và cho nhận xét.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLocalEnableAIGrading(!localEnableAIGrading)}
                      className={`w-11 h-6 rounded-full transition-colors relative shadow-inner focus:outline-none ${localEnableAIGrading ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-md ${localEnableAIGrading ? 'right-0.5' : 'left-0.5'}`}
                      />
                    </button>
                  </div>

                  {/* Dual Column Profiles Section */}
                  <div className={`flex-1 flex flex-col md:flex-row gap-6 min-h-0 transition-all duration-300 ${localEnableAIGrading ? 'opacity-100 pointer-events-auto' : 'opacity-40 pointer-events-none'}`}>
                    
                    {/* Profiles List Sidebar */}
                    <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col pb-4 md:pb-0 md:pr-4 overflow-y-auto space-y-1.5 shrink-0 max-h-44 md:max-h-none">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Danh sách cấu hình</p>
                        <button
                          type="button"
                          onClick={handleAddProfile}
                          className="p-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          title="Thêm cấu hình mới"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {localProfiles.map(p => {
                        const isActive = localActiveProfileId === p.id;
                        const isSelected = selectedProfileIdToEdit === p.id;
                        return (
                          <div
                            key={p.id}
                            className={`group w-full flex items-center justify-between p-1.5 rounded-xl transition-all border ${
                              isSelected
                                ? 'bg-slate-100/80 border-slate-200'
                                : 'border-transparent hover:bg-slate-50'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProfileIdToEdit(p.id);
                                setTestResult(null);
                              }}
                              className="flex-1 text-left px-2 py-1 min-w-0"
                            >
                              <div className="font-semibold text-slate-700 text-xs truncate flex items-center gap-1.5">
                                {isActive && (
                                  <CheckCircle2 size={12} className="text-indigo-600 shrink-0" />
                                )}
                                <span className={isActive ? 'font-bold text-slate-900' : ''}>{p.name}</span>
                              </div>
                              <span className="text-[9px] text-slate-400 font-mono block truncate mt-0.5">{p.aiModel || 'Chưa đặt model'}</span>
                            </button>

                            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              {!isActive && (
                                <button
                                  type="button"
                                  onClick={() => setLocalActiveProfileId(p.id)}
                                  className="text-[9px] font-bold px-1.5 py-0.5 text-slate-500 hover:text-indigo-600 rounded bg-slate-100 hover:bg-indigo-50 border border-slate-200 mr-1"
                                >
                                  Dùng
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteProfile(p.id)}
                                className="p-1 text-slate-400 hover:text-red-500 rounded transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Profile configuration Form Panel */}
                    <div className="flex-1 overflow-y-auto pr-1">
                      {currentEditingProfile ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chi tiết cấu hình</h5>
                            {localActiveProfileId === currentEditingProfile.id && (
                              <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-lg font-bold">Đang kích hoạt</span>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tên cấu hình</label>
                            <input
                              type="text"
                              value={currentEditingProfile.name}
                              onChange={(e) => handleUpdateProfileField('name', e.target.value)}
                              autoComplete="off"
                              placeholder="Đặt tên cho cấu hình này..."
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Base URL (Địa chỉ API)</label>
                            <input
                              type="text"
                              value={currentEditingProfile.aiBaseUrl}
                              onChange={(e) => handleUpdateProfileField('aiBaseUrl', e.target.value)}
                              autoComplete="off"
                              placeholder="Mặc định: Google Gemini compatibility endpoint"
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">API Key</label>
                            <input
                              type="text"
                              value={currentEditingProfile.aiApiKey}
                              onChange={(e) => handleUpdateProfileField('aiApiKey', e.target.value)}
                              autoComplete="off"
                              placeholder="Nhập API Key của nhà cung cấp LLM..."
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Model Name (Tên mô hình)</label>
                            <input
                              type="text"
                              value={currentEditingProfile.aiModel}
                              onChange={(e) => handleUpdateProfileField('aiModel', e.target.value)}
                              autoComplete="off"
                              placeholder="VD: gemini-3.5-flash, gpt-5, deepseek-chat..."
                              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-xs font-semibold focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all"
                            />
                          </div>

                          {/* Test Connection Actions & Reports */}
                          <div className="pt-2 flex flex-col gap-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleTestConnection}
                                disabled={isTesting}
                                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 disabled:opacity-55 disabled:cursor-not-allowed rounded-lg text-[11px] font-bold transition-all border border-indigo-200/50 flex items-center justify-center gap-1.5 shadow-sm"
                              >
                                {isTesting ? (
                                  <>
                                    <Loader2 className="animate-spin" size={12} />
                                    <span>Đang kiểm tra kết nối...</span>
                                  </>
                                ) : (
                                  <>
                                    <Sparkles size={12} />
                                    <span>Kiểm tra cấu hình này</span>
                                  </>
                                )}
                              </button>
                              
                              {localActiveProfileId !== currentEditingProfile.id && (
                                <button
                                  type="button"
                                  onClick={() => setLocalActiveProfileId(currentEditingProfile.id)}
                                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold transition-all border border-slate-200/50"
                                >
                                  Đặt làm hoạt động chính
                                </button>
                              )}
                            </div>

                            {testResult && (
                              <div className={`p-4 rounded-xl border text-xs transition-all ${testResult.success
                                ? 'bg-emerald-50/30 border-emerald-100 text-emerald-800'
                                : 'bg-rose-50/30 border-rose-100 text-rose-800'
                              }`}>
                                <div className="flex items-center gap-2 font-bold mb-1.5">
                                  <div className={`w-1.5 h-1.5 rounded-full ${testResult.success ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                                  <span>{testResult.success ? 'Kết nối thành công!' : 'Kết nối thất bại'}</span>
                                </div>

                                <div className="space-y-2">
                                  {testResult.success ? (
                                    <div className="p-2.5 bg-white border border-emerald-100 rounded-lg">
                                      <p className="text-[9px] font-bold text-slate-400 mb-0.5 uppercase tracking-wider">Phản hồi của AI:</p>
                                      <p className="text-xs text-slate-700 leading-relaxed font-serif italic whitespace-pre-wrap">{testResult.response}</p>
                                    </div>
                                  ) : (
                                    <div className="p-2.5 bg-white border border-rose-100 rounded-lg font-mono text-[9px] whitespace-pre-wrap leading-relaxed overflow-x-auto text-rose-700">
                                      <p className="text-[9px] font-bold text-rose-600 mb-0.5 uppercase tracking-wider font-sans">Chi tiết lỗi (Error Log):</p>
                                      {testResult.error}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-10">Bấm thêm cấu hình để khởi tạo profiles mới.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeSettingsTab === 'subjects' && (
                <div className="h-full flex flex-col md:flex-row gap-6 min-h-0">
                  <div className="w-full md:w-[220px] border-b md:border-b-0 md:border-r border-slate-100 flex flex-col pb-4 md:pb-0 md:pr-4 shrink-0 min-h-0 max-h-44 md:max-h-none">
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Danh sách môn</p>
                    </div>

                    {!isLoadingAllSubjects && allSubjectsForConfig.length > 0 && (
                      <div className="mb-2 shrink-0">
                        <SearchBar
                          size="sm"
                          value={subjectSearchQuery}
                          onChange={setSubjectSearchQuery}
                          placeholder="Tìm kiếm môn học..."
                        />
                      </div>
                    )}

                    <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
                      {isLoadingAllSubjects ? (
                        <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-indigo-500" size={20} /></div>
                      ) : filteredSubjects.length === 0 ? (
                        <p className="text-xs text-slate-400 italic text-center py-6">
                          {subjectSearchQuery ? 'Không tìm thấy môn học phù hợp.' : 'Không có môn học.'}
                        </p>
                      ) : (
                        filteredSubjects.map(s => {
                          const isTempActive = tempSubjectConfigs[s.id]?.active ?? true;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setSelectedSubjectIdForConfig(s.id)}
                              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${selectedSubjectIdForConfig === s.id
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                              <span className="truncate mr-2 italic font-serif text-[11px]">{s.name}</span>
                              {!isTempActive && (
                                <span className="text-[8px] bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded shrink-0 font-bold">Ẩn</span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1">
                    {selectedSubjectIdForConfig && tempSubjectConfigs[selectedSubjectIdForConfig] ? (() => {
                      const subj = allSubjectsForConfig.find(s => s.id === selectedSubjectIdForConfig);
                      const config = tempSubjectConfigs[selectedSubjectIdForConfig];
                      return (
                        <div className="space-y-5">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h4 className="font-bold text-slate-800 text-sm">Cấu hình: <span className="italic font-serif text-indigo-600">{subj?.name}</span></h4>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                            <div>
                              <h5 className="text-xs font-bold text-slate-800">Trạng thái môn học</h5>
                              <p className="text-[10px] text-slate-400 mt-0.5">Cho phép hiển thị môn học này trên thanh công cụ chính.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setTempSubjectConfigs({
                                  ...tempSubjectConfigs,
                                  [selectedSubjectIdForConfig]: {
                                    ...config,
                                    active: !config.active
                                  }
                                });
                              }}
                              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${config.active ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            >
                              <div
                                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${config.active ? 'right-0.5' : 'left-0.5'}`}
                              />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Mô tả môn học</label>
                            <textarea
                              rows={3}
                              value={config.description}
                              onChange={(e) => {
                                setTempSubjectConfigs({
                                  ...tempSubjectConfigs,
                                  [selectedSubjectIdForConfig]: {
                                    ...config,
                                    description: e.target.value
                                  }
                                });
                              }}
                              placeholder="Nhập mô tả tóm tắt về môn học này..."
                              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/30 text-sm font-medium focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Thông tin khác (Lưu ý, giáo viên, tài liệu tham khảo...)</label>
                            <textarea
                              rows={3}
                              value={config.other_information}
                              onChange={(e) => {
                                setTempSubjectConfigs({
                                  ...tempSubjectConfigs,
                                  [selectedSubjectIdForConfig]: {
                                    ...config,
                                    other_information: e.target.value
                                  }
                                });
                              }}
                              placeholder="Nhập ghi chú thêm..."
                              className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/30 text-sm font-medium focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all resize-none"
                            />
                          </div>
                        </div>
                      );
                    })() : (
                      <p className="text-xs text-slate-400 italic text-center py-10">Chọn một môn học bên trái để chỉnh sửa cấu hình.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 border-t border-slate-100 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleSave}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all font-serif italic cursor-pointer"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
