<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\RunBackupJob;
use App\Models\BackupSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class BackupController extends Controller
{
    public function settings()
    {
        return response()->json(BackupSetting::query()->first());
    }

    public function updateSettings(Request $request)
    {
        $payload = $request->validate([
            'auto_backup_enabled' => ['boolean'],
            'frequency' => ['string'],
            'backup_time' => ['date_format:H:i:s'],
            'custom_interval_minutes' => ['nullable', 'integer', 'min:5'],
            'retention_count' => ['integer', 'min:1', 'max:365'],
            'compress_backup' => ['boolean'],
            'custom_backup_count' => ['integer', 'min:0'],
            'backup_day_of_week' => ['nullable', 'integer', 'min:0', 'max:6'],
            'backup_day_of_month' => ['nullable', 'integer', 'min:1', 'max:31'],
        ]);

        $settings = BackupSetting::query()->firstOrCreate([], [
            'frequency' => 'daily',
            'backup_time' => '02:00:00',
            'retention_count' => 10,
        ]);

        $settings->update($payload);

        return response()->json($settings->fresh());
    }

    public function list()
    {
        $backupDir = storage_path('app/backups');
        File::ensureDirectoryExists($backupDir);

        $files = collect(File::files($backupDir))
            ->map(fn ($file) => [
                'name' => $file->getFilename(),
                'size' => $file->getSize(),
                'modified_at' => date('c', $file->getMTime()),
            ])
            ->sortByDesc('modified_at')
            ->values();

        return response()->json($files);
    }

    public function createNow()
    {
        RunBackupJob::dispatchSync();

        return response()->json(['message' => 'Backup created.']);
    }

    public function download(string $filename)
    {
        $path = storage_path('app/backups/'.basename($filename));
        abort_unless(File::exists($path), 404, 'Backup not found.');

        return response()->download($path);
    }

    public function delete(string $filename)
    {
        $path = storage_path('app/backups/'.basename($filename));
        abort_unless(File::exists($path), 404, 'Backup not found.');

        File::delete($path);

        return response()->json([], 204);
    }

    public function restore(string $filename)
    {
        $path = storage_path('app/backups/'.basename($filename));
        abort_unless(File::exists($path), 404, 'Backup not found.');

        $target = database_path('database.sqlite');

        if (str_ends_with($path, '.zip')) {
            $zip = new \ZipArchive();
            $zip->open($path);
            $zip->extractTo(dirname($target));
            $zip->close();
        } else {
            File::copy($path, $target);
        }

        return response()->json(['message' => 'Backup restored.']);
    }
}
