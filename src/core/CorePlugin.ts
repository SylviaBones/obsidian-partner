// CorePlugin.ts

import { Plugin as ObsidianPlugin, TFile } from "obsidian";
import { EventBus } from "./EventBus";
import { ViewPlugin } from "@codemirror/view";

//managers
import { ModuleManager } from "./managers/ModuleManager";
import { SnippetManager } from "./managers/SnippetManager";

declare const require: any;

// modules
import { EntryAnchorModule } from "../modules/entryAnchor";
import { ProjectBridgeModule } from "../modules/projectBridge";

// button module
import { registerEditorButtons } from "../modules/buttons/buttons";
import { registerMarkdownButtons } from "../modules/buttons/markdownRenderer";
import { CallRegistry } from "../modules/calls/callRegistry";
import { ButtonResolver } from "../modules/buttons/buttonResolver";

//command module
import { registerCommands } from "../modules/commands";


interface PartnerPlugin extends ObsidianPlugin {
  settings: {
    calls: any;
    // optional folder path (relative to vault) where snippets are stored
    snippetFolder?: string;
  };
}

export class CorePlugin {
  private plugin!: PartnerPlugin;
  private app!: any;

  // systems
  private callRegistry: CallRegistry = new CallRegistry();
  private buttonResolver!: ButtonResolver;
  private snippetManager!: SnippetManager;

  events = new EventBus();
  modules = new ModuleManager(this.events);

  init(plugin: PartnerPlugin) {
    console.log("[Core] init");

    this.plugin = plugin;
    this.app = plugin.app;

    // load calls ONCE here
    this.callRegistry.load(
      this.plugin.settings.calls
    );
  }

  async onload() {
    const partner = this.plugin.settings
    console.log("[Core] System v2 loading...");

    try {
      console.log("[Core] Loading snippets...");

      this.snippetManager = new SnippetManager(this.plugin.app);

      await this.snippetManager.loadAll(
        partner.calls,
        partner.snippetFolder
      );

      // resolver connects calls + snippets
      this.buttonResolver =
        new ButtonResolver(
          this.callRegistry,
          this.snippetManager,
          // additional params expected by constructor
          this.plugin.app,
          this.plugin
        );


      // editor uses resolver ONLY
      registerEditorButtons(
        this.plugin,
        this.buttonResolver
      );

      // TEMP: keep markdown working (will migrate later)
      registerMarkdownButtons(
        this.plugin,
        this.buttonResolver
      );

      registerCommands(this.plugin);


    } catch (err) {
      console.error("[Core] BUTTON SYSTEM CRASHED", err);
    }

    // --- DEBUG ---
    this.plugin.registerEditorExtension(
      (() => {
        try {
          return ViewPlugin.fromClass(class {
            constructor() {
              console.log("[Core] Minimal plugin works");
            }
          });
        } catch (e) {
          console.error("[Core] Minimal plugin failed", e);
          return [];
        }
      })()
    );

    // --- MODULES ---
    console.log("[Core] Registering modules");

    this.modules.registerModule(new EntryAnchorModule());
    this.modules.registerModule(new ProjectBridgeModule());

    // --- EVENT ---
    this.events.emit("core:loaded");

    console.log("[Core] Loaded successfully");
  }

  onunload() {
    console.log("[Core] Unloading");
    this.events.clear();
  }
}
