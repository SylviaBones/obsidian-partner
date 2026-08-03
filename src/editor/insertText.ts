import { Editor } from "obsidian";

export function insertAtCursor(
	editor: Editor,
	text: string
) {
	const cursor = editor.getCursor();

	editor.replaceRange(
		text,
		cursor
	);
}