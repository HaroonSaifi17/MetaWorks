import { Injectable, signal } from '@angular/core';

export type AuthProviderId = 'google' | 'github';

export interface AuthUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class SupabaseAuthService {
  readonly user = signal<AuthUser | null>(null);
  readonly isLoading = signal(false);
  readonly isSuccess = signal(false);
  readonly isError = signal<string | null>(null);

  async signInWithProvider(provider: AuthProviderId): Promise<void> {
    this.isLoading.set(true);
    this.isError.set(null);

    this.user.set({
      id: `demo-${provider}`,
      email: `${provider}@example.com`,
      user_metadata: {
        full_name: `${provider[0].toUpperCase()}${provider.slice(1)} User`,
        email: `${provider}@example.com`,
      },
    });

    this.isLoading.set(false);
    this.isSuccess.set(false);
  }

  signInWithEmail(email: string): void {
    this.isLoading.set(true);
    this.isError.set(null);

    if (!email.trim()) {
      this.isError.set('Email is required.');
      this.isLoading.set(false);
      return;
    }

    this.isSuccess.set(true);
    this.isLoading.set(false);
  }

  logout(): void {
    this.user.set(null);
    this.isSuccess.set(false);
    this.isError.set(null);
  }
}
