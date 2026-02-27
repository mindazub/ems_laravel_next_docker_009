<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PlantNameMapping;
use App\Models\QueueJobLog;
use App\Models\User;
use App\Models\UserActivity;
use Database\Seeders\PlantNameMappingSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

class AdminController extends Controller
{
    public function users()
    {
        return response()->json(
            User::query()
                ->select(['id', 'name', 'email', 'role', 'status', 'is_suspended', 'customer_id', 'email_verified_at', 'created_at'])
                ->orderBy('id')
                ->get()
        );
    }

    public function updateUser(int $id, \Illuminate\Http\Request $request)
    {
        $user = User::query()->findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'role' => ['sometimes', 'in:admin,staff,manager,installer,customer'],
            'status' => ['sometimes', 'string', 'max:50'],
            'is_suspended' => ['sometimes', 'boolean'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
        ]);

        $user->fill($validated);
        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user->only(['id', 'name', 'email', 'role', 'status', 'is_suspended', 'customer_id', 'email_verified_at', 'created_at']),
        ]);
    }

    public function activity()
    {
        return response()->json(UserActivity::query()->latest('created_at')->limit(250)->get());
    }

    public function queue()
    {
        return response()->json([
            'jobs_pending' => DB::table('jobs')->count(),
            'failed_jobs' => DB::table('failed_jobs')->count(),
            'logs' => QueueJobLog::query()->latest()->limit(100)->get(),
        ]);
    }

    public function analytics()
    {
        return response()->json([
            'users_by_role' => User::query()->select('role', DB::raw('count(*) as total'))->groupBy('role')->get(),
            'activity_by_type' => UserActivity::query()->select('activity_type', DB::raw('count(*) as total'))->groupBy('activity_type')->orderByDesc('total')->limit(20)->get(),
            'activity_by_device' => UserActivity::query()->select('device', DB::raw('count(*) as total'))->groupBy('device')->orderByDesc('total')->get(),
        ]);
    }

    public function plantNameMappings()
    {
        return response()->json(
            PlantNameMapping::query()
                ->select(['id', 'plant_uuid', 'display_name', 'description', 'is_active', 'created_at', 'updated_at'])
                ->orderBy('display_name')
                ->get()
        );
    }

    public function seedPlantNameMappings()
    {
        (new PlantNameMappingSeeder())->run();

        return response()->json([
            'message' => 'Plant name mappings seeded successfully.',
            'total' => PlantNameMapping::query()->count(),
        ]);
    }

    public function restartQueues()
    {
        Artisan::call('queue:restart');

        return response()->json(['message' => 'Queue workers restart signal sent.']);
    }

    public function retryFailedJobs()
    {
        Artisan::call('queue:retry', ['id' => ['all']]);

        return response()->json(['message' => 'Retry requested for failed jobs.']);
    }

    public function runSchedulerNow()
    {
        Artisan::call('schedule:run');

        return response()->json(['message' => 'Scheduler run completed.']);
    }

    public function apiDocs()
    {
        $routes = collect(Route::getRoutes())
            ->map(fn ($route) => [
                'uri' => $route->uri(),
                'methods' => array_values(array_diff($route->methods(), ['HEAD'])),
                'name' => $route->getName(),
                'action' => $route->getActionName(),
            ])
            ->filter(fn ($route) => str_starts_with($route['uri'], 'api/v1/'))
            ->values();

        return response()->json($routes);
    }
}
