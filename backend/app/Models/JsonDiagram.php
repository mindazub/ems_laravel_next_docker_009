<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JsonDiagram extends Model
{
    use HasFactory;

    protected $table = 'json_diagrams';

    protected $fillable = ['plant_uid','user_id','name','description','diagram_data','is_json_type'];
}
