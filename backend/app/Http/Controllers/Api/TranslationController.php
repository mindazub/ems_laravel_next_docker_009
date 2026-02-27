<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Translation;
use Illuminate\Http\Request;

class TranslationController extends Controller
{
    public function index(Request $request)
    {
        $locale = $request->query('locale', 'en');

        return response()->json(
            Translation::query()
                ->where('locale', $locale)
                ->orderBy('key')
                ->get(['key', 'value'])
                ->pluck('value', 'key')
        );
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'key' => ['required', 'string', 'max:255'],
            'locale' => ['required', 'string', 'max:12'],
            'value' => ['required', 'string'],
        ]);

        $translation = Translation::updateOrCreate(
            ['key' => $payload['key'], 'locale' => $payload['locale']],
            ['value' => $payload['value']]
        );

        return response()->json($translation, 201);
    }

    public function update(Request $request, int $id)
    {
        $translation = Translation::findOrFail($id);
        $payload = $request->validate([
            'value' => ['required', 'string'],
        ]);

        $translation->update($payload);

        return response()->json($translation->fresh());
    }

    public function destroy(int $id)
    {
        Translation::findOrFail($id)->delete();

        return response()->json([], 204);
    }
}
