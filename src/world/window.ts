import { contextBridge, ipcRenderer } from "electron";

import { version } from "../../package.json";

contextBridge.exposeInMainWorld("native", {
  isElectron: true,
  platform: process.platform,
  goBack: () => ipcRenderer.send("nav-back"),
  goForward: () => ipcRenderer.send("nav-forward"),
  closeWindow: () => ipcRenderer.send("close-window"),

  openExternalAuth: (url: string) =>
    ipcRenderer.send("open-external-auth", url),

  onDeepLinkAuth: (
    callback: (payload: {
      token: string;
      id: string | null;
      userId: string | null;
    }) => void,
  ) => {
    const eventName = "deep-link-auth";
    ipcRenderer.removeAllListeners(eventName);
    ipcRenderer.on(eventName, (_event, payload) => callback(payload));
  },

  versions: {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
    desktop: () => version,
  },

  minimise: () => ipcRenderer.send("minimise"),
  maximise: () => ipcRenderer.send("maximise"),
  close: () => ipcRenderer.send("close"),

  setBadgeCount: (count: number) => ipcRenderer.send("setBadgeCount", count),

  onceScreenPicker: (
    onScreenPick: (
      sources: {
        idx: number;
        name: string;
        isFullScreen: boolean;
        image?: string;
      }[],
    ) => void,
  ) => {
    const eventName = "screenPicker";
    ipcRenderer.removeAllListeners(eventName);
    ipcRenderer.once(eventName, (_, sources) => onScreenPick(sources));
  },
  screenPickerCallback: (idx: number, audio: boolean) =>
    ipcRenderer.send("screenPickerCallback", idx, audio),

  isWayland: () => ipcRenderer.invoke("getIsWayland"),
});
