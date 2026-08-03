import {
  App,
  PluginSettingTab,
  Setting,
  Modal,
  TextComponent,
  TextAreaComponent,
  MarkdownRenderer,
  Component
} from "obsidian";

import ObsidianPartner from "../main";
import { CallType, PartnerCall } from "../modules/calls/callTypes";


async function renderIcon(app: App, containerEl: HTMLElement, iconText: string) {
  await MarkdownRenderer.render(
    app,
    iconText, // ":sjb_obsidian:"
    containerEl,
    "", // source path
    new Component()
  );
}

class CreateCallModal extends Modal {
  parent: PartnerSettingTab;

  constructor(app: App, parent: PartnerSettingTab) {
    super(app);
    this.parent = parent;
  }

  generateId(): string {
    return "ptr" + Math.random().toString(36).substring(2, 8);
  }

  onOpen() {
    const { contentEl } = this;

    contentEl.empty();
    contentEl.createEl("h2", { text: "Create New Call" });

    // --- Label ---
    new Setting(contentEl)
      .setName("Call Label")
      .addText(text => {
        text
          .setPlaceholder("Call Label")
          .onChange(value => {
            this.parent.newCallLabel = value;
          });
      });

    // --- Type ---
    new Setting(contentEl)
      .setName("Type")
      .addDropdown(drop => {
        drop
          .addOption("btn", "Button")
          .addOption("vw", "View")
          .setValue(this.parent.newCallType)
          .onChange(value => {
            this.parent.newCallType = value as CallType;
          });
      });

    // --- Source ---
    new Setting(contentEl)
      .setName("Source")
      .addDropdown(drop => {
        drop.addOption("", "Select source");

        this.parent.getAvailableSources().forEach(source => {
          drop.addOption(source, source);
        });

        drop.onChange(value => {
          this.parent.newCallSource = value;
        });
      });

    // --- Description ---
    new Setting(contentEl)
      .setName("Description")
      .setDesc("Optional")
      .addTextArea(text => {
        text
          .setPlaceholder("What does this call do?")
          .onChange(value => {
            this.parent.newCallDescription = value;
          });
      });

    new Setting(contentEl)
      .setName("Icon")
      .setDesc("Optional")
      .addTextArea(text => {
        text
          .setPlaceholder("Iconify shortcode")
          .onChange(value => {
            this.parent.newCallIcon = value;
          })
      }

      )

    // --- Save Button ---
    new Setting(contentEl)
      .addButton(btn => {
        btn
          .setButtonText("Add Call")
          .setCta()
          .onClick(async () => {
            if (!this.parent.newCallSource) {
              console.warn("Partner Call requires a source.");
              return;
            }

            const cleanLabel = this.parent.newCallLabel
              .toLowerCase()
              .replace(/\s+/g, "-");

            const newCall: any = {
              id: this.generateId(),

              label: cleanLabel,
              type: this.parent.newCallType,
              source: this.parent.newCallSource,

              enabled: true, // default ON
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

            // reset state
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
}

export class PartnerSettingTab extends PluginSettingTab {
  plugin: ObsidianPartner;
  newCallLabel = "";
  newCallType: CallType = "btn";
  newCallSource = "";
  newCallDescription = "";
  newCallIcon = "";
    
  constructor(
    app: App,
    plugin: ObsidianPartner
  ) {
    super(app, plugin);
    this.plugin = plugin;
  }

  getAvailableSources() {
    const folder =
      this.plugin.settings.snippetFolder;

    const files =
      this.app.vault
        .getFiles()
        .filter(file =>
          file.path.startsWith(folder)
        );

    const used =
      (this.plugin.settings.calls ?? [])
        .map(call => call.source)
        .filter(Boolean);

    return files
      .filter(file =>
        !used.includes(file.basename)
      )
      .map(file =>
        file.basename
      );
  }

  display() {
    const {containerEl} = this;
    containerEl.empty();
    containerEl.createEl(
      "h2",
      {
        text: "Obsidian Partner"
      }
    );

    // Snippet folder
    new Setting(containerEl)
      .setName("Snippet Folder")
      .setDesc(
        "Folder containing Partner JS snippets"
      )
      .addText(text => {

        text
          .setPlaceholder(
            "Partner Snippets"
          )
          .setValue(
            this.plugin.settings.snippetFolder
          )
          .onChange(async value => {
            this.plugin.settings.snippetFolder =
              value;
            await this.plugin.SaveSettings();
          });
      });

    // Calls section
    containerEl.createEl("h3", {text: "Partner Calls"});
    this.renderCalls(containerEl);
  }

  renderCalls(containerEl: HTMLElement) {
    this.renderExistingCalls(containerEl);
    this.renderNewCall(containerEl);
    this.renderUncalledSnippets(containerEl);
  }

  renderExistingCalls(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Existing Calls")
      .setDesc("Calls registered in the plugin");

    const list = containerEl.createDiv({cls: "call-manager-list"});
    const calls = this.plugin.settings.calls ?? [];

    if (calls.length === 0) {
      list.createEl("p", {
        text: "No calls created yet."
      });
      return;
    }

    const listContainer = list.createDiv("call-manager-container");

    calls.forEach((call, idx) => {
      const description = (call as any).description || call.source;

      this.renderRow(
        listContainer, {
          label: `partner-${call.type}-${call.label}`,
          description,
          enabled: call.enabled,

          onToggle: async (value) => {
            this.plugin.callRegistry.toggleEnabled(call, value);
            this.plugin.callRegistry.logActiveCalls()
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

  renderNewCall(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Add a New Call")
      .addButton(btn => {
        btn
          .setButtonText("Create New Call")
          .setCta()
          .onClick(() => {
            new CreateCallModal(this.app, this).open();
          });
      });
  }


  uncalledSnippets:string[] = [];

  renderUncalledSnippets(containerEl: HTMLElement) {
    new Setting(containerEl)
      .setName("Uncalled Snippets")
      .setDesc("Refresh to scan the snippet folder")
      .addButton(btn => {
        btn
          .setButtonText("Refresh")
          .onClick(() => {
            this.uncalledSnippets =
              this.getAvailableSources();
            this.display();
          });
      });

      const snippets = this.uncalledSnippets ?? [];

      const container = containerEl.createDiv("call-manager-container");

      if (snippets.length === 0) {
        container.createEl("p", {
          text: "No unused snippets found."
        });
        return;
      }

      snippets.forEach((snippet) => {
        this.renderRow(container,{
          label: snippet
        //no delete button  
        });
      })
  }

  renderRow(
    rowEl: HTMLElement,
    data: {
      call?: PartnerCall;
      icon?: string;
      label: string;
      description?: string;
      enabled?: boolean;
      onToggle?: (value: boolean) => Promise<void> | void;
      onDelete?: () => Promise<void> | void;
    }
  ) {
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

    // Optional description layer
    if (data.description) {
      info.createDiv({
        text: data.description,
        cls: "call-manager-description"
      });
    }

    const controls = row.createDiv("call-manager-controls");
    if (data.onToggle !== undefined) {
      const toggle = controls.createEl("input", {
        type: "checkbox"
      });

      toggle.checked = data.enabled ?? true;

      toggle.onchange = async () => {
        await data.onToggle?.(toggle.checked);
      };
    }

    if (data.onDelete) {
      const deleteBtn = controls.createEl("button", {
        text: "Delete",
        cls: "mod-warning"
      });

      deleteBtn.onclick = async () => {
        await data.onDelete?.();
      };
    }
  }
}
