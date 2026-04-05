import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import Toast from "../components/Toast";
import styles from "./FileOpen.module.css";
import { OverviewAnalyticsHero } from "../components/OverviewCharts";

interface Session {
  _id?: string;
  id: string;
  timestamp: number;
  createdAt?: string;
  words: number;
  chars: number;
  edits: number;
  pastes: number;
  wpm: number;
  pauses: number;
  duration: number | string;
  content: string;
  analytics?: {
    authenticity?: {
      score: number;
      label: string;
    };
    flags?: {
      type: string;
      message: string;
    }[];
  };
}

interface FileData {
  id: string;
  name: string;
  content: string;
  sessions: Session[];
  lastModified: number;
  font: string;
  fontSize: number;
  textColor: string;
  bgColor: string;
  customColor: string;
  customBg: string;
  scrollPosition: number;
}

interface DocumentDetail {
  _id: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface EditorProps {
  fileId: string;
  fileName: string;
  onClose?: () => void;
}

const STORAGE_KEY = "writing_tracker_files";

const DRAFT_PREFIX = "draft_";

function saveDraft(fileId: string, content: string) {
  localStorage.setItem(`${DRAFT_PREFIX}${fileId}`, content);
}

function loadDraft(fileId: string): string | null {
  return localStorage.getItem(`${DRAFT_PREFIX}${fileId}`);
}

function clearDraft(fileId: string) {
  localStorage.removeItem(`${DRAFT_PREFIX}${fileId}`);
}

const DEFAULT_FORMATTING = {
  font: "Calibri",
  fontSize: 14,
  textColor: "#ffffff",
  bgColor: "#f59e0b",
  customColor: "#ffffff",
  customBg: "#000000",
  scrollPosition: 0,
};

function migrationFileData(file: any): FileData {
  return {
    id: file.id || "",
    name: file.name || "",
    content: file.content || "",
    sessions: file.sessions || [],
    lastModified: file.lastModified || Date.now(),
    font: file.font || DEFAULT_FORMATTING.font,
    fontSize: file.fontSize || DEFAULT_FORMATTING.fontSize,
    textColor: file.textColor || DEFAULT_FORMATTING.textColor,
    bgColor: file.bgColor || DEFAULT_FORMATTING.bgColor,
    customColor: file.customColor || DEFAULT_FORMATTING.customColor,
    customBg: file.customBg || DEFAULT_FORMATTING.customBg,
    scrollPosition: file.scrollPosition || DEFAULT_FORMATTING.scrollPosition,
  };
}

function loadFiles(): Record<string, FileData> {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const migratedData: Record<string, FileData> = {};
    for (const fileId in data) {
      migratedData[fileId] = migrationFileData(data[fileId]);
    }
    return migratedData;
  } catch {
    return {};
  }
}

function saveFiles(files: Record<string, FileData>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
}

function getFileData(fileId: string, fileName: string): FileData {
  const files = loadFiles();
  if (files[fileId]) {
    return migrationFileData(files[fileId]);
  }
  return {
    id: fileId,
    name: fileName,
    content: "",
    sessions: [],
    lastModified: Date.now(),
    font: DEFAULT_FORMATTING.font,
    fontSize: DEFAULT_FORMATTING.fontSize,
    textColor: DEFAULT_FORMATTING.textColor,
    bgColor: DEFAULT_FORMATTING.bgColor,
    customColor: DEFAULT_FORMATTING.customColor,
    // ... rest of the content will be handled in chunks if need be but actually I'll just write the full file.
    customBg: DEFAULT_FORMATTING.customBg,
    scrollPosition: DEFAULT_FORMATTING.scrollPosition,
  };
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, " ").trim();
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function countChars(html: string): number {
  return html.replace(/<[^>]*>/g, "").length;
}

const FONTS = [
  "Calibri",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Courier New",
  "Verdana",
  "Trebuchet MS",
];
const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

const FONT_CLASS_MAP: Record<string, string> = {
  Calibri: styles.fontCalibri,
  Georgia: styles.fontGeorgia,
  "Times New Roman": styles.fontTimesNewRoman,
  Arial: styles.fontArial,
  "Courier New": styles.fontCourierNew,
  Verdana: styles.fontVerdana,
  "Trebuchet MS": styles.fontTrebuchetMs,
};

const FONT_SIZE_CLASS_MAP: Record<number, string> = {
  10: styles.fontSize10,
  11: styles.fontSize11,
  12: styles.fontSize12,
  13: styles.fontSize13,
  14: styles.fontSize14,
  16: styles.fontSize16,
  18: styles.fontSize18,
  20: styles.fontSize20,
  24: styles.fontSize24,
  28: styles.fontSize28,
  32: styles.fontSize32,
  36: styles.fontSize36,
  48: styles.fontSize48,
  72: styles.fontSize72,
};

const PAUSE_THRESHOLD_MS = 3000;

const SESSION_ID_RE = /^[a-f\d]{24}$/i;

const isMongoObjectId = (value: unknown): value is string =>
  typeof value === "string" && SESSION_ID_RE.test(value);

