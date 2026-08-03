export type CallType = "btn" | "vw";

export interface PartnerCall {
  id: string;
  type: CallType;
  label: string;
  source: string;
  description?: string;
  enabled?: boolean;
  icon?: string;
  path: string;
}