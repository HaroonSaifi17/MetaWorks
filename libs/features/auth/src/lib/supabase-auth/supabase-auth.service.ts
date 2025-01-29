import { Injectable } from '@angular/core';
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
  async signInWithProvider(provider: 'google' | 'github' | 'facebook') {
    return this.supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  }
}
