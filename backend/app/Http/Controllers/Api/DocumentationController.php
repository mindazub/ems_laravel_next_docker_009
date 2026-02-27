<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Documentation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DocumentationController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(
            Documentation::query()
                ->when($request->query('visibility'), fn ($query, $visibility) => $query->where('visibility', $visibility))
                ->orderBy('order')
                ->orderBy('title')
                ->get()
        );
    }

    public function show(int $id)
    {
        return response()->json(Documentation::findOrFail($id));
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:documentations,slug'],
            'category' => ['required', 'string', 'max:100'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string'],
            'visibility' => ['required', 'string'],
            'is_published' => ['boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $payload['slug'] = $payload['slug'] ?? Str::slug($payload['title']);
        $payload['author_id'] = $request->user()?->id;

        return response()->json(Documentation::create($payload), 201);
    }

    public function update(Request $request, int $id)
    {
        $documentation = Documentation::findOrFail($id);

        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', 'unique:documentations,slug,'.$id],
            'category' => ['sometimes', 'string', 'max:100'],
            'content' => ['sometimes', 'string'],
            'excerpt' => ['nullable', 'string'],
            'visibility' => ['sometimes', 'string'],
            'is_published' => ['sometimes', 'boolean'],
            'order' => ['nullable', 'integer', 'min:0'],
        ]);

        $documentation->update($payload);

        return response()->json($documentation->fresh());
    }

    public function destroy(int $id)
    {
        Documentation::findOrFail($id)->delete();

        return response()->json([], 204);
    }
}
