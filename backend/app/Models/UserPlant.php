<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserPlant extends Model
{
    use HasFactory;

    protected $table = 'user_plants';

    protected $fillable = [
        'uid',
        'name',
        'description',
        'type',
        'capacity',
        'owner_name',
        'owner_email',
        'owner_phone',
        'address',
        'city',
        'state',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'approval_status',
        'approved_at',
        'approved_by',
        'rejection_reason',
        'created_by',
    ];
}
