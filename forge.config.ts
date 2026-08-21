import { MakerAppX } from "@electron-forge/maker-appx";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerFlatpak } from "@electron-forge/maker-flatpak";
import { MakerFlatpakOptionsConfig } from "@electron-forge/maker-flatpak/dist/Config";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { VitePlugin } from "@electron-forge/plugin-vite";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import fs from "node:fs";
import path from "node:path";
import { PublisherS3 } from "@electron-forge/publisher-s3";
// import { globSync } from "node:fs";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { execSync } from "node:child_process";

const STRINGS = {
  author: "Learnet Platforms LTD",
  name: "Learnet",
  execName: "learnet-desktop",
  description: "Open source user-first flashcards app.",
};

const ASSET_DIR = "assets/desktop";

function isPreTahoeMacOS(): boolean {
  if (process.platform !== "darwin") return false;
  const version = execSync("sw_vers -productVersion").toString().trim();
  const major = parseInt(version.split(".")[0], 10);
  return major < 26;
}

const iconIconPath = `${ASSET_DIR}/icon.icon`;
const iconIconBackupPath = `${ASSET_DIR}/icon.icon.bak`;

if (isPreTahoeMacOS() && fs.existsSync(iconIconPath)) {
  fs.renameSync(iconIconPath, iconIconBackupPath);
  process.on("exit", () => {
    if (fs.existsSync(iconIconBackupPath)) {
      fs.renameSync(iconIconBackupPath, iconIconPath);
    }
  });
}

/**
 * Build targets for the desktop app
 */
const makers: ForgeConfig["makers"] = [
  new MakerSquirrel({
    name: STRINGS.name,
    authors: STRINGS.author,
    // todo: hoist this
    iconUrl: `https://learnet.app/app/assets/icon-DUSNE-Pb.ico`,
    // todo: loadingGif
    setupIcon: `${ASSET_DIR}/icon.ico`,
    description: STRINGS.description,
    exe: `${STRINGS.execName}.exe`,
    setupExe: `${STRINGS.execName}-setup.exe`,
    copyright: "Copyright (C) 2026 Learnet Platforms LTD",
  }),
  new MakerDMG({
    background: `${ASSET_DIR}/dmg-background.png`,
    icon: `${ASSET_DIR}/icon.icns`,
    format: "ULFO",

    additionalDMGOptions: {
      window: {
        size: {
          width: 540,
          height: 380,
        },
      },
    },

    contents: (opts) => [
      {
        x: 130,
        y: 220,
        type: "file",
        path: opts.appPath,
      },
      {
        x: 410,
        y: 220,
        type: "link",
        path: "/Applications",
      },
    ],
  }),
  ...(process.platform !== "darwin" ? [new MakerZIP({})] : []),
  new MakerFlatpak({
    options: {
      id: "app.learnet.LearnetDesktop",
      description: STRINGS.description,
      productName: STRINGS.name,
      productDescription: STRINGS.description,
      runtimeVersion: "25.08",
      icon: {
        "16x16": `${ASSET_DIR}/hicolor/16x16.png`,
        "32x32": `${ASSET_DIR}/hicolor/32x32.png`,
        "64x64": `${ASSET_DIR}/hicolor/64x64.png`,
        "128x128": `${ASSET_DIR}/hicolor/128x128.png`,
        "256x256": `${ASSET_DIR}/hicolor/256x256.png`,
        "512x512": `${ASSET_DIR}/hicolor/512x512.png`,
      } as unknown,
      categories: ["Network"],
      modules: [
        // use the latest zypak -- Electron sandboxing for Flatpak
        {
          name: "zypak",
          sources: [
            {
              type: "git",
              url: "https://github.com/refi64/zypak",
              tag: "v2025.09",
            },
          ],
        },
      ],
      finishArgs: [
        // default arguments found by running
        // DEBUG=electron-installer-flatpak* pnpm make
        "--socket=fallback-x11",
        "--socket=wayland",
        "--share=ipc",
        "--share=network",
        "--device=dri",
        "--device=all",
        "--socket=pulseaudio",
        "--filesystem=xdg-run/pipewire-0",
        "--filesystem=xdg-videos:ro",
        "--filesystem=xdg-pictures:ro",
        "--filesystem=xdg-download",
        "--filesystem=xdg-run/speech-dispatcher",
        "--talk-name=org.freedesktop.ScreenSaver",
        "--talk-name=org.freedesktop.Notifications",
        "--talk-name=org.kde.StatusNotifierWatcher",
        "--talk-name=com.canonical.AppMenu.Registrar",
        "--talk-name=com.canonical.indicator.application",
        "--talk-name=com.canonical.Unity",
        "--env=XCURSOR_PATH=/run/host/user-share/icons:/run/host/share/icons",
        "--env=ELECTRON_TRASH=gio",
        "--env=TMPDIR=xdg-run/app/app.learnet.LearnetDesktop",
      ],
      files: [],
    } as MakerFlatpakOptionsConfig,
  }),
];

