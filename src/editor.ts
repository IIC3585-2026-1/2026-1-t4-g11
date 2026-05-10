import { marked } from "marked";
import { mangle } from "marked-mangle";
import Katex from "katex";
import extendedLatex from "marked-extended-latex";
import {
  createNewFileWithContent,
  makeUniqueMarkdownFilename,
  renameMarkdownFile,
} from "./file_tree";

marked.use({ headerIds: false });
marked.use(mangle());
const previewRenderer = new marked.Renderer();

export type EditorState = {
  folderHandle: FileSystemDirectoryHandle | null;
  currentFileHandle: FileSystemFileHandle | null;
  currentFileParentHandle: FileSystemDirectoryHandle | null;
  currentFileName: string | null;
  saveTimer: number | undefined;
};

export type EditorRefs = {
  editorContent: HTMLTextAreaElement | null;
  previewContent: HTMLElement | null;
  noteTitleInput: HTMLInputElement | null;
};

export function setNoteTitleState(
  noteTitleInput: HTMLInputElement | null,
  isActive: boolean,
) {
  if (!noteTitleInput) return;

  noteTitleInput.readOnly = !isActive;
  noteTitleInput.classList.toggle("active", isActive);
  noteTitleInput.classList.toggle("inactive", !isActive);
}

export async function saveCurrentFile(
  state: EditorState,
  editorContent: HTMLTextAreaElement | null,
) {
  if (!state.currentFileHandle || !editorContent) return;
  try {
    const writable = await state.currentFileHandle.createWritable();
    await writable.write(editorContent.value);
    await writable.close();
  } catch (error) {
    console.error("Failed to save file", error);
  }
}

export function updatePreview(
  editorContent: HTMLTextAreaElement | null,
  previewContent: HTMLElement | null,
) {
  if (!editorContent || !previewContent) return;

  const md = editorContent.value;
  const options = {
    render: (formula: string, displayMode: boolean) =>
      Katex.renderToString(formula, { displayMode, output: "mathml" }),
  };

  try {
    marked.use(extendedLatex(options));
    marked.use({ renderer: previewRenderer });
    const html = marked.parse(md, { renderer: previewRenderer });
    previewContent.innerHTML = html;
  } catch (error) {
    console.error("Marked parse error", error);
    previewContent.textContent = md;
  }
}

export function loadMarkdownFile(state: EditorState, refs: EditorRefs) {
  const vaultSelected = document.getElementById(
    "vault-selected",
  ) as HTMLElement | null;
  if (vaultSelected) vaultSelected.style.display = "none";

  const note = state.vaultHandle
    .doc()
    .notes.find((n) => n.id == state.currentFileId);

  if (refs.noteTitleInput && note.name) refs.noteTitleInput.value = note.name;
  setNoteTitleState(refs.noteTitleInput, false);

  if (refs.editorContent) {
    refs.editorContent.value = note.contents;
    updatePreview(refs.editorContent, refs.previewContent);
  }
}

export async function renameCurrentFile(
  state: EditorState,
  refs: EditorRefs,
  requestedName: string,
  refreshFileTree: () => Promise<void>,
) {
  if (
    !state.folderHandle ||
    !state.currentFileHandle ||
    !state.currentFileParentHandle ||
    !state.currentFileName
  )
    return;

  const targetName = requestedName.trim();
  if (!targetName || targetName === state.currentFileName) return;

  if (state.saveTimer) window.clearTimeout(state.saveTimer);
  await saveCurrentFile(state, refs.editorContent);

  const uniqueName = await makeUniqueMarkdownFilename(
    state.currentFileParentHandle,
    targetName,
    state.currentFileName,
  );
  const result = await renameMarkdownFile(
    state.currentFileParentHandle,
    state.currentFileHandle,
    state.currentFileName,
    uniqueName,
  );

  state.currentFileHandle = result.fileHandle;
  state.currentFileName = result.name;

  if (refs.noteTitleInput) {
    refs.noteTitleInput.value = result.name;
  }

  await refreshFileTree();
}

export async function createMarkdownFile(
  state: EditorState,
  refs: EditorRefs,
  refreshFileTree: () => Promise<void>,
) {
  try {
    if (state.saveTimer) window.clearTimeout(state.saveTimer);
    await saveCurrentFile(state, refs.editorContent);

    if (!state.vaultHandle) return;

    const newNote = {
      id: crypto.randomUUID(),
      name: "New Note",
      contents: "Hello, world!",
    };
    state.currentFileId = newNote.id;
    state.vaultHandle.change((vault) => {
      vault.notes.push(newNote);
    });
    loadMarkdownFile(state, refs, newNote.contents, newNote.name);
    setNoteTitleState(refs.noteTitleInput, true);

    refs.noteTitleInput?.focus();
    refs.noteTitleInput?.select();
    await refreshFileTree();
  } catch (error) {
    console.error("Failed to create file", error);
  }
}
