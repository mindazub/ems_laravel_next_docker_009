<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorService
{
    public function __construct(private readonly Google2FA $google2FA)
    {
    }

    public function generateSecret(): string
    {
        return $this->google2FA->generateSecretKey();
    }

    public function qrUri(User $user, string $secret): string
    {
        return $this->google2FA->getQRCodeUrl(config('app.name', 'EMS'), $user->email, $secret);
    }

    public function verifyCode(string $secret, string $code): bool
    {
        return $this->google2FA->verifyKey($secret, $code);
    }

    public function encryptSecret(string $secret): string
    {
        return Crypt::encryptString($secret);
    }

    public function decryptSecret(?string $encrypted): ?string
    {
        if (! $encrypted) {
            return null;
        }

        return Crypt::decryptString($encrypted);
    }

    public function generateRecoveryCodes(): array
    {
        return collect(range(1, 8))
            ->map(fn () => strtoupper(Str::random(4).'-'.Str::random(4)))
            ->all();
    }

    public function encryptRecoveryCodes(array $codes): string
    {
        return Crypt::encryptString(json_encode($codes, JSON_THROW_ON_ERROR));
    }

    public function decryptRecoveryCodes(?string $payload): array
    {
        if (! $payload) {
            return [];
        }

        $decoded = json_decode(Crypt::decryptString($payload), true, 512, JSON_THROW_ON_ERROR);

        return is_array($decoded) ? $decoded : [];
    }
}
