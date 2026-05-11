import type { DocHandle } from "@automerge/automerge-repo";
import type { Vault } from "./vault";
import { renderPage } from "./main";

export type TreeEntry = {
  name: string;
  kind: "file" | "directory";
  handle?: FileSystemFileHandle | FileSystemDirectoryHandle;
  parentHandle?: FileSystemDirectoryHandle | null;
  children?: TreeEntry[];
};

export type TreeDragPayload = {
  kind: "file" | "directory";
  name: string;
  handle: FileSystemFileHandle | FileSystemDirectoryHandle;
  parentHandle: FileSystemDirectoryHandle | null;
} | null;

export type TreeState = {
  vaultHandle: DocHandle<Vault> | null;
  currentFileId: string | null;
  dragPayload: TreeDragPayload;
  noteTitleInput: HTMLInputElement | null;
};

export type TreeRenderHooks = {
  setTreeItemEditingState(
    treeItem: HTMLElement | null,
    input: HTMLInputElement | null,
    isActive: boolean,
  ): void;
  loadMarkdownFile(md: string, filename?: string): void;
};

export async function createNewFileWithContent(
  folderHandle: FileSystemDirectoryHandle | null,
  name: string,
  content: string,
) {
  if (!folderHandle) return null;

  const fileHandle = await folderHandle.getFileHandle(name, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
  return fileHandle;
}

export async function renderNotesList(
  state: TreeState,
  container: HTMLElement | null,
) {
  if (!state.vaultHandle || !container) return;

  container.innerHTML = "";
  renderTree(state.vaultHandle.doc(), container, state);
}

export function hasExpandedFolders(container: HTMLElement | null) {
  if (!container) return false;

  const folders = Array.from(
    container.querySelectorAll<HTMLElement>(".tree-item[aria-expanded]"),
  );
  return folders.some(
    (folder) => folder.getAttribute("aria-expanded") === "true",
  );
}

export function renderTree(
  entries: Vault,
  parent: HTMLElement,
  state: TreeState,
) {
  const ul = document.createElement("ul");
  ul.className = "tree-list";

  entries.notes.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "tree-item";
    li.tabIndex = 0;
    li.setAttribute("role", "button");
    li.setAttribute("aria-label", entry.name);

    const caret = document.createElement("span");
    caret.className = "caret material-symbols-outlined";
    caret.textContent = "keyboard_arrow_right";

    const header = document.createElement("div");
    header.className = "tree-header file-header";

    const fileNameWrapper = document.createElement("div");
    fileNameWrapper.className = "file-name-wrapper";

    const fileName = document.createElement("input");
    fileName.className = "file-name tree-name-input";
    fileName.value = entry.name;
    fileName.type = "text";
    fileName.readOnly = true;
    fileName.tabIndex = -1;

    caret.style.visibility = "hidden";
    caret.classList.add("tree-icon-hidden");
    header.appendChild(caret);
    fileNameWrapper.appendChild(fileName);
    header.appendChild(fileNameWrapper);

    const openFile = () => {
      if (!fileName.readOnly) return;

      state.currentFileId = entry.id;
      renderPage();
    };

    li.addEventListener("click", () => {
      openFile();
    });

    li.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openFile();
      }
    });

    fileName.addEventListener("click", (event) => {
      event.stopPropagation();
      openFile();
    });

    li.appendChild(header);

    ul.appendChild(li);
  });

  parent.appendChild(ul);
}
