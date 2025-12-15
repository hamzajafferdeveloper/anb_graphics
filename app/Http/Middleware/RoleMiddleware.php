<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = Auth::user();

        // If not logged in → go to login
        if (!$user) {
            return redirect()->route('login')
                ->with('error', 'You must be logged in.');
        }

        // If user has required role → continue
        if ($user->hasAnyRole($roles)) {
            return $next($request);
        }

        // If user does NOT have permission → redirect to their own dashboard
        $role = $user->roles->first()?->name;

        $redirect = match ($role) {
            'admin' => route('dashboard'),
            'user' => route('user.dashboard'),
            default => route('login'),
        };

        return redirect($redirect);
    }
}
