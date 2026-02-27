<?php

namespace App\Jobs;

use App\Models\EmailJob;
use App\Models\QueueJobLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class ProcessEmailJobsJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $jobs = EmailJob::query()
            ->where('status', 'active')
            ->where(fn ($query) => $query->whereNull('next_run_at')->orWhere('next_run_at', '<=', now()))
            ->limit(25)
            ->get();

        foreach ($jobs as $emailJob) {
            try {
                Mail::raw('EMS report job '.$emailJob->id.' executed.', function ($message) use ($emailJob) {
                    $message->to($emailJob->email)->subject('EMS Scheduled Report');
                });

                $emailJob->forceFill([
                    'last_run_at' => now(),
                    'emails_sent_count' => (int) $emailJob->emails_sent_count + 1,
                    'occurrences_count' => (int) $emailJob->occurrences_count + 1,
                    'next_run_at' => $this->nextRunAt($emailJob->recurrence),
                    'last_error' => null,
                ])->save();

                QueueJobLog::create([
                    'job_type' => 'report_email_dispatch',
                    'status' => 'success',
                    'result' => 'Email sent to '.$emailJob->email,
                    'queued_at' => now(),
                    'started_at' => now(),
                    'completed_at' => now(),
                ]);
            } catch (\Throwable $throwable) {
                $emailJob->forceFill([
                    'last_error' => $throwable->getMessage(),
                    'last_run_at' => now(),
                    'next_run_at' => now()->addMinutes(15),
                ])->save();

                QueueJobLog::create([
                    'job_type' => 'report_email_dispatch',
                    'status' => 'failed',
                    'result' => $throwable->getMessage(),
                    'queued_at' => now(),
                    'started_at' => now(),
                    'completed_at' => now(),
                ]);
            }
        }
    }

    private function nextRunAt(string $recurrence)
    {
        return match ($recurrence) {
            'daily' => now()->addDay(),
            'weekly' => now()->addWeek(),
            'monthly' => now()->addMonth(),
            default => now()->addHours(1),
        };
    }
}
