import { useState, useMemo } from 'react';
import { GraduationCap, Loader2, Settings2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { CopyConfig, QuizParams } from '../../types.ts';
import SearchBar from '../SearchBar.tsx';

interface SettingsModalProps {
  activeSettingsTab: 'general' | 'subjects';
  setActiveSettingsTab: (tab: 'general' | 'subjects') => void;
  tempCopyConfig: CopyConfig;
  setTempCopyConfig: React.Dispatch<React.SetStateAction<CopyConfig>>;
  allSubjectsForConfig: any[];
  isLoadingAllSubjects: boolean;
  selectedSubjectIdForConfig: string | null;
  setSelectedSubjectIdForConfig: (id: string | null) => void;
  tempSubjectConfigs: Record<string, any>;
  setTempSubjectConfigs: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  defaultQuizConfig: QuizParams;
  onClose: () => void;
  onSave: (copyConfig: CopyConfig, defaultQuizConfig: QuizParams) => void;
}

export default function SettingsModal({
  activeSettingsTab,
  setActiveSettingsTab,
  tempCopyConfig,
  setTempCopyConfig,
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
  const [localDefaultQuizConfigStr, setLocalDefaultQuizConfigStr] = useState<string>(() => {
    return JSON.stringify(defaultQuizConfig, null, 2);
  });

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

  const handleSave = () => {
    let parsedQuizConfig;
    try {
      parsedQuizConfig = JSON.parse(localDefaultQuizConfigStr);
    } catch (e) {
      alert("Cấu hình JSON mặc định không hợp lệ: " + (e as Error).message);
      return;
    }
    onSave(
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
                {activeSettingsTab === 'general' ? 'Cấu hình chung' : 'Quản lý môn học'}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                {activeSettingsTab === 'general'
                  ? 'Lưu trữ tại browser localStorage (copyConfig).'
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
                          { key: 'feedback', label: 'Nhận xét bài làm' },
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
