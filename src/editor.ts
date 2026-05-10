import { marked } from 'marked';
import Katex from 'katex';
import extendedLatex from 'marked-extended-latex';
import {
    createNewFileWithContent,
    makeUniqueMarkdownFilename,
    renameMarkdownFile,
} from './file_tree';

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

export function setNoteTitleState(noteTitleInput: HTMLInputElement | null, isActive: boolean) {
    if (!noteTitleInput) return;

    noteTitleInput.readOnly = !isActive;
    noteTitleInput.classList.toggle('active', isActive);
    noteTitleInput.classList.toggle('inactive', !isActive);
}

export async function saveCurrentFile(state: EditorState, editorContent: HTMLTextAreaElement | null) {
    if (!state.currentFileHandle || !editorContent) return;
    try {
        const writable = await state.currentFileHandle.createWritable();
        await writable.write(editorContent.value);
        await writable.close();
    } catch (error) {
        console.error('Failed to save file', error);
    }
}

export function updatePreview(editorContent: HTMLTextAreaElement | null, previewContent: HTMLElement | null) {
    if (!editorContent || !previewContent) return;

    const md = editorContent.value;
    const options = {
        render: (formula: string, displayMode: boolean) => Katex.renderToString(formula, { displayMode, output: 'mathml' }),
    };

    try {
        marked.use(extendedLatex(options));
        marked.use({ renderer: previewRenderer });
        const html = marked.parse(md, { renderer: previewRenderer });
        previewContent.innerHTML = html;
    } catch (error) {
        console.error('Marked parse error', error);
        previewContent.textContent = md;
    }
}

export function loadMarkdownFile(
    state: EditorState,
    refs: EditorRefs,
    md: string,
    filename?: string,
) {
    const vaultSelected = document.getElementById('vault-selected') as HTMLElement | null;
    if (vaultSelected) vaultSelected.style.display = 'none';

    if (refs.noteTitleInput && filename) refs.noteTitleInput.value = filename;
    if (filename) state.currentFileName = filename;
    setNoteTitleState(refs.noteTitleInput, !!filename);

    if (refs.editorContent) {
        refs.editorContent.value = md;
        updatePreview(refs.editorContent, refs.previewContent);
    }
}

export async function renameCurrentFile(
    state: EditorState,
    refs: EditorRefs,
    requestedName: string,
    refreshFileTree: () => Promise<void>,
) {
    if (!state.folderHandle || !state.currentFileHandle || !state.currentFileParentHandle || !state.currentFileName) return;

    const targetName = requestedName.trim();
    if (!targetName || targetName === state.currentFileName) return;

    if (state.saveTimer) window.clearTimeout(state.saveTimer);
    await saveCurrentFile(state, refs.editorContent);

    const uniqueName = await makeUniqueMarkdownFilename(state.currentFileParentHandle, targetName, state.currentFileName);
    const result = await renameMarkdownFile(state.currentFileParentHandle, state.currentFileHandle, state.currentFileName, uniqueName);

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

        if (!state.folderHandle) {
            state.folderHandle = await window.showDirectoryPicker();
        }

        if (!state.folderHandle) return;

        const filename = await makeUniqueMarkdownFilename(state.folderHandle, 'Nueva nota');
        const fileHandle = await createNewFileWithContent(state.folderHandle, filename, '');
        if (!fileHandle) return;

        state.currentFileHandle = fileHandle;
        state.currentFileParentHandle = state.folderHandle;
        loadMarkdownFile(state, refs, '', filename);
        setNoteTitleState(refs.noteTitleInput, true);
        refs.noteTitleInput?.focus();
        refs.noteTitleInput?.select();
        await refreshFileTree();
    } catch (error) {
        console.error('Failed to create file', error);
    }
}
