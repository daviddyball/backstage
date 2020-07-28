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
import { Writable } from 'stream';
import { JsonValue } from '@backstage/config';

export type PipelineRunResult = {
  success: boolean;
};

export type RequiredPipelineValues = {
  name: string;
  pipelineName: string;
  owner: string;
};

export type TektonPipelineOptions = {
  values: RequiredPipelineValues & Record<string, JsonValue>;
  logStream?: Writable;
};

export class Tekton {
  public async runPipeline(
    options: TektonPipelineOptions,
  ): Promise<PipelineRunResult> {
    const runName = options.values.name;
    const pipelineName = options.values.pipelineName;
    const owner = options.values.owner;
    console.log(options);
    console.log(runName);
    console.log(pipelineName);
    console.log(owner);
    return { success: true };
  }
}
