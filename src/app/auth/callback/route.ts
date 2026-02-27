/**
 * ============================================================================
 * API Route: Auth Callback Handler
 * ============================================================================
 * 
 * VERCEL EDGE FUNCTION - Gère le callback OAuth  
 * 
 * TODO: This endpoint needs to be updated to use the new auth service
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/callback
 * Handles OAuth callback from Supabase/Google
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const state = requestUrl.searchParams.get('state');
  const roleParam = requestUrl.searchParams.get('role') as 'candidate' | 'company' || 'candidate';

  console.log('[Auth/Callback] Processing OAuth callback', {
    hasCode: !!code,
    hasState: !!state,
    role: roleParam,
  });

  try {
    // ========================================================================
    // Step 1: Exchange code for session with Supabase
    // ========================================================================
    if (!code) {
      console.error('[Auth/Callback] Missing OAuth code');
      return NextResponse.redirect(
        new URL('/connexion?error=missing_code', requestUrl.origin)
      );
    }

    const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError || !authData.session) {
      console.error('[Auth/Callback] Failed to exchange code:', authError);
      return NextResponse.redirect(
        new URL('/connexion?error=invalid_code', requestUrl.origin)
      );
    }

    const session = authData.session;
    const user = session.user;

    console.log('[Auth/Callback] OAuth successful', {
      userId: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
    });

    // ========================================================================
    // Step 2: Verify and sync user profile to public.profiles
    // ========================================================================
    const profile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      avatar_url: user.user_metadata?.avatar_url,
      user_type: roleParam, // 'candidate' or 'company'
      is_verified: false, // Will be set to true after email verification if needed
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // ========================================================================
    // Step 3: Upsert user in public.profiles table
    // ========================================================================
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          user_type: profile.user_type,
          updated_at: profile.updated_at,
        },
        { onConflict: 'id' }
      )
      .select()
      .single();

    if (profileError) {
      console.error('[Auth/Callback] Failed to sync profile:', profileError);
      // Don't block user, continue anyway - they can manually update later
    } else {
      console.log('[Auth/Callback] Profile synced successfully', {
        userId: profileData?.id,
        role: profileData?.user_type,
      });
    }

    // ========================================================================
    // Step 4: Store session in URL to be picked up by frontend
    // Redirect to appropriate dashboard based on role
    // ========================================================================
    const dashboardUrl = roleParam === 'company' 
      ? '/company/dashboard' 
      : '/dashboard';

    // Create response with redirect
    const response = NextResponse.redirect(new URL(dashboardUrl, requestUrl.origin));

    // Set secure session cookie (Supabase manages this automatically, but we can reinforce)
    // The Supabase session is already in localStorage via the supabase-js library
    
    console.log('[Auth/Callback] Redirecting to:', dashboardUrl);
    return response;

  } catch (error) {
    console.error('[Auth/Callback] Unhandled error:', error);
    return NextResponse.redirect(
      new URL('/connexion?error=server_error', requestUrl.origin)
    );
  }
}

/**
 * POST /api/auth/callback
 * Optional: Handle POST requests for additional auth operations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, userType } = body;

    if (action === 'verify_role') {
      // Verify that user has the correct role set
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      if (error) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        userType: profile?.user_type,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[Auth/Callback POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
