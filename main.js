"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ObsidianPartner
});
module.exports = __toCommonJS(main_exports);
var import_obsidian10 = require("obsidian");

// src/core/EventBus.ts
var EventBus = class {
  constructor() {
    this.events = /* @__PURE__ */ new Map();
  }
  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, /* @__PURE__ */ new Set());
    }
    this.events.get(event).add(handler);
  }
  off(event, handler) {
    var _a;
    (_a = this.events.get(event)) == null ? void 0 : _a.delete(handler);
  }
  emit(event, ...args) {
    var _a;
    (_a = this.events.get(event)) == null ? void 0 : _a.forEach((handler) => handler(...args));
  }
  clear() {
    this.events.clear();
  }
};

// src/core/CorePlugin.ts
var import_view2 = require("@codemirror/view");

// src/core/managers/ModuleManager.ts
var ModuleManager = class {
  constructor(events) {
    this.events = events;
    this.modules = /* @__PURE__ */ new Map();
  }
  registerModule(module2) {
    this.modules.set(module2.id, module2);
    module2.init(this);
  }
  getModule(id) {
    return this.modules.get(id);
  }
  enable(id) {
    var _a;
    const mod = this.modules.get(id);
    (_a = mod == null ? void 0 : mod.onEnable) == null ? void 0 : _a.call(mod);
  }
  disable(id) {
    var _a;
    const mod = this.modules.get(id);
    (_a = mod == null ? void 0 : mod.onDisable) == null ? void 0 : _a.call(mod);
  }
};

// src/core/managers/SnippetManager.ts
var import_obsidian = require("obsidian");
var SnippetManager = class {
  constructor(app) {
    this.app = app;
    this.registry = /* @__PURE__ */ new Map();
  }
  // =========================
  // PUBLIC API
  // =========================
  async loadAll(calls, baseFolder) {
    console.log("[Snippets] Base folder:", baseFolder);
    for (const call of calls) {
      const key = call.source || call.id;
      if (!key) {
        console.warn("[Snippets] \u274C Missing source/id:", call);
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
        console.log(`[Snippets] \u2705 Loaded: ${key}`);
      }
    }
  }
  get(key) {
    return this.registry.get(key);
  }
  getAllKeys() {
    return Array.from(this.registry.keys());
  }
  // =========================
  // INTERNAL
  // =========================
  async loadOne(filePath) {
    console.log("[Snippets] Attempt load:", filePath);
    const abstract = this.app.vault.getAbstractFileByPath(filePath);
    if (!abstract) {
      console.warn("[Snippets] \u274C File not found:", filePath);
      return null;
    }
    if (!(abstract instanceof import_obsidian.TFile)) {
      console.warn("[Snippets] \u274C Not a file:", filePath);
      return null;
    }
    const content = await this.app.vault.read(abstract);
    console.log("[Snippets] \u{1F4C4} Preview:");
    console.log(content.slice(0, 200));
    try {
      const module2 = { exports: {} };
      const wrapped = new Function(
        "module",
        "exports",
        "require",
        "app",
        content
      );
      wrapped(module2, module2.exports, require, this.app);
      console.log("[Snippets] \u2705 Compiled:", filePath);
      return module2.exports;
    } catch (err) {
      console.error("[Snippets] \u274C Compile failed:", filePath, err);
      return null;
    }
  }
};

// src/modules/entryAnchor/index.ts
var EntryAnchorModule = class {
  constructor() {
    this.id = "entry-anchor";
    this.handleFileOpen = (file) => {
      console.log("EntryAnchor reacting to file-open:", file);
    };
  }
  init(core) {
    this.core = core;
    this.core.events.on("file-open", this.handleFileOpen);
  }
  onEnable() {
    console.log("EntryAnchor enabled");
  }
  onDisable() {
    console.log("EntryAnchor disabled");
  }
};

// src/modules/projectBridge/index.ts
var ProjectBridgeModule = class {
  constructor() {
    this.id = "project-bridge";
    this.onTaskCreated = (task) => {
      console.log("ProjectBridge saw task:", task);
    };
  }
  init(core) {
    core.events.on("task-created", this.onTaskCreated);
  }
};

