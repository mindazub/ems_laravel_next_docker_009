<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantEvent extends Model
{
    use HasFactory;

    protected $table = 'plant_events';

    protected $fillable = ['plant_uid','device_uid','event_type','event_category','title','description','severity','status','metadata','event_timestamp','resolved_at','resolved_by'];
}
