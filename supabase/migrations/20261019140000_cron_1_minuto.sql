-- Menos carga no banco. Em 19/10 o workspace ficou sem créditos e o
-- cron.job_run_details tinha 950 mil linhas (1,34 GB), quase tudo das
-- execuções a cada 10s (boas-vindas) e 30s (vídeo).
--   - boas-vindas e vídeo passam a rodar a cada minuto (mesmo comando; a
--     mensagem sai até 1 min depois do atraso configurado);
--   - o histórico do cron guarda só os últimos 3 dias (limpeza diária às
--     3h de Brasília).

select cron.alter_job(jobid, schedule := '* * * * *')
from cron.job
where jobname in ('whatsapp-boas-vindas', 'video-resumo');

select cron.unschedule('cron-historico-limpeza')
where exists (select 1 from cron.job where jobname = 'cron-historico-limpeza');

select cron.schedule(
  'cron-historico-limpeza',
  '0 6 * * *',
  $$ DELETE FROM cron.job_run_details WHERE end_time < now() - interval '3 days' $$
);

-- Aplicado uma vez à mão em 19/10 para liberar o espaço na hora:
-- TRUNCATE cron.job_run_details;
