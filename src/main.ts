import "./styles/main.css";
import {
  createMarkdownFile,
  loadMarkdownFile,
  updatePreview,
  type EditorRefs,
  type EditorState,
} from "./editor";
import { type TreeState, renderNotesList } from "./file_tree";

import {
  isValidAutomergeUrl,
  Repo,
  type AutomergeUrl,
} from "@automerge/automerge-repo";
import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb";
import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket";

const editorContent = document.getElementById(
  "editor-input",
) as HTMLTextAreaElement | null;

import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

// URL del servidor de push (cambiar si se deploya)
const PUSH_SERVER = import.meta.env.VITE_PUSH_SERVER ?? "http://localhost:3000";
const VAPID_PUBLIC =
  "BIzF4QkrDPrWexnLeXEmxgqvjHD0iPsEFsInMjBY5TJ5dHZ8W9UBAkWG6zhnWOfCzczrLSrBzd4s2DMYkcCdJQY";

async function initNotifications() {
  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messaging, { vapidKey: VAPID_PUBLIC });
    console.log("FCM TOKEN:", token);

    // Registrar suscripción directa en nuestro servidor (para demo push)
    try {
      const swReg = await navigator.serviceWorker.register("/push-sw.js", {
        scope: "/push-sw-scope/",
      });
      await navigator.serviceWorker.ready;
      let sub = await swReg.pushManager.getSubscription();
      if (!sub) {
        sub = await swReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: VAPID_PUBLIC,
        });
      }
      await fetch(`${PUSH_SERVER}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });
      console.log("✅ Suscrito al servidor de push");
    } catch (err) {
      console.warn("Push server no disponible (demo offline):", err);
    }
  }
}

onMessage(messaging, (payload) => {
  console.log("Mensaje recibido con la app abierta:", payload);

  const title = "Carbon";
  const body = payload.notification?.body ?? "";

  new Notification(title, {
    body,
  });
});

initNotifications();

async function sendNotification(msg: string) {
  const body = { body: msg };
  await fetch(`${PUSH_SERVER}/notify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

if (editorContent) editorContent.spellcheck = true;

const previewContent = document.getElementById(
  "preview-content",
) as HTMLElement | null;
const noteTitleInput = document.getElementById(
  "note-title",
) as HTMLInputElement | null;

const filebarFiles = document.getElementById(
  "filebar-files",
) as HTMLElement | null;
const app = document.getElementById("app") as HTMLElement | null;
const toggleBarsButton = document.querySelector(
  "#toggle-sidebar",
) as HTMLElement | null;
const sidebarToggle = document.querySelector(
  "#sidebar-toggle",
) as HTMLInputElement | null;
const optionsButton = document.querySelector(
  "#options",
) as HTMLButtonElement | null;
const optionsMenu = document.querySelector(
  "#options-menu",
) as HTMLElement | null;
const deleteNoteButton = document.querySelector(
  "#delete-note",
) as HTMLButtonElement | null;

const refs: EditorRefs = {
  editorContent,
  previewContent,
  noteTitleInput,
};

const appState: EditorState & TreeState = {
  vaultHandle: null,
  currentFileId: null,
  editingNote: false,
  dragPayload: null,
  noteTitleInput,
};

const repo = new Repo({
  network: [new BrowserWebSocketClientAdapter("wss://sync.automerge.org")],
  storage: new IndexedDBStorageAdapter(),
});

async function vaultDocChangeHandler() {
  renderPage();
}

const locationHash = document.location.hash.substring(1);
let vaultUrl: AutomergeUrl | null;
if (isValidAutomergeUrl(locationHash)) {
  vaultUrl = locationHash;
} else {
  vaultUrl = localStorage.getItem("root-vault-url") as AutomergeUrl | null;
}

if (vaultUrl) {
  document.location.hash = vaultUrl;
  appState.vaultHandle = await repo.find(vaultUrl);
  appState.vaultHandle.addListener("change", vaultDocChangeHandler);
}

export function renderPage() {
  console.log("RENDERING", appState);
  renderNotesList(appState, filebarFiles);
  renderEditor(appState, refs);
}

let recentNotesLoading = false;

function updateSidebarToggleIcon() {
  const icon = document.getElementById("toggle-sidebar-icon");
  if (!icon) return;

  const isMobile = isMobileSidebarMode();
  const isOpen = isMobile
    ? !!sidebarToggle?.checked
    : document.getElementById("sidebar")?.style.display !== "none";
  icon.textContent = isOpen ? "left_panel_close" : "left_panel_open";
}

function setOptionsMenuOpen(isOpen: boolean) {
  if (!optionsMenu || !optionsButton) return;

  optionsMenu.hidden = !isOpen;
  optionsButton.setAttribute("aria-expanded", String(isOpen));
}

function toggleOptionsMenu() {
  if (!optionsMenu) return;

  setOptionsMenuOpen(optionsMenu.hasAttribute("hidden"));
}

function setEditorPaneVisible(isEditorVisible: boolean) {
  const editorPane = document.getElementById(
    "editor-pane",
  ) as HTMLElement | null;
  const previewPane = document.getElementById(
    "preview-pane",
  ) as HTMLElement | null;
  if (!editorPane || !previewPane) return;

  editorPane.style.display = isEditorVisible ? "flex" : "none";
  previewPane.style.display = isEditorVisible ? "none" : "block";
}

function isMobileSidebarMode() {
  return window.matchMedia("(max-aspect-ratio: 3/5)").matches;
}

function syncSidebarVisibilityForViewport() {
  const sidebar = document.getElementById("sidebar") as HTMLElement | null;
  if (!sidebar) return;

  // In mobile mode, visibility is controlled by the checkbox + CSS transform.
  if (isMobileSidebarMode()) {
    sidebar.style.removeProperty("display");
  }

  updateSidebarToggleIcon();
}

function updateSidebarState() {
  if (!app) return;

  const sidebar = document.getElementById("sidebar") as HTMLElement | null;
  if (!sidebar) return;

  if (!toggleBarsButton) return;

  if (isMobileSidebarMode()) {
    if (sidebarToggle) {
      sidebarToggle.checked = !sidebarToggle.checked;
    }
    updateSidebarToggleIcon();
    return;
  }

  const isHidden = sidebar.style.display === "none";

  if (isHidden) {
    sidebar.style.display = "flex";
  } else {
    sidebar.style.display = "none";
  }

  updateSidebarToggleIcon();
}

function bindCreateVaultButton() {
  const btnEl = document.getElementById(
    "create-vault",
  ) as HTMLButtonElement | null;
  if (!btnEl) return;

  btnEl.onclick = async () => {
    try {
      appState.vaultHandle = repo.create({
        name: "Vault",
        notes: [],
      });
      appState.vaultHandle.addListener("change", vaultDocChangeHandler);
      localStorage.setItem("root-vault-url", appState.vaultHandle.url);
      renderPage();
    } catch (error) {
      console.error("Failed to create vault", error);
    }
  };
}

function setVaultViewState(hasVault: boolean) {
  const vaultEmpty = document.getElementById(
    "vault-empty",
  ) as HTMLElement | null;
  const vaultSelected = document.getElementById(
    "vault-selected",
  ) as HTMLElement | null;
  const editorPane = document.getElementById(
    "editor-pane",
  ) as HTMLElement | null;
  const previewPane = document.getElementById(
    "preview-pane",
  ) as HTMLElement | null;

  if (vaultEmpty) vaultEmpty.style.display = hasVault ? "none" : "flex";
  if (vaultSelected) vaultSelected.style.display = hasVault ? "flex" : "none";
  if (!hasVault) {
    if (editorPane) editorPane.style.display = "none";
    if (previewPane) previewPane.style.display = "none";
  }
}

function renderEditor(state, refs) {
  if (!appState.vaultHandle) {
    setVaultViewState(false);
  } else {
    setVaultViewState(true);

    if (appState.currentFileId) {
      console.log(state.editingNote);
      setEditorPaneVisible(state.editingNote);
      loadMarkdownFile(state, refs);
    } else {
      const vaultSelected = document.getElementById(
        "vault-selected",
      ) as HTMLElement | null;
      if (vaultSelected) vaultSelected.style.display = "flex";

      document.getElementById("editor-pane").style.display = "none";
      document.getElementById("preview-pane").style.display = "none";

      const vaultName = appState.vaultHandle.doc().name || "Vault";
      const vaultNameElements =
        document.querySelectorAll<HTMLElement>(".vault-name");
      vaultNameElements.forEach((element) => {
        element.textContent = vaultName;
      });

      if (noteTitleInput) {
        noteTitleInput.value = appState.vaultHandle.doc().name;
        noteTitleInput.placeholder = appState.vaultHandle.doc().name;
      }
    }
  }
}

const toggleViewButton = document.querySelector(
  "#toggle-view",
) as HTMLButtonElement | null;

if (toggleViewButton) {
  toggleViewButton.addEventListener("click", () => {
    if (!appState.currentFileId) return;

    const editorPane = document.getElementById(
      "editor-pane",
    ) as HTMLElement | null;
    const previewPane = document.getElementById(
      "preview-pane",
    ) as HTMLElement | null;
    if (!editorPane || !previewPane) return;
    const isEditorVisible = editorPane.style.display !== "none";
    appState.editingNote = !isEditorVisible;
    setEditorPaneVisible(!isEditorVisible);
  });
}

if (toggleBarsButton) {
  toggleBarsButton.addEventListener("click", () => {
    updateSidebarState();
  });
}

if (optionsButton) {
  optionsButton.setAttribute("aria-haspopup", "menu");
  optionsButton.setAttribute("aria-expanded", "false");
  optionsButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (appState.currentFileId) {
      toggleOptionsMenu();
    }
  });
}

