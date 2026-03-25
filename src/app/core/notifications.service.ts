import { Injectable, signal } from "@angular/core";

export type NoticeTone = "info" | "success" | "warning" | "error";

export interface AppNotice {
  id: number;
  message: string;
  tone: NoticeTone;
}

@Injectable({
  providedIn: "root",
})
export class NotificationsService {
  private readonly nextId = signal(1);
  readonly notices = signal<AppNotice[]>([]);

  show(message: string, tone: NoticeTone = "info", timeoutMs = 3000): number {
    const id = this.nextId();
    this.nextId.update((value) => value + 1);

    this.notices.update((current) => [...current, { id, message, tone }]);

    if (typeof window !== "undefined" && timeoutMs > 0) {
      window.setTimeout(() => this.dismiss(id), timeoutMs);
    }

    return id;
  }

  dismiss(id: number): void {
    this.notices.update((current) =>
      current.filter((notification) => notification.id !== id),
    );
  }
}
