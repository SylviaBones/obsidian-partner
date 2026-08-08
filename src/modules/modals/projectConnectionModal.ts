// projectConnectionModal.ts
import {App, Modal, Setting, TFile, FuzzySuggestModal} from "obsidian";

type TrackerInput = {
  description: string;
  idTag: string;
  projectTitle: string;
};

export class TrackerInputModal extends Modal {
  private description: string;
  private idTag: string;
  private projectTitle: string;

  private onSubmit: (result: TrackerInput) => void;
  private onUpdate: (description: string) => Promise<TrackerInput | null>;

  private descriptionInput!: any;
  private idTagInput!: any;
  private projectTitleInput!: any;

  constructor(
    app: App,
    onSubmit: (result: TrackerInput) => void,
    defaults: Partial<TrackerInput> = {},
    onUpdate: (description: string) => Promise<TrackerInput | null>
  ) {
    super(app);

    this.description = defaults.description ?? "";
    this.idTag = defaults.idTag ?? "";
    this.projectTitle = defaults.projectTitle ?? "";

    this.onSubmit = onSubmit;
    this.onUpdate = onUpdate;
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();

    contentEl.createEl("h2", {
      text: "Project Connection"
    });

    // -------------------------
    // POA / Description
    // -------------------------

    new Setting(contentEl)
      .setName("Description / POA")
      .setDesc("Path to the POA file")
      .addText(text => {
        this.descriptionInput = text;

        text
          .setValue(this.description)
          .setPlaceholder("Select a POA file...");
      })
      .addButton(button =>
        button
          .setIcon("search")
          .setTooltip("Choose POA file")
          .onClick(() => this.choosePOA())
      );

    // -------------------------
    // Update
    // -------------------------
    const statusEl = contentEl.createEl("span", { text: "" }) as HTMLSpanElement;
    new Setting(contentEl)
      .addButton(button => {
        button
          .setButtonText("Update")
          .onClick(async () => {
            statusEl.setText("Updating...");
            statusEl.style.color = "var(--text-muted)";

            try{
              await this.updateConnection();
              statusEl.setText("Wired up!");
              statusEl.style.color = "var(--text-green)";
              setTimeout(() => {
                statusEl.setText("");
              }, 2000);
            } catch (error) {
              console.error("Error updating connection:", error);
              statusEl.setText("Update failed!");
              statusEl.style.color = "var(--text-red)";
            }
          });
      });

    // -------------------------
    // idTag
    // -------------------------
    new Setting(contentEl)
      .setName("idTag")
      .addText(text => {
        this.idTagInput = text;

        text
          .setValue(this.idTag)
          .setPlaceholder("Project tag");
      });

    // -------------------------
    // projectTitle
    // -------------------------
    new Setting(contentEl)
      .setName("projectTitle")
      .addText(text => {
        this.projectTitleInput = text;

        text
          .setValue(this.projectTitle)
          .setPlaceholder("Project title");
      });

    // -------------------------
    // Buttons
    // -------------------------
    new Setting(contentEl)
      .addButton(button =>
        button
          .setButtonText("Submit")
          .setCta()
          .onClick(() => {
            this.submit();
          })
      )
      .addButton(button =>
        button
          .setButtonText("Done")
          .onClick(() => {
            this.close();
          })
      );
  }

  private async choosePOA() {
    const modal = new POAFileSuggestModal(
      this.app,
      (file) => {
        this.description = file.path;
        this.descriptionInput.setValue(file.path);
      }
    );
    modal.open();
  }

  private async updateConnection() {
    const description = this.descriptionInput.getValue().trim();
    if (!description) {return;}

    const result = await this.onUpdate(description);
    if (!result) {return;}

    // Keep modal open and refresh values
    this.description = result.description ?? description;
    this.idTag = result.idTag ?? "";
    this.projectTitle = result.projectTitle ?? "";

    this.descriptionInput.setValue(this.description);
    this.idTagInput.setValue(this.idTag);
    this.projectTitleInput.setValue(this.projectTitle);
  }

  private submit() {
    const result: TrackerInput = {
      description: this.descriptionInput.getValue().trim(),
      idTag: this.idTagInput.getValue().trim(),
      projectTitle: this.projectTitleInput.getValue().trim()
    };
    console.log("Submitting TrackerInput:", result);
    console.log("onSubmit function:", this.onSubmit);

    this.onSubmit(result);
    this.close();
  }
}


// --------------------------------------------------
// POA file picker
// --------------------------------------------------
class POAFileSuggestModal extends FuzzySuggestModal<TFile> {
  private files: TFile[];
  private onChoose: (file: TFile) => void;

  constructor(
    app: App,
    onChoose: (file: TFile) => void
  ) {
    super(app);
    this.files = app.vault.getMarkdownFiles();
    this.onChoose = onChoose;
  }

  getItems(): TFile[] {return this.files;}
  getItemText(file: TFile): string {return file.path;}
  onChooseItem(file: TFile) {this.onChoose(file);}
}