<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Plant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CustomerAssignmentController extends Controller
{
    public function index(Customer $customer)
    {
        $assignedPlantUids = DB::table('customer_plant')
            ->where('customer_id', $customer->id)
            ->pluck('plant_uid');

        return response()->json([
            'customer' => $customer,
            'assigned_plants' => Plant::query()->whereIn('uid', $assignedPlantUids)->get(),
            'assigned_plant_uids' => $assignedPlantUids,
        ]);
    }

    public function assign(Request $request, Customer $customer)
    {
        $payload = $request->validate([
            'plant_uid' => ['required', 'string', 'exists:plants,uid'],
        ]);

        $exists = DB::table('customer_plant')
            ->where('customer_id', $customer->id)
            ->where('plant_uid', $payload['plant_uid'])
            ->exists();

        if (! $exists) {
            DB::table('customer_plant')->insert([
                'customer_id' => $customer->id,
                'plant_uid' => $payload['plant_uid'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Plant assigned to customer.'], 201);
    }

    public function unassign(Customer $customer, string $plantUid)
    {
        DB::table('customer_plant')
            ->where('customer_id', $customer->id)
            ->where('plant_uid', $plantUid)
            ->delete();

        return response()->json([], 204);
    }
}
