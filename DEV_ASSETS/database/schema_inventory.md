## activity_log_settings (rows=10)
- id | INTEGER | notnull=1 | pk=1 | default=None
- activity_type | varchar | notnull=1 | pk=0 | default=None
- display_name | varchar | notnull=1 | pk=0 | default=None
- description | TEXT | notnull=0 | pk=0 | default=None
- is_enabled | tinyint(1) | notnull=1 | pk=0 | default='1'
- additional_fields | TEXT | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## aggregated_data_snapshots (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- uid | varchar | notnull=1 | pk=0 | default=None
- plant_id | INTEGER | notnull=1 | pk=0 | default=None
- battery_p | numeric | notnull=1 | pk=0 | default=None
- battery_savings | numeric | notnull=1 | pk=0 | default=None
- battery_soc | numeric | notnull=1 | pk=0 | default=None
- dt | INTEGER | notnull=1 | pk=0 | default=None
- grid_p | numeric | notnull=1 | pk=0 | default=None
- load_p | numeric | notnull=1 | pk=0 | default=None
- price | numeric | notnull=1 | pk=0 | default=None
- pv_p | numeric | notnull=1 | pk=0 | default=None
- wind_p | numeric | notnull=1 | pk=0 | default=None

## backup_settings (rows=1)
- id | INTEGER | notnull=1 | pk=1 | default=None
- auto_backup_enabled | tinyint(1) | notnull=1 | pk=0 | default='0'
- frequency | varchar | notnull=1 | pk=0 | default='daily'
- backup_time | time | notnull=1 | pk=0 | default='02:00:00'
- custom_interval_minutes | smallint unsigned | notnull=0 | pk=0 | default=None
- retention_count | INTEGER | notnull=1 | pk=0 | default='10'
- compress_backup | tinyint(1) | notnull=1 | pk=0 | default='1'
- last_backup_at | varchar | notnull=0 | pk=0 | default=None
- last_backup_status | varchar | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None
- custom_backup_count | INTEGER | notnull=1 | pk=0 | default='0'
- backup_day_of_week | INTEGER | notnull=0 | pk=0 | default=None
- backup_day_of_month | INTEGER | notnull=0 | pk=0 | default=None

## cache (rows=4)
- key | varchar | notnull=1 | pk=1 | default=None
- value | TEXT | notnull=1 | pk=0 | default=None
- expiration | INTEGER | notnull=1 | pk=0 | default=None

## cache_locks (rows=0)
- key | varchar | notnull=1 | pk=1 | default=None
- owner | varchar | notnull=1 | pk=0 | default=None
- expiration | INTEGER | notnull=1 | pk=0 | default=None

## code_changes (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- file_path | varchar | notnull=1 | pk=0 | default=None
- commit_hash | varchar | notnull=0 | pk=0 | default=None
- author | varchar | notnull=0 | pk=0 | default=None
- commit_message | TEXT | notnull=0 | pk=0 | default=None
- changed_at | datetime | notnull=1 | pk=0 | default=None
- change_type | varchar | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## code_features (rows=14)
- id | INTEGER | notnull=1 | pk=1 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- category | varchar | notnull=1 | pk=0 | default=None
- description | TEXT | notnull=1 | pk=0 | default=None
- related_classes | TEXT | notnull=0 | pk=0 | default=None
- is_active | tinyint(1) | notnull=1 | pk=0 | default='1'
- order | INTEGER | notnull=1 | pk=0 | default='0'
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## code_items (rows=331)
- id | INTEGER | notnull=1 | pk=1 | default=None
- type | varchar | notnull=1 | pk=0 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- namespace | varchar | notnull=0 | pk=0 | default=None
- full_name | varchar | notnull=1 | pk=0 | default=None
- parent_id | INTEGER | notnull=0 | pk=0 | default=None
- description | TEXT | notnull=0 | pk=0 | default=None
- parameters | TEXT | notnull=0 | pk=0 | default=None
- return_type | varchar | notnull=0 | pk=0 | default=None
- visibility | varchar | notnull=0 | pk=0 | default=None
- is_static | tinyint(1) | notnull=1 | pk=0 | default='0'
- is_abstract | tinyint(1) | notnull=1 | pk=0 | default='0'
- file_path | TEXT | notnull=1 | pk=0 | default=None
- start_line | INTEGER | notnull=0 | pk=0 | default=None
- end_line | INTEGER | notnull=0 | pk=0 | default=None
- tags | TEXT | notnull=0 | pk=0 | default=None
- last_modified_at | datetime | notnull=0 | pk=0 | default=None
- is_new | tinyint(1) | notnull=1 | pk=0 | default='0'
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## controllers (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- uid | varchar | notnull=1 | pk=0 | default=None
- plant_id | INTEGER | notnull=1 | pk=0 | default=None
- serial_number | varchar | notnull=1 | pk=0 | default=None
- updated_at | INTEGER | notnull=1 | pk=0 | default=None

