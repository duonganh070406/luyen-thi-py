import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppState, CopyConfig, QuizParams } from '../types.ts';
import { listSubjects, updateSubjectConfig, getAIConfig, updateAIConfig, AIProfile, AIConfig } from '../services/api.ts';

const DEFAULT_COPY_CONFIG: CopyConfig = {
  format: 'json',
  fields: {
    id: true,
    name: true,
    type: true,
    question: true,
    options: true,
    correctAnswer: true,
    userAnswer: true,
    isCorrect: true,
    explanation: true,
    feedback: true,
  }
};

interface UseSettingsParams {
  selectedSubjectId: string | null;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function useSettings({ selectedSubjectId, setState }: UseSettingsParams) {
  const navigate = useNavigate();

  const [copyConfig, setCopyConfig] = useState<CopyConfig>(() => {
    const saved = localStorage.getItem("copyConfig");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_COPY_CONFIG;
  });

  const [enableAIGrading, setEnableAIGrading] = useState<boolean>(true);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [aiProfiles, setAiProfiles] = useState<AIProfile[]>([]);
  const [defaultQuizConfig, setDefaultQuizConfig] = useState<QuizParams>(() => {
    const saved = localStorage.getItem("defaultQuizConfig");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return {
      num_questions: 40,
      single: 0.7,
      multi: 0.2,
      essay: 0,
      short_answer: 0.1,
      matching: 0,
      sources: []
    };
  });

  // Load copyConfig to local storage
  useEffect(() => {
    localStorage.setItem("copyConfig", JSON.stringify(copyConfig));
  }, [copyConfig]);

  // Load initial AI config from backend
  useEffect(() => {
    async function loadInitialAIConfig() {
      try {
        const config = await getAIConfig();
        setEnableAIGrading(config.enableAIGrading);
        setActiveProfileId(config.activeProfileId);
        setAiProfiles(config.profiles || []);
      } catch (e) {
        console.error("Failed to load initial AI config", e);
      }
    }
    loadInitialAIConfig();
  }, []);

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [allSubjectsForConfig, setAllSubjectsForConfig] = useState<any[]>([]);
  const [isLoadingAllSubjects, setIsLoadingAllSubjects] = useState<boolean>(false);
  const [selectedSubjectIdForConfig, setSelectedSubjectIdForConfig] = useState<string | null>(null);
  const [tempSubjectConfigs, setTempSubjectConfigs] = useState<Record<string, any>>({});
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'ai' | 'subjects'>('general');
  const [tempCopyConfig, setTempCopyConfig] = useState<CopyConfig>(copyConfig);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchAllSubjects = async () => {
    setIsLoadingAllSubjects(true);
    try {
      const res = await listSubjects(true);
      setAllSubjectsForConfig(res);
      const configs: Record<string, any> = {};
      res.forEach(s => {
        configs[s.id] = { ...s.config };
      });
      setTempSubjectConfigs(configs);
      if (res.length > 0) {
        if (!selectedSubjectIdForConfig || !res.some(s => s.id === selectedSubjectIdForConfig)) {
          setSelectedSubjectIdForConfig(res[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load all subjects for config", e);
    } finally {
      setIsLoadingAllSubjects(false);
    }
  };

  // Synchronize modal fields when settings open
  useEffect(() => {
    if (showSettingsModal) {
      setTempCopyConfig(copyConfig);
    }
  }, [showSettingsModal, copyConfig]);

  const handleSaveSettings = async (
    aiConfig: AIConfig,
    newCopyConfig: CopyConfig,
    newDefaultQuizConfig: QuizParams
  ) => {
    try {
      // 1. Save AI config to backend
      const updateAIRes = await updateAIConfig(aiConfig);

      if (!updateAIRes.ok) {
        alert("Lỗi khi lưu cấu hình AI trên máy chủ!");
        return;
      }

      setCopyConfig(newCopyConfig);
      setDefaultQuizConfig(newDefaultQuizConfig);
      localStorage.setItem("defaultQuizConfig", JSON.stringify(newDefaultQuizConfig));
      setEnableAIGrading(aiConfig.enableAIGrading);
      setActiveProfileId(aiConfig.activeProfileId);
      setAiProfiles(aiConfig.profiles);

      // 2. Save Subject configs
      let saveError = null;
      for (const s of allSubjectsForConfig) {
        const currentConfig = s.config;
        const tempConfig = tempSubjectConfigs[s.id];
        if (tempConfig && (
          tempConfig.active !== currentConfig.active ||
          tempConfig.description !== currentConfig.description ||
          tempConfig.other_information !== currentConfig.other_information
        )) {
          const updateRes = await updateSubjectConfig(s.id, tempConfig);
          if (!updateRes.ok) {
            saveError = `Không thể lưu cấu hình môn học ${s.name}`;
            break;
          }
        }
      }

      if (saveError) {
        alert(saveError);
        return;
      }

      const rawSubjects = await listSubjects(false);
      const iconChoices = ['Calculator', 'Code', 'BookOpen', 'FileText'];
      const updatedSubjects = rawSubjects.map((s, i) => ({
        id: s.id,
        name: s.name,
        icon: iconChoices[i % iconChoices.length],
        description: s.config.description || 'Ngân hàng đề và lịch sử được đọc/ghi qua API backend.',
        other_information: s.config.other_information,
      }));

      setState(prev => ({
        ...prev,
        subjects: updatedSubjects
      }));

      if (selectedSubjectId) {
        const currentIsActive = rawSubjects.some(s => s.id === selectedSubjectId);
        if (!currentIsActive) {
          if (updatedSubjects.length > 0) {
            navigate(`/subject/${updatedSubjects[0].id}`, { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }
      }

      showToast("Đã lưu cấu hình thành công!");

    } catch (e) {
      console.error(e);
      alert("Lỗi xảy ra khi lưu cấu hình!");
    }
  };

  const openSettings = () => {
    setShowSettingsModal(true);
    fetchAllSubjects();
    async function refreshAIConfig() {
      try {
        const config = await getAIConfig();
        setEnableAIGrading(config.enableAIGrading);
        setActiveProfileId(config.activeProfileId);
        setAiProfiles(config.profiles || []);
      } catch (e) {
        console.error("Failed to refresh AI config", e);
      }
    }
    refreshAIConfig();
  };

  return {
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
  };
}
