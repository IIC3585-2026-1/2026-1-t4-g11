import './styles/main.css';
import {
    createMarkdownFile,
    loadMarkdownFile,
    setNoteTitleState,
    renameCurrentFile,
    saveCurrentFile,
    updatePreview,
    type EditorRefs,
    type EditorState,
} from './editor';
import {
    refreshFileTree,
    setTreeItemEditingState,
    createDirectoryWithName,
    getTree,
    hasExpandedFolders,
    setAllFoldersExpanded,
    type TreeRenderHooks,
    type TreeState,
} from './file_tree';

const editorContent = document.getElementById('editor-input') as HTMLTextAreaElement | null;
if (editorContent) editorContent.spellcheck = true;

const previewContent = document.getElementById('preview-content') as HTMLElement | null;
const noteTitleInput = document.getElementById('note-title') as HTMLInputElement | null;

const filebarFiles = document.getElementById('filebar-files') as HTMLElement | null;
const app = document.getElementById('app') as HTMLElement | null;
const sidebarToggle = document.querySelector('#sidebar-toggle') as HTMLInputElement | null;
const toggleBarsButton = document.querySelector('#toggle-sidebar') as HTMLElement | null;
const collapseFilesButton = document.querySelector('#collapse-files') as HTMLButtonElement | null;
const collapseFilesIcon = collapseFilesButton?.querySelector('.material-symbols-outlined') as HTMLElement | null;
const optionsButton = document.querySelector('#options') as HTMLButtonElement | null;
const optionsMenu = document.querySelector('#options-menu') as HTMLElement | null;
const deleteNoteButton = document.querySelector('#delete-note') as HTMLButtonElement | null;

const refs: EditorRefs = {
    editorContent,
    previewContent,
    noteTitleInput,
};

const appState: EditorState & TreeState = {
    folderHandle: null,
    currentFileHandle: null,
    currentFileParentHandle: null,
    currentFileName: null,
    saveTimer: undefined,
    dragPayload: null,
    noteTitleInput,
};

const treeHooks: TreeRenderHooks = {
    setTreeItemEditingState,
    loadMarkdownFile: (md, filename) => loadMarkdownFile(appState, refs, md, filename),
};

let recentNotesLoading = false;

async function syncFileTree() {
    await refreshFileTree(appState, filebarFiles, treeHooks);
    updateCollapseFilesButtonIcon();
    updateEditorView();
}

async function refreshTreeOnly() {
    await refreshFileTree(appState, filebarFiles, treeHooks);
    updateCollapseFilesButtonIcon();
}

function updateCollapseFilesButtonIcon() {
    if (!collapseFilesIcon) return;

    collapseFilesIcon.textContent = hasExpandedFolders(filebarFiles) ? 'collapse_all' : 'expand_all';
}

function updateSidebarToggleIcon() {
    const icon = document.getElementById('toggle-sidebar-icon');
    if (!icon) return;

    const isMobile = isMobileSidebarMode();
    const isOpen = isMobile ? !!sidebarToggle?.checked : document.getElementById('sidebar')?.style.display !== 'none';
    icon.textContent = isOpen ? 'left_panel_close' : 'left_panel_open';
}

function setOptionsMenuOpen(isOpen: boolean) {
    if (!optionsMenu || !optionsButton) return;

    optionsMenu.hidden = !isOpen;
    optionsButton.setAttribute('aria-expanded', String(isOpen));
}

function toggleOptionsMenu() {
    if (!optionsMenu) return;

    setOptionsMenuOpen(optionsMenu.hasAttribute('hidden'));
}

function setEditorPaneVisible(isEditorVisible: boolean) {
    const editorPane = document.getElementById('editor-pane') as HTMLElement | null;
    const previewPane = document.getElementById('preview-pane') as HTMLElement | null;
    if (!editorPane || !previewPane) return;

    editorPane.style.display = isEditorVisible ? 'flex' : 'none';
    previewPane.style.display = isEditorVisible ? 'none' : 'block';
}

