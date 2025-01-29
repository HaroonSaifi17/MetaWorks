import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthService {
  supabase = createClient(
    import.meta.env['VITE_SUPABASE_URL'],
    import.meta.env['VITE_ANON_PUBLIC_KEY']
  );

  constructor() {}
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
}
