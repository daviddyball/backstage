/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { TemplateEntityV1alpha1 } from '@backstage/catalog-model';
import { JsonValue } from '@backstage/config';
import Docker from 'dockerode';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import {
  JobProcessor,
  PreparerBuilder,
  RequiredTemplateValues,
  TemplaterBuilder,
  PublisherBase,
} from '../scaffolder';
import {
  Tekton,
} from './tekton';

export interface RouterOptions {
  preparers: PreparerBuilder;
  templaters: TemplaterBuilder;
  publisher: PublisherBase;

  logger: Logger;
  dockerClient: Docker;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const router = Router();

  const {
    logger: parentLogger,
  } = options;

  const logger = parentLogger.child({ plugin: 'scaffolder' });
  const jobProcessor = new JobProcessor();

  router
    .get('/v1/job/:jobId', ({ params }, res) => {
      const job = jobProcessor.get(params.jobId);

      if (!job) {
        res.status(404).send({ error: 'job not found' });
        return;
      }

      res.send({
        id: job.id,
        metadata: {
          ...job.context,
          logger: undefined,
          logStream: undefined,
        },
        status: job.status,
        stages: job.stages.map(stage => ({
          ...stage,
          handler: undefined,
        })),
        error: job.error,
      });
    })
    .post('/v1/jobs', async (req, res) => {
      const template: TemplateEntityV1alpha1 = req.body.template;
      const values: RequiredTemplateValues & Record<string, JsonValue> =
        req.body.values;
      const tektonRunner: Tekton = new Tekton()

      console.log("before jobProcessort.create()");
      const job = jobProcessor.create({
        entity: template,
        values,
        stages: [
          {
            name: 'Run Tekton Pipeline',
            handler: async ctx => {
              await tektonRunner.runPipeline({
                logStream: ctx.logStream,
                values: req.body.values,
              });
            },
          },
        ],
      });
      console.log("after jobProcessort.create()");

      res.status(201).json({ id: job.id });

      jobProcessor.run(job);
    });

  const app = express();
  app.set('logger', logger);
  app.use('/', router);

  return app;
}