function isMobileSidebarMode() {
    return window.matchMedia('(max-aspect-ratio: 1/2)').matches;
}

function syncSidebarVisibilityForViewport() {
    const sidebar = document.getElementById('sidebar') as HTMLElement | null;
    if (!sidebar) return;

    // In mobile mode, visibility is controlled by the checkbox + CSS transform.
    if (isMobileSidebarMode()) {
        sidebar.style.removeProperty('display');
    }

    updateSidebarToggleIcon();
}

function updateSidebarState() {
    if (!app) return;

    const sidebar = document.getElementById('sidebar') as HTMLElement | null;
    if (!sidebar) return;

    if (!toggleBarsButton) return;

    if (isMobileSidebarMode()) {
        if (sidebarToggle) {
            sidebarToggle.checked = !sidebarToggle.checked;
        }
        updateSidebarToggleIcon();
        return;
    }

    const isHidden = sidebar.style.display === 'none';

    if (isHidden) {
        sidebar.style.display = 'flex';
    } else {
        sidebar.style.display = 'none';
    }

    updateSidebarToggleIcon();
}

function bindCreateVaultButton() {
    const btnEl = document.getElementById('create-vault') as HTMLButtonElement | null;
    if (!btnEl) return;

    btnEl.onclick = async () => {
        try {
            appState.folderHandle = await window.showDirectoryPicker();
            if (!appState.folderHandle) return;
            await syncFileTree();
        } catch (error) {
            console.error('Failed to create vault', error);
        }
    };
}

function setVaultViewState(hasVault: boolean) {
    const vaultEmpty = document.getElementById('vault-empty') as HTMLElement | null;
    const vaultSelected = document.getElementById('vault-selected') as HTMLElement | null;
    const editorPane = document.getElementById('editor-pane') as HTMLElement | null;
    const previewPane = document.getElementById('preview-pane') as HTMLElement | null;

    if (vaultEmpty) vaultEmpty.style.display = hasVault ? 'none' : 'flex';
    if (vaultSelected) vaultSelected.style.display = hasVault ? 'flex' : 'none';
    if (!hasVault) {
        if (editorPane) editorPane.style.display = 'none';
        if (previewPane) previewPane.style.display = 'none';
    }
}

function updateEditorView() {
    if (!appState.folderHandle) {
        setVaultViewState(false);
    } else {
        setVaultViewState(true);

        const vaultSelected = document.getElementById('vault-selected') as HTMLElement | null;
        if (vaultSelected) {
            vaultSelected.style.display = appState.currentFileHandle ? 'none' : 'flex';
        }
        if (appState.folderHandle) {
            const vaultName = (appState.folderHandle as any).name || 'Vault';
            const vaultNameElements = document.querySelectorAll<HTMLElement>('.vault-name');
            vaultNameElements.forEach((element) => {
                element.textContent = vaultName;
            });
        }

        void populateRecentNotes();
    }
}

async function populateRecentNotes() {
    const recentEl = document.getElementById('recent-notes') as HTMLUListElement | null;
    if (!recentEl || !appState.folderHandle || recentNotesLoading || recentEl.children.length) return;

    recentNotesLoading = true;

    try {
        const tree = await getTree(appState.folderHandle);
        const files: Array<{ name: string; handle: FileSystemFileHandle }> = [];
        function walk(entries: typeof tree) {
            for (const e of entries) {
                if (e.kind === 'file' && e.handle) files.push({ name: e.name, handle: e.handle as FileSystemFileHandle });
                if (e.children && e.children.length) walk(e.children);
            }
        }
        walk(tree);

        // load lastModified for each file
        const withTimes = await Promise.all(files.map(async (f) => {
            try {
                const file = await f.handle.getFile();
                return { ...f, lastModified: file.lastModified };
            } catch {
                return { ...f, lastModified: 0 } as any;
            }
        }));

        withTimes.sort((a, b) => (b.lastModified || 0) - (a.lastModified || 0));
        const top = withTimes.slice(0, 5);

        for (const t of top) {
            const li = document.createElement('li');
            li.className = 'recent-note-item';
            li.style.padding = '6px 8px';
            li.style.cursor = 'pointer';
            const date = t.lastModified ? new Date(t.lastModified).toLocaleString() : '';
            li.textContent = `${t.name} ${date ? '— ' + date : ''}`;
            li.addEventListener('click', async () => {
                try {
                    const file = await t.handle.getFile();
                    const text = await file.text();
                    treeHooks.loadMarkdownFile(text, t.name);
                    const preview = document.getElementById('preview-pane') as HTMLElement | null;
                    const editorP = document.getElementById('editor-pane') as HTMLElement | null;
                    if (preview) preview.style.display = 'none';
                    if (editorP) editorP.style.display = 'flex';
                } catch (error) {
                    console.error('Failed to open recent note', error);
                }
            });
            recentEl.appendChild(li);
        }
    } finally {
        recentNotesLoading = false;
    }
}

