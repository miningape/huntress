# Huntress

- Job Scheduler
- Webscraper

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

Planned Workers:

- [x] pipeline (streaming data: source -> destination)
- [x] materialise (refresh tables as needed)
- [ ] notify
- [ ] analyse (ai / analytics to find desired data)
- [ ] docker (reads any git repo and runs the dockerfile)

Planned Integrations:

- [x] BoligPortal (pipeline source)
- [x] Files (pipeline source / destination)
- [ ] Postgres (pipeline source / destination)
- [ ] ...

Possible Ideas:

- [ ] refactor materialise to generic job
