<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BackupController;
use App\Http\Controllers\Api\CustomerAssignmentController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\DiagramController;
use App\Http\Controllers\Api\DocumentationController;
use App\Http\Controllers\Api\PlantController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\TranslationController;
use App\Http\Controllers\Api\UserPlantController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->middleware('api.user')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);
    Route::post('/auth/email/verify', [AuthController::class, 'verifyEmail']);
    Route::post('/auth/2fa/challenge', [TwoFactorController::class, 'challenge']);
    Route::get('/translations', [TranslationController::class, 'index']);

    Route::middleware('api.auth')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/password', [AuthController::class, 'updatePassword']);
        Route::post('/auth/email/verification-notification', [AuthController::class, 'sendEmailVerification']);
        Route::post('/auth/2fa/setup', [TwoFactorController::class, 'setup']);
        Route::post('/auth/2fa/confirm', [TwoFactorController::class, 'confirm']);
        Route::post('/auth/2fa/recovery-codes/regenerate', [TwoFactorController::class, 'regenerateRecoveryCodes']);
        Route::delete('/auth/2fa', [TwoFactorController::class, 'disable']);

    Route::get('/plants/list', [PlantController::class, 'list']);
    Route::get('/plants/{uid}/show', [PlantController::class, 'show']);
    Route::get('/plants/{uid}/view', [PlantController::class, 'view']);
    Route::get('/plants/{uid}/events', [PlantController::class, 'events']);
    Route::get('/plants/{uid}/reaggregated-data', [PlantController::class, 'reaggregatedData']);

    Route::get('/diagrams/scada', [DiagramController::class, 'scadaIndex']);
    Route::post('/diagrams/scada', [DiagramController::class, 'scadaStore'])->middleware('role:admin,staff');
    Route::get('/diagrams/scada/{id}', [DiagramController::class, 'scadaShow']);
    Route::put('/diagrams/scada/{id}', [DiagramController::class, 'scadaUpdate'])->middleware('role:admin,staff');
    Route::delete('/diagrams/scada/{id}', [DiagramController::class, 'scadaDestroy'])->middleware('role:admin');

    Route::get('/diagrams/json', [DiagramController::class, 'jsonIndex']);
    Route::post('/diagrams/json', [DiagramController::class, 'jsonStore'])->middleware('role:admin,staff');

    Route::apiResource('customers', CustomerController::class)->middleware('role:admin,staff');
    Route::post('/customers/{customer}/scrape-rekvizitai', [CustomerController::class, 'scrapeRekvizitai'])->middleware('role:admin,staff');
    Route::get('/customers/{customer}/plants', [CustomerAssignmentController::class, 'index'])->middleware('role:admin,staff');
    Route::post('/customers/{customer}/plants', [CustomerAssignmentController::class, 'assign'])->middleware('role:admin,staff');
    Route::delete('/customers/{customer}/plants/{plantUid}', [CustomerAssignmentController::class, 'unassign'])->middleware('role:admin,staff');

    Route::get('/user-plants', [UserPlantController::class, 'index']);
    Route::post('/user-plants', [UserPlantController::class, 'store']);
    Route::post('/user-plants/{id}/approve', [UserPlantController::class, 'approve'])->middleware('role:admin,staff');
    Route::post('/user-plants/{id}/reject', [UserPlantController::class, 'reject'])->middleware('role:admin,staff');

    Route::get('/reports/email-jobs', [ReportController::class, 'emailJobs']);
    Route::get('/reports/export', [ReportController::class, 'export']);
    Route::post('/reports/email-jobs', [ReportController::class, 'createEmailJob'])->middleware('role:admin,staff');
    Route::put('/reports/email-jobs/{id}', [ReportController::class, 'updateEmailJob'])->middleware('role:admin,staff');
    Route::delete('/reports/email-jobs/{id}', [ReportController::class, 'deleteEmailJob'])->middleware('role:admin,staff');
    Route::post('/reports/email-jobs/{id}/send-now', [ReportController::class, 'sendNow'])->middleware('role:admin,staff');
    Route::get('/reports/templates', [ReportController::class, 'templates']);
    Route::post('/reports/templates/report', [ReportController::class, 'createReportTemplate'])->middleware('role:admin,staff');
    Route::put('/reports/templates/report/{id}', [ReportController::class, 'updateReportTemplate'])->middleware('role:admin,staff');
    Route::delete('/reports/templates/report/{id}', [ReportController::class, 'deleteReportTemplate'])->middleware('role:admin,staff');
    Route::post('/reports/templates/wysiwyg', [ReportController::class, 'createWysiwygTemplate'])->middleware('role:admin,staff');
    Route::put('/reports/templates/wysiwyg/{id}', [ReportController::class, 'updateWysiwygTemplate'])->middleware('role:admin,staff');
    Route::delete('/reports/templates/wysiwyg/{id}', [ReportController::class, 'deleteWysiwygTemplate'])->middleware('role:admin,staff');
    Route::post('/reports/templates/assign', [ReportController::class, 'assignTemplate'])->middleware('role:admin,staff');

    Route::apiResource('documentations', DocumentationController::class);

    Route::post('/translations', [TranslationController::class, 'store'])->middleware('role:admin,staff');
    Route::put('/translations/{id}', [TranslationController::class, 'update'])->middleware('role:admin,staff');
    Route::delete('/translations/{id}', [TranslationController::class, 'destroy'])->middleware('role:admin,staff');

    Route::get('/backups/settings', [BackupController::class, 'settings'])->middleware('role:admin');
    Route::put('/backups/settings', [BackupController::class, 'updateSettings'])->middleware('role:admin');
    Route::get('/backups', [BackupController::class, 'list'])->middleware('role:admin');
    Route::post('/backups/create', [BackupController::class, 'createNow'])->middleware('role:admin');
    Route::get('/backups/download/{filename}', [BackupController::class, 'download'])->middleware('role:admin');
    Route::delete('/backups/{filename}', [BackupController::class, 'delete'])->middleware('role:admin');
    Route::post('/backups/restore/{filename}', [BackupController::class, 'restore'])->middleware('role:admin');

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/activity', [AdminController::class, 'activity']);
        Route::get('/queue', [AdminController::class, 'queue']);
        Route::get('/analytics', [AdminController::class, 'analytics']);
        Route::get('/api-docs', [AdminController::class, 'apiDocs']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::post('/queue/restart', [AdminController::class, 'restartQueues']);
        Route::post('/queue/retry-failed', [AdminController::class, 'retryFailedJobs']);
        Route::post('/scheduler/run-now', [AdminController::class, 'runSchedulerNow']);
    });
    });
});
