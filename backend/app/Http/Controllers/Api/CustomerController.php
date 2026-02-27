<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        return response()->json(Customer::query()
            ->when($request->query('q'), fn ($query, $term) => $query->where('name', 'like', "%{$term}%"))
            ->latest()
            ->get());
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'website' => ['nullable', 'url'],
            'rekvizitai_url' => ['nullable', 'url'],
        ]);

        return response()->json(Customer::create($payload), 201);
    }

    public function show(string $id)
    {
        return response()->json(Customer::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $customer = Customer::findOrFail($id);
        $customer->update($request->all());

        return response()->json($customer->fresh());
    }

    public function destroy(string $id)
    {
        Customer::findOrFail($id)->delete();

        return response()->json([], 204);
    }

    public function scrapeRekvizitai(int $customerId)
    {
        $customer = Customer::query()->findOrFail($customerId);

        if (! $customer->rekvizitai_url) {
            return response()->json(['message' => 'Customer has no rekvizitai_url configured.'], 422);
        }

        $customer->forceFill(['is_scraping' => true])->save();

        $response = Http::timeout(20)->retry(1, 200)->get($customer->rekvizitai_url);
        if (! $response->ok()) {
            $customer->forceFill(['is_scraping' => false])->save();

            return response()->json(['message' => 'Failed to fetch Rekvizitai page.'], 502);
        }

        $html = $response->body();

        preg_match('/<title>(.*?)<\/title>/is', $html, $titleMatch);
        preg_match('/<meta\s+property="og:description"\s+content="(.*?)"\s*\/?>/is', $html, $descriptionMatch);
        preg_match('/<meta\s+property="og:image"\s+content="(.*?)"\s*\/?>/is', $html, $imageMatch);

        $scrapedDescription = trim(html_entity_decode($descriptionMatch[1] ?? $titleMatch[1] ?? ''));
        $logoUrl = trim(html_entity_decode($imageMatch[1] ?? '')) ?: null;

        $customer->forceFill([
            'is_scraping' => false,
            'last_scraped_at' => now(),
            'scraped_description' => $scrapedDescription ?: null,
            'logo_url' => $logoUrl,
        ])->save();

        return response()->json([
            'message' => 'Rekvizitai scrape completed.',
            'customer' => $customer->fresh(),
        ]);
    }
}
