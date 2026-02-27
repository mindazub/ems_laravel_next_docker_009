<?php

namespace App\Jobs;

use App\Models\QueueJobLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class QueueWatchdogJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        QueueJobLog::create([
            'job_type' => 'queue_watchdog',
            'status' => 'success',
            'result' => json_encode([
                'jobs_pending' => DB::table('jobs')->count(),
                'failed_jobs' => DB::table('failed_jobs')->count(),
            ], JSON_THROW_ON_ERROR),
            'queued_at' => now(),
            'started_at' => now(),
            'completed_at' => now(),
        ]);
    }
}
