export interface Keystroke {
    action: "down" | "up" | "paste" | "edit";
    timestamp: number;
    rawTimestamp?: number | null;
    duration?: number | null;
    rawDuration?: number | null;
    pasteLength?: number | null;
    pasteSelectionStart?: number | null;
    pasteSelectionEnd?: number | null;
    editedLater?: boolean | null;
    editStart?: number | null;
    editEnd?: number | null;
    insertedLength?: number | null;
    removedLength?: number | null;
}
//# sourceMappingURL=keystroke.d.ts.map