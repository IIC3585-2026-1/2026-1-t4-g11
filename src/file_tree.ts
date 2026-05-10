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
  vaultHandle: FileSystemDirectoryHandle | null;
  currentFileId: FileSystemFileHandle | null;
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

export function normalizeMarkdownName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "Nueva nota.md";

  return trimmed.toLowerCase().endsWith(".md") ? trimmed : `${trimmed}.md`;
}

async function collectSiblingNames(parentHandle: FileSystemDirectoryHandle) {
  const names = new Set<string>();
  for await (const entry of parentHandle.entries()) {
    const [name] = entry as [
      string,
      FileSystemFileHandle | FileSystemDirectoryHandle,
    ];
    names.add(name);
  }

  return names;
}

export async function makeUniqueMarkdownFilename(
  parentHandle: FileSystemDirectoryHandle | null,
  baseName: string,
  ignoreName?: string,
) {
  const normalizedBase = normalizeMarkdownName(baseName);
  if (!parentHandle) return normalizedBase;

  const names = await collectSiblingNames(parentHandle);
  if (ignoreName) {
    names.delete(ignoreName);
  }

  const base = normalizedBase.slice(0, -3);
  if (!names.has(normalizedBase)) {
    return normalizedBase;
  }

  let suffix = 2;
  while (names.has(`${base} (${suffix}).md`)) {
    suffix += 1;
  }

  return `${base} (${suffix}).md`;
}

export async function makeUniqueDirectoryName(
  parentHandle: FileSystemDirectoryHandle,
  baseName: string,
  ignoreName?: string,
) {
  const trimmed = baseName.trim();
  if (!trimmed) return "Nueva carpeta";

  const names = await collectSiblingNames(parentHandle);
  if (ignoreName) {
    names.delete(ignoreName);
  }

  if (!names.has(trimmed)) {
    return trimmed;
  }

  let suffix = 2;
  while (names.has(`${trimmed} (${suffix})`)) {
    suffix += 1;
  }

  return `${trimmed} (${suffix})`;
}

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

export async function createDirectoryWithName(
  parentHandle: FileSystemDirectoryHandle | null,
  baseName: string,
) {
  if (!parentHandle) return null;

  const name = await makeUniqueDirectoryName(parentHandle, baseName);
  const dirHandle = await parentHandle.getDirectoryHandle(name, {
    create: true,
  });
  return { directoryHandle: dirHandle, name };
}

async function copyDirectoryContents(
  sourceHandle: FileSystemDirectoryHandle,
  targetHandle: FileSystemDirectoryHandle,
) {
  for await (const entry of sourceHandle.entries()) {
    const [name, handle] = entry as [
      string,
      FileSystemFileHandle | FileSystemDirectoryHandle,
    ];

    if (handle.kind === "directory") {
      const childDirectoryHandle = await targetHandle.getDirectoryHandle(name, {
        create: true,
      });
      await copyDirectoryContents(handle, childDirectoryHandle);
    } else {
      const file = await handle.getFile();
      const content = await file.text();
      const newFileHandle = await targetHandle.getFileHandle(name, {
        create: true,
      });
      const writable = await newFileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    }
  }
}

export async function moveFile(
  fromParent: FileSystemDirectoryHandle,
  fileHandle: FileSystemFileHandle,
  name: string,
  toParent: FileSystemDirectoryHandle,
) {
  const file = await fileHandle.getFile();
  const content = await file.text();
  const targetName = await makeUniqueMarkdownFilename(toParent, name);
  const newHandle = await toParent.getFileHandle(targetName, { create: true });
  const writable = await newHandle.createWritable();
  await writable.write(content);
  await writable.close();
  await fromParent.removeEntry(name);
  return { fileHandle: newHandle, name: targetName };
}

export async function moveDirectory(
  fromParent: FileSystemDirectoryHandle,
  dirHandle: FileSystemDirectoryHandle,
  name: string,
  toParent: FileSystemDirectoryHandle,
) {
  const targetName = await makeUniqueDirectoryName(toParent, name);
  const newHandle = await toParent.getDirectoryHandle(targetName, {
    create: true,
  });
  await copyDirectoryContents(dirHandle, newHandle);
  await fromParent.removeEntry(name, { recursive: true });
  return { directoryHandle: newHandle, name: targetName };
}

