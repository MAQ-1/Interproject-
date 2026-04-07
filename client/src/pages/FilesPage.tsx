import { useMemo, useState } from "react";
import { FileText, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import { useDocument } from "../hooks/useDocument";

const FilesPage = () => {
  const navigate = useNavigate();
  const {
    documents,
    isLoading,
    error,
    createError,
    renameErrors,
    createDocument,
    renameDocument,
    deleteDocument,
    clearCreateError,
    clearRenameError,
  } = useDocument();

  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [pageError, setPageError] = useState<string | null>(null);

  const isEmpty = useMemo(
    () => !isLoading && documents.length === 0,
    [documents.length, isLoading],
  );

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmed = newName.trim();
    if (!trimmed) {
      return;
    }

    const created = await createDocument(trimmed);
    if (!created) {
      return;
    }

    setNewName("");
    navigate(`/fileopen?fileId=${created._id}&fileName=${encodeURIComponent(trimmed)}`);
  };

  const handleOpen = (documentId: string, fileName: string) => {
    navigate(`/fileopen?fileId=${documentId}&fileName=${encodeURIComponent(fileName)}`);
  };

  const handleRename = async (documentId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      return;
    // Check if there are no documents after loading is complete.

    const renamed = await renameDocument(documentId, trimmed);
    if (!renamed) {
      return;
    }
    // Handle document creation and navigate to the new document.
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      if (editingId === documentId) {
        setEditingId(null);
        setEditingName("");
      }
    } catch {
      setPageError("Failed to delete file.");
    }
  };

  return (
    <div className="files-page min-h-screen">
      <div className="w-full h-full min-h-[calc(100vh-100px)] py-12 px-6 flex flex-col items-center font-sans ">
      <div className="w-full max-w-5xl flex flex-col gap-10">
        
    // Rename the document and reset editing state on success.
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-orange-800/40 text-orange-400 text-xs font-semibold tracking-widest uppercase mb-4"
              style={{ background: "rgba(194,65,12,0.1)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Workspace
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white dark:text-white">
              Your <span className="italic text-orange-400">Files</span>
            </h1>
            <p className="text-white/50 dark:text-white/50 text-base max-w-lg leading-relaxed">
              Manage your technical documentation and capture your creative flow in one secure, beautiful place.
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 rounded-2xl border border-white/[0.07] dark:border-white/[0.07] relative overflow-hidden shadow-2xl" 
             style={{ 
               background: "rgba(20,20,20,0.6)", 
               backdropFilter: "blur(12px)" 
             }}>
           <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-orange-600/10 blur-[90px] rounded-full pointer-events-none" />
           
           <form className="relative z-10 flex flex-col sm:flex-row gap-4 w-full" onSubmit={handleCreate}>
             <input
               id="new-file-input"
               value={newName}
               onChange={(event) => {
                 setNewName(event.target.value);
                 if (createError) clearCreateError();
               }}
               className="flex-1 bg-white/[0.04] dark:bg-white/[0.04] border border-white/[0.08] dark:border-white/[0.08] rounded-xl px-5 py-3.5 text-white dark:text-white placeholder-white/30 dark:placeholder-white/30 focus:outline-none focus:border-orange-500/50 focus:bg-white/[0.07] dark:focus:bg-white/[0.07] transition-all text-sm shadow-inner"
               placeholder="Name your new document..."
               aria-label="New file name"
             />
             <button type="submit"
               className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm text-white dark:text-white transition-all hover:scale-105"
               style={{ background: "linear-gradient(135deg,#c2410c,#ea580c)", boxShadow: "0 4px 24px rgba(194,65,12,0.3)" }}>
               <FolderPlus size={18} />
               Create File
             </button>
           </form>
           {createError && <p className="mt-4 text-sm text-red-400 font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {createError}
           </p>}
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium" style={{ background: "rgba(239,68,68,0.06)" }}>
            {error}
          </div>
        )}

        {isEmpty && (
           <div className="flex flex-col items-center justify-center py-24 px-6 text-center rounded-2xl border border-white/[0.05] relative overflow-hidden" 
                style={{ background: "rgba(0,0,0,0.4)" }}>
             <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 100%, rgba(194,65,12,0.05), transparent 50%)" }} />
             <div className="relative z-10 flex flex-col items-center">
               <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl" 
                    style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)" }}>
                 <FileText size={32} className="text-orange-400" />
               </div>
               <h2 className="text-3xl font-extrabold text-white dark:text-white mb-4">No files yet</h2>
               <p className="text-white/40 dark:text-white/40 mb-10 max-w-md text-sm leading-relaxed">
                 Start your first document to begin capturing your writing flow. Your ideas deserve a cinematic, focused environment.
               </p>
               <button
                  type="button"
                  onClick={() => document.getElementById("new-file-input")?.focus()}
                  className="px-8 py-3.5 rounded-xl font-bold text-sm text-black dark:text-black transition-all hover:scale-105 hover:shadow-lg"
                  style={{ background: "#ffffff", boxShadow: "0 4px 20px rgba(255,255,255,0.15)" }}>
                  Start Writing Today
               </button>
             </div>
           </div>
        )}

        {!isLoading && documents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => {
              const isEditing = editingId === document._id;
  
              return (
                <div key={document._id} className="group flex flex-col p-6 rounded-2xl border border-white/[0.07] dark:border-white/[0.07] transition-all duration-300 hover:border-orange-500/30 hover:-translate-y-1 shadow-lg" 
                     style={{ background: "rgba(20,20,20,0.5)", backdropFilter: "blur(8px)" }}>
                  
                  <div className="flex items-start justify-between mb-5">
                     <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-inner" 
                          style={{ background: "rgba(82,39,255,0.12)", border: "1px solid rgba(82,39,255,0.2)" }}>
                       <FileText size={20} style={{ color: "#a78bfa" }} />
                     </div>
                     <div className="flex items-center gap-1.5 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                       {isEditing ? (
                         <>
                           <button onClick={() => void handleRename(document._id)} className="p-2 rounded-lg text-green-400 bg-green-400/10 hover:bg-green-400/20 transition-colors" title="Save">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                           </button>
                           <button onClick={() => { setEditingId(null); setEditingName(""); }} className="p-2 rounded-lg text-white/50 bg-white/5 hover:bg-white/10 hover:text-white transition-colors" title="Cancel">
                             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                           </button>
                         </>
                       ) : (
                         <>
                           <button onClick={() => { setEditingId(document._id); setEditingName(document.name); }} className="p-2 rounded-lg text-white/40 bg-white/5 hover:bg-white/10 hover:text-white transition-colors shadow-sm" title="Rename">
                             <Pencil size={14} />
                           </button>
                           <button onClick={() => void handleDelete(document._id)} className="p-2 rounded-lg text-white/40 bg-white/5 hover:bg-red-500/20 hover:text-red-400 transition-colors shadow-sm" title="Delete">
                             <Trash2 size={14} />
                           </button>
                         </>
                       )}
                     </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    {isEditing ? (
                      <div className="w-full">
                        <input
                          id={`rename-file-${document._id}`}
                          className="w-full bg-black/40 dark:bg-black/40 border border-orange-500/40 dark:border-orange-500/40 rounded-lg px-3 py-2 text-white dark:text-white placeholder-white/30 dark:placeholder-white/30 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/50 text-base font-semibold transition-all"
                          value={editingName}
                          placeholder="Rename file"
                          onChange={(event) => {
                            setEditingName(event.target.value);
                            clearRenameError(document._id);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter") {
                              event.preventDefault();
                              void handleRename(document._id);
                            }
                          }}
                          autoFocus
                        />
                        {renameErrors[document._id] && (
                          <p className="mt-2 text-xs text-red-400 font-medium">{renameErrors[document._id]}</p>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="text-left w-full text-xl font-bold text-white/95 dark:text-white/95 hover:text-orange-400 transition-colors truncate"
                        onClick={() => handleOpen(document._id, document.name)}
                      >
                        {document.name}
                      </button>
                    )}
                  </div>
                  
                  {!isEditing && (
                    <div className="mt-5 pt-4 border-t border-white/[0.06] flex justify-between items-center text-xs">
                      <span className="text-white/30 dark:text-white/30 uppercase tracking-wider font-semibold">Ready</span>
                      <button onClick={() => handleOpen(document._id, document.name)} className="text-orange-400/90 hover:text-orange-400 font-bold uppercase tracking-widest flex items-center gap-1.5 group/btn transition-colors">
                        Open <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {pageError && (
          <Toast
            message={pageError}
            type="error"
            onClose={() => setPageError(null)}
          />
        )}
      </div>
      </div>
    </div>
  );
};
}

export default FilesPage;
