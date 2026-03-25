import { Pipe, PipeTransform } from "@angular/core";
import Prism from "prismjs";

import "prismjs/components/prism-json";
import "prismjs/components/prism-graphql";
import "prismjs/components/prism-bash";

type SupportedLanguage = "json" | "graphql" | "bash" | "plain";

@Pipe({
  name: "codeHighlight",
  standalone: true,
})
export class CodeHighlightPipe implements PipeTransform {
  transform(
    value: string | null | undefined,
    language: SupportedLanguage,
  ): string {
    const source = value ?? "";

    if (!source.trim()) {
      return "";
    }

    if (language === "plain") {
      return String(Prism.util.encode(source));
    }

    const grammar = Prism.languages[language];

    if (!grammar) {
      return String(Prism.util.encode(source));
    }

    return Prism.highlight(source, grammar, language);
  }
}