## customer_plant (rows=11)
- id | INTEGER | notnull=1 | pk=1 | default=None
- customer_id | INTEGER | notnull=1 | pk=0 | default=None
- plant_uid | varchar | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## customers (rows=2)
- id | INTEGER | notnull=1 | pk=1 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- email | varchar | notnull=0 | pk=0 | default=None
- phone | varchar | notnull=0 | pk=0 | default=None
- address | TEXT | notnull=0 | pk=0 | default=None
- description | TEXT | notnull=0 | pk=0 | default=None
- is_active | tinyint(1) | notnull=1 | pk=0 | default='1'
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None
- icon | varchar | notnull=1 | pk=0 | default='Building2'
- icon_color | varchar | notnull=1 | pk=0 | default='bg-blue-500'
- website | varchar | notnull=0 | pk=0 | default=None
- rekvizitai_url | varchar | notnull=0 | pk=0 | default=None
- manager | varchar | notnull=0 | pk=0 | default=None
- facebook | varchar | notnull=0 | pk=0 | default=None
- employees | INTEGER | notnull=0 | pk=0 | default=None
- turnover | numeric | notnull=0 | pk=0 | default=None
- last_scraped_at | datetime | notnull=0 | pk=0 | default=None
- is_scraping | tinyint(1) | notnull=1 | pk=0 | default='0'
- scraped_description | TEXT | notnull=0 | pk=0 | default=None
- logo_url | varchar | notnull=0 | pk=0 | default=None

## devices (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- uid | varchar | notnull=1 | pk=0 | default=None
- controller_id | INTEGER | notnull=1 | pk=0 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- type | INTEGER | notnull=1 | pk=0 | default=None
- parameters | TEXT | notnull=1 | pk=0 | default=None
- data | numeric | notnull=0 | pk=0 | default=None
- units | varchar | notnull=0 | pk=0 | default=None
- updated_at | INTEGER | notnull=1 | pk=0 | default=None

## documentation_customer (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- documentation_id | INTEGER | notnull=1 | pk=0 | default=None
- customer_id | INTEGER | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## documentation_user (rows=0)
- documentation_id | INTEGER | notnull=1 | pk=0 | default=None
- user_id | INTEGER | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## documentations (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- title | varchar | notnull=1 | pk=0 | default=None
- slug | varchar | notnull=1 | pk=0 | default=None
- category | varchar | notnull=1 | pk=0 | default='general'
- content | TEXT | notnull=1 | pk=0 | default=None
- excerpt | TEXT | notnull=0 | pk=0 | default=None
- visibility | varchar | notnull=1 | pk=0 | default='staff'
- github_commits | TEXT | notnull=0 | pk=0 | default=None
- version_added | varchar | notnull=0 | pk=0 | default=None
- version_updated | varchar | notnull=0 | pk=0 | default=None
- is_published | tinyint(1) | notnull=1 | pk=0 | default='0'
- author_id | INTEGER | notnull=0 | pk=0 | default=None
- order | INTEGER | notnull=1 | pk=0 | default='0'
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## email_jobs (rows=3)
- id | INTEGER | notnull=1 | pk=1 | default=None
- plant_uuid | varchar | notnull=1 | pk=0 | default=None
- email | varchar | notnull=1 | pk=0 | default=None
- recurrence | varchar | notnull=1 | pk=0 | default=None
- columns | TEXT | notnull=1 | pk=0 | default=None
- date_range | TEXT | notnull=0 | pk=0 | default=None
- format | varchar | notnull=1 | pk=0 | default=None
- status | varchar | notnull=1 | pk=0 | default='active'
- next_run_at | datetime | notnull=0 | pk=0 | default=None
- last_run_at | datetime | notnull=0 | pk=0 | default=None
- last_error | TEXT | notnull=0 | pk=0 | default=None
- created_by | INTEGER | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None
- stop_after_occurrences | INTEGER | notnull=0 | pk=0 | default=None
- occurrences_count | INTEGER | notnull=1 | pk=0 | default='0'
- unsubscribe_token | varchar | notnull=0 | pk=0 | default=None
- emails_sent_count | INTEGER | notnull=1 | pk=0 | default='0'

