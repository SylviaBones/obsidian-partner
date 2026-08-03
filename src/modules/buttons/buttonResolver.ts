//buttonResolver.ts
import { CallRegistry } from "../calls/callRegistry";
import { SnippetManager } from "../../core/managers/SnippetManager";
import { App } from "obsidian";

declare const require: any;

// look up call, find and execute snippets
export class ButtonResolver {
  constructor(
    private callRegistry: CallRegistry,
    private snippetManager: SnippetManager,
    private app: App,
    private plugin: any
  ) {}

  //helpers
  private buildContext() {
    const { Notice, Modal, TFile } = require("obsidian");
    const file = this.app.workspace.getActiveFile()
    let frontmatter = {};
    if (file) {
      const cache = this.app.metadataCache.getFileCache(file);
      frontmatter = cache?.frontmatter ?? {};
    }

    return {
      app: this.app,
      plugin: this.plugin,

      obsidian: {
        Notice,
        Modal,
        TFile,
      },

      utils: {
        // future helpers
      },

      state: {
        // shared runtime state later
      },

      note: {
        file,
        frontmatter,
      }
    };
  }

  resolve(type: string, label: string): HTMLElement | null {
    const call = 
      this.callRegistry.get(
        `partner-${type}-${label}`
    );

    if (!call) {
      console.warn(
        "Call not found:",
        `partner-${type}-${label}`
      );
      return null;
    }
    if (!call.enabled) return null
    return this.runSnippet(call)
  }
  
  private runSnippet(call: any): HTMLElement | null {
    try {
      const fn = this.snippetManager.get(call.source);

      console.log("Running snippet:", call.source);

      if (!fn) {
        console.warn("[Resolver] Missing snippet:", call.source);
        return null;
      }
      const action = fn({
        ...this.buildContext(),
        call
      });


      console.log("[Resolver] Action returned:", action);

      if (!action) {
        console.warn("[Resolver] No action returned:", call.source);
        return null;
      }

      console.log("[Resolver] INPUT:", call.source)
      console.log("[Resolver] FN CHECK:", {
        type: typeof fn,
        fn: fn
      });

      // Build button; centralized UI
      return this.buildButton(call, action);

    } catch (err) {
      console.error("Snippet execution failed:", call.label, err);
      return null;
    }

  }

  private buildButton(call: any, action: any): HTMLElement {
    const button = document.createElement("button");

    // label fallback logic
    button.textContent =
      action.label ??
      call.label ??
      call.source;

    // click handler
    if (action.onClick) {
      button.onclick = action.onClick;
    }

    // optional extras (future-proofing)
    if (action.className) {
      button.className = action.className;
    }

    if (action.tooltip) {
      button.title = action.tooltip;
    }

    return button;
  }
}