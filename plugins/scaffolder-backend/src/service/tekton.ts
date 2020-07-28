import { Writable } from 'stream';
import { JsonValue } from '@backstage/config';
import { KubeConfig, CustomObjectsApi } from '@kubernetes/client-node';

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
  public async runPipeline(options: TektonPipelineOptions): Promise<any> {
    const runName = options.values.name;
    const pipelineName = options.values.pipelineName;
    const owner = options.values.owner;
    const kc = new KubeConfig();
    const k8sApi = kc.makeApiClient(CustomObjectsApi);
    const resp = await k8sApi.createNamespacedCustomObject(
      "tekton.dev",
      "v1beta1",
      "scaffolder",
      "pipelineruns",
      {
        "apiVersion": "tekton.dev/v1beta1",
        "kind": "PipelineRun",
        "metadata": {
          "name": runName,
          "namespace": "scaffolder"
        },
        "spec": {
          "params": [
            {
              "name": "SERVICE_NAME",
              "value": "dd-test",
            },
            {
              "name": "OWNER",
              "value": owner,
            },
            {
              "name": "DEPLOYMENT_MARKETS",
              "value": "gb",
            },
            {
              "name": "TEMPLATE_ARGS",
              "value": "",
            },
          ],
          "pipelineRef": {
            "name": "scaffolder-python-flask-service",
          },
          "workspaces": [
            {
              "emptyDir": {},
              "name": "python-app-workspace",
            },
          ],
        },
      },
    );
    return resp.body;
    console.log(resp);
    console.log(options);
    console.log(runName);
    console.log(pipelineName);
    console.log(owner);
    return {success: true};
  }
}