// src/modules/buttons/buttons.ts
var import_view = require("@codemirror/view");
var import_state = require("@codemirror/state");
var PartnerButtonWidget = class extends import_view.WidgetType {
  constructor(el, readingMode) {
    super();
    this.el = el;
    this.readingMode = readingMode;
  }
  toDOM() {
    if (this.readingMode) {
      const span = document.createElement("span");
      span.textContent = this.el.textContent || "Button";
      span.style.color = "#666";
      span.style.cursor = "default";
      return span;
    }
    return this.el;
  }
  ignoreEvent() {
    return this.readingMode;
  }
};
function createButtonPlugin(resolver) {
  return import_view.ViewPlugin.fromClass(
    class {
      constructor(view) {
        this.decorations = this.buildDecorations(view);
      }
      update(update) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }
      buildDecorations(view) {
        var _a;
        const builder = new import_state.RangeSetBuilder();
        const isReadingMode = !((_a = view.contentDOM) == null ? void 0 : _a.isContentEditable);
        const regex = /`partner-(btn)-([a-zA-Z0-9_-]+)`/g;
        for (let { from, to } of view.visibleRanges) {
          const text = view.state.doc.sliceString(from, to);
          let match;
          while ((match = regex.exec(text)) !== null) {
            const [full, type, label] = match;
            const start = from + match.index;
            const end = start + full.length;
            const editor = view;
            const buttonEl = resolver.resolve(type, label, {
              from: start,
              to: end
            });
            if (!buttonEl)
              continue;
            const deco = import_view.Decoration.replace({
              widget: new PartnerButtonWidget(buttonEl, isReadingMode),
              inclusive: false
            });
            builder.add(start, end, deco);
          }
        }
        return builder.finish();
      }
    },
    {
      decorations: (v) => v.decorations
    }
  );
}
function registerEditorButtons(plugin, resolver) {
  const extension = createButtonPlugin(resolver);
  plugin.registerEditorExtension(extension);
}

// src/modules/buttons/markdownRenderer.ts
function registerMarkdownButtons(plugin, resolver) {
  plugin.registerMarkdownPostProcessor(
    (element, ctx) => {
      const codeBlocks = element.querySelectorAll("code");
      codeBlocks.forEach((code) => {
        var _a;
        const text = (_a = code.textContent) == null ? void 0 : _a.trim();
        if (!text)
          return;
        const match = text.match(
          /^partner-([a-zA-Z0-9_-]+)$/
        );
        if (!match)
          return;
        const name = match[1];
        console.log("[Markdown] Resolving button:", name);
        const button = resolver.createButton(name, { source: ctx.sourcePath });
        if (!button) {
          console.warn("[Markdown] Button not found:", name);
          return;
        }
        code.replaceWith(button);
      });
    }
  );
}

// src/modules/calls/callRegistry.ts
var CallRegistry = class _CallRegistry {
  constructor() {
    this.calls = /* @__PURE__ */ new Map();
  }
  getActive() {
    return Array.from(this.calls.values()).filter((call) => call.enabled);
  }
  logActiveCalls() {
    console.group("Active Partner Calls");
    const active = this.getActive();
    console.log("Active Count:", active.length);
    console.table(active);
    console.groupEnd();
  }
  load(calls) {
    this.calls.clear();
    for (const call of calls) {
      const key = this.buildKey(call);
      this.calls.set(key, call);
    }
    this.logRegistryState("LOAD");
  }
  register(call) {
    const key = this.buildKey(call);
    this.calls.set(key, call);
    this.logRegistryState("REGISTER", call);
  }
  unregister(call) {
    const key = this.buildKey(call);
    this.calls.delete(key);
    this.logRegistryState("UNREGISTER", call);
  }
  toggleEnabled(call, enabled) {
    const key = this.buildKey(call);
    const existing = this.calls.get(key);
    if (!existing)
      return;
    existing.enabled = enabled != null ? enabled : !existing.enabled;
    this.calls.set(key, existing);
    this.logRegistryState("TOGGLE_ENABLED", existing);
  }
  get(id) {
    return this.calls.get(id);
  }
  getAll() {
    return Array.from(this.calls.values());
  }
  buildKey(call) {
    return `partner-${call.type}-${call.label}`;
  }
  logRegistryState(action, call) {
    console.group(_CallRegistry, action);
    if (call) {
      console.log("Changed Call:", action);
    }
    console.log("Total Calls:", this.calls.size);
    console.log("All Calls:", Array.from(this.calls.values()));
    console.groupEnd();
  }
};

