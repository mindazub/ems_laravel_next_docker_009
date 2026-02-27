<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JsonDiagram;
use App\Models\ScadaDiagram;
use Illuminate\Http\Request;

class DiagramController extends Controller
{
    public function scadaIndex(Request $request)
    {
        return response()->json(ScadaDiagram::query()
            ->when($request->query('plant_uid'), fn ($query, $plantUid) => $query->where('plant_uid', $plantUid))
            ->latest()
            ->get());
    }

    public function scadaShow(int $id)
    {
        return response()->json(ScadaDiagram::findOrFail($id));
    }

    public function scadaStore(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'diagram_data' => ['required'],
            'plant_uid' => ['nullable', 'string'],
            'show_on_frontend' => ['boolean'],
        ]);

        $payload['user_id'] = $request->user()?->id;

        return response()->json(ScadaDiagram::create($payload), 201);
    }

    public function scadaUpdate(Request $request, int $id)
    {
        $diagram = ScadaDiagram::findOrFail($id);
        $diagram->update($request->only(['name', 'description', 'diagram_data', 'plant_uid', 'show_on_frontend', 'is_shared']));

        return response()->json($diagram->fresh());
    }

    public function scadaDestroy(int $id)
    {
        ScadaDiagram::findOrFail($id)->delete();

        return response()->json([], 204);
    }

    public function jsonIndex(Request $request)
    {
        return response()->json(JsonDiagram::query()
            ->when($request->query('plant_uid'), fn ($query, $plantUid) => $query->where('plant_uid', $plantUid))
            ->latest()
            ->get());
    }

    public function jsonStore(Request $request)
    {
        $payload = $request->validate([
            'plant_uid' => ['required', 'string'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'diagram_data' => ['required'],
            'is_json_type' => ['boolean'],
        ]);

        $payload['user_id'] = $request->user()?->id;

        return response()->json(JsonDiagram::create($payload), 201);
    }
}
