import { z } from 'zod';

const WebCrawlerJob = z.object({
  webcrawler: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('bolig-portal'),
      startUri: z.string(),
    }),
  ]),
});

const FileJob = z.object({
  file: z.string(),
});

const PipelineJobFrom = z.union([FileJob, WebCrawlerJob]);
const PipelineJobTo = FileJob;

export const PipelineJob = z.object({
  from: PipelineJobFrom,
  to: PipelineJobTo,
});

export type WebCrawlerJob = z.infer<typeof WebCrawlerJob>;
export type FileJob = z.infer<typeof FileJob>;
export type PipelineJobFrom = z.infer<typeof PipelineJobFrom>;
export type PipelineJobTo = z.infer<typeof PipelineJobTo>;
export type PipelineJob = z.infer<typeof PipelineJob>;
