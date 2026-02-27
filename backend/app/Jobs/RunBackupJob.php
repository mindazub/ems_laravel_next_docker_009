<?php

namespace App\Jobs;

use App\Models\BackupSetting;
use App\Models\QueueJobLog;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use ZipArchive;

class RunBackupJob implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $settings = BackupSetting::query()->first();
        $source = database_path('database.sqlite');
        $backupDir = storage_path('app/backups');

        if (! File::exists($source)) {
            throw new \RuntimeException('Source SQLite database not found for backup.');
        }

        File::ensureDirectoryExists($backupDir);

        $filename = 'database_backup_'.now()->format('Y-m-d_His').'.sqlite';
        $target = $backupDir.DIRECTORY_SEPARATOR.$filename;

        File::copy($source, $target);

        if ($settings?->compress_backup) {
            $zipPath = $target.'.zip';
            $zip = new ZipArchive();
            $zip->open($zipPath, ZipArchive::CREATE | ZipArchive::OVERWRITE);
            $zip->addFile($target, basename($target));
            $zip->close();
            File::delete($target);
            $target = $zipPath;
        }

        if ($settings) {
            $settings->forceFill([
                'last_backup_at' => now()->toDateTimeString(),
                'last_backup_status' => 'success',
            ])->save();
        }

        QueueJobLog::create([
            'job_id' => (string) Str::uuid(),
            'job_type' => 'database_backup',
            'status' => 'success',
            'result' => 'Backup created: '.basename($target),
            'queued_at' => now(),
            'started_at' => now(),
            'completed_at' => now(),
        ]);
    }
}
