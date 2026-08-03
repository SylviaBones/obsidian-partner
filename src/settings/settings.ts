import { PartnerCall } from "../modules/calls/callTypes";

export interface PartnerSettings {
  // Folder containing JS snippets
  snippetFolder: string;

  // Registered calls
  calls: PartnerCall[];
}


export const DEFAULT_SETTINGS: PartnerSettings = {
  snippetFolder: "Partner Snippets",
  calls: []
};