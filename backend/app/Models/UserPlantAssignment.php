<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPlantAssignment extends Model
{
    use HasFactory;

    protected $table = 'user_plant_assignments';

    protected $fillable = ['user_id','plant_uid'];
}