// src/modules/buttons/buttonResolver.ts
var ButtonResolver = class {
  constructor(callRegistry, snippetManager, app, plugin) {
    this.callRegistry = callRegistry;
    this.snippetManager = snippetManager;
    this.app = app;
    this.plugin = plugin;
  }
  //helpers
  buildContext() {
    var _a, _b;
    const { Notice: Notice3, Modal: Modal2, TFile: TFile4 } = require("obsidian");
    const file = this.app.workspace.getActiveFile();
    let frontmatter = {};
    if (file) {
      const cache = this.app.metadataCache.getFileCache(file);
      frontmatter = (_a = cache == null ? void 0 : cache.frontmatter) != null ? _a : {};
    }
    return {
      app: this.app,
      plugin: this.plugin,
      obsidian: {
        Notice: Notice3,
        Modal: Modal2,
        TFile: TFile4
      },
      editor: (_b = this.app.workspace.activeEditor) == null ? void 0 : _b.editor,
      utils: {
        // future helpers
      },
      state: {
        // shared runtime state later
      },
      note: file,
      frontmatter,
      from: void 0,
      to: void 0
    };
  }
  resolve(type, label, extraContext = {}) {
    console.log("[Resolver] Resolving call:", type, label);
    const call = this.callRegistry.get(
      `partner-${type}-${label}`
    );
    if (!call) {
      console.warn(
        "Call not found:",
        `partner-${type}-${label}`
      );
      return null;
    }
    if (!call.enabled)
      return null;
    return this.runSnippet(call, extraContext);
  }
  runSnippet(call, extraContext = {}) {
    var _a;
    try {
      console.log("Available snippets:", this.snippetManager.getAllKeys());
      const fn = this.snippetManager.get(call.source);
      console.log("Running snippet:", call.source);
      if (!fn) {
        console.warn("[Resolver] Missing snippet:", call.source);
        return null;
      }
      const editor = (_a = this.app.workspace.activeEditor) == null ? void 0 : _a.editor;
      const context = {
        ...this.buildContext(),
        ...extraContext,
        editor,
        from: editor == null ? void 0 : editor.offsetToPos(extraContext.from),
        to: editor == null ? void 0 : editor.offsetToPos(extraContext.to),
        call
      };
      const action = fn(context);
      console.log("[Resolver] Action returned:", action);
      if (!action) {
        console.warn("[Resolver] No action returned:", call.source);
        return null;
      }
      console.log("[Resolver] INPUT:", call.source);
      console.log("[Resolver] FN CHECK:", {
        type: typeof fn,
        fn
      });
      return this.buildButton(call, action, context);
    } catch (err) {
      console.error("Snippet execution failed:", call.label, err);
      return null;
    }
  }
  buildButton(call, action, context) {
    var _a, _b;
    const button = document.createElement("button");
    button.textContent = (_b = (_a = action.label) != null ? _a : call.label) != null ? _b : call.source;
    if (action.onClick) {
      button.onclick = () => {
        action.onClick(context);
      };
    }
    if (action.className) {
      button.className = action.className;
    }
    if (action.tooltip) {
      button.title = action.tooltip;
    }
    return button;
  }
};

// src/modules/commands/createPmModalButton.ts
var import_obsidian4 = require("obsidian");

// src/modules/commands/projectSuggestModal.ts
var import_obsidian2 = require("obsidian");
var ProjectSuggestModal = class extends import_obsidian2.SuggestModal {
  constructor(app, projects, onSelect) {
    super(app);
    this.projects = projects;
    this.onSelect = onSelect;
  }
  getSuggestions(inputStr) {
    return this.projects.filter(
      (project) => project.toLowerCase().includes(inputStr.toLowerCase())
    );
  }
  renderSuggestion(project, el) {
    el.createEl("div", {
      text: project.replace(".md", "")
    });
  }
  onChooseSuggestion(project) {
    this.onSelect(project);
  }
};