const toggleViewButton = document.querySelector('#toggle-view') as HTMLButtonElement | null;

if (toggleViewButton) {
    toggleViewButton.addEventListener('click', () => {
        if (!appState.currentFileHandle) return;

        const editorPane = document.getElementById('editor-pane') as HTMLElement | null;
        const previewPane = document.getElementById('preview-pane') as HTMLElement | null;
        if (!editorPane || !previewPane) return;

        const isEditorVisible = editorPane.style.display !== 'none';
        setEditorPaneVisible(!isEditorVisible);
    });
}

if (toggleBarsButton) {
    toggleBarsButton.addEventListener('click', () => {
        updateSidebarState();
    });
}

if (optionsButton) {
    optionsButton.setAttribute('aria-haspopup', 'menu');
    optionsButton.setAttribute('aria-expanded', 'false');
    optionsButton.addEventListener('click', (event) => {
        event.stopPropagation();
        toggleOptionsMenu();
    });
}

if (deleteNoteButton) {
    deleteNoteButton.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        setOptionsMenuOpen(false);

        if (!appState.currentFileHandle || !appState.currentFileParentHandle || !appState.currentFileName) return;

        try {
            await appState.currentFileParentHandle.removeEntry(appState.currentFileName);

            // clear current file state
            appState.currentFileHandle = null;
            appState.currentFileParentHandle = null;
            appState.currentFileName = null;

            // clear editor UI
            if (refs.editorContent) {
                refs.editorContent.value = '';
                updatePreview(refs.editorContent, refs.previewContent);
            }
            if (refs.noteTitleInput) {
                refs.noteTitleInput.value = '';
                setNoteTitleState(refs.noteTitleInput, false);
            }

            await refreshTreeOnly();
            updateEditorView();
        } catch (error) {
            console.error('Failed to delete note', error);
        }
    });
}

document.addEventListener('click', (event) => {
    if (!optionsMenu || !optionsButton) return;
    const target = event.target as Node | null;
    if (target && (optionsMenu.contains(target) || optionsButton.contains(target))) return;
    setOptionsMenuOpen(false);
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        setOptionsMenuOpen(false);
    }
});

if (sidebarToggle) {
    sidebarToggle.addEventListener('change', () => {
        updateSidebarToggleIcon();
    });
}

if (collapseFilesButton) {
    collapseFilesButton.addEventListener('click', () => {
        const shouldCollapse = collapseFilesIcon?.textContent === 'collapse_all';
        setAllFoldersExpanded(filebarFiles, !shouldCollapse);
        updateCollapseFilesButtonIcon();
    });
}

if (filebarFiles) {
    filebarFiles.addEventListener('click', () => {
        window.requestAnimationFrame(updateCollapseFilesButtonIcon);
    });

    filebarFiles.addEventListener('keydown', () => {
        window.requestAnimationFrame(updateCollapseFilesButtonIcon);
    });
}

syncSidebarVisibilityForViewport();
window.addEventListener('resize', syncSidebarVisibilityForViewport);

bindCreateVaultButton();

async function createNewNote() {
    await createMarkdownFile(appState, refs, refreshTreeOnly);
}

