import { Plugin } from "obsidian";
import { CorePlugin } from "./core/CorePlugin";
import { PartnerSettingTab } from "./settings/settingsTab";
import { DEFAULT_SETTINGS, PartnerSettings } from "./settings/settings";
import { CallEngine } from "./callEngine"
import { CallRegistry } from "./modules/calls/callRegistry";
import { registerCommands } from "./modules/commands";
import { getProjectData } from "./modules/calls/getProjectData";

// Main plugin class

//Bridge to Obsidian only, core logic is in CorePlugin

export default class ObsidianPartner extends Plugin {
  settings!: PartnerSettings;
  callEngine!: CallEngine;
  callRegistry!: CallRegistry;
  api!: any;

  core = new CorePlugin();

  async onload() {
    console.log("Loading Obsidian Partner ...");
    this.settings = Object.assign(
      {},
      DEFAULT_SETTINGS,
      await this.loadData()
    );
    registerCommands(this);

    this.api = {getProjectData: () => getProjectData(this.app)};
    this.addCommand({
            id: "get-project-data",
            name: "Get Project Data",
            callback: async () => {
                const data = await getProjectData(this.app);
                console.log(data);
            }
    });
    this.callRegistry = new CallRegistry();
    this.callRegistry.load(this.settings.calls as any)

    this.settings.calls ??= [];
    this.settings.snippetFolder ??= DEFAULT_SETTINGS.snippetFolder;
    
    this.addSettingTab(
      new PartnerSettingTab(this.app, this)
    );
    this.callEngine = new CallEngine(this);
    this.callEngine.init();

    this.core.init(this);       // give core access to plugin
    await this.core.onload();   // let core do everything
  }

  async SaveSettings() {
    await this.saveData(this.settings);
    this.callRegistry.load(this.settings.calls as any)
  }

  onunload() {
    this.core.onunload();
    console.log("Obsidian Partner unloaded");
  }
}