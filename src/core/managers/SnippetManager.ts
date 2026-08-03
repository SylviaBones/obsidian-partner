//SnippetManager.ts
import { App, TFile } from "obsidian";

declare const require: any;

export class SnippetManager {
  private registry: Map<string, Function> = new Map();

  constructor(private app: App) {}

  // =========================
  // PUBLIC API
  // =========================

  async loadAll(calls: any[], baseFolder?: string) {
    console.log("[Snippets] Base folder:", baseFolder);

    for (const call of calls) {
      const key = call.source || call.id;

      if (!key) {
        console.warn("[Snippets] ❌ Missing source/id:", call);
        continue;
      }

      if (this.registry.has(key)) {
        console.log("[Snippets] Skipping already loaded:", key);
        continue;
      }

      const path = `${baseFolder}/${key}.js`;

      console.log("[Snippets] Resolving:", { key, path });

      const fn = await this.loadOne(path);

      if (fn) {
        this.registry.set(key, fn);
        console.log(`[Snippets] ✅ Loaded: ${key}`);
      }
    }
  }

  get(key: string): Function | undefined {
    return this.registry.get(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.registry.keys());
  }

  // =========================
  // INTERNAL
  // =========================

  private async loadOne(filePath: string): Promise<Function | null> {
    console.log("[Snippets] Attempt load:", filePath);

    const abstract = this.app.vault.getAbstractFileByPath(filePath);

    if (!abstract) {
      console.warn("[Snippets] ❌ File not found:", filePath);
      return null;
    }

    if (!(abstract instanceof TFile)) {
      console.warn("[Snippets] ❌ Not a file:", filePath);
      return null;
    }

    const content = await this.app.vault.read(abstract);

    console.log("[Snippets] 📄 Preview:");
    console.log(content.slice(0, 200));

    try {
      const module: { exports: any } = { exports: {} };

      const wrapped = new Function(
        "module",
        "exports",
        "require",
        "app",
        content
      );

      wrapped(module, module.exports, require, this.app);

      console.log("[Snippets] ✅ Compiled:", filePath);

      return module.exports as Function;

    } catch (err) {
      console.error("[Snippets] ❌ Compile failed:", filePath, err);
      return null;
    }
  }
}