// src/modules/properties/pmLink.ts
var import_obsidian3 = require("obsidian");
async function insertPMLink(app, projectPath) {
  const file = app.workspace.getActiveFile();
  if (!file) {
    new import_obsidian3.Notice("No active note.");
    return;
  }
  const fileName = projectPath.split("/").pop();
  await app.fileManager.processFrontMatter(
    file,
    (frontmatter) => {
      frontmatter.pmLink = `${fileName}`;
    }
  );
  new import_obsidian3.Notice("PM Link added.");
}

// src/editor/insertText.ts
function insertAtCursor(editor, text) {
  const cursor = editor.getCursor();
  editor.replaceRange(
    text,
    cursor
  );
}

// src/modules/commands/createPmModalButton.ts
async function createPMModalButton(app) {
  var _a, _b, _c;
  const pmPlugin = (_b = (_a = app.plugins) == null ? void 0 : _a.plugins) == null ? void 0 : _b["project-manager"];
  if (!pmPlugin) {
    new import_obsidian4.Notice("Project Manager plugin is not enabled.");
    return;
  }
  const cache = pmPlugin.store.projectCache;
  const projects = Array.from(cache.keys()).filter((key) => typeof key === "string");
  const selected = await new Promise((resolve) => {
    const modal = new ProjectSuggestModal(
      app,
      projects,
      resolve
    );
    modal.open();
  });
  if (!selected)
    return;
  await insertPMLink(
    app,
    selected
  );
  const editor = (_c = app.workspace.activeEditor) == null ? void 0 : _c.editor;
  if (!editor) {
    new import_obsidian4.Notice("No active editor.");
    return;
  }
  insertAtCursor(
    editor,
    "`partner-btn-pm-modal`"
  );
  await insertPMLink(app, selected);
}

// src/modules/commands/index.ts
function registerCommands(plugin) {
  plugin.addCommand({
    id: "create-pm-modal-button",
    name: "Create PM Modal Button",
    callback: () => {
      createPMModalButton(plugin.app);
    }
  });
}

