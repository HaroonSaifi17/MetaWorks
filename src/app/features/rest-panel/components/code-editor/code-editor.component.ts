import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild, ElementRef, computed, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { CodeHighlightPipe } from "../../../../core/code-highlight.pipe";

@Component({
  selector: "reqquest-code-editor",
  standalone: true,
  imports: [CommonModule, FormsModule, CodeHighlightPipe],
  template: `
    <div class="relative flex h-full w-full overflow-hidden bg-background font-mono text-xs leading-5" [class.rounded-md]="!plain()" [class.border]="!plain()">
      <!-- Line Numbers -->
      <div class="sticky left-0 z-10 flex min-h-full min-w-[3rem] flex-col select-none border-r bg-muted/20 py-3 text-right text-muted-foreground/50 backdrop-blur-sm">
        @for (line of lineNumbers(); track $index) {
          <div class="px-2">{{ line }}</div>
        }
      </div>
      
      <!-- Editor Area -->
      <div class="relative min-w-0 flex-1 overflow-auto bg-background">
        <!-- Syntax Highlighter (Background) -->
        <pre aria-hidden="true" class="absolute inset-0 m-0 min-h-full w-full bg-transparent p-0 pointer-events-none"><code [innerHTML]="content() | codeHighlight: language()" class="block px-4 py-3 !whitespace-pre"></code></pre>
        
        <!-- Editable Textarea (Foreground) -->
        @if (!readonly()) {
          <textarea
            #textarea
            class="absolute inset-0 h-full w-full resize-none bg-transparent px-4 py-3 font-mono text-xs leading-5 text-transparent caret-foreground outline-none whitespace-pre"
            [value]="content()"
            (input)="onInput($event)"
            (scroll)="syncScroll($event)"
            spellcheck="false"
          ></textarea>
        }

        <!-- Readonly View -->
        @if (readonly()) {
           <pre class="m-0 h-full w-full bg-transparent p-0"><code [innerHTML]="content() | codeHighlight: language()" class="block px-4 py-3 !whitespace-pre"></code></pre>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
    }
    textarea {
        font-family: inherit;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodeEditorComponent {
  readonly content = signal("");
  readonly language = signal<"json" | "plain" | "bash" | "graphql">("plain");
  readonly readonly = signal(true);
  readonly plain = signal(false);

  @ViewChild('textarea') textarea?: ElementRef<HTMLTextAreaElement>;

  @Input({ required: true, alias: "code" })
  set _code(value: string | null | undefined) {
    this.content.set(value || "");
  }

  @Input()
  set lang(value: "json" | "plain" | "bash" | "graphql") {
    this.language.set(value);
  }

  @Input({ alias: "readonly" })
  set _readonly(value: boolean) {
    this.readonly.set(value);
  }

  @Input({ alias: "plain" })
  set _plain(value: boolean) {
    this.plain.set(value);
  }

  @Output() codeChange = new EventEmitter<string>();

  readonly lineNumbers = computed(() => {
    const lines = this.content().split("\n").length;
    return Array.from({ length: lines }, (_, i) => i + 1);
  });

  onInput(event: Event) {
    const value = (event.target as HTMLTextAreaElement).value;
    this.content.set(value);
    this.codeChange.emit(value);
  }

  syncScroll(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    const pre = target.parentElement?.querySelector('pre');
    if (pre) {
      pre.scrollTop = target.scrollTop;
      pre.scrollLeft = target.scrollLeft;
    }
  }
}
