import { Plugin } from "obsidian";
import { createPMModalButton } from "./createPmModalButton";


export function registerCommands(plugin: Plugin) {

	plugin.addCommand({
		id: "create-pm-modal-button",
		name: "Create PM Modal Button",
		callback: () => {
			createPMModalButton(plugin.app);
		}
	});

}