export async function renameMarkdownFile(
  parentHandle: FileSystemDirectoryHandle,
  fileHandle: FileSystemFileHandle,
  oldName: string,
  requestedName: string,
) {
  const normalizedName = await makeUniqueMarkdownFilename(
    parentHandle,
    requestedName,
    oldName,
  );
  if (normalizedName === oldName) {
    return { fileHandle, name: oldName };
  }

  const file = await fileHandle.getFile();
  const content = await file.text();
  const newHandle = await parentHandle.getFileHandle(normalizedName, {
    create: true,
  });
  const writable = await newHandle.createWritable();
  await writable.write(content);
  await writable.close();
  await parentHandle.removeEntry(oldName);

  return { fileHandle: newHandle, name: normalizedName };
}

export async function renameDirectory(
  parentHandle: FileSystemDirectoryHandle,
  directoryHandle: FileSystemDirectoryHandle,
  oldName: string,
  requestedName: string,
) {
  const normalizedName = await makeUniqueDirectoryName(
    parentHandle,
    requestedName,
    oldName,
  );
  if (normalizedName === oldName) {
    return { directoryHandle, name: oldName };
  }

  const newHandle = await parentHandle.getDirectoryHandle(normalizedName, {
    create: true,
  });
  await copyDirectoryContents(directoryHandle, newHandle);
  await parentHandle.removeEntry(oldName, { recursive: true });

  return { directoryHandle: newHandle, name: normalizedName };
}

export async function getTree(
  dirHandle: FileSystemDirectoryHandle,
): Promise<TreeEntry[]> {
  const items: TreeEntry[] = [];
  for await (const entry of dirHandle.entries()) {
    const [name, handle] = entry as [
      string,
      FileSystemFileHandle | FileSystemDirectoryHandle,
    ];
    if (name.startsWith(".")) continue;

    if (handle.kind === "directory") {
      const children = await getTree(handle);
      // Always include directories in the tree, even if they have no markdown children.
      items.push({
        name,
        kind: "directory",
        handle,
        parentHandle: dirHandle,
        children,
      });
    } else if (name.toLowerCase().endsWith(".md")) {
      items.push({ name, kind: "file", handle, parentHandle: dirHandle });
    }
  }

  items.sort((a, b) => {
    if (a.kind === b.kind) return a.name.localeCompare(b.name);
    return a.kind === "directory" ? -1 : 1;
  });
  return items;
}

export function setTreeItemEditingState(
  treeItem: HTMLElement | null,
  input: HTMLInputElement | null,
  isActive: boolean,
) {
  if (!input) return;

  input.readOnly = !isActive;
  treeItem?.classList.toggle("editing", isActive);
}

export async function refreshFileTree(
  state: TreeState,
  container: HTMLElement | null,
  hooks: TreeRenderHooks,
) {
  if (!state.vaultHandle || !container) return;

  container.innerHTML = "";
  renderTree(state.vaultHandle.doc(), container, state, hooks);
}

