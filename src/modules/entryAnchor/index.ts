// modules/entryAnchor/index.ts

import { IModule, ICoreAPI } from "../../core/types";

export class EntryAnchorModule implements IModule {
  id = "entry-anchor";

  private core!: ICoreAPI;

  init(core: ICoreAPI) {
    this.core = core;

    this.core.events.on("file-open", this.handleFileOpen);
  }

  onEnable() {
    console.log("EntryAnchor enabled");
  }

  onDisable() {
    console.log("EntryAnchor disabled");
  }

  private handleFileOpen = (file: any) => {
    // placeholder logic
    console.log("EntryAnchor reacting to file-open:", file);
  };
}