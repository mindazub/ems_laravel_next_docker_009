<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScadaDiagram extends Model
{
    use HasFactory;

    protected $table = 'scada_diagrams';

    protected $fillable = ['user_id','name','description','diagram_data','is_shared','plant_id','show_on_frontend','plant_uid'];
}
