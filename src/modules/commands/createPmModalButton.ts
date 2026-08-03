// createPMModalButton.ts
import { App, Notice } from "obsidian";
import { ProjectSuggestModal } from "./projectSuggestModal";
import { insertPMLink } from "../properties/pmLink";
import { insertAtCursor } from "../../editor/insertText";

export async function createPMModalButton(app: App) {
	const pmPlugin = (app as any).plugins?.plugins?.["project-manager"];

	if (!pmPlugin) {
		new Notice("Project Manager plugin is not enabled.");
		return;
	}

    
	const cache = pmPlugin.store.projectCache;
	const projects = Array.from(cache.keys()).filter((key): key is string => typeof key === "string");

	const selected = await new Promise<string | null>((resolve) => {
		const modal = new ProjectSuggestModal(
			app,
			projects,
			resolve
		);
		modal.open();
	});
    if (!selected) return;

    await insertPMLink(
        app,
        selected
    )

    const editor = app.workspace.activeEditor?.editor;
    if (!editor) {
		new Notice("No active editor.");
		return;
	}

    insertAtCursor(
		editor,
		"`partner-btn-pm-modal`"
	);

	await insertPMLink(app, selected);
}

