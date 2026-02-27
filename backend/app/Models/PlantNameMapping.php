<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PlantNameMapping extends Model
{
    use HasFactory;

    protected $table = 'plant_name_mappings';

    protected $fillable = ['plant_uuid','display_name','description','is_active'];
}
