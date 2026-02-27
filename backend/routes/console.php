<?php

use App\Jobs\ProcessEmailJobsJob;
use App\Jobs\QueueWatchdogJob;
use App\Jobs\RunBackupJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new ProcessEmailJobsJob())->everyFifteenMinutes();
Schedule::job(new QueueWatchdogJob())->everyFiveMinutes();
Schedule::job(new RunBackupJob())->dailyAt('02:00');
