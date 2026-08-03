import { Plugin, TFile } from "obsidian";
import { MarkdownRenderer } from "obsidian";

interface PluginSettings {
  calls: any[];
}

const DEFAULT_SETTINGS: PluginSettings = {
  calls: []
};

export default class YourPlugin extends Plugin {
  settings: PluginSettings = DEFAULT_SETTINGS;
  // Instance of the call engine
  callEngine!: CallEngine;

  async onload() {
    await this.loadSettings();

    // This is what makes it accessible to the engine
    this.callEngine = new CallEngine(this);
    this.callEngine.init();
  }

  async loadSettings() {
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
  }

  async SaveSettings() {
    await this.saveData(this.settings);
  }
}

export class CallEngine {
  plugin: Plugin;

  constructor(plugin: Plugin) {
    this.plugin = plugin;
  }

  init() {
    this.registerProcessor();
    this.registerInteractions();
  }

  // Detect + replace calls in rendered markdown
  registerProcessor() {
    this.plugin.registerMarkdownPostProcessor(async (el, ctx) => {
      const codeEls = el.querySelectorAll("code");

      for (const codeEl of codeEls) {
        const text = codeEl.innerText.trim();

        const match = text.match(/^partner-(btn|vw)-([\w-]+)$/);
        if (!match) continue;

        const [, type, label] = match;

        const call = (this.plugin.settings as any).calls.find(
          (c: any) => c.type === type && c.label === label
        );

        if (!call) continue;

        const container = document.createElement("div");
        container.className = "partner-view";

        await this.renderCallInto(container, call, ctx);

        codeEl.replaceWith(container);
      }
    });
  }

  // Resolve call → actual content
  async renderCallInto(container: HTMLElement, call: any, ctx: any) {
    const file = this.plugin.app.vault.getAbstractFileByPath(call.source);

    if (!(file instanceof TFile)) {
      container.setText(`Missing source: ${call.source}`);
      return;
    }

    const content = await this.plugin.app.vault.read(file);

    // Detect if it's a JS class (like HeadList)
    const isJS = call.source.endsWith(".js");

    if (call.type === "vw" && isJS) {
      await this.executeViewScript(container, content);
      return;
    }

    if (call.type === "vw") {
      await MarkdownRenderer.renderMarkdown(
        content,
        container,
        file.path,
        this.plugin
      );
      return;
    }

    if (call.type === "btn") {
      const button = document.createElement("button");
      button.className = "partner-btn";
      button.dataset.call = call.label;
      button.setText(call.label);

      container.appendChild(button);
    }
  }

  // Execute JS views from source files
  async executeViewScript(container: HTMLElement, content: string) {
    try {
      const scriptFn = new Function("container", "plugin", content);
      await scriptFn(container, this.plugin);
    } catch (error) {
      container.setText(`Error executing view script: ${error}`);
    }
  }

  // Handle button clicks
  registerInteractions() {
    document.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;

      if (!target.classList.contains("partner-btn")) return;

      const label = target.dataset.call;

      const call = (this.plugin.settings as any).calls.find(
        (c: any) => c.label === label
      );

      if (!call) return;

      const file = this.plugin.app.vault.getAbstractFileByPath(call.source);
      if (!(file instanceof TFile)) return;

      const content = await this.plugin.app.vault.read(file);

      // Simple example: open content in modal
      const modal = new (class extends (window as any).Modal {
        content: string;
        constructor(app: any, content: string) {
          super(app);
          this.content = content;
        }
        onOpen() {
          this.contentEl.createEl("pre", { text: this.content });
        }
      })(this.plugin.app, content);

      modal.open();
    });
  }
}