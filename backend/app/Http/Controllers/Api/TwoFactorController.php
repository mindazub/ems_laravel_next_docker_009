<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\User;
use App\Services\TwoFactorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class TwoFactorController extends Controller
{
    public function __construct(private readonly TwoFactorService $twoFactorService)
    {
    }

    public function setup(Request $request)
    {
        $user = $request->user();
        $secret = $this->twoFactorService->generateSecret();

        $user->forceFill([
            'two_factor_secret' => $this->twoFactorService->encryptSecret($secret),
            'two_factor_confirmed_at' => null,
        ])->save();

        $otpauth = $this->twoFactorService->qrUri($user, $secret);

        return response()->json([
            'secret' => $secret,
            'otpauth_url' => $otpauth,
            'qr_url' => 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data='.urlencode($otpauth),
        ]);
    }

    public function confirm(Request $request)
    {
        $payload = $request->validate([
            'code' => ['required', 'digits:6'],
        ]);

        $user = $request->user();
        $secret = $this->twoFactorService->decryptSecret($user->two_factor_secret);

        if (! $secret || ! $this->twoFactorService->verifyCode($secret, $payload['code'])) {
            return response()->json(['message' => 'Invalid two-factor code.'], 422);
        }

        $recoveryCodes = $this->twoFactorService->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => $this->twoFactorService->encryptRecoveryCodes($recoveryCodes),
        ])->save();

        return response()->json([
            'message' => 'Two-factor authentication enabled.',
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function challenge(Request $request)
    {
        $payload = $request->validate([
            'challenge_token' => ['required', 'string'],
            'code' => ['nullable', 'digits:6'],
            'recovery_code' => ['nullable', 'string'],
        ]);

        if (! isset($payload['code']) && ! isset($payload['recovery_code'])) {
            return response()->json(['message' => 'Provide code or recovery_code.'], 422);
        }

        $userId = Cache::pull('2fa_challenge:'.$payload['challenge_token']);
        if (! $userId) {
            return response()->json(['message' => '2FA challenge expired.'], 422);
        }

        $user = User::find($userId);
        if (! $user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $verified = false;

        if (! empty($payload['code'])) {
            $secret = $this->twoFactorService->decryptSecret($user->two_factor_secret);
            $verified = $secret ? $this->twoFactorService->verifyCode($secret, $payload['code']) : false;
        }

        if (! $verified && ! empty($payload['recovery_code'])) {
            $recoveryCodes = $this->twoFactorService->decryptRecoveryCodes($user->two_factor_recovery_codes);
            $recoveryCode = strtoupper($payload['recovery_code']);
            if (in_array($recoveryCode, $recoveryCodes, true)) {
                $verified = true;
                $remaining = array_values(array_filter($recoveryCodes, fn ($code) => $code !== $recoveryCode));
                $user->forceFill([
                    'two_factor_recovery_codes' => $this->twoFactorService->encryptRecoveryCodes($remaining),
                ])->save();
            }
        }

        if (! $verified) {
            return response()->json(['message' => 'Invalid two-factor authentication response.'], 422);
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

    public function regenerateRecoveryCodes(Request $request)
    {
        $user = $request->user();

        if (! $user->two_factor_confirmed_at) {
            return response()->json(['message' => 'Two-factor authentication is not enabled.'], 422);
        }

        $codes = $this->twoFactorService->generateRecoveryCodes();
        $user->forceFill([
            'two_factor_recovery_codes' => $this->twoFactorService->encryptRecoveryCodes($codes),
        ])->save();

        return response()->json(['recovery_codes' => $codes]);
    }

    public function disable(Request $request)
    {
        $request->user()->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        return response()->json(['message' => 'Two-factor authentication disabled.']);
    }
}
