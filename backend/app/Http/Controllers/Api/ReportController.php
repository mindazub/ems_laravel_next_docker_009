<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailJob;
use App\Models\PlantEvent;
use App\Models\ReportEmailTemplate;
use App\Models\WysiwygEmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function export(Request $request)
    {
        $payload = $request->validate([
            'format' => ['required', 'in:csv,xlsx,pdf'],
            'plant_uid' => ['nullable', 'string'],
        ]);

        $rows = PlantEvent::query()
            ->when($payload['plant_uid'] ?? null, fn ($query, $plantUid) => $query->where('plant_uid', $plantUid))
            ->latest('event_timestamp')
            ->limit(500)
            ->get(['plant_uid', 'event_type', 'severity', 'status', 'event_timestamp', 'title'])
            ->map(fn ($row) => [
                $row->plant_uid,
                $row->event_type,
                $row->severity,
                $row->status,
                $row->event_timestamp,
                $row->title,
            ])
            ->values()
            ->all();

        $header = ['plant_uid', 'event_type', 'severity', 'status', 'event_timestamp', 'title'];
        $fileName = 'ems-report-'.now()->format('Ymd-His');

        if ($payload['format'] === 'csv') {
            return response()->streamDownload(function () use ($header, $rows) {
                $output = fopen('php://output', 'w');
                fputcsv($output, $header);
                foreach ($rows as $row) {
                    fputcsv($output, $row);
                }
                fclose($output);
            }, $fileName.'.csv', ['Content-Type' => 'text/csv']);
        }

        if ($payload['format'] === 'xlsx') {
            return response()->streamDownload(function () use ($header, $rows) {
                $output = fopen('php://output', 'w');
                fputcsv($output, $header, "\t");
                foreach ($rows as $row) {
                    fputcsv($output, $row, "\t");
                }
                fclose($output);
            }, $fileName.'.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
        }

        $lines = [implode(' | ', $header)];
        foreach ($rows as $row) {
            $lines[] = implode(' | ', array_map(fn ($value) => (string) $value, $row));
        }

        return response(implode("\n", $lines), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="'.$fileName.'.pdf"',
        ]);
    }

    public function emailJobs(Request $request)
    {
        return response()->json(EmailJob::query()
            ->when($request->query('plant_uuid'), fn ($query, $plantUuid) => $query->where('plant_uuid', $plantUuid))
            ->latest()
            ->get());
    }

    public function createEmailJob(Request $request)
    {
        $payload = $request->validate([
            'plant_uuid' => ['required', 'string'],
            'email' => ['required', 'email'],
            'recurrence' => ['required', 'string'],
            'columns' => ['required'],
            'date_range' => ['nullable'],
            'format' => ['required', 'string'],
            'next_run_at' => ['nullable', 'date'],
        ]);

        $payload['created_by'] = $request->user()?->id;

        return response()->json(EmailJob::create($payload), 201);
    }

    public function updateEmailJob(Request $request, int $id)
    {
        $emailJob = EmailJob::findOrFail($id);
        $emailJob->update($request->only(['email', 'recurrence', 'columns', 'date_range', 'format', 'status', 'next_run_at']));

        return response()->json($emailJob->fresh());
    }

    public function deleteEmailJob(int $id)
    {
        EmailJob::findOrFail($id)->delete();

        return response()->json([], 204);
    }

    public function sendNow(int $id)
    {
        $emailJob = EmailJob::findOrFail($id);
        $emailJob->update([
            'status' => 'active',
            'next_run_at' => now(),
        ]);

        return response()->json(['message' => 'Email job queued for immediate processing.']);
    }

    public function templates()
    {
        return response()->json([
            'report' => ReportEmailTemplate::query()->latest()->get(),
            'wysiwyg' => WysiwygEmailTemplate::query()->latest()->get(),
        ]);
    }

    public function createReportTemplate(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'body_html' => ['required', 'string'],
            'header_logo_alignment' => ['nullable', 'string'],
            'footer_company_info_enabled' => ['nullable', 'boolean'],
            'footer_company_info_text' => ['nullable', 'string'],
            'is_default' => ['nullable', 'boolean'],
        ]);

        $payload['created_by'] = $request->user()?->id;

        return response()->json(ReportEmailTemplate::create($payload), 201);
    }

    public function updateReportTemplate(Request $request, int $id)
    {
        $template = ReportEmailTemplate::findOrFail($id);
        $template->update($request->only(['name', 'subject', 'body_html', 'header_logo_alignment', 'footer_company_info_enabled', 'footer_company_info_text', 'is_default']));

        return response()->json($template->fresh());
    }

    public function deleteReportTemplate(int $id)
    {
        ReportEmailTemplate::findOrFail($id)->delete();
        DB::table('report_email_template_assignments')->where('report_email_template_id', $id)->delete();

        return response()->json([], 204);
    }

    public function createWysiwygTemplate(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subject' => ['required', 'string', 'max:255'],
            'body_html' => ['required', 'string'],
            'header_logo_alignment' => ['nullable', 'string'],
            'footer_company_info_enabled' => ['nullable', 'boolean'],
            'footer_company_info_text' => ['nullable', 'string'],
            'is_default' => ['nullable', 'boolean'],
            'background_image' => ['nullable', 'string'],
        ]);

        $payload['created_by'] = $request->user()?->id;

        return response()->json(WysiwygEmailTemplate::create($payload), 201);
    }

    public function updateWysiwygTemplate(Request $request, int $id)
    {
        $template = WysiwygEmailTemplate::findOrFail($id);
        $template->update($request->only(['name', 'subject', 'body_html', 'header_logo_alignment', 'footer_company_info_enabled', 'footer_company_info_text', 'is_default', 'background_image']));

        return response()->json($template->fresh());
    }

    public function deleteWysiwygTemplate(int $id)
    {
        WysiwygEmailTemplate::findOrFail($id)->delete();
        DB::table('wysiwyg_email_template_assignments')->where('wysiwyg_email_template_id', $id)->delete();

        return response()->json([], 204);
    }

    public function assignTemplate(Request $request)
    {
        $payload = $request->validate([
            'template_type' => ['required', 'in:report,wysiwyg'],
            'template_id' => ['required', 'integer'],
            'scope_type' => ['required', 'string'],
            'scope_id' => ['required', 'string'],
        ]);

        if ($payload['template_type'] === 'report') {
            DB::table('report_email_template_assignments')->insert([
                'report_email_template_id' => $payload['template_id'],
                'scope_type' => $payload['scope_type'],
                'scope_id' => $payload['scope_id'],
                'created_by' => $request->user()?->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('wysiwyg_email_template_assignments')->insert([
                'wysiwyg_email_template_id' => $payload['template_id'],
                'scope_type' => $payload['scope_type'],
                'scope_id' => $payload['scope_id'],
                'created_by' => $request->user()?->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json(['message' => 'Template assigned.'], 201);
    }
}