## failed_jobs (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- uuid | varchar | notnull=1 | pk=0 | default=None
- connection | TEXT | notnull=1 | pk=0 | default=None
- queue | TEXT | notnull=1 | pk=0 | default=None
- payload | TEXT | notnull=1 | pk=0 | default=None
- exception | TEXT | notnull=1 | pk=0 | default=None
- failed_at | datetime | notnull=1 | pk=0 | default=CURRENT_TIMESTAMP

## job_batches (rows=0)
- id | varchar | notnull=1 | pk=1 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- total_jobs | INTEGER | notnull=1 | pk=0 | default=None
- pending_jobs | INTEGER | notnull=1 | pk=0 | default=None
- failed_jobs | INTEGER | notnull=1 | pk=0 | default=None
- failed_job_ids | TEXT | notnull=1 | pk=0 | default=None
- options | TEXT | notnull=0 | pk=0 | default=None
- cancelled_at | INTEGER | notnull=0 | pk=0 | default=None
- created_at | INTEGER | notnull=1 | pk=0 | default=None
- finished_at | INTEGER | notnull=0 | pk=0 | default=None

## jobs (rows=1)
- id | INTEGER | notnull=1 | pk=1 | default=None
- queue | varchar | notnull=1 | pk=0 | default=None
- payload | TEXT | notnull=1 | pk=0 | default=None
- attempts | INTEGER | notnull=1 | pk=0 | default=None
- reserved_at | INTEGER | notnull=0 | pk=0 | default=None
- available_at | INTEGER | notnull=1 | pk=0 | default=None
- created_at | INTEGER | notnull=1 | pk=0 | default=None

## json_diagrams (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- plant_uid | varchar | notnull=1 | pk=0 | default=None
- user_id | INTEGER | notnull=1 | pk=0 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- description | TEXT | notnull=0 | pk=0 | default=None
- diagram_data | TEXT | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None
- is_json_type | tinyint(1) | notnull=1 | pk=0 | default='0'

## main_feeds (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- uid | varchar | notnull=1 | pk=0 | default=None
- controller_id | INTEGER | notnull=1 | pk=0 | default=None
- export_power | numeric | notnull=1 | pk=0 | default=None
- import_power | numeric | notnull=1 | pk=0 | default=None
- updated_at | INTEGER | notnull=1 | pk=0 | default=None

## migrations (rows=63)
- id | INTEGER | notnull=1 | pk=1 | default=None
- migration | varchar | notnull=1 | pk=0 | default=None
- batch | INTEGER | notnull=1 | pk=0 | default=None

## password_reset_tokens (rows=1)
- email | varchar | notnull=1 | pk=1 | default=None
- token | varchar | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None

## plant_events (rows=130)
- id | INTEGER | notnull=1 | pk=1 | default=None
- plant_uid | varchar | notnull=1 | pk=0 | default=None
- device_uid | varchar | notnull=0 | pk=0 | default=None
- event_type | varchar | notnull=1 | pk=0 | default=None
- event_category | varchar | notnull=1 | pk=0 | default=None
- title | varchar | notnull=1 | pk=0 | default=None
- description | TEXT | notnull=1 | pk=0 | default=None
- severity | varchar | notnull=1 | pk=0 | default='info'
- status | varchar | notnull=1 | pk=0 | default='active'
- metadata | TEXT | notnull=0 | pk=0 | default=None
- event_timestamp | datetime | notnull=1 | pk=0 | default=None
- resolved_at | datetime | notnull=0 | pk=0 | default=None
- resolved_by | varchar | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## plant_name_mappings (rows=13)
- id | INTEGER | notnull=1 | pk=1 | default=None
- plant_uuid | varchar | notnull=1 | pk=0 | default=None
- display_name | varchar | notnull=1 | pk=0 | default=None
- description | TEXT | notnull=0 | pk=0 | default=None
- is_active | tinyint(1) | notnull=1 | pk=0 | default='1'
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## plants (rows=2)
- id | INTEGER | notnull=1 | pk=1 | default=None
- uid | varchar | notnull=1 | pk=0 | default=None
- owner | varchar | notnull=1 | pk=0 | default=None
- capacity | numeric | notnull=1 | pk=0 | default=None
- latitude | numeric | notnull=1 | pk=0 | default=None
- longitude | numeric | notnull=1 | pk=0 | default=None
- status | varchar | notnull=1 | pk=0 | default=None
- updated_at | INTEGER | notnull=1 | pk=0 | default=None
- price_calculation_method | varchar | notnull=1 | pk=0 | default='imbalance'
- plant_name | varchar | notnull=0 | pk=0 | default=None

