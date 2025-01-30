import { Injectable, Signal, signal } from '@angular/core';
import { createClient, User } from '@supabase/supabase-js';
import { fromEventPattern } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthService {
  supabase = createClient(
    import.meta.env['VITE_SUPABASE_URL'],
    import.meta.env['VITE_ANON_PUBLIC_KEY']
  );

  isLoading = signal(false);
  isSuccess = signal(false);
  isError = signal<string | null>(null);
  async signInWithProvider(provider: 'google' | 'github' | 'facebook') {
    return this.supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  }
  async logout() {
    return this.supabase.auth.signOut();
  }
  async signInWithEmail(email: string) {
    this.isLoading.set(true);
    this.isSuccess.set(false);
    this.isError.set(null);

    const { error } = await this.supabase.auth.signInWithOtp({ email });

    this.isLoading.set(false);

    if (error) {
      this.isError.set(error.message);
    } else {
      this.isSuccess.set(true);
    }
  }
  user = signal<User | null>(null);
  constructor() {
    fromEventPattern((handler) =>
      this.supabase.auth.onAuthStateChange((_event, session) => {
        this.user.set(session?.user ?? null);
        handler(session?.user ?? null);
      })
    );
    this.checkCurrentUser();
  }

  private async checkCurrentUser() {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    this.user.set(user);
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    this.user.set(null);
    return { error };
  }

  get currentUser(): Signal<User | null> {
    return this.user.asReadonly();
  }
}
