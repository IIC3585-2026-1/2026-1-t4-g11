import './styles/main.css';
import {
    createMarkdownFile,
    loadMarkdownFile,
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
    type TreeRenderHooks,
    type TreeState,
} from './file_tree';

import { DocHandle, Repo, type AutomergeUrl } from '@automerge/automerge-repo';
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel';
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb';

const editorContent = document.getElementById('editor-input') as HTMLTextAreaElement | null;
if (editorContent) editorContent.spellcheck = true;

const previewContent = document.getElementById('preview-content') as HTMLElement | null;
const noteTitleInput = document.getElementById('note-title') as HTMLInputElement | null;

const filebarFiles = document.getElementById('filebar-files') as HTMLElement | null;
const app = document.getElementById('app') as HTMLElement | null;
const toggleBarsButton = document.querySelector('#toggle-sidebar') as HTMLElement | null;

const refs: EditorRefs = {
    editorContent,
    previewContent,
    noteTitleInput,
};

const appState: EditorState & TreeState = {
	vaultUrl: null,
	vaultHandle: null,
    currentFileId: null,
    saveTimer: undefined,
    dragPayload: null,
    noteTitleInput,
};

const treeHooks: TreeRenderHooks = {
    setTreeItemEditingState,
    loadMarkdownFile: () => loadMarkdownFile(appState, refs),
};

const repo = new Repo({
  network: [new BroadcastChannelNetworkAdapter()],
  storage: new IndexedDBStorageAdapter(),
});

function vaultDocChangeHandler(handle: DocHandler) {
	console.log("change", handle.doc())
	syncFileTree()
}

appState.vaultUrl = null; //localStorage.getItem("root-vault-url") as AutomergeUrl | null;

if (appState.vaultUrl) {
	appState.vaultHandle =  await repo.find(appState.vaultUrl);
	appState.vaultHandle.onchange = vaultDocChangeHandler
}


const syncFileTree = async () => {
    await refreshFileTree(appState, filebarFiles, treeHooks);
    updateEditorView();
}

async function refreshTreeOnly() {
    await refreshFileTree(appState, filebarFiles, treeHooks);
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
}

function updateSidebarState() {
    if (!app) return;

    const sidebar = document.getElementById('sidebar') as HTMLElement | null;
    if (!sidebar) return;

    if (isMobileSidebarMode()) {
        // Let the checkbox + CSS drive sidebar visibility on narrow aspect ratios.
        return;
    }

    const isHidden = sidebar.style.display === 'none';

    if (isHidden) {
        sidebar.style.display = 'flex';
    } else {
        sidebar.style.display = 'none';
    }
}

function bindCreateVaultButton() {
    const btnEl = document.getElementById('create-vault') as HTMLButtonElement | null;
    if (!btnEl) return;

    btnEl.onclick = async () => {
        try {
		appState.vaultHandle = repo.create({notes: [{id: 1, name: "test", contents: "aaa"}]})
		console.log(appState.vaultHandle)
		appState.vaultHandle.onchange = vaultDocChangeHandler
		appState.vaultUrl = appState.vaultHandle.url;
		localStorage.setItem("root-vault-url", appState.vaultUrl);
		appState.vaultHandle.change(doc => doc.test = "b")
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
    if (!appState.vaultHandle) {
        setVaultViewState(false);
    } else {
        setVaultViewState(true);

        const vaultSelected = document.getElementById('vault-selected') as HTMLElement | null;
        if (vaultSelected) vaultSelected.style.display = 'flex';
        if (appState.vaultHandle) {
            const vaultName = (appState.vaultHandle as any).name || 'Vault';
            const vaultNameElements = document.querySelectorAll<HTMLElement>('.vault-name');
            vaultNameElements.forEach((element) => {
                element.textContent = vaultName;
            });
        }

        void populateRecentNotes();
    }
}

async function populateRecentNotes() {
	return; // TODO
    const recentEl = document.getElementById('recent-notes') as HTMLUListElement | null;
    if (!recentEl || !appState.vaultHandle) return;

    if (recentEl.children.length) return;

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
}

const toggleViewButton = document.querySelector('#toggle-view') as HTMLButtonElement | null;
if (toggleViewButton) {
    toggleViewButton.addEventListener('click', () => {
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

syncSidebarVisibilityForViewport();
window.addEventListener('resize', syncSidebarVisibilityForViewport);

bindCreateVaultButton();

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
    void createMarkdownFile(appState, refs, refreshTreeOnly);
});

document.querySelector('#new-note-vault')?.addEventListener('click', () => {
    void createMarkdownFile(appState, refs, refreshTreeOnly);
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
    editorContent.addEventListener('input', (e) => {
        updatePreview(editorContent, previewContent);

	if (!appState.vaultHandle) return;
	if (!appState.currentFileId) return;

	appState.vaultHandle.change(vault => {
		const index = vault.notes.findIndex(n => n.id == appState.currentFileId)
		const note = vault.notes[index]
		vault.notes[index] = { ...note, contents: e.target.value}
	});
    });
}

updatePreview(editorContent, previewContent);

// initialize editor view based on whether a vault is selected
updateEditorView();