## queue_job_logs (rows=16)
- id | INTEGER | notnull=1 | pk=1 | default=None
- job_id | varchar | notnull=0 | pk=0 | default=None
- job_type | varchar | notnull=1 | pk=0 | default=None
- status | varchar | notnull=1 | pk=0 | default=None
- payload | TEXT | notnull=0 | pk=0 | default=None
- result | TEXT | notnull=0 | pk=0 | default=None
- user_id | INTEGER | notnull=0 | pk=0 | default=None
- user_email | varchar | notnull=0 | pk=0 | default=None
- user_name | varchar | notnull=0 | pk=0 | default=None
- queued_at | datetime | notnull=0 | pk=0 | default=None
- started_at | datetime | notnull=0 | pk=0 | default=None
- completed_at | datetime | notnull=0 | pk=0 | default=None
- attempts | INTEGER | notnull=1 | pk=0 | default='0'
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## report_email_template_assignments (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- report_email_template_id | INTEGER | notnull=1 | pk=0 | default=None
- scope_type | varchar | notnull=1 | pk=0 | default=None
- scope_id | varchar | notnull=1 | pk=0 | default=None
- created_by | INTEGER | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## report_email_templates (rows=1)
- id | INTEGER | notnull=1 | pk=1 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- subject | varchar | notnull=1 | pk=0 | default=None
- body_html | TEXT | notnull=1 | pk=0 | default=None
- header_logo_alignment | varchar | notnull=1 | pk=0 | default='center'
- footer_company_info_enabled | tinyint(1) | notnull=1 | pk=0 | default='1'
- footer_company_info_text | TEXT | notnull=0 | pk=0 | default=None
- is_default | tinyint(1) | notnull=1 | pk=0 | default='0'
- created_by | INTEGER | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## scada_diagrams (rows=50)
- id | INTEGER | notnull=1 | pk=1 | default=None
- user_id | INTEGER | notnull=1 | pk=0 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- description | TEXT | notnull=0 | pk=0 | default=None
- diagram_data | TEXT | notnull=1 | pk=0 | default=None
- is_shared | tinyint(1) | notnull=1 | pk=0 | default='0'
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None
- deleted_at | datetime | notnull=0 | pk=0 | default=None
- plant_id | INTEGER | notnull=0 | pk=0 | default=None
- show_on_frontend | tinyint(1) | notnull=1 | pk=0 | default='0'
- plant_uid | varchar | notnull=0 | pk=0 | default=None

## sessions (rows=6)
- id | varchar | notnull=1 | pk=1 | default=None
- user_id | INTEGER | notnull=0 | pk=0 | default=None
- ip_address | varchar | notnull=0 | pk=0 | default=None
- user_agent | TEXT | notnull=0 | pk=0 | default=None
- payload | TEXT | notnull=1 | pk=0 | default=None
- last_activity | INTEGER | notnull=1 | pk=0 | default=None

## translations (rows=667)
- id | INTEGER | notnull=1 | pk=1 | default=None
- key | varchar | notnull=1 | pk=0 | default=None
- locale | varchar | notnull=1 | pk=0 | default=None
- value | TEXT | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## user_activities (rows=3200)
- id | INTEGER | notnull=1 | pk=1 | default=None
- user_id | INTEGER | notnull=0 | pk=0 | default=None
- session_id | varchar | notnull=0 | pk=0 | default=None
- activity_type | varchar | notnull=1 | pk=0 | default=None
- description | varchar | notnull=1 | pk=0 | default=None
- url | varchar | notnull=0 | pk=0 | default=None
- method | varchar | notnull=0 | pk=0 | default=None
- properties | TEXT | notnull=0 | pk=0 | default=None
- ip_address | varchar | notnull=0 | pk=0 | default=None
- user_agent | TEXT | notnull=0 | pk=0 | default=None
- browser | varchar | notnull=0 | pk=0 | default=None
- platform | varchar | notnull=0 | pk=0 | default=None
- device | varchar | notnull=0 | pk=0 | default=None
- location | varchar | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=1 | pk=0 | default=None