document.addEventListener("click", (event) => {
  if (!optionsMenu || !optionsButton) return;
  const target = event.target as Node | null;
  if (
    target &&
    (optionsMenu.contains(target) || optionsButton.contains(target))
  )
    return;
  setOptionsMenuOpen(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setOptionsMenuOpen(false);
  }
});

if (sidebarToggle) {
  sidebarToggle.addEventListener("change", () => {
    updateSidebarToggleIcon();
  });
}

syncSidebarVisibilityForViewport();
window.addEventListener("resize", syncSidebarVisibilityForViewport);

bindCreateVaultButton();

document.querySelector("#get-vault")!.addEventListener("click", async () => {
  appState.currentFileId = null;
  renderPage();
});

document.querySelector("#new-file")?.addEventListener("click", () => {
  createMarkdownFile(appState, refs);
  const vaultName = appState.vaultHandle?.doc().name;
  sendNotification(`Nueva nota creada en bobeda ${vaultName}`);
});

document.querySelector("#new-note-vault")?.addEventListener("click", () => {
  createMarkdownFile(appState, refs);
  const vaultName = appState.vaultHandle?.doc().name;
  sendNotification(`Nueva nota creada en bobeda ${vaultName}`);
});

function getTodayTitle() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());
  return `${day}-${month}-${year}`;
}

