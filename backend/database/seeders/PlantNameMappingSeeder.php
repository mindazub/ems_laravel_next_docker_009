<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\PlantNameMapping;
use Illuminate\Database\Seeder;

class PlantNameMappingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mappings = [
            '96f19ddd-d0b9-4a61-a22a-a81afdc6e9db' => 'Grinda Plant',
            '65f20fa1-047a-4379-8464-59f1d94be3c7' => 'Viasolis Plant',
            '0872bb54-0ac0-4ec6-88a3-d8b7f78e5aef' => 'Saldi Svajone Plant',
            '926b5283-1df1-4d98-a6a1-2825e603fa78' => 'PrintIN Plant',
            'd09da530-2200-4a4f-981a-d1e060d1ce2a' => 'Litcargus Plant',
            '89efd2e9-5bfa-4f75-af1c-3e1ad58d2ef9' => 'Zemaitijos Energija Plant',
            '9a50f1c4-635b-48ac-af09-8bcbc2d04ba2' => 'Eneka Plant',
            '5588bf43-4d45-4e58-91df-4f4840f6b792' => 'Egliana Plant',
            '62786c22-949c-464b-ab81-617ef28c80c4' => 'Elinta 001 Plant',
            '5d0009be-3e5b-4c1d-b18b-b489aa243c53' => 'Elinta 002 Plant',
            'dabca712-8e3b-4c03-9b66-e09f1c414328' => 'Elinta 003 Plant',
            '44d91546-8f2f-48c3-9132-5bcb6769f500' => 'Vičiūnai Plant',
            '321dad44-4e51-47bf-b8ad-474572925b61' => 'Laimučio Palionio firma Plant',
        ];

        foreach ($mappings as $uuid => $name) {
            PlantNameMapping::updateOrCreate(
                ['plant_uuid' => $uuid],
                [
                    'display_name' => $name,
                    'is_active' => true,
                ]
            );
        }
    }
}
