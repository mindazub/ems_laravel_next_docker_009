<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class V2PlantApiClient
{
    public function get(string $endpoint, array $query = []): array
    {
        $baseUrl = config('plants.v2.base_url');
        $token = config('plants.v2.token');

        if (! $baseUrl || ! $token) {
            throw new RuntimeException('EMS V2 API configuration is missing. Set EMS_V2_API_BASE_URL and EMS_V2_API_TOKEN.');
        }

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->retry((int) config('plants.v2.retry_times', 2), 250)
                ->timeout((int) config('plants.v2.timeout_seconds', 20))
                ->get(rtrim($baseUrl, '/').'/'.ltrim($endpoint, '/'), $query);
        } catch (Throwable $exception) {
            throw new RuntimeException('V2 API request failed: '.$exception->getMessage(), 0, $exception);
        }

        if ($response->failed()) {
            throw new RuntimeException('V2 API request failed: '.$response->status().' '.$response->body());
        }

        return $response->json() ?? [];
    }
}
