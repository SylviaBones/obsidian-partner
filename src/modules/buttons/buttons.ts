// === buttons.ts ===
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
    console.log("[Partner Widget] CREATED", {
      text: el.textContent,
      readingMode
    });
  }

  toDOM() {
    console.log("[Partner Widget] toDOM", {
      text: this.el.textContent,
      readingMode: this.readingMode
    });
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

function createButtonPlugin(resolver: ButtonResolver) {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
      //  console.log("[Partner Buttons] PLUGIN CREATED");
        this.decorations = this.buildDecorations(view);
      }

      update(update: ViewUpdate) {
      //  console.log("[Partner Buttons] UPDATE", {
      //    docChanged: update.docChanged,
      //    viewportChanged: update.viewportChanged,
      //    selectionSet: update.selectionSet,
      //    focusChanged: update.focusChanged
      //  });

        if (update.docChanged || update.viewportChanged) {
        //  console.log("[Partner Buttons] REBUILDING DECORATIONS");

          this.decorations = this.buildDecorations(update.view);

          //console.log(
          //  "[Partner Buttons] Decoration rebuild complete"
          //);
        }
      }

      buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        const isReadingMode = !view.contentDOM?.isContentEditable;
        const regex = /`partner-(btn)-([a-zA-Z0-9_-]+)`/g;

        const from = 0;
        const to = view.state.doc.length;
        const text = view.state.doc.sliceString(from, to);
        //console.log("[Partner Buttons] BUILD START", {
        //  readingMode: isReadingMode,
        //  docLength: view.state.doc.length,
        //  textPreview: text.slice(0, 300)
        //});

        let match;
        while ((match = regex.exec(text)) !== null) {
          const [full, type, label] = match;
          const start = from + match.index;
          const end = start + full.length;

        //  console.log(
        //    "[Partner Buttons] MATCH FOUND:",
        //    {full, type, label, start, end}
        //  );

          const buttonEl = resolver.resolve(type, label, {
            from: start,
            to: end
          });

          //  console.log(
          //    "[Partner Buttons] RESOLVING RESULT:",
          //  //  {label, found: !!buttonEl, element: buttonEl}
          //  );

          if (!buttonEl) continue;

          const deco = Decoration.replace({
            widget: new PartnerButtonWidget(
              buttonEl,
              isReadingMode
            ),
            inclusive: false
          });
          builder.add(start, end, deco);
        }
        //console.log("[Partner Buttons] BUILD COMPLETE");
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