export function renderTree(
  entries: TreeEntry[],
  parent: HTMLElement,
  state: TreeState,
  hooks: TreeRenderHooks,
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

    const startEditing = () => {
      if (!entry.handle) return;
      setTreeItemEditingState(li, fileName, true);
      fileName.focus();
      fileName.select();
    };

    const openFile = async () => {
      if (!fileName.readOnly) return;
      try {
        state.currentFileId = entry.id;
        hooks.loadMarkdownFile(entry.contents, entry.name);
      } catch (error) {
        console.error("Failed to open file", error);
      }
    };

    li.draggable = true;
    li.addEventListener("dragstart", (ev) => {
      if (!entry.handle) return;
      state.dragPayload = {
        kind: "file",
        name: entry.name,
        handle: entry.handle,
        parentHandle: entry.parentHandle ?? null,
      };
      try {
        ev.dataTransfer?.setData(
          "text/plain",
          JSON.stringify({ kind: "file", name: entry.name }),
        );
      } catch {
        // ignore clipboard/drag data errors
      }
    });

    li.addEventListener("dragover", (ev) => {
      ev.preventDefault();
      const x = (ev as DragEvent).clientX;
      const y = (ev as DragEvent).clientY;
      const element = document.elementFromPoint(x, y) as HTMLElement | null;
      const nearest = element?.closest?.(".tree-item") as HTMLElement | null;

      const container = li.closest(".children") as HTMLElement | null;
      if (!container) {
        li.classList.remove("drop-target");
        return;
      }

      const parentFolderLi = container.closest(
        ".tree-item",
      ) as HTMLElement | null;
      if (!parentFolderLi) return;

      const nearestChildren = element?.closest(
        ".children",
      ) as HTMLElement | null;

      if (nearest === parentFolderLi) {
        parentFolderLi.classList.add("drop-target");
        return;
      }

      if (nearestChildren === container) {
        parentFolderLi.classList.add("drop-target");
        return;
      }

      parentFolderLi.classList.remove("drop-target");
    });

    li.addEventListener("dragleave", (ev) => {
      const x = (ev as DragEvent).clientX;
      const y = (ev as DragEvent).clientY;
      const element = document.elementFromPoint(x, y) as HTMLElement | null;
      const nearest = element?.closest?.(".tree-item") as HTMLElement | null;

      const container = li.closest(".children") as HTMLElement | null;
      if (!container) return;
      const parentFolderLi = container.closest(
        ".tree-item",
      ) as HTMLElement | null;
      if (!parentFolderLi) return;

      const nearestChildren = element?.closest(
        ".children",
      ) as HTMLElement | null;

      if (nearest === parentFolderLi) return;
      if (nearestChildren === container) return;
      parentFolderLi.classList.remove("drop-target");
    });

    li.addEventListener("drop", async (ev) => {
      ev.preventDefault();
      li.classList.remove("drop-target");
      if (!state.dragPayload) return;

      const container = li.closest(".children") as HTMLElement | null;
      if (!container) return;

      const parentFolderLi = container.closest(
        ".tree-item",
      ) as HTMLElement | null;
      if (!parentFolderLi) return;

      const targetParent = entry.parentHandle;
      if (!targetParent) return;

      const fromParent = state.dragPayload.parentHandle;
      const draggedHandle = state.dragPayload.handle;

      try {
        if (!fromParent) return;
        if (state.dragPayload.kind === "file") {
          await moveFile(
            fromParent,
            draggedHandle as FileSystemFileHandle,
            state.dragPayload.name,
            targetParent,
          );
        } else {
          if (state.dragPayload.handle === entry.handle) return;
          await moveDirectory(
            fromParent,
            draggedHandle as FileSystemDirectoryHandle,
            state.dragPayload.name,
            targetParent,
          );
        }
        await refreshFileTree(state, parent, hooks);
      } catch (error) {
        console.error("Failed to move entry", error);
      } finally {
        state.dragPayload = null;
        parentFolderLi.classList.remove("drop-target");
      }
    });

    const commitEditing = async () => {
      if (!entry.handle || !entry.parentHandle) return;
      if (fileName.readOnly) return;

      const requestedName = fileName.value;
      const normalizedRequestedName = normalizeMarkdownName(requestedName);
      if (!normalizedRequestedName || normalizedRequestedName === entry.name) {
        fileName.value = entry.name;
        setTreeItemEditingState(li, fileName, false);
        return;
      }

      try {
        const previousHandle = entry.handle;
        const result = await renameMarkdownFile(
          entry.parentHandle,
          previousHandle as FileSystemFileHandle,
          entry.name,
          requestedName,
        );
        entry.handle = result.fileHandle;
        entry.name = result.name;
        fileName.value = result.name;

        if (
          state.currentFileHandle &&
          state.currentFileHandle === previousHandle
        ) {
          state.currentFileHandle = result.fileHandle;
          state.currentFileParentHandle = entry.parentHandle;
          state.currentFileName = result.name;
          if (state.noteTitleInput) state.noteTitleInput.value = result.name;
        }

        await refreshFileTree(state, parent, hooks);
      } catch (error) {
        console.error("Failed to rename file", error);
        fileName.value = entry.name;
      } finally {
        setTreeItemEditingState(li, fileName, false);
      }
    };

    li.addEventListener("click", () => {
      void openFile();
    });

    li.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        void openFile();
      }
    });

    fileName.addEventListener("click", (event) => {
      event.stopPropagation();
      void openFile();
    });

    fileName.addEventListener("dblclick", (event) => {
      event.preventDefault();
      event.stopPropagation();
      startEditing();
    });

    fileName.addEventListener("blur", () => {
      void commitEditing();
    });

    fileName.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        fileName.blur();
      }

      if (event.key === "Escape") {
        event.preventDefault();
        fileName.value = entry.name;
        setTreeItemEditingState(li, fileName, false);
      }
    });

    li.appendChild(header);

    ul.appendChild(li);
  });

  parent.appendChild(ul);
}
