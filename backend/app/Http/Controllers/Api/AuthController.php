<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 422);
        }

        if ($user->two_factor_confirmed_at && ! empty($user->two_factor_secret)) {
            $challengeToken = Str::random(64);
            Cache::put('2fa_challenge:'.$challengeToken, $user->id, now()->addMinutes(10));

            return response()->json([
                'requires_two_factor' => true,
                'challenge_token' => $challengeToken,
                'message' => 'Two-factor authentication required.',
            ]);
        }

        $plainToken = Str::random(64);
        $token = ApiToken::create([
            'user_id' => $user->id,
            'name' => 'api',
            'token' => hash('sha256', $plainToken),
            'expires_at' => now()->addDays(7),
        ]);

        return response()->json([
            'user' => $user,
            'token' => $plainToken,
            'token_expires_at' => $token->expires_at,
            'meta' => ['token_type' => 'Bearer'],
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            ...$validated,
            'password' => Hash::make($validated['password']),
            'role' => 'customer',
            'status' => 'new',
        ]);

        return response()->json(['user' => $user], 201);
    }

    public function me(Request $request)
    {
        return response()->json(['user' => $request->user()]);
    }

    public function logout(Request $request)
    {
        $bearer = (string) $request->bearerToken();
        if ($bearer !== '') {
            ApiToken::query()->where('token', hash('sha256', $bearer))->delete();
        }

        return response()->json([], 204);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user) {
            return response()->json([
                'message' => 'If your email exists in our system, a reset link has been generated.',
            ]);
        }

        $token = Password::createToken($user);

        return response()->json([
            'message' => 'Password reset token generated.',
            'reset_token' => $token,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user) use ($validated): void {
                $user->forceFill([
                    'password' => Hash::make($validated['password']),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status),
            ], 422);
        }

        return response()->json([
            'message' => 'Password has been reset.',
        ]);
    }

    public function sendEmailVerification(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email already verified.']);
        }

        $verificationToken = Str::random(64);
        Cache::put('email_verification:'.$verificationToken, $user->id, now()->addMinutes(60));

        return response()->json([
            'message' => 'Verification token generated.',
            'verification_token' => $verificationToken,
        ]);
    }

    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
        ]);

        $userId = Cache::pull('email_verification:'.$validated['token']);
        if (! $userId) {
            return response()->json(['message' => 'Invalid or expired verification token.'], 422);
        }

        $user = User::find($userId);
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->forceFill(['email_verified_at' => now()])->save();

        return response()->json(['message' => 'Email verified successfully.']);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
        ]);

        $emailChanged = $user->email !== $validated['email'];

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        if ($emailChanged) {
            $user->email_verified_at = null;
        }
        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user,
        ]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is invalid.'], 422);
        }

        $user->password = Hash::make($validated['password']);
        $user->save();

        ApiToken::query()->where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Password updated successfully. Please login again.']);
    }
}
