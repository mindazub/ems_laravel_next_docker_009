<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Documentation extends Model
{
    use HasFactory;

    protected $table = 'documentations';

    protected $fillable = ['title','slug','category','content','excerpt','visibility','github_commits','version_added','version_updated','is_published','author_id','order'];
}
