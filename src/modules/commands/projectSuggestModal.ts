//projectSuggestModal.ts
import { App, SuggestModal } from "obsidian";

export class ProjectSuggestModal extends SuggestModal<string> {

	constructor(
		app: App,
		private projects: string[],
		private onSelect: (project: string) => void
	) {
		super(app);
	}


	getSuggestions(inputStr: string): string[] {
		return this.projects.filter(project =>
			project
				.toLowerCase()
				.includes(inputStr.toLowerCase())
		);
	}


	renderSuggestion(project: string, el: HTMLElement) {
		el.createEl("div", {
			text: project
				.replace(".md", "")
		});
	}


	onChooseSuggestion(project: string) {
		this.onSelect(project);
	}
}