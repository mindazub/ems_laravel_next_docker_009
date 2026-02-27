<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReportEmailTemplate extends Model
{
    use HasFactory;

    protected $table = 'report_email_templates';

    protected $fillable = ['name','subject','body_html','header_logo_alignment','footer_company_info_enabled','footer_company_info_text','is_default','created_by'];
}
