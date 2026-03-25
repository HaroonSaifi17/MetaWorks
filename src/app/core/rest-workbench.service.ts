import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class RestWorkbenchService {
  private readonly focusUrlToken = signal(0);

  readonly urlFocusRequests = this.focusUrlToken.asReadonly();

  requestUrlFocus(): void {
    this.focusUrlToken.update((value) => value + 1);
  }
}
