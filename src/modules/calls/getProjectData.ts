//getProjectData.ts
import { App, TFile } from "obsidian";
import { ProjectPickerModal } from "./projectPickerModal";

export interface ProjectData {
    projectName: string;
    projectPath: string;
    description: string;
    poaPath?: string;
    idTag?: string;
    projectTitle?: string;
}

export function getProjectData(app: App): Promise<ProjectData | null> {
    return new Promise((resolve) => {
        const pm = (app as any)?.plugins?.plugins["project-manager"];
        const cache = pm?.store?.projectCache as Map<string, any> | undefined;

        if (!cache) {resolve(null); return;}

        const projects = Array.from(cache.keys())
            .map(path => path
                .replace(/^Projects\//, "")
                .replace(/\.md$/, "")
            );

        console.log("Projects found:", projects);

        new ProjectPickerModal(
            app,
            projects,
            async (projectName) => {
                const projectPath = `Projects/${projectName}.md`;
                const projectFile = app.vault.getAbstractFileByPath(projectPath);

                if (!(projectFile instanceof TFile)) {
                    resolve(null);
                    return;
                }

                const projectCache = app.metadataCache.getFileCache(projectFile);
                const description = projectCache?.frontmatter?.description ?? "";

                // No POA connected yet.
                // Return the project so the repair modal can handle it.
                if (!description) {
                    resolve({
                        projectName,
                        projectPath,
                        description
                    }); return;
                }

                const poaFile =
                    app.metadataCache.getFirstLinkpathDest(
                        description,
                        projectFile.path
                    );

                // Description exists, but it doesn't resolve
                // to an actual file.
                if (!poaFile) {resolve({
                    projectName,
                    projectPath,
                    description
                    }); return;
                }

                const poaData = app.metadataCache
                    .getFileCache(poaFile)
                    ?.frontmatter;

                resolve({
                    projectName,
                    projectPath,
                    description,
                    poaPath: poaFile.path,
                    idTag: poaData?.idTag,
                    projectTitle: poaData?.projectTitle
                });
            }
        ).open();
    });
}


export async function updateProjectDescription(
    app: App,
    projectPath: string,
    description: string
): Promise<ProjectData | null> {
    const projectFile = app.vault.getAbstractFileByPath(projectPath);
    if (!(projectFile instanceof TFile)) {return null;}

    // Write the POA path into the Project's description property.
    await app.fileManager.processFrontMatter(projectFile,(fm) => {
            fm.description = description;
        }
    );

    // Resolve the newly connected POA.
    const poaFile =
        app.metadataCache.getFirstLinkpathDest(
            description,
            projectFile.path
        );

    if (!poaFile) {
        return {
            projectName: projectFile.basename,
            projectPath,
            description
        };
    }

    const poaData = app.metadataCache.getFileCache(poaFile)?.frontmatter;
    return {
        projectName: projectFile.basename,
        projectPath,
        description,
        poaPath: poaFile.path,
        idTag: poaData?.idTag,
        projectTitle: poaData?.projectTitle
    };
}

export async function updatePoaProperties(
  app: App,
  poaPath: string,
  updates: {
    idTag?: string;
    projectTitle?: string;
  }
) {
  const file = app.vault.getAbstractFileByPath(poaPath);
  if (!(file instanceof TFile)) {
    throw new Error("POA file not found");
  }

  await app.fileManager.processFrontMatter(file, (fm) => {
    if (updates.idTag !== undefined) {
      fm.idTag = updates.idTag;
    }

    if (updates.projectTitle !== undefined) {
      fm.projectTitle = updates.projectTitle;
    }
  });
}