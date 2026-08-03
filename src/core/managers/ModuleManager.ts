import { IModule, ICoreAPI, ModuleID } from "../types";

export class ModuleManager implements ICoreAPI {
  private modules = new Map<ModuleID, IModule>();

  constructor(public events: any) {}

  registerModule(module: IModule) {
    this.modules.set(module.id, module);
    module.init(this);
  }

  getModule(id: ModuleID) {
    return this.modules.get(id);
  }

  enable(id: ModuleID) {
    const mod = this.modules.get(id);
    mod?.onEnable?.();
  }

  disable(id: ModuleID) {
    const mod = this.modules.get(id);
    mod?.onDisable?.();
  }
}