## user_plant_assignments (rows=48)
- id | INTEGER | notnull=1 | pk=1 | default=None
- user_id | INTEGER | notnull=1 | pk=0 | default=None
- plant_uid | varchar | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## user_plants (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- uid | varchar | notnull=1 | pk=0 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- description | TEXT | notnull=0 | pk=0 | default=None
- type | varchar | notnull=1 | pk=0 | default=None
- capacity | numeric | notnull=1 | pk=0 | default=None
- owner_name | varchar | notnull=1 | pk=0 | default=None
- owner_email | varchar | notnull=1 | pk=0 | default=None
- owner_phone | varchar | notnull=1 | pk=0 | default=None
- address | TEXT | notnull=1 | pk=0 | default=None
- city | varchar | notnull=1 | pk=0 | default=None
- state | varchar | notnull=1 | pk=0 | default=None
- postal_code | varchar | notnull=1 | pk=0 | default=None
- country | varchar | notnull=1 | pk=0 | default=None
- latitude | numeric | notnull=0 | pk=0 | default=None
- longitude | numeric | notnull=0 | pk=0 | default=None
- approval_status | varchar | notnull=1 | pk=0 | default='pending'
- approved_at | datetime | notnull=0 | pk=0 | default=None
- approved_by | INTEGER | notnull=0 | pk=0 | default=None
- rejection_reason | TEXT | notnull=0 | pk=0 | default=None
- created_by | INTEGER | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## user_profiles (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- user_id | INTEGER | notnull=1 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## users (rows=25)
- id | INTEGER | notnull=1 | pk=1 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- email | varchar | notnull=1 | pk=0 | default=None
- email_verified_at | datetime | notnull=0 | pk=0 | default=None
- password | varchar | notnull=1 | pk=0 | default=None
- remember_token | varchar | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None
- uuid | varchar | notnull=0 | pk=0 | default=None
- role | varchar | notnull=1 | pk=0 | default='customer'
- is_suspended | tinyint(1) | notnull=1 | pk=0 | default='0'
- two_factor_secret | TEXT | notnull=0 | pk=0 | default=None
- two_factor_recovery_codes | TEXT | notnull=0 | pk=0 | default=None
- two_factor_confirmed_at | datetime | notnull=0 | pk=0 | default=None
- demo_api_uuid | varchar | notnull=0 | pk=0 | default=None
- status | varchar | notnull=1 | pk=0 | default='new'
- customer_id | INTEGER | notnull=0 | pk=0 | default=None

## wysiwyg_email_template_assignments (rows=0)
- id | INTEGER | notnull=1 | pk=1 | default=None
- wysiwyg_email_template_id | INTEGER | notnull=1 | pk=0 | default=None
- scope_type | varchar | notnull=1 | pk=0 | default=None
- scope_id | varchar | notnull=1 | pk=0 | default=None
- created_by | INTEGER | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None

## wysiwyg_email_templates (rows=2)
- id | INTEGER | notnull=1 | pk=1 | default=None
- name | varchar | notnull=1 | pk=0 | default=None
- subject | varchar | notnull=1 | pk=0 | default=None
- body_html | TEXT | notnull=1 | pk=0 | default=None
- header_logo_alignment | varchar | notnull=1 | pk=0 | default='center'
- footer_company_info_enabled | tinyint(1) | notnull=1 | pk=0 | default='1'
- footer_company_info_text | varchar | notnull=0 | pk=0 | default=None
- is_default | tinyint(1) | notnull=1 | pk=0 | default='0'
- created_by | INTEGER | notnull=0 | pk=0 | default=None
- created_at | datetime | notnull=0 | pk=0 | default=None
- updated_at | datetime | notnull=0 | pk=0 | default=None
- background_image | varchar | notnull=0 | pk=0 | default=None
