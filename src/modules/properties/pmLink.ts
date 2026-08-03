//pmLink.ts
import { App, Notice } from "obsidian";

export async function insertPMLink(
	app: App,
	projectPath: string
) {
	const file = app.workspace.getActiveFile();

	if (!file) {
		new Notice("No active note.");
		return;
	}

    const fileName = projectPath.split("/").pop()

	await app.fileManager.processFrontMatter(
		file,
		(frontmatter) => {
			frontmatter.pmLink =
				`${fileName}`;
		}
	);
	new Notice("PM Link added.");
}