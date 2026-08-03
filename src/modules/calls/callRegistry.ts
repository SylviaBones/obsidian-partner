import { PartnerCall } from "./callTypes";

// stores Call information and connections

export class CallRegistry {
  private calls = new Map<string, PartnerCall>();

  getActive() {
    return Array.from(this.calls.values())
    .filter(call => call.enabled);
  }

  logActiveCalls() {
    console.group("Active Partner Calls");

    const active = this.getActive();

    console.log("Active Count:", active.length);
    console.table(active);

    console.groupEnd();
  }

  load(calls: PartnerCall[]) {
    this.calls.clear();

    for (const call of calls) {
      const key = this.buildKey(call);
      this.calls.set(key, call);
    }
    this.logRegistryState("LOAD");
  }

  register(call: PartnerCall) {
    const key = this.buildKey(call);
    this.calls.set(key, call);
    this.logRegistryState("REGISTER", call)
  }

  unregister(call: PartnerCall) {
    const key = this.buildKey(call);
    this.calls.delete(key);
    this.logRegistryState("UNREGISTER", call)
  }

  toggleEnabled(call: PartnerCall, enabled?: boolean) {
    const key = this.buildKey(call);
    const existing = this.calls.get(key);

    if (!existing) return;

    existing.enabled = enabled ?? !existing.enabled;
    this.calls.set(key, existing);
    this.logRegistryState("TOGGLE_ENABLED", existing);
  }

  get(id: string) {
    return this.calls.get(id);
  }

  getAll() {
    return Array.from(this.calls.values());
  }

  private buildKey(call: PartnerCall) {
    return `partner-${call.type}-${call.label}`;
  }

  private logRegistryState(action: string, call?: PartnerCall){
    console.group(CallRegistry, action);
    if (call){
      console.log("Changed Call:", action);
    }

    console.log("Total Calls:", this.calls.size); 
    console.log("All Calls:", Array.from(this.calls.values())); 
    console.groupEnd();
  }
}