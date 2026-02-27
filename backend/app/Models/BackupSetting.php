<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BackupSetting extends Model
{
    use HasFactory;

    protected $table = 'backup_settings';

    protected $fillable = ['auto_backup_enabled','frequency','backup_time','custom_interval_minutes','retention_count','compress_backup','last_backup_at','last_backup_status','custom_backup_count','backup_day_of_week','backup_day_of_month'];
}
