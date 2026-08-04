import { App, FuzzySuggestModal } from "obsidian";

export class ProjectPickerModal extends FuzzySuggestModal<string> {

    constructor(
        app: App,
        private projects: string[],
        private onSelect: (project: string) => void
    ) {
        super(app);
    }

    getItems(): string[] {
        return this.projects;
    }

    getItemText(item: string): string {
        return item;
    }

    onChooseItem(item: string): void {
        this.onSelect(item);
    }
}