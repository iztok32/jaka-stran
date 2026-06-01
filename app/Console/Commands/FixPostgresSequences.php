<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class FixPostgresSequences extends Command
{
    protected $signature = 'db:fix-sequences';
    protected $description = 'Fix PostgreSQL auto-increment sequences that are out of sync';

    public function handle(): void
    {
        $tables = DB::select("
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_type = 'BASE TABLE'
        ");

        foreach ($tables as $table) {
            $tableName = $table->table_name;

            try {
                $sequence = DB::selectOne("
                    SELECT pg_get_serial_sequence(:table, 'id') AS seq
                ", ['table' => $tableName]);
            } catch (\Exception $e) {
                continue; // table has no 'id' column
            }

            if (!$sequence || !$sequence->seq) {
                continue;
            }

            $seqName = $sequence->seq;

            $max = DB::selectOne("SELECT COALESCE(MAX(id), 0) AS max_id FROM \"{$tableName}\"");
            $maxId = max((int) $max->max_id, 1);

            DB::statement("SELECT setval('{$seqName}', {$maxId}, true)");

            $this->line("  Fixed: {$tableName} → sequence set to {$maxId}");
        }

        $this->info('All sequences fixed successfully.');
    }
}
