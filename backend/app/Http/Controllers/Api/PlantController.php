<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plant;
use App\Models\PlantEvent;
use App\Models\PlantNameMapping;
use App\Models\UserPlantAssignment;
use App\Services\V2PlantApiClient;
use Illuminate\Http\Request;
use RuntimeException;

class PlantController extends Controller
{
    public function __construct(private readonly V2PlantApiClient $v2PlantApiClient)
    {
    }

    public function list(Request $request)
    {
        $user = $request->user();
        $query = Plant::query();

        if ($user && $user->role === 'customer') {
            $assignedPlantUids = UserPlantAssignment::where('user_id', $user->id)->pluck('plant_uid');
            $query->whereIn('uid', $assignedPlantUids);
        }

        $plants = $query->get();

        return response()->json([
            'local' => $plants,
            'external' => $this->safeExternal('plants'),
        ]);
    }

    public function show(string $uid)
    {
        $plant = Plant::where('uid', $uid)->firstOrFail();
        $nameMapping = PlantNameMapping::where('plant_uuid', $uid)->where('is_active', 1)->first();

        return response()->json([
            'plant' => $plant,
            'display_name' => $nameMapping?->display_name ?? $plant->plant_name,
        ]);
    }

    public function view(string $uid)
    {
        return response()->json([
            'local' => Plant::where('uid', $uid)->firstOrFail(),
            'external' => $this->safeExternal("plants/{$uid}/view"),
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
}