function Editor({ fileId, fileName, onClose }: EditorProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "sessions" | "write">(
    "write",
  );
  const [fileData, setFileData] = useState<FileData>(() =>
    getFileData(fileId, fileName),
  );
  const [toastMessage, setToastMessage] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const stored = localStorage.getItem(`sessionId_${fileId}`);
    return isMongoObjectId(stored) ? stored : null;
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const isSavingRef = useRef(false);
  const pendingKeystrokesRef = useRef<any[]>([]);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousContentRef = useRef<string>("");
  const [font, setFont] = useState(DEFAULT_FORMATTING.font);
  const [fontSize, setFontSize] = useState(DEFAULT_FORMATTING.fontSize);
  const [textColor, setTextColor] = useState(DEFAULT_FORMATTING.textColor);
  const [bgColor, setBgColor] = useState(DEFAULT_FORMATTING.bgColor);
  const [customColor, setCustomColor] = useState(
    DEFAULT_FORMATTING.customColor,
  );
  const [customBg, setCustomBg] = useState(DEFAULT_FORMATTING.customBg);

  const [wpm, setWpm] = useState(0);
  const [pauses, setPauses] = useState(0);
  const [edits, setEdits] = useState(0);
  const [pastes, setPastes] = useState(0);
  const [pasteDetected, setPasteDetected] = useState(false);
  const [sessionAnalytics, setSessionAnalytics] = useState<any>(null);
  const [baselineDeviation, setBaselineDeviation] = useState(0);

  const totalWords = fileData.sessions.length
    ? fileData.sessions[fileData.sessions.length - 1].words
    : 0;
  const totalSessions = fileData.sessions.length;
  const avgWpm =
    totalSessions > 0
      ? Math.round(
        fileData.sessions.reduce((a, s) => a + s.wpm, 0) / totalSessions,
      )
      : 0;
  const totalDuration = fileData.sessions.reduce((a, s) => a + Number(s.duration), 0);

  const sessionStartRef = useRef<number>(Date.now());
  const lastKeystrokeRef = useRef<number>(Date.now());
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wordCountRef = useRef<number>(0);
  const startWordCountRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalsRef = useRef<number[]>([]);
  const lastTimestampRef = useRef<number>(Date.now());
  const microPausesRef = useRef(0);
  const macroPausesRef = useRef(0);
  const lastEditTimeRef = useRef<number>(0);
  const [behaviorScore, setBehaviorScore] = useState(0);

  const fontRef = useRef(font);
  const fontSizeRef = useRef(fontSize);
  const textColorRef = useRef(textColor);
  const bgColorRef = useRef(bgColor);
  const customColorRef = useRef(customColor);
  const customBgRef = useRef(customBg);

  useEffect(() => {
    fontRef.current = font;
  }, [font]);
  useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);
  useEffect(() => {
    textColorRef.current = textColor;
  }, [textColor]);
  useEffect(() => {
    bgColorRef.current = bgColor;
  }, [bgColor]);
  useEffect(() => {
    customColorRef.current = customColor;
  }, [customColor]);
  useEffect(() => {
    customBgRef.current = customBg;
  }, [customBg]);

  useEffect(() => {
    const fetchAndInitDocument = async () => {
      try {
        const response = await api.get<DocumentDetail>(
          `/api/documents/${fileId}`,
        );
        const dbDocument = response.data;
        const files = loadFiles();

        if (!files[fileId]) {
          files[fileId] = {
            id: fileId,
            name: dbDocument.name,
            content: dbDocument.content,
            sessions: [],
            lastModified: Date.now(),
            font: DEFAULT_FORMATTING.font,
            fontSize: DEFAULT_FORMATTING.fontSize,
            textColor: DEFAULT_FORMATTING.textColor,
            bgColor: DEFAULT_FORMATTING.bgColor,
            customColor: DEFAULT_FORMATTING.customColor,
            customBg: DEFAULT_FORMATTING.customBg,
            scrollPosition: DEFAULT_FORMATTING.scrollPosition,
          };
        } else {
          files[fileId] = migrationFileData(files[fileId]);
          files[fileId].name = dbDocument.name;
        }

        saveFiles(files);
        setFileData(files[fileId]);
      } catch (error) {
        console.error("Failed to fetch document from database:", error);
        setFileData(getFileData(fileId, fileName));
      }
    };

    const createSession = async () => {
      const storageKey = `sessionId_${fileId}`;
      const stored = localStorage.getItem(storageKey);

      if (stored && !isMongoObjectId(stored)) {
        localStorage.removeItem(storageKey);
      }

      if (isMongoObjectId(stored)) {
        setSessionId(stored);
        return;
      }

      try {
        const res = await api.post("/api/sessions", {
          documentId: fileId,
          keystrokes: [],
        });

        const id = String(res.data.sessionId);
        if (!isMongoObjectId(id)) {
          throw new Error("Invalid session id");
        }

        localStorage.setItem(storageKey, id);
        setSessionId(id);
      } catch (err) {
        console.error("Session creation failed", err);
        setToastMessage({
          message: "Could not start a writing session.",
          type: "error",
        });
      }
    };

    void fetchAndInitDocument();
    void createSession();
  }, [fileId, fileName]);

  useEffect(() => {
    if (!fileData) return;

    const draft = loadDraft(fileId);
    const contentToLoad =
      draft ??
      (fileData.sessions && fileData.sessions.length > 0
        ? fileData.sessions[fileData.sessions.length - 1].content
        : fileData.content || "");

    if (editorRef.current) {
      editorRef.current.innerHTML = contentToLoad;
      editorRef.current.scrollTop = fileData.scrollPosition || 0;
    }

    previousContentRef.current = contentToLoad;
    startWordCountRef.current = countWords(contentToLoad);
    wordCountRef.current = startWordCountRef.current;
    sessionStartRef.current = Date.now();
  }, [fileId, activeTab, fileData]);

  useEffect(() => {
    setFont(fileData.font || DEFAULT_FORMATTING.font);
    setFontSize(fileData.fontSize || DEFAULT_FORMATTING.fontSize);
    setTextColor(fileData.textColor || DEFAULT_FORMATTING.textColor);
    setBgColor(fileData.bgColor || DEFAULT_FORMATTING.bgColor);
    setCustomColor(fileData.customColor || DEFAULT_FORMATTING.customColor);
    setCustomBg(fileData.customBg || DEFAULT_FORMATTING.customBg);
    setEdits(0);
    setPastes(0);
    setPauses(0);
    setWpm(0);
    intervalsRef.current = [];
    microPausesRef.current = 0;
    macroPausesRef.current = 0;
    lastTimestampRef.current = Date.now();
    setBehaviorScore(0);
  }, [fileId]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const intervals = intervalsRef.current;

      if (!intervals || intervals.length < 5) return;

      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;

      if (!avg || avg === 0) return;

      const newWpm = Math.round(60000 / (avg * 5));

      setWpm((prev) => Math.round(prev * 0.7 + newWpm * 0.3));

      if (avgWpm > 0) {
        const dev = Math.abs(newWpm - avgWpm) / avgWpm;
        setBaselineDeviation(Math.round(dev * 100));
      }

      const variance = intervals.reduce((s, v) => s + (v - avg) ** 2, 0) / intervals.length;
      const std = Math.sqrt(variance);
      const cv = std / avg;
      const score = Math.max(0, 100 - cv * 100);
      setBehaviorScore(Math.round(score));
    }, 500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [avgWpm]);

  const getChangeBounds = (before: string, after: string) => {
    const maxPrefix = Math.min(before.length, after.length);
    let prefix = 0;

    while (prefix < maxPrefix && before[prefix] === after[prefix]) {
      prefix += 1;
    }

    const maxSuffix = Math.min(before.length - prefix, after.length - prefix);
    let suffix = 0;

    while (
      suffix < maxSuffix &&
      before[before.length - 1 - suffix] === after[after.length - 1 - suffix]
    ) {
      suffix += 1;
    }

    const removedLength = before.length - prefix - suffix;
    const insertedLength = after.length - prefix - suffix;

    return {
      start: prefix,
      end: prefix + removedLength,
      insertedLength,
      removedLength,
    };
  };

  const flushKeystrokes = useCallback(async () => {
    if (!sessionId || pendingKeystrokesRef.current.length === 0) return;

    const batch = pendingKeystrokesRef.current.splice(
      0,
      pendingKeystrokesRef.current.length,
    );

    await api.patch(`/api/sessions/${sessionId}`, {
      keystrokes: batch,
    });
  }, [sessionId]);

  const queueKeystrokes = useCallback(
    (events: any[]) => {
      pendingKeystrokesRef.current.push(...events);

      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

      syncTimerRef.current = setTimeout(() => {
        void flushKeystrokes();
      }, 500);
    },
    [flushKeystrokes],
  );

  const handleSaveSession = useCallback(async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    try {
      await flushKeystrokes();

      const content = editorRef.current?.innerHTML || "";
      const words = countWords(content);
      const chars = countChars(content);
      const elapsed = (Date.now() - sessionStartRef.current) / 1000;
      const elapsedMin = elapsed / 60;
      const wordsTyped = Math.max(0, words - startWordCountRef.current);
      const finalWpm = elapsedMin > 0 ? Math.round(wordsTyped / elapsedMin) : 0;

      await api.patch(`/api/documents/${fileId}/content`, { content });

      if (!sessionId) {
        throw new Error("Missing session id");
      }

      const closeRes = await api.post(`/api/sessions/${sessionId}/close`, { wpm: finalWpm });
      const analytics = closeRes.data.analytics ?? null;
      setSessionAnalytics(analytics);

      const session: Session = {
        _id: sessionId,
        id: sessionId,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        words,
        chars,
        edits,
        pastes,
        wpm: finalWpm,
        pauses,
        duration: String(Math.round(elapsed)),
        content,
        analytics: analytics ?? undefined,
      };

      const updated: FileData = {
        ...fileData,
        content,
        sessions: [...(fileData.sessions || []), session],
        lastModified: Date.now(),
        font,
        fontSize,
        textColor,
        bgColor,
        customColor,
        customBg,
        scrollPosition: editorRef.current?.scrollTop || 0,
      };

      const files = loadFiles();
      files[fileId] = updated;
      saveFiles(files);
      setFileData(updated);
      clearDraft(fileId);

      localStorage.removeItem(`sessionId_${fileId}`);
      setSessionId(null);

      const nextSessionRes = await api.post("/api/sessions", {
        documentId: fileId,
        keystrokes: [],
      });

      const nextSessionId = String(nextSessionRes.data.sessionId);
      if (isMongoObjectId(nextSessionId)) {
        localStorage.setItem(`sessionId_${fileId}`, nextSessionId);
        setSessionId(nextSessionId);
      }

      setEdits(0);
      setPastes(0);
      setPauses(0);
      setWpm(0);
      intervalsRef.current = [];
      microPausesRef.current = 0;
      macroPausesRef.current = 0;
      lastTimestampRef.current = Date.now();
      sessionStartRef.current = Date.now();
      startWordCountRef.current = words;

      setToastMessage({
        message: "Session saved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to save session:", error);
      setToastMessage({
        message: "Failed to save session",
        type: "error",
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [
    edits,
    fileData,
    fileId,
    font,
    fontSize,
    flushKeystrokes,
    bgColor,
    customBg,
    customColor,
    pauses,
    pastes,
    sessionId,
    textColor,
  ]);

  useEffect(() => {
    const handleCtrlS = async (e: KeyboardEvent) => {
      if (!((e.ctrlKey || e.metaKey) && e.key === "s")) return;
      e.preventDefault();

      await handleSaveSession();
    };

    window.addEventListener("keydown", handleCtrlS);
    return () => window.removeEventListener("keydown", handleCtrlS);
  }, [fileId, handleSaveSession]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const content = editorRef.current?.innerHTML || "";
      if (!content.trim()) return;

      saveDraft(fileId, content);

      handleSaveSession();

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [fileId, handleSaveSession]);

  useEffect(() => {
    const handleAutoSave = () => {
      handleSaveSession();
    };

    window.addEventListener("auto-save-session", handleAutoSave);

    return () => {
      window.removeEventListener("auto-save-session", handleAutoSave);
    };
  }, [handleSaveSession]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") return;

      const content = editorRef.current?.innerHTML || "";
      saveDraft(fileId, content);

      const now = Date.now();
      const gap = now - lastTimestampRef.current;

      if (gap > 0 && gap < 10000) {
        intervalsRef.current.push(gap);
        if (intervalsRef.current.length > 50) {
          intervalsRef.current.shift();
        }
      }

      if (gap > 2000) {
        setPauses((p) => p + 1);
        macroPausesRef.current++;
      } else if (gap > 300) {
        microPausesRef.current++;
      }

      lastTimestampRef.current = now;

      queueKeystrokes([{ action: "down", timestamp: now }]);

      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        lastKeystrokeRef.current = 0;
      }, PAUSE_THRESHOLD_MS);
    },
    [fileId, queueKeystrokes],
  );

  const handleKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") return;

      const now = Date.now();
      queueKeystrokes([{ action: "up", timestamp: now }]);
    },
    [queueKeystrokes],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();

      const text = e.clipboardData.getData("text/plain");

      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const selectionStart = range ? range.startOffset : 0;
      const selectionEnd = range ? range.endOffset : 0;
      const now = Date.now();

      document.execCommand("insertText", false, text);

      if (text.length > 20) {
        setPastes((p) => p + 1);
      }
      setPasteDetected(true);

      queueKeystrokes([
        {
          action: "paste",
          timestamp: now,
          pasteLength: text.length,
          pasteSelectionStart: selectionStart,
          pasteSelectionEnd: selectionEnd,
        },
      ]);

      setTimeout(() => setPasteDetected(false), 2000);
    },
    [queueKeystrokes],
  );

  const handleInput = useCallback(() => {
    const current = editorRef.current?.innerHTML || "";
    const previous = previousContentRef.current;

    if (current !== previous) {
      const change = getChangeBounds(previous, current);
      const now = Date.now();

      if (
        (change.insertedLength > 2 || change.removedLength > 2) &&
        now - lastEditTimeRef.current > 200
      ) {
        setEdits((prev) => prev + 1);
        lastEditTimeRef.current = now;
      }

      if (change.insertedLength !== 0 || change.removedLength !== 0) {
        queueKeystrokes([
          {
            action: "edit",
            timestamp: now,
            editStart: change.start,
            editEnd: change.end,
            insertedLength: change.insertedLength,
            removedLength: change.removedLength,
          },
        ]);
      }

      previousContentRef.current = current;
    }
  }, [queueKeystrokes]);

  useEffect(() => {
    const files = loadFiles();
    if (files[fileId]) {
      files[fileId].font = font;
      files[fileId].fontSize = fontSize;
      files[fileId].textColor = textColor;
      files[fileId].bgColor = bgColor;
      files[fileId].customColor = customColor;
      files[fileId].customBg = customBg;
      saveFiles(files);
    }
  }, [font, fontSize, textColor, bgColor, customColor, customBg, fileId]);

  useEffect(() => {
    const handleScroll = () => {
      if (editorRef.current) {
        const files = loadFiles();
        if (files[fileId]) {
          files[fileId].scrollPosition = editorRef.current.scrollTop;
          saveFiles(files);
        }
      }
    };
    const editor = editorRef.current;
    if (editor) {
      editor.addEventListener("scroll", handleScroll);
      return () => editor.removeEventListener("scroll", handleScroll);
    }
  }, [fileId]);

  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const applyFont = (f: string) => {
    setFont(f);
    exec("fontName", f);
  };

  const applySize = (s: number) => {
    setFontSize(s);
    exec("fontSize", "7");
    const container = editorRef.current;
    if (container) {
      container.querySelectorAll('font[size="7"]').forEach((el) => {
        (el as HTMLElement).removeAttribute("size");
        (el as HTMLElement).style.fontSize = `${s}px`;
      });
    }
  };

  const applyTextColor = (c: string) => {
    setTextColor(c);
    exec("foreColor", c);
  };
  const applyBgColor = (c: string) => {
    setBgColor(c);
    exec("hiliteColor", c);
  };
  const applyHeading = (tag: string) => exec("formatBlock", `<${tag}>`);

  const currentContent = editorRef.current?.innerHTML || fileData.content;
  const words = countWords(currentContent);
  const chars = countChars(currentContent);
  const fontClass = FONT_CLASS_MAP[font] || styles.fontCalibri;
  const fontSizeClass = FONT_SIZE_CLASS_MAP[fontSize] || styles.fontSize14;

  return (
    <div className="file-open-page min-h-screen bg-[#0B0B0B] relative overflow-hidden">
      {/* Stable Premium Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-[#FF6A00] to-[#FF8C42] opacity-[0.025] blur-[80px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-l from-[#FF8C42] to-[#FFB366] opacity-[0.015] blur-[60px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.01]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,106,0,0.2) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative z-10 min-h-screen">
        <div className="w-full max-w-[2600px] mx-auto px-6 md:px-12 lg:px-16 py-10">

          {/* Premium Navigation */}
          <nav className="mb-6">
            <div className="flex items-center justify-between p-6 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/10 shadow-xl">
              <div className="flex items-center gap-3">
                {(["overview", "sessions", "write"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${activeTab === tab
                      ? "bg-gradient-to-r from-[#FF6A00] to-[#FF8C42] text-white shadow-md"
                      : "text-white/70 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20"
                      }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              {onClose && (
                <button
                  className="px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 transition-all duration-200 font-medium"
                  onClick={onClose}
                >
                  ✕ Close
                </button>
              )}
            </div>
          </nav>

          {activeTab === "write" && (
            <div className="space-y-8">
              <div className="flex flex-wrap gap-4">
                <PremiumBadge color="#4ade80" label="Keystroke capture active" />
                <PremiumBadge
                  color="#FF6A00"
                  label={pasteDetected ? "Paste detected!" : "Paste detection on"}
                  pulse={pasteDetected}
                />
                <PremiumBadge color="#4ade80" label={`WPM: ${wpm}`} />
                <PremiumBadge color="#4ade80" label={`Pauses: ${pauses}`} />
                <PremiumBadge color="#4ade80" label={`Human-like: ${behaviorScore}%`} />
                <PremiumBadge color="#FF6A00" label={`Deviation: ${baselineDeviation}%`} />
              </div>

              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-3xl shadow-xl overflow-hidden">
                <div className="flex flex-wrap items-center gap-4 p-6 border-b border-white/10 bg-black/20">
                  <select
                    className="px-4 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/20 transition-all duration-200"
                    aria-label="Font family"
                    title="Font family"
                    value={font}
                    onChange={(e) => applyFont(e.target.value)}
                  >
                    {FONTS.map((f) => (
                      <option key={f} value={f} className="bg-black text-white">
                        {f}
                      </option>
                    ))}
                  </select>

                  <select
                    className="px-3 py-2 bg-black/40 border border-white/20 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-[#FF6A00]/50 focus:ring-1 focus:ring-[#FF6A00]/20 transition-all duration-200 w-20"
                    aria-label="Font size"
                    title="Font size"
                    value={fontSize}
                    onChange={(e) => applySize(Number(e.target.value))}
                  >
                    {FONT_SIZES.map((s) => (
                      <option key={s} value={s} className="bg-black text-white">
                        {s}
                      </option>
                    ))}
                  </select>

                  <div className="w-px h-6 bg-white/20" />

                  <PremiumToolBtn label="B" bold onClick={() => exec("bold")} title="Bold" />
                  <PremiumToolBtn label="I" italic onClick={() => exec("italic")} title="Italic" />
                  <PremiumToolBtn label="U" underline onClick={() => exec("underline")} title="Underline" />
                  <PremiumToolBtn label="S" strike onClick={() => exec("strikeThrough")} title="Strikethrough" />

                  <div className="w-px h-6 bg-white/20" />

                  <PremiumToolBtn label="H1" onClick={() => applyHeading("h1")} title="Heading 1" />
                  <PremiumToolBtn label="H2" onClick={() => applyHeading("h2")} title="Heading 2" />
                  <PremiumToolBtn label="H3" onClick={() => applyHeading("h3")} title="Heading 3" />
                  <PremiumToolBtn label="¶" onClick={() => applyHeading("p")} title="Paragraph" />

                  <div className="w-px h-6 bg-white/20" />

                  <PremiumToolBtn label="≡" onClick={() => exec("justifyLeft")} title="Align Left" />
                  <PremiumToolBtn label="≡" onClick={() => exec("justifyCenter")} title="Center" centerAlign />
                  <PremiumToolBtn label="≡" onClick={() => exec("justifyRight")} title="Align Right" />
                  <PremiumToolBtn label="≡" onClick={() => exec("justifyFull")} title="Justify" />
                </div>

                <div className="flex flex-wrap items-center gap-4 p-6 pt-0 border-b border-white/10 bg-black/20">
                  <div className="flex gap-3">
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-white/20 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-white/40 bg-white"
                      onClick={() => applyTextColor("#ffffff")}
                      title="White text"
                    />
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-white/20 cursor-pointer transition-all duration-200 hover:scale-105 hover:border-[#FF6A00]/50 bg-gradient-to-r from-[#FF6A00] to-[#FF8C42]"
                      onClick={() => applyTextColor("#FF6A00")}
                      title="Orange text"
                    />
                  </div>

                  <div className="w-px h-6 bg-white/20" />

                  <label className="relative cursor-pointer" title="Custom text color">
                    <input
                      type="color"
                      value={customColor}
                      className="w-8 h-8 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                      aria-label="Custom text color"
                      title="Custom text color"
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        applyTextColor(e.target.value);
                      }}
                    />
                  </label>

                  <label className="relative cursor-pointer" title="Custom highlight color">
                    <input
                      type="color"
                      value={customBg}
                      className="w-8 h-8 rounded-lg border-2 border-white/20 cursor-pointer bg-transparent"
                      aria-label="Custom highlight color"
                      title="Custom highlight color"
                      onChange={(e) => {
                        setCustomBg(e.target.value);
                        applyBgColor(e.target.value);
                      }}
                    />
                  </label>

                  <div className="w-px h-6 bg-white/20" />

                  <PremiumToolBtn label="• —" onClick={() => exec("insertUnorderedList")} title="Bullet List" />
                  <PremiumToolBtn label="1." onClick={() => exec("insertOrderedList")} title="Numbered List" />
                  <PremiumToolBtn label="→" onClick={() => exec("indent")} title="Indent" />
                  <PremiumToolBtn label="←" onClick={() => exec("outdent")} title="Outdent" />
                  <PremiumToolBtn label="⎌" onClick={() => exec("undo")} title="Undo" />
                  <PremiumToolBtn label="⎋" onClick={() => exec("redo")} title="Redo" />
                </div>

                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  className={`min-h-[500px] p-8 bg-black/20 text-white text-lg leading-relaxed outline-none overflow-y-auto ${fontClass} ${fontSizeClass}`}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  onInput={handleInput}
                  onPaste={handlePaste}
                  spellCheck
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    whiteSpace: 'pre-wrap'
                  }}
                />

                <div className="flex items-center justify-between p-6 border-t border-white/10 bg-black/20">
                  <div className="flex items-center gap-6">
                    <PremiumStatItem label="Words:" value={words} tone="muted" />
                    <PremiumStatItem label="Chars:" value={chars} tone="muted" />
                    <PremiumStatItem label="Edits:" value={edits} tone="accent" />
                    <PremiumStatItem label="Pastes:" value={pastes} tone="muted" />
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-white/40 text-sm">Ctrl+S to save quietly</span>
                    <button
                      className="px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#FF6A00] to-[#FF8C42] shadow-md transition-all duration-200 hover:shadow-lg active:scale-95"
                      onClick={handleSaveSession}
                    >
                      Save session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Ta          {/* Sessions Tab - High Density Wide Design */}
          {activeTab === "sessions" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF8C42]/10 border border-[#FF6A00]/20 flex items-center justify-center shrink-0 shadow-lg shadow-[#FF6A00]/5">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h2 className="text-[1.5rem] md:text-[1.75rem] leading-[1.2] font-black text-white tracking-tight">Writing Sessions</h2>
                    <p className="text-white/65 text-[0.75rem] md:text-[0.8125rem] leading-[1.45] font-semibold uppercase tracking-[0.08em]">Complete history for {fileData.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-3">
                      <span className="text-[0.6875rem] text-white/55 font-bold uppercase tracking-[0.08em]">Total Committed</span>
                      <span className="text-[1.125rem] md:text-[1.25rem] leading-none font-black text-white">{fileData.sessions.length}</span>
                   </div>
                </div>
              </div>

              {fileData.sessions.length === 0 ? (
                <div className="py-32 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center mb-6 text-3xl opacity-20">📜</div>
                  <h3 className="text-white/75 text-[1.0625rem] md:text-[1.125rem] leading-[1.35] font-bold">No sessions committed to the ledger yet.</h3>
                  <p className="text-white/55 text-[0.9rem] leading-[1.55] mt-1">Start writing to capture behavioral biometrics.</p>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0D0D0D]/50 backdrop-blur-xl shadow-2xl">
                  {/* Grid Layout Container */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[1200px]">
                      {/* Header Row */}
                      <div className="grid grid-cols-[80px,2fr,1fr,1fr,1fr,1fr,1fr,1fr,140px] items-center px-10 py-6 bg-white/[0.03] border-b border-white/5">
                        <span className="text-[0.6875rem] text-white/60 font-bold uppercase tracking-[0.08em]">Ref</span>
                        <span className="text-[0.6875rem] text-white/60 font-bold uppercase tracking-[0.08em]">Session Timeline</span>
                        <span className="text-[0.6875rem] text-white/60 font-bold uppercase tracking-[0.08em] text-right">Words</span>
                        <span className="text-[0.6875rem] text-white/60 font-bold uppercase tracking-[0.08em] text-right">Chars</span>
                        <span className="text-[0.6875rem] text-white/60 font-bold uppercase tracking-[0.08em] text-right">Duration</span>
                        <span className="text-[0.6875rem] text-white/60 font-bold uppercase tracking-[0.08em] text-right">Edits</span>
                        <span className="text-[0.6875rem] text-white/60 font-bold uppercase tracking-[0.08em] text-right">Velocity</span>
                        <span className="text-[0.6875rem] text-white/60 font-bold uppercase tracking-[0.08em] text-right">Authenticity</span>
                        <span className="text-right"></span>
                      </div>

                      <div className="divide-y divide-white/[0.02]">
                        {[...fileData.sessions].reverse().map((session, index) => {
                          const verificationSessionId = session._id || session.id;
                          const sessionRef = fileData.sessions.length - index;
                          const score = session.analytics?.authenticity?.score;
                          const label = session.analytics?.authenticity?.label;
                          
                          const scoreColor = typeof score === 'number' 
                            ? score > 70 ? 'text-emerald-400' : score > 40 ? 'text-amber-400' : 'text-red-400'
                            : 'text-white/20';

                          return (
                            <div
                              key={session._id || session.id || index}
                              className="grid grid-cols-[80px,2fr,1fr,1fr,1fr,1fr,1fr,1fr,140px] items-center px-10 py-7 hover:bg-white/[0.02] transition-all duration-300 group relative"
                            >
                              {/* Left margin highlight */}
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF6A00] opacity-0 group-hover:opacity-100 transition-opacity" />
                              
                              <span className="text-[0.75rem] leading-none font-bold text-[#FF6A00]/70 tracking-[0.02em]">#{sessionRef.toString().padStart(3, '0')}</span>
                              
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[0.95rem] md:text-[1rem] leading-[1.35] font-semibold text-white group-hover:text-[#FF6A00] transition-colors">{new Date(session.timestamp).toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
                                <span className="text-[0.6875rem] text-white/60 font-semibold uppercase tracking-[0.06em] leading-[1.35]">At {new Date(session.timestamp).toLocaleTimeString(undefined, { timeStyle: 'short' })}</span>
                              </div>

                              <span className="text-[0.95rem] font-bold text-white text-right tracking-tight">{session.words.toLocaleString()}</span>
                              <span className="text-[0.95rem] font-semibold text-white/75 text-right tracking-tight">{session.chars.toLocaleString()} <span className="text-[0.625rem] opacity-70">ch</span></span>
                              <span className="text-[0.95rem] font-semibold text-white/75 text-right tracking-tight">{session.duration}s</span>
                              <span className="text-[0.95rem] font-semibold text-amber-400/85 text-right tracking-tight">{session.edits || 0}</span>
                              
                              <div className="text-right">
                                <span className="text-[0.95rem] font-bold text-white tracking-tight">{session.wpm}</span>
                                <span className="text-[0.625rem] text-[#FF8C42] font-semibold uppercase ml-1 tracking-[0.06em] opacity-90">wpm</span>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className={`text-[0.95rem] font-bold leading-none ${scoreColor}`}>{typeof score === 'number' ? `${score}%` : '—'}</span>
                                {label && <span className={`text-[0.625rem] font-semibold uppercase tracking-[0.06em] opacity-70 px-1.5 py-0.5 rounded border border-current leading-[1.2] ${scoreColor}`}>{label}</span>}
                              </div>

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  disabled={!isMongoObjectId(verificationSessionId)}
                                  onClick={() => {
                                    if (!isMongoObjectId(verificationSessionId)) return;
                                    navigate(`/verify/${verificationSessionId}`);
                                  }}
                                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-[0.625rem] font-semibold text-white uppercase tracking-[0.08em] leading-none hover:bg-gradient-to-r hover:from-[#FF6A00] hover:to-[#FF8C42] hover:border-transparent hover:shadow-lg hover:shadow-[#FF6A00]/20 transition-all active:scale-95 disabled:hidden"
                                >
                                  Deep Analysis
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00]/20 to-[#FF8C42]/10 border border-[#FF6A00]/20 flex items-center justify-center shrink-0">
                  <span className="text-xl">📄</span>
                </div>
                <div>
                  <h2 className="text-[1.45rem] md:text-[1.65rem] leading-[1.2] font-bold text-white tracking-tight">Document Overview</h2>
                  <p className="text-white/65 text-[0.9rem] md:text-[0.95rem] leading-[1.5] font-medium">{fileData.name}</p>
                </div>
              </div>

              {sessionAnalytics?.authenticity && (
                <div className="flex items-center gap-8 py-6 border-b border-white/[0.05] mb-8">
                  <div className="flex items-baseline gap-3 shrink-0">
                    <span className="text-[0.6875rem] uppercase tracking-[0.08em] text-white/60 font-bold shrink-0">Authenticity</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[1.7rem] md:text-[1.9rem] font-black text-white leading-none">{sessionAnalytics.authenticity.score}</span>
                      <span className="text-white/55 text-[0.75rem] font-semibold tracking-tight">/ 100</span>
                    </div>
                  </div>
                  <div className="h-4 w-px bg-white/5" />
                  <span className="text-[0.8125rem] font-semibold text-green-300/90 uppercase tracking-[0.06em]">{sessionAnalytics.authenticity.label}</span>
                  <div className="ml-auto flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500/40 animate-pulse" />
                    <span className="text-[0.6875rem] text-white/55 font-semibold uppercase tracking-[0.06em]">Verified Sync</span>
                  </div>
                </div>
              )}

              <OverviewAnalyticsHero
                avgWpm={avgWpm}
                totalWords={totalWords}
                totalSessions={totalSessions}
                totalDuration={totalDuration}
                sessions={fileData.sessions}
                fileName={fileData.name}
                lastModified={fileData.lastModified}
              />
            </div>
          )}
        </div>
      </div>

      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

function PremiumBadge({
  color,
  label,
  pulse,
}: {
  color: string;
  label: string;
  pulse?: boolean;
}) {
  const dotColor = color === "#FF6A00" ? "bg-gradient-to-r from-[#FF6A00] to-[#FF8C42]" : "bg-green-400";
  const pulseClass = pulse ? "animate-pulse" : "";

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/20 backdrop-blur-sm border border-white/10 transition-all duration-200 hover:border-white/20">
      <div className={`w-2 h-2 rounded-full ${dotColor} ${pulseClass} shadow-sm`} />
      <span className="text-white/90 text-sm font-medium font-mono tracking-wide">{label}</span>
    </div>
  );
}

function PremiumToolBtn({
  label,
  onClick,
  bold,
  italic,
  underline,
  strike,
  title,
  centerAlign,
}: {
  label: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  title?: string;
  centerAlign?: boolean;
}) {
  const className = [
    "px-3 py-2 rounded-xl bg-black/40 border border-white/20 text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all duration-200 text-sm font-medium min-w-[36px] h-9 flex items-center justify-center",
    bold ? "font-bold" : "",
    italic ? "italic" : "",
    underline ? "underline" : "",
    strike ? "line-through" : "",
    centerAlign ? "tracking-wider" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={className} onClick={onClick} title={title}>
      {label}
    </button>
  );
}

function PremiumStatItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "muted" | "accent";
}) {
  const toneClass = tone === "accent" ? "text-[#FF6A00]" : "text-white/60";
  return (
    <span className="text-sm">
      <span className="text-white/60">{label}</span>{" "}
      <strong className={`font-mono ${toneClass}`}>{value}</strong>
    </span>
  );
}

function PremiumSessionStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-2xl font-bold mb-1 ${accent ? "text-[#FF6A00]" : "text-white"}`}>
        {value}
      </div>
      <div className="text-xs text-white/50 uppercase tracking-wider font-bold">
        {label}
      </div>
    </div>
  );
}

function PremiumOverviewCard({
  label,
  value,
  icon,
  accent,
  progressRingValue,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent?: boolean;
  progressRingValue?: number;
}) {
  const showProgressRing = label === "Avg WPM" && typeof progressRingValue === "number";

  return (
    <div className="p-6 rounded-2xl bg-black/30 backdrop-blur-sm border border-white/10 shadow-xl transition-all duration-200 hover:border-[#FF6A00]/20 hover:shadow-lg hover:-translate-y-1">
      <div className="text-center space-y-4">
        <div className="text-3xl">{icon}</div>
        <div className="flex items-center justify-center gap-3">
          <div className={`text-2xl font-bold ${accent ? "text-[#FF6A00]" : "text-white"}`}>
            {value}
          </div>
          {showProgressRing && (
            <SubtleProgressRing value={progressRingValue} max={120} />
          )}
        </div>
        <div className="text-sm text-white/60 uppercase tracking-wider font-bold">
          {label}
        </div>
      </div>
    </div>
  );
}

function SubtleProgressRing({ value, max }: { value: number; max: number }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const size = 34;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(value / max, 1));
  const dashOffset = circumference * (1 - normalized);

  return (
    <div
      className="opacity-0 translate-y-1"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity 520ms ease, transform 520ms ease",
      }}
      aria-hidden="true"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 140, 66, 0.65)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={circumference}
          strokeDashoffset={isVisible ? dashOffset : circumference}
          style={{ transition: "stroke-dashoffset 520ms ease" }}
        />
      </svg>
    </div>
  );
}

function Badge({
  color,
  label,
  pulse,
}: {
  color: string;
  label: string;
  pulse?: boolean;
}) {
  return <PremiumBadge color={color} label={label} pulse={pulse} />;
}

function ToolBtn({
  label,
  onClick,
  bold,
  italic,
  underline,
  strike,
  title,
  centerAlign,
}: {
  label: string;
  onClick: () => void;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  title?: string;
  centerAlign?: boolean;
}) {
  return (
    <PremiumToolBtn
      label={label}
      onClick={onClick}
      bold={bold}
      italic={italic}
      underline={underline}
      strike={strike}
      title={title}
      centerAlign={centerAlign}
    />
  );
}

function StatItem({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "muted" | "accent";
}) {
  return <PremiumStatItem label={label} value={value} tone={tone} />;
}

function OverviewCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  icon: string;
  accent?: boolean;
}) {
  return <PremiumOverviewCard label={label} value={value} icon={icon} accent={accent} />;
}

export default function FileOpen() {
  const [searchParams] = useSearchParams();
  const fileId = searchParams.get("fileId");
  const fileName = searchParams.get("fileName");

  if (!fileId || !fileName) {
    return (
      <div className="file-open-page min-h-screen bg-[#0B0B0B] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-gradient-to-r from-[#FF6A00] to-[#FF8C42] opacity-[0.025] blur-[80px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-gradient-to-l from-[#FF8C42] to-[#FFB366] opacity-[0.015] blur-[60px] rounded-full" />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto px-6">
            <div className="text-center p-8 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
              <p className="text-white/60">
                No file specified. Please select a file from the files list.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Editor fileId={fileId} fileName={fileName} />;
}