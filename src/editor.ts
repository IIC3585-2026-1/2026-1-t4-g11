import { marked } from "marked";
import { mangle } from "marked-mangle";
import Katex from "katex";
import extendedLatex from "marked-extended-latex";
import {
  createNewFileWithContent,
  makeUniqueMarkdownFilename,
  renameMarkdownFile,
} from "./file_tree";
import type { DocHandle } from "@automerge/automerge-repo";
import type { Vault } from "./vault";
import { renderPage } from "./main";

marked.use({ headerIds: false });
marked.use(mangle());
const previewRenderer = new marked.Renderer();

export type EditorState = {
  vaultHandle: DocHandle<Vault> | null;
  currentFileId: string | null;
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

  //noteTitleInput.readOnly = !isActive;
  noteTitleInput.classList.toggle("active", isActive);
  noteTitleInput.classList.toggle("inactive", !isActive);
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

  if (refs.noteTitleInput && note.name) {
    refs.noteTitleInput.value = note.name;
    refs.noteTitleInput.placeholder = note.name;
  }

  setNoteTitleState(refs.noteTitleInput, false);

  if (refs.editorContent) {
    refs.editorContent.value = note.contents;
    updatePreview(refs.editorContent, refs.previewContent);
  }
}

export async function createMarkdownFile(state: EditorState, refs: EditorRefs) {
  try {
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

    refs.noteTitleInput?.focus();
    refs.noteTitleInput?.select();
    renderPage();
  } catch (error) {
    console.error("Failed to create file", error);
  }
}