function getTodayTitle() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear());
    return `${day}-${month}-${year}`;
}

document.querySelector('#get-vault')!.addEventListener('click', async () => {
    try {
        appState.folderHandle = await window.showDirectoryPicker();
        await syncFileTree();
        updateEditorView();
    } catch (error) {
        console.error(error);
    }
});

document.querySelector('#new-file')?.addEventListener('click', () => {
    void createNewNote();
});

document.querySelector('#new-file-today')?.addEventListener('click', () => {
    void (async () => {
        await createNewNote();
        if (!appState.currentFileHandle || !noteTitleInput) return;

        noteTitleInput.value = getTodayTitle();
        await renameCurrentFile(appState, refs, noteTitleInput.value, syncFileTree);
    })();
});

document.querySelector('#new-folder')?.addEventListener('click', async () => {
    try {
        if (!appState.folderHandle) {
            appState.folderHandle = await window.showDirectoryPicker();
        }
        if (!appState.folderHandle) return;

        // create a new folder with a unique name and refresh the tree
        const result = await createDirectoryWithName(appState.folderHandle, 'Nueva carpeta');
        if (!result) return;
        const createdName = result.name;
        await refreshFileTree(appState, filebarFiles, treeHooks);

        // find the newly created folder input and activate editing
        if (!filebarFiles) return;
        const inputs = Array.from(filebarFiles.querySelectorAll<HTMLInputElement>('input.file-name.tree-name-input'));
        for (const input of inputs) {
            if (input.value !== createdName) continue;
            const treeItem = input.closest('.tree-item') as HTMLElement | null;
            // only consider directory entries (they have aria-expanded)
            if (!treeItem || !treeItem.hasAttribute('aria-expanded')) continue;
            setTreeItemEditingState(treeItem, input, true);
            input.focus();
            input.select();
            break;
        }
    } catch (error) {
        console.error('Failed to create folder', error);
    }
});

document.addEventListener('dragend', () => {
    appState.dragPayload = null;
    document.querySelectorAll('.tree-item.drop-target').forEach((element) => element.classList.remove('drop-target'));
});

document.addEventListener('dragover', (event) => {
    event.preventDefault();
    const x = (event as DragEvent).clientX;
    const y = (event as DragEvent).clientY;
    const element = document.elementFromPoint(x, y) as HTMLElement | null;

    document.querySelectorAll('.tree-item.drop-target').forEach((treeItem) => treeItem.classList.remove('drop-target'));
    if (!element) return;

    const nearest = element.closest('.tree-item') as HTMLElement | null;
    if (!nearest) return;

    const hasChildren = !!nearest.querySelector('.children');
    if (!hasChildren) {
        const container = nearest.closest('.children') as HTMLElement | null;
        if (!container) return;

        const parentFolderLi = container.closest('.tree-item') as HTMLElement | null;
        if (parentFolderLi) parentFolderLi.classList.add('drop-target');
        return;
    }

    nearest.classList.add('drop-target');
});

if (noteTitleInput) {
    noteTitleInput.addEventListener('blur', () => {
        if (!noteTitleInput.readOnly) {
            void renameCurrentFile(appState, refs, noteTitleInput.value, syncFileTree);
        }
    });

    noteTitleInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            noteTitleInput.blur();
        }

        if (event.key === 'Escape' && appState.currentFileName) {
            event.preventDefault();
            noteTitleInput.value = appState.currentFileName;
            noteTitleInput.blur();
        }
    });
}

if (editorContent) {
    editorContent.addEventListener('input', () => {
        updatePreview(editorContent, previewContent);

        if (appState.saveTimer) window.clearTimeout(appState.saveTimer);
        appState.saveTimer = window.setTimeout(() => {
            void saveCurrentFile(appState, editorContent);
        }, 500);
    });
}

updatePreview(editorContent, previewContent);
updateCollapseFilesButtonIcon();
updateSidebarToggleIcon();

// initialize editor view based on whether a vault is selected
updateEditorView();