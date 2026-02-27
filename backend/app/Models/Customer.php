<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    use HasFactory;

    protected $table = 'customers';

    protected $fillable = ['name','email','phone','address','description','is_active','icon','icon_color','website','rekvizitai_url','manager','facebook','employees','turnover','last_scraped_at','is_scraping','scraped_description','logo_url'];
}
