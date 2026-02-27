<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plant;
use App\Models\PlantEvent;
use App\Models\PlantNameMapping;
use App\Services\V2PlantApiClient;
use Illuminate\Http\Request;
use RuntimeException;

class PlantController extends Controller
{
    public function __construct(private readonly V2PlantApiClient $v2PlantApiClient)
    {
    }

    public function list()
    {
        $plants = Plant::query()->get();
        $external = $this->safeExternalWithFallback([
            'plant_list',
            'plants',
        ]);

        $externalPlants = isset($external['plants']) && is_array($external['plants']) ? $external['plants'] : [];
        $uids = $plants->pluck('uid')
            ->merge(collect($externalPlants)->pluck('uuid'))
            ->filter(fn ($uid) => is_string($uid) && $uid !== '')
            ->unique()
            ->values()
            ->all();
        $displayNames = $this->displayNamesForUids($uids);

        $localPayload = $plants->map(function (Plant $plant) use ($displayNames) {
            return [
                ...$plant->toArray(),
                'display_name' => $displayNames[$plant->uid] ?? $plant->plant_name,
            ];
        });

        if (isset($external['plants']) && is_array($external['plants'])) {
            $external['plants'] = array_map(function (array $plant) use ($displayNames) {
                $uid = isset($plant['uuid']) && is_string($plant['uuid']) ? $plant['uuid'] : null;

                return [
                    ...$plant,
                    'display_name' => $uid ? ($displayNames[$uid] ?? null) : null,
                ];
            }, $external['plants']);
        }

        return response()->json([
            'local' => $localPayload,
            'external' => $external,
        ]);
    }

    public function show(string $uid)
    {
        $plant = Plant::where('uid', $uid)->firstOrFail();
        $displayName = $this->displayNameForUid($uid, $plant->plant_name);

        return response()->json([
            'plant' => [
                ...$plant->toArray(),
                'display_name' => $displayName,
            ],
            'display_name' => $displayName,
        ]);
    }

    public function view(string $uid)
    {
        $plant = Plant::where('uid', $uid)->first();
        $displayName = $this->displayNameForUid($uid, $plant?->plant_name);
        $external = $this->safeExternalWithFallback([
            "plant_view/{$uid}",
            "plants/{$uid}",
            "plants/{$uid}/view",
        ]);

        if (isset($external['plant_metadata']) && is_array($external['plant_metadata'])) {
            $external['plant_metadata'] = [
                ...$external['plant_metadata'],
                'display_name' => $displayName,
            ];
        }

        return response()->json([
            'local' => $plant ? [
                ...$plant->toArray(),
                'display_name' => $displayName,
            ] : null,
            'external' => $external,
            'display_name' => $displayName,
        ]);
    }

    public function events(string $uid)
    {
        return response()->json([
            'local' => PlantEvent::where('plant_uid', $uid)->latest('event_timestamp')->limit(200)->get(),
            'external' => $this->safeExternal("plants/{$uid}/events"),
        ]);
    }

    public function reaggregatedData(Request $request, string $uid)
    {
        return response()->json([
            'external' => $this->safeExternal("plants/{$uid}/reaggregated-data", [
                'range' => $request->query('range', 'day'),
                'date' => $request->query('date'),
            ]),
        ]);
    }

    private function safeExternal(string $endpoint, array $query = []): array
    {
        try {
            return $this->v2PlantApiClient->get($endpoint, $query);
        } catch (RuntimeException $exception) {
            return ['error' => $exception->getMessage()];
        }
    }

    private function safeExternalWithFallback(array $endpoints, array $query = []): array
    {
        foreach ($endpoints as $endpoint) {
            $result = $this->safeExternal($endpoint, $query);
            if (! isset($result['error'])) {
                return $result;
            }
        }

        return $result ?? ['error' => 'External API request failed.'];
    }

    private function displayNamesForUids(array $uids): array
    {
        return PlantNameMapping::query()
            ->whereIn('plant_uuid', $uids)
            ->where('is_active', 1)
            ->pluck('display_name', 'plant_uuid')
            ->toArray();
    }

    private function displayNameForUid(string $uid, ?string $fallback = null): ?string
    {
        $displayName = PlantNameMapping::query()
            ->where('plant_uuid', $uid)
            ->where('is_active', 1)
            ->value('display_name');

        if (is_string($displayName) && $displayName !== '') {
            return $displayName;
        }

        return $fallback;
    }
}
