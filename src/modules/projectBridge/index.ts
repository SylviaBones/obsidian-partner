// modules/projectBridge/index.ts

import { IModule, ICoreAPI } from "../../core/types";

export class ProjectBridgeModule implements IModule {
  id = "project-bridge";

  init(core: ICoreAPI) {
    core.events.on("task-created", this.onTaskCreated);
  }

  private onTaskCreated = (task: any) => {
    console.log("ProjectBridge saw task:", task);
  };
}