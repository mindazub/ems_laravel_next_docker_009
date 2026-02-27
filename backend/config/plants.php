<?php

return [
    'v2' => [
        'base_url' => env('EMS_V2_API_BASE_URL'),
        'token' => env('EMS_V2_API_TOKEN'),
        'timeout_seconds' => env('EMS_V2_API_TIMEOUT', 20),
        'retry_times' => env('EMS_V2_API_RETRY_TIMES', 2),
    ],
];
