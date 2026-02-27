<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveApiUser
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() && $request->bearerToken()) {
            $token = ApiToken::query()
                ->where('token', hash('sha256', (string) $request->bearerToken()))
                ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                ->first();

            if ($token && $token->user) {
                $token->forceFill(['last_used_at' => now()])->save();
                $request->setUserResolver(fn () => $token->user);
            }
        }

        if (! $request->user() && $request->hasHeader('X-User-Id')) {
            $user = User::find((int) $request->header('X-User-Id'));
            if ($user) {
                $request->setUserResolver(fn () => $user);
            }
        }

        return $next($request);
    }
}