// src/core/CorePlugin.ts
var CorePlugin = class {
  constructor() {
    // systems
    this.callRegistry = new CallRegistry();
    this.events = new EventBus();
    this.modules = new ModuleManager(this.events);
  }
  init(plugin) {
    console.log("[Core] init");
    this.plugin = plugin;
    this.app = plugin.app;
    this.callRegistry.load(
      this.plugin.settings.calls
    );
  }
  async onload() {
    const partner = this.plugin.settings;
    console.log("[Core] System v2 loading...");
    try {
      console.log("[Core] Loading snippets...");
      this.snippetManager = new SnippetManager(this.plugin.app);
      await this.snippetManager.loadAll(
        partner.calls,
        partner.snippetFolder
      );
      this.buttonResolver = new ButtonResolver(
        this.callRegistry,
        this.snippetManager,
        // additional params expected by constructor
        this.plugin.app,
        this.plugin
      );
      registerEditorButtons(
        this.plugin,
        this.buttonResolver
      );
      registerMarkdownButtons(
        this.plugin,
        this.buttonResolver
      );
      registerCommands(this.plugin);
    } catch (err) {
      console.error("[Core] BUTTON SYSTEM CRASHED", err);
    }
    this.plugin.registerEditorExtension(
      (() => {
        try {
          return import_view2.ViewPlugin.fromClass(class {
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
    console.log("[Core] Registering modules");
    this.modules.registerModule(new EntryAnchorModule());
    this.modules.registerModule(new ProjectBridgeModule());
    this.events.emit("core:loaded");
    console.log("[Core] Loaded successfully");
  }
  onunload() {
    console.log("[Core] Unloading");
    this.events.clear();
  }
};

// src/settings/settingsTab.ts
var import_obsidian5 = require("obsidian");
async function renderIcon(app, containerEl, iconText) {
  await import_obsidian5.MarkdownRenderer.render(
    app,
    iconText,
    // ":sjb_obsidian:"
    containerEl,
    "",
    // source path
    new import_obsidian5.Component()
  );
}
var CreateCallModal = class extends import_obsidian5.Modal {
  constructor(app, parent) {
    super(app);
    this.parent = parent;
  }
  generateId() {
    return "ptr" + Math.random().toString(36).substring(2, 8);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl("h2", { text: "Create New Call" });
    new import_obsidian5.Setting(contentEl).setName("Call Label").addText((text) => {
      text.setPlaceholder("Call Label").onChange((value) => {
        this.parent.newCallLabel = value;
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Type").addDropdown((drop) => {
      drop.addOption("btn", "Button").addOption("vw", "View").setValue(this.parent.newCallType).onChange((value) => {
        this.parent.newCallType = value;
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Source").addDropdown((drop) => {
      drop.addOption("", "Select source");
      this.parent.getAvailableSources().forEach((source) => {
        drop.addOption(source, source);
      });
      drop.onChange((value) => {
        this.parent.newCallSource = value;
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Description").setDesc("Optional").addTextArea((text) => {
      text.setPlaceholder("What does this call do?").onChange((value) => {
        this.parent.newCallDescription = value;
      });
    });
    new import_obsidian5.Setting(contentEl).setName("Icon").setDesc("Optional").addTextArea(
      (text) => {
        text.setPlaceholder("Iconify shortcode").onChange((value) => {
          this.parent.newCallIcon = value;
        });
      }
    );
    new import_obsidian5.Setting(contentEl).addButton((btn) => {
      btn.setButtonText("Add Call").setCta().onClick(async () => {
        if (!this.parent.newCallSource) {
          console.warn("Partner Call requires a source.");
          return;
        }
        const cleanLabel = this.parent.newCallLabel.toLowerCase().replace(/\s+/g, "-");
        const newCall = {
          id: this.generateId(),
          label: cleanLabel,
          type: this.parent.newCallType,
          source: this.parent.newCallSource,
          enabled: true
          // default ON
        };
        if (this.parent.newCallDescription) {
          newCall.description = this.parent.newCallDescription;
        }
        if (this.parent.newCallIcon) {
          newCall.icon = this.parent.newCallIcon;
        }
        if (this.parent.newCallDescription) {
          newCall.description = this.parent.newCallDescription;
        }
        this.parent.plugin.settings.calls.push(newCall);
        await this.parent.plugin.SaveSettings();
        this.parent.newCallLabel = "";
        this.parent.newCallSource = "";
        this.parent.newCallType = "btn";
        this.parent.newCallDescription = "";
        this.parent.newCallIcon = "";
        this.parent.display();
        this.close();
      });
    });
  }
  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
};
var PartnerSettingTab = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.newCallLabel = "";
    this.newCallType = "btn";
    this.newCallSource = "";
    this.newCallDescription = "";
    this.newCallIcon = "";
    this.uncalledSnippets = [];
    this.plugin = plugin;
  }
  getAvailableSources() {
    var _a;
    const folder = this.plugin.settings.snippetFolder;
    const files = this.app.vault.getFiles().filter(
      (file) => file.path.startsWith(folder)
    );
    const used = ((_a = this.plugin.settings.calls) != null ? _a : []).map((call) => call.source).filter(Boolean);
    return files.filter(
      (file) => !used.includes(file.basename)
    ).map(
      (file) => file.basename
    );
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl(
      "h2",
      {
        text: "Obsidian Partner"
      }
    );
    new import_obsidian5.Setting(containerEl).setName("Snippet Folder").setDesc(
      "Folder containing Partner JS snippets"
    ).addText((text) => {
      text.setPlaceholder(
        "Partner Snippets"
      ).setValue(
        this.plugin.settings.snippetFolder
      ).onChange(async (value) => {
        this.plugin.settings.snippetFolder = value;
        await this.plugin.SaveSettings();
      });
    });
    containerEl.createEl("h3", { text: "Partner Calls" });
    this.renderCalls(containerEl);
  }
  renderCalls(containerEl) {
    this.renderExistingCalls(containerEl);
    this.renderNewCall(containerEl);
    this.renderUncalledSnippets(containerEl);
  }
  renderExistingCalls(containerEl) {
    var _a;
    new import_obsidian5.Setting(containerEl).setName("Existing Calls").setDesc("Calls registered in the plugin");
    const list = containerEl.createDiv({ cls: "call-manager-list" });
    const calls = (_a = this.plugin.settings.calls) != null ? _a : [];
    if (calls.length === 0) {
      list.createEl("p", {
        text: "No calls created yet."
      });
      return;
    }
    const listContainer = list.createDiv("call-manager-container");
    calls.forEach((call, idx) => {
      const description = call.description || call.source;
      this.renderRow(
        listContainer,
        {
          label: `partner-${call.type}-${call.label}`,
          description,
          enabled: call.enabled,
          onToggle: async (value) => {
            this.plugin.callRegistry.toggleEnabled(call, value);
            this.plugin.callRegistry.logActiveCalls();
            await this.plugin.SaveSettings();
          },
          onDelete: async () => {
            calls.splice(idx, 1);
            await this.plugin.SaveSettings();
            this.display();
          }
        }
      );
    });
  }
  renderNewCall(containerEl) {
    new import_obsidian5.Setting(containerEl).setName("Add a New Call").addButton((btn) => {
      btn.setButtonText("Create New Call").setCta().onClick(() => {
        new CreateCallModal(this.app, this).open();
      });
    });
  }
  renderUncalledSnippets(containerEl) {
    var _a;
    new import_obsidian5.Setting(containerEl).setName("Uncalled Snippets").setDesc("Refresh to scan the snippet folder").addButton((btn) => {
      btn.setButtonText("Refresh").onClick(() => {
        this.uncalledSnippets = this.getAvailableSources();
        this.display();
      });
    });
    const snippets = (_a = this.uncalledSnippets) != null ? _a : [];
    const container = containerEl.createDiv("call-manager-container");
    if (snippets.length === 0) {
      container.createEl("p", {
        text: "No unused snippets found."
      });
      return;
    }
    snippets.forEach((snippet) => {
      this.renderRow(container, {
        label: snippet
        //no delete button  
      });
    });
  }
  renderRow(rowEl, data) {
    var _a;
    const row = rowEl.createDiv("call-manager-row");
    const iconEl = row.createDiv();
    if (data.icon) {
      void renderIcon(this.app, iconEl, data.icon);
    }
    const info = row.createDiv("call-manager-info");
    if (data.icon) {
      info.createDiv({
        text: data.icon,
        cls: "call-manager-icon"
      });
    }
    info.createDiv({
      text: data.label,
      cls: "partner-btn-callLabel"
    });
    if (data.description) {
      info.createDiv({
        text: data.description,
        cls: "call-manager-description"
      });
    }
    const controls = row.createDiv("call-manager-controls");
    if (data.onToggle !== void 0) {
      const toggle = controls.createEl("input", {
        type: "checkbox"
      });
      toggle.checked = (_a = data.enabled) != null ? _a : true;
      toggle.onchange = async () => {
        var _a2;
        await ((_a2 = data.onToggle) == null ? void 0 : _a2.call(data, toggle.checked));
      };
    }
    if (data.onDelete) {
      const deleteBtn = controls.createEl("button", {
        text: "Delete",
        cls: "mod-warning"
      });
      deleteBtn.onclick = async () => {
        var _a2;
        await ((_a2 = data.onDelete) == null ? void 0 : _a2.call(data));
      };
    }
  }
};

// src/settings/settings.ts
var DEFAULT_SETTINGS = {
  snippetFolder: "Partner Snippets",
  calls: []
};

// src/callEngine.ts
var import_obsidian6 = require("obsidian");
var import_obsidian7 = require("obsidian");
var CallEngine = class {
  constructor(plugin) {
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
        if (!match)
          continue;
        const [, type, label] = match;
        const call = this.plugin.settings.calls.find(
          (c) => c.type === type && c.label === label
        );
        if (!call)
          continue;
        const container = document.createElement("div");
        container.className = "partner-view";
        await this.renderCallInto(container, call, ctx);
        codeEl.replaceWith(container);
      }
    });
  }
  // Resolve call → actual content
  async renderCallInto(container, call, ctx) {
    const file = this.plugin.app.vault.getAbstractFileByPath(call.source);
    if (!(file instanceof import_obsidian6.TFile)) {
      container.setText(`Missing source: ${call.source}`);
      return;
    }
    const content = await this.plugin.app.vault.read(file);
    const isJS = call.source.endsWith(".js");
    if (call.type === "vw" && isJS) {
      await this.executeViewScript(container, content);
      return;
    }
    if (call.type === "vw") {
      await import_obsidian7.MarkdownRenderer.renderMarkdown(
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
  async executeViewScript(container, content) {
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
      const target = e.target;
      if (!target.classList.contains("partner-btn"))
        return;
      const label = target.dataset.call;
      const call = this.plugin.settings.calls.find(
        (c) => c.label === label
      );
      if (!call)
        return;
      const file = this.plugin.app.vault.getAbstractFileByPath(call.source);
      if (!(file instanceof import_obsidian6.TFile))
        return;
      const content = await this.plugin.app.vault.read(file);
      const modal = new class extends window.Modal {
        constructor(app, content2) {
          super(app);
          this.content = content2;
        }
        onOpen() {
          this.contentEl.createEl("pre", { text: this.content });
        }
      }(this.plugin.app, content);
      modal.open();
    });
  }
};

// src/modules/calls/getProjectData.ts
var import_obsidian9 = require("obsidian");

// src/modules/calls/projectPickerModal.ts
var import_obsidian8 = require("obsidian");
var ProjectPickerModal = class extends import_obsidian8.FuzzySuggestModal {
  constructor(app, projects, onSelect) {
    super(app);
    this.projects = projects;
    this.onSelect = onSelect;
  }
  getItems() {
    return this.projects;
  }
  getItemText(item) {
    return item;
  }
  onChooseItem(item) {
    this.onSelect(item);
  }
};

// src/modules/calls/getProjectData.ts
function getProjectData(app) {
  return new Promise((resolve) => {
    var _a, _b;
    const pm = (_a = app == null ? void 0 : app.plugins) == null ? void 0 : _a.plugins["project-manager"];
    const cache = (_b = pm == null ? void 0 : pm.store) == null ? void 0 : _b.projectCache;
    if (!cache) {
      resolve(null);
      return;
    }
    const projects = Array.from(cache.keys()).map(
      (path) => path.replace(/^Projects\//, "").replace(/\.md$/, "")
    );
    console.log("Projects found:", projects);
    new ProjectPickerModal(
      app,
      projects,
      async (projectName) => {
        var _a2, _b2;
        const projectFile = app.vault.getAbstractFileByPath(`Projects/${projectName}.md`);
        if (!(projectFile instanceof import_obsidian9.TFile)) {
          resolve(null);
          return;
        }
        const projectCache = app.metadataCache.getFileCache(projectFile);
        const poaLink = (_a2 = projectCache == null ? void 0 : projectCache.frontmatter) == null ? void 0 : _a2.description;
        if (!poaLink) {
          resolve(null);
          return;
        }
        const poaFile = app.metadataCache.getFirstLinkpathDest(poaLink, projectFile.path);
        if (!poaFile) {
          resolve(null);
          return;
        }
        const poaData = (_b2 = app.metadataCache.getFileCache(poaFile)) == null ? void 0 : _b2.frontmatter;
        resolve({
          projectName,
          poaPath: poaFile.path,
          idTag: poaData == null ? void 0 : poaData.idTag,
          projectTitle: poaData == null ? void 0 : poaData.projectTitle
        });
      }
    ).open();
  });
}

// src/main.ts
var ObsidianPartner = class extends import_obsidian10.Plugin {
  constructor() {
    super(...arguments);
    this.core = new CorePlugin();
  }
  async onload() {
    var _a, _b, _c, _d;
    console.log("Loading Obsidian Partner ...");
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
    registerCommands(this);
    this.api = { getProjectData: () => getProjectData(this.app) };
    this.addCommand({
      id: "get-project-data",
      name: "Get Project Data",
      callback: async () => {
        const data = await getProjectData(this.app);
        console.log(data);
      }
    });
    this.callRegistry = new CallRegistry();
    this.callRegistry.load(this.settings.calls);
    (_b = (_a = this.settings).calls) != null ? _b : _a.calls = [];
    (_d = (_c = this.settings).snippetFolder) != null ? _d : _c.snippetFolder = DEFAULT_SETTINGS.snippetFolder;
    this.addSettingTab(
      new PartnerSettingTab(this.app, this)
    );
    this.callEngine = new CallEngine(this);
    this.callEngine.init();
    this.core.init(this);
    await this.core.onload();
  }
  async SaveSettings() {
    await this.saveData(this.settings);
    this.callRegistry.load(this.settings.calls);
  }
  onunload() {
    this.core.onunload();
    console.log("Obsidian Partner unloaded");
  }
};
//# sourceMappingURL=main.js.map
