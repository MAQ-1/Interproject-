export interface SessionTextAnalysis {
    avgSentenceLength: number;
    sentenceVariance: number;
    lexicalDiversity: number;
    totalWords: number;
    totalSentences: number;
}
export interface SessionAuthenticity {
    score: number;
    label: string;
    behavioralScore: number;
    textualScore: number;
    crossCheckScore: number;
}
import type { Keystroke } from "./keystroke";
export interface CreateSessionInput {
    documentId: string;
    keystrokes: Keystroke[];
}
export interface SessionUpsertInput {
    keystrokes: Keystroke[];
}
export interface SessionStartResponse {
    sessionId: string;
    resumed: boolean;
}
export interface SessionSummary {
    _id: string;
    documentId?: string;
    status: "active" | "closed";
    createdAt: string;
    closedAt?: string;
}
export interface SessionAnalytics {
    version: number;
    approximateWpmVariance: number;
    pauseFrequency: number;
    editRatio: number;
    pasteRatio: number;
    totalInsertedChars: number;
    totalDeletedChars: number;
    finalChars: number;
    totalPastedChars: number;
    pauseCount: number;
    durationMs: number;
    microPauseCount: number;
    wpm: number;
    wpmVariance: number;
    coefficientOfVariation: number;
    textAnalysis: SessionTextAnalysis;
    authenticity: SessionAuthenticity;
    flags: string[];
}
export interface SessionDerivedStats {
    wordCount: number;
    charCount: number;
    edits: number;
    keystrokes: number;
    pastes: number;
}
export interface SessionListItem {
    _id: string;
    documentId?: string;
    status: "active" | "closed";
    createdAt: number;
    closedAt?: number;
    stats: SessionDerivedStats;
    analytics?: SessionAnalytics;
}
export interface CloseSessionResponse {
    message: string;
    sessionId: string;
    documentId?: string;
    analytics: SessionAnalytics;
    closedAt: string;
    alreadyClosed: boolean;
}
//# sourceMappingURL=session.d.ts.map