// skip these makers in CI/CD
if (!process.env.PLATFORM) {
  makers.push(
    // must be manually built (freezes CI process)
    // not much use in being published anyhow
    new MakerAppX({
      certPass: "",
      packageExecutable: `app\\${STRINGS.execName}.exe`,
      publisher: "CN=B040CC7E-0016-4AF5-957F-F8977A6CFA3B",
    }),
    // testing purposes
    new MakerDeb({
      options: {
        productName: STRINGS.name,
        productDescription: STRINGS.description,
        categories: ["Network"],
        icon: `${ASSET_DIR}/icon.png`,
      },
    }),
  );
}

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: STRINGS.name,
    executableName: STRINGS.execName,
    icon:
      process.platform === "darwin"
        ? `${ASSET_DIR}/icon.icns`
        : `${ASSET_DIR}/icon`,
    osxSign: {
      optionsForFile: () => {
        return {
          entitlements: "./entitlements.plist",
        };
      },
    },

    // extraResource: [
    //   // include all the asset files
    //   ...globSync(ASSET_DIR + "/**/*"),
    // ],
  },
  rebuildConfig: {},
  makers,
  hooks: {
    // Copy the node-pipewire dist to the app on linux
    packageAfterCopy: async (_config, buildPath, _version, platform) => {
      if (platform === "linux") {
        // Copy only the files we need to run the code, which is dist, LICENSE, and package.json
        fs.cpSync(
          "node_modules/node-pipewire/dist",
          path.join(buildPath, "node_modules/node-pipewire/dist"),
          { recursive: true },
        );
        fs.cpSync(
          "node_modules/node-pipewire/LICENSE",
          path.join(buildPath, "node_modules/node-pipewire/LICENSE"),
          { recursive: true },
        );
        fs.cpSync(
          "node_modules/node-pipewire/package.json",
          path.join(buildPath, "node_modules/node-pipewire/package.json"),
          { recursive: true },
        );
      }
    },
//     postMake: async (config, makeResults) => {
//       const vaultHost = process.env.VAULT_HOST || "https://dl.learnet.app";
//       const botToken = process.env.BOT_TOKEN;

//       if (!botToken) {
//         throw new Error("BOT_TOKEN environment variable is required to upload releases to Vault.");
//       }

//       for (const result of makeResults) {
//         for (const filePath of result.artifacts) {
//           const file = path.basename(filePath);
//           if (
//             file.endsWith(".zip") ||
//             file.endsWith(".exe") ||
//             file.endsWith(".AppImage") ||
//             file.endsWith(".deb") ||
//             file.endsWith(".rpm")
//           ) {
//             console.log(`Uploading ${file} to Vault releases...`);

//             const formData = new FormData();
//             const fileBlob = new Blob([fs.readFileSync(filePath)]);
//             formData.append("file", fileBlob, file);

// let response;
// try {
//   response = await fetch(`${vaultHost}/releases`, {
//     method: "POST",
//     headers: {
//       "X-Bot-Token": botToken,
//     },
//     body: formData,
//   });
// } catch (err) {
//   console.error("fetch error:", err);
//   console.error("cause:", err.cause);
//   throw err;
// }

//             if (!response.ok) {
//               const errorText = await response.text();
//               throw new Error(`Failed to upload ${file} to Vault: ${response.status} ${errorText}`);
//             }

//             const data = await response.json();
//             console.log(`Successfully uploaded ${file}. File ID: ${data.id}`);
//           }
//         }
//       }
//     },
  },
  publishers: [
    new PublisherS3({
      bucket: process.env.R2_BUCKET!,
      region: "auto",
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      endpoint: process.env.R2_ENDPOINT, // https://<account_id>.r2.cloudflarestorage.com
      s3ForcePathStyle: true,
      public: true,
      folder: "releases", // -> releases/<platform>-<arch>/<file>
    }),
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.ts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
