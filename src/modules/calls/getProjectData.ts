// src/modules/calls/getProjectData.ts
import { App, TFile } from "obsidian";
import { ProjectPickerModal } from "./projectPickerModal";

export interface ProjectData {
    projectName: string;
    poaPath: string;
    idTag: string;
    projectTitle: string;
}


export function getProjectData(app: App): Promise<ProjectData | null> {
    return new Promise((resolve) => {
        const pm = (app as any)?.plugins?.plugins["project-manager"];
        const cache = pm?.store?.projectCache as Map<string, any> | undefined;
        if (!cache) {resolve(null);  return;}
    

        const projects = Array.from(cache.keys())
            .map(path =>
                path
                    .replace(/^Projects\//, "")
                    .replace(/\.md$/, "")
            );
            console.log("Projects found:", projects);

        new ProjectPickerModal(
            app,
            projects,
            async (projectName) => {
                const projectFile = app.vault.getAbstractFileByPath(`Projects/${projectName}.md`);
                if (!(projectFile instanceof TFile)) {resolve(null); return;}

                const projectCache = app.metadataCache.getFileCache(projectFile);
                const poaLink = projectCache?.frontmatter?.description;
                if (!poaLink) {resolve(null); return;}

                const poaFile = app.metadataCache.getFirstLinkpathDest(poaLink, projectFile.path);
                if (!poaFile) {resolve(null); return;}

                const poaData = app.metadataCache.getFileCache(poaFile)?.frontmatter;

                resolve({
                    projectName,
                    poaPath: poaFile.path,
                    idTag: poaData?.idTag,
                    projectTitle: poaData?.projectTitle
                });
            }
        ).open();
    });
}