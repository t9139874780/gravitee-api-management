/*
 * Copyright (C) 2015 The Gravitee team (http://gravitee.io)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as faker from 'faker';
import {ApiImport, ApiImportPage, ApiImportProxyGroupLoadBalancerType} from '@model/imports';
import {ApiFlowMode, ApiPageType, ApiVisibility} from '@model/apis';
import {ApiFakers} from "./apis";

export class ApiImportFakers {
  static api(attributes?: Partial<ApiImport>): ApiImport {
    const name = faker.commerce.productName();
    const version = ApiFakers.version();
    const description = faker.commerce.productDescription();

    return {
      name,
      version,
      description,
      visibility: ApiVisibility.PRIVATE,
      gravitee: '2.0.0',
      flow_mode: ApiFlowMode.DEFAULT,
      resources: [],
      properties: [],
      groups: ['wireless purple systems'],
      members: [],
      pages: [],
      plans: [],
      metadata: [],
      path_mappings: [],
      proxy: {
        virtual_hosts: [
          {
            path: faker.helpers.slugify(name),
          },
        ],
        strip_context_path: false,
        preserve_host: false,
        groups: [
          {
            name: 'default-group',
            endpoints: [
              {
                inherit: true,
                name: 'default',
                target: 'http://localhost:8080/hello-world',
                weight: 1,
                backup: false,
                type: 'http',
              },
            ],
            load_balancing: {
              type: ApiImportProxyGroupLoadBalancerType.ROUND_ROBIN,
            },
            http: {
              connectTimeout: 5000,
              idleTimeout: 60000,
              keepAlive: true,
              readTimeout: 10000,
              pipelining: false,
              maxConcurrentConnections: 100,
              useCompression: true,
              followRedirects: false,
            },
          },
        ],
      },
      response_templates: {},
      primaryOwner: {},
      ...attributes,
    };
  }

  static page(attributes?: Partial<ApiImportPage>): ApiImportPage {
    const content = faker.lorem.paragraph(3);

    return {
      name: 'Documentation',
      type: ApiPageType.MARKDOWN,
      content,
      order: 1,
      published: false,
      visibility: ApiVisibility.PUBLIC,
      contentType: 'application/json',
      homepage: false,
      parentPath: '',
      excludedAccessControls: false,
      accessControls: [],
      ...attributes,
    };
  }
}
