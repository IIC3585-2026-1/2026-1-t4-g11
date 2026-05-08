import './style.css'
import { marked } from 'marked';
import Katex from 'katex';
import extendedLatex from "marked-extended-latex";

let folderHandle: FileSystemDirectoryHandle | null = null;
let currentFileHandle: FileSystemFileHandle | null = null;
let saveTimer: number | undefined;

const previewRenderer = new marked.Renderer();  

const editorContent = document.getElementById('editor-input') as HTMLTextAreaElement | null;
if (editorContent) editorContent.spellcheck = true;

const previewContent = document.getElementById('preview-content') as HTMLElement | null;

async function saveCurrentFile() {
    if (!currentFileHandle || !editorContent) return;
    try {
        const writable = await currentFileHandle.createWritable();
        await writable.write(editorContent.value);
        await writable.close();
    } catch (err) {
        console.error('Failed to save file', err);
    }
}

type TreeEntry = { name: string; kind: 'file' | 'directory'; handle?: any; children?: TreeEntry[] };

async function getTree(dirHandle: any): Promise<TreeEntry[]> {
    const items: TreeEntry[] = [];
    for await (const entry of dirHandle.entries()) {
        const [name, handle] = entry as [string, any];
        if (name.startsWith('.')) continue;

        if (handle.kind === 'directory') {
            const children = await getTree(handle);
            if (children && children.length > 0) {
                items.push({ name, kind: 'directory', handle, children });
            }
        } else {
            if (name.toLowerCase().endsWith('.md')) {
                items.push({ name, kind: 'file', handle });
            }
        }
    }
    items.sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'directory' ? -1 : 1;
    });
    return items;
}

function renderTree(entries: TreeEntry[], parent: HTMLElement) {
    const ul = document.createElement('ul');
    ul.className = 'tree-list';
    
    entries.forEach(e => {
        const li = document.createElement('li');
        li.className = 'tree-item';

        let caret = document.createElement('span');
        caret.className = 'caret material-symbols-outlined';
        caret.textContent = 'keyboard_arrow_right';

        if (e.kind === 'directory') {
            const header = document.createElement('div');
            header.className = 'tree-header';

            const nameSpan = document.createElement('span');
            nameSpan.className = 'tree-name';
            nameSpan.textContent = e.name;

            header.appendChild(caret);
            header.appendChild(nameSpan);
            li.appendChild(header);

            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'children collapsed';
            if (e.children && e.children.length) {
                renderTree(e.children, childrenContainer as unknown as HTMLElement);
            }
            li.appendChild(childrenContainer);

            caret.addEventListener('click', () => {
                const isCollapsed = childrenContainer.classList.toggle('collapsed');
                childrenContainer.classList.toggle('expanded', !isCollapsed);
                caret.textContent = isCollapsed ? 'keyboard_arrow_right' : 'keyboard_arrow_down';
            });
        } else {
            const header = document.createElement('div');
            header.className = 'tree-header file-header';

            const fileName = document.createElement('div');
            fileName.className = 'file-name';
            fileName.textContent = e.name;
            fileName.style.cursor = 'pointer';

            caret.style.visibility = 'hidden';
            header.appendChild(caret);
            header.appendChild(fileName);

            fileName.addEventListener('click', async () => {
                if (!e.handle) return;
                try {
                    currentFileHandle = e.handle;
                    const file = await e.handle.getFile();
                    const text = await file.text();
                    loadMarkdownFile(text, e.name);
                } catch (err) {
                    console.error('Failed to open file', err);
                }
            });
            li.appendChild(header);
        }
        ul.appendChild(li);
    });
    parent.appendChild(ul);
}

document.querySelector('#get-files')!.addEventListener('click', async () => {
    try {
        folderHandle = await window.showDirectoryPicker();
        const tree = await getTree(folderHandle);
        const container = document.getElementById('filebar-files');
        if (container) {
            container.innerHTML = '';
            renderTree(tree, container);
        }
        console.log(tree);
    } catch (err) {
        console.error(err);
    }
});

function loadMarkdownFile(md: string, filename?: string) {
    const title = document.getElementById('note-title');
    if (title && filename) title.textContent = filename;
    
    if (editorContent) {
        editorContent.value = md;
        updatePreview();
    }
}

function updatePreview() {
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
    } catch (err) {
        console.error('Marked parse error', err);
        previewContent.textContent = md;
    }
}

document.getElementById('editor-input')?.addEventListener('input', () => {
    updatePreview();

    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
        void saveCurrentFile();
    }, 500);
});

updatePreview();