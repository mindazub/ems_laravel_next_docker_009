<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plant extends Model
{
    use HasFactory;

    protected $table = 'plants';

    protected $fillable = ['uid','owner','capacity','latitude','longitude','status','updated_at','price_calculation_method','plant_name'];
}
