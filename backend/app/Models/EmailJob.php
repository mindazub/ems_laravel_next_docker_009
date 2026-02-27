<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailJob extends Model
{
    use HasFactory;

    protected $table = 'email_jobs';

    protected $fillable = ['plant_uuid','email','recurrence','columns','date_range','format','status','next_run_at','last_run_at','last_error','created_by','stop_after_occurrences','occurrences_count','unsubscribe_token','emails_sent_count'];
}
