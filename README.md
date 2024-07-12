# Huntress

Highly scalable job scheduler that can easily be configured to run complex workflows. Currently the "frontend" is a postgres database however complex tasks can still easily be configured. Jobs can be "orchestrated"
meaning that they are able to wait for another job to complete before running, this allows for complex flows of data where the order of completion is not necessarily known. 

Uses JSON job definitions to determine type of job, schedule as well as other necessary parameters. Uses a highly scalable microservice architecture so it can be scaled to massive workloads. 

- Job Scheduler
  - Materialised Views  
  - Web Scraper
- Orchestrate jobs

Roadmap:

- [x] orchestration
- [x] "jobs" / non pipeline
  - Made workers (see below)
- [ ] notifier
- [x] break into many services
- [ ] scan for specific conditions
- [ ] scan other websites
- [x] remove dead listings
- [ ] frontend to see statuses / manage jobs
- [ ] Cycle detection (make sure orchestrated jobs do not have an infinite run time - there should always be a start and end and no loops)

Planned Workers:

- [x] pipeline (streaming data: source -> destination)
- [x] materialise (refresh complex and large tables in postgres as needed)
- [ ] notify
- [ ] analyse (ai / analytics to find desired data)
- [ ] generic (point at a docker container online)

Planned Integrations:

- [x] Files (pipeline source / destination)
- [ ] Postgres (pipeline source / destination)
- [x] BoligPortal.dk (pipeline source)
- [ ] BoligZonen.dk (pipeline source)
- [ ] FindBoliger.dk (pipeline source)

Possible Ideas:

- [ ] refactor materialise to generic job
- [ ] docker worker (reads any git repo and runs the dockerfile)
- [ ]