document.querySelector("#new-file-today")?.addEventListener("click", () => {
  createMarkdownFile(appState, refs, getTodayTitle());
});

document.getElementById("change-vault")?.addEventListener("click", () => {
  if (appState.vaultHandle) {
    repo.delete(appState.vaultHandle.url);
  }

  appState.vaultHandle = null;
  document.location.hash = "";
  renderPage();
});

deleteNoteButton?.addEventListener("click", () => {
  if (!appState.vaultHandle) return;
  if (!appState.currentFileId) return;

  appState.vaultHandle.change((vault) => {
    const index = vault.notes.findIndex((n) => n.id === appState.currentFileId);
    sendNotification(
      `Nota ${vault.notes[index].name} borrada en bobeda ${vault.name}`,
    );
    // @ts-ignore: proxy function type incorrect for automerge document
    vault.notes.deleteAt(index);
  });
  appState.currentFileId = null;

  renderPage();
});

if (noteTitleInput) {
  noteTitleInput.addEventListener("click", () => {
    noteTitleInput.classList.remove("inactive");
    noteTitleInput.select();
  });

  noteTitleInput.addEventListener("blur", () => {
    noteTitleInput.classList.add("inactive");
    if (appState.currentFileId) {
      appState.vaultHandle?.change((vault) => {
        const note = vault.notes.find((n) => n.id === appState.currentFileId);
        if (note) note.name = noteTitleInput.value;
      });
    } else if (appState.vaultHandle) {
      appState.vaultHandle.change((vault) => {
        vault.name = noteTitleInput.value;
      });
    }
    renderPage();
  });
  noteTitleInput.addEventListener("keydown", (event) => {
    if (!appState.vaultHandle) return;
    if (event.key === "Enter") {
      event.preventDefault();
      if (appState.currentFileId) {
        appState.vaultHandle.change((vault) => {
          const note = vault.notes.find((n) => n.id === appState.currentFileId);
          if (note) {
            note.name = noteTitleInput.value;
          }
        });
      } else {
        appState.vaultHandle.change((vault) => {
          vault.name = noteTitleInput.value;
        });
      }

      noteTitleInput.blur();
      renderPage();
    } else if (event.key === "Escape") {
      event.preventDefault();
      noteTitleInput.value = noteTitleInput.placeholder;
      noteTitleInput.blur();
    }
  });
}

if (editorContent) {
  editorContent.addEventListener("input", () => {
    updatePreview(editorContent, previewContent);

    if (!appState.vaultHandle) return;
    if (!appState.currentFileId) return;

    appState.vaultHandle.change((vault) => {
      const index = vault.notes.findIndex(
        (n) => n.id == appState.currentFileId,
      );
      const note = vault.notes[index];
      vault.notes[index] = { ...note, contents: editorContent.value };
    });
  });
}

updatePreview(editorContent, previewContent);
updateSidebarToggleIcon();

renderPage();
