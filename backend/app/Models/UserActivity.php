<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserActivity extends Model
{
    use HasFactory;

    protected $table = 'user_activities';

    protected $fillable = ['user_id','session_id','activity_type','description','url','method','properties','ip_address','user_agent','browser','platform','device','location','created_at'];
}
