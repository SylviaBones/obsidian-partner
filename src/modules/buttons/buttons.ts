// === buttons.ts (FULL COMPOSITION) ===
import { Plugin } from "obsidian";
import {
  ViewPlugin,
  Decoration,
  DecorationSet,
  WidgetType,
  EditorView,
  ViewUpdate
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { ButtonResolver } from "./buttonResolver";


class PartnerButtonWidget extends WidgetType {
  constructor(
    private el: HTMLElement,
    private readingMode: boolean
  ) {
    super();
  }

  toDOM() {
    if (this.readingMode) {
      // Reading mode → render as plain text-like element
      const span = document.createElement("span");
      span.textContent = this.el.textContent || "Button";
      span.style.color = "#666";
      span.style.cursor = "default";
      return span;
    }

    // Editing mode → real interactive button
    return this.el;
  }

  ignoreEvent() {
    return this.readingMode; // block interaction in reading mode
  }
}

function createButtonPlugin(resolver: ButtonResolver ) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
          this.decorations = this.buildDecorations(update.view);
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const isReadingMode = !view.contentDOM?.isContentEditable;
        const regex = /`partner-(btn)-([a-zA-Z0-9_-]+)`/g;

        for (let { from, to } of view.visibleRanges) {
          const text = view.state.doc.sliceString(from, to);

          let match;
          while ((match = regex.exec(text)) !== null) {
            const [full, type, label] = match;
            const start = from + match.index;
            const end = start + full.length;
            // EditorView doesn't expose an `editor` property; pass the view
            // through as a best-effort context (typed as any to satisfy TS).
            const editor = view as any;

            const buttonEl = resolver.resolve(type, label, {
              from: start,
              to: end
            });
            if (!buttonEl) continue;

            // detect reading mode
            const deco = Decoration.replace({
              widget: new PartnerButtonWidget(buttonEl, isReadingMode),
              inclusive: false
            });

            builder.add(start, end, deco);
          }
        }

        return builder.finish();
      }
    },
    {
      decorations: v => v.decorations
    }
  );
}

export function registerEditorButtons(
  plugin: Plugin,
  resolver: ButtonResolver
) {
  const extension = createButtonPlugin(resolver);
  plugin.registerEditorExtension(extension);
}
