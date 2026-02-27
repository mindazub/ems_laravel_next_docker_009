<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QueueJobLog extends Model
{
    use HasFactory;

    protected $table = 'queue_job_logs';

    protected $fillable = ['job_id','job_type','status','payload','result','user_id','user_email','user_name','queued_at','started_at','completed_at','attempts'];
}
