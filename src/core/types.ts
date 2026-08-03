export type ModuleID = string;

export interface IModule {
  id: ModuleID;

  init(core: ICoreAPI): void;
  onEnable?(): void;
  onDisable?(): void;
}

export interface IEventBus {
  on(event: string, handler: (...args: any[]) => void): void;
  off(event: string, handler: (...args: any[]) => void): void;
  emit(event: string, ...args: any[]): void;
  clear(): void;
}

export interface ICoreAPI {
  events: IEventBus;
  registerModule(module: IModule): void;
  getModule(id: ModuleID): IModule | undefined;
}