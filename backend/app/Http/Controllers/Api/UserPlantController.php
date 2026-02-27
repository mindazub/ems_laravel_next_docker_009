<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserPlant;
use Illuminate\Http\Request;

class UserPlantController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            UserPlant::query()
                ->when($request->query('approval_status'), fn ($query, $status) => $query->where('approval_status', $status))
                ->latest('created_at')
                ->get()
        );
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'uid' => ['required', 'string', 'unique:user_plants,uid'],
            'name' => ['required', 'string'],
            'description' => ['nullable', 'string'],
            'type' => ['required', 'string'],
            'capacity' => ['required', 'numeric'],
            'owner_name' => ['required', 'string'],
            'owner_email' => ['required', 'email'],
            'owner_phone' => ['required', 'string'],
            'address' => ['required', 'string'],
            'city' => ['required', 'string'],
            'state' => ['required', 'string'],
            'postal_code' => ['required', 'string'],
            'country' => ['required', 'string'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
        ]);

        $payload['created_by'] = $request->user()?->id;

        return response()->json(UserPlant::create($payload), 201);
    }

    public function approve(Request $request, int $id)
    {
        $userPlant = UserPlant::findOrFail($id);
        $userPlant->update([
            'approval_status' => 'approved',
            'approved_at' => now(),
            'approved_by' => $request->user()?->id,
            'rejection_reason' => null,
        ]);

        return response()->json($userPlant->fresh());
    }

    public function reject(Request $request, int $id)
    {
        $payload = $request->validate([
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $userPlant = UserPlant::findOrFail($id);
        $userPlant->update([
            'approval_status' => 'rejected',
            'approved_at' => null,
            'approved_by' => $request->user()?->id,
            'rejection_reason' => $payload['rejection_reason'] ?? null,
        ]);

        return response()->json($userPlant->fresh());
    }
}
