import { MarkdownPostProcessorContext, Plugin } from "obsidian";
import { ButtonResolver } from "./buttonResolver";

export function registerMarkdownButtons(
  plugin: Plugin,
  resolver: ButtonResolver
) {

  plugin.registerMarkdownPostProcessor(
    (element: HTMLElement, ctx: MarkdownPostProcessorContext) => {

      const codeBlocks = element.querySelectorAll("code");
      codeBlocks.forEach((code) => {
        const text = code.textContent?.trim();
        if (!text) return;

        const match = text.match(
          /^partner-([a-zA-Z0-9_-]+)$/
        );
        if (!match) return;

        const name = match[1];
        console.log("[Markdown] Resolving button:", name)

        const button = (resolver as any).createButton(name, {source: ctx.sourcePath})
        if (!button) {
          console.warn("[Markdown] Button not found:", name);
          return;
        }
        code.replaceWith(button);
      });
    }
  );
}