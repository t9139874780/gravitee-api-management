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
import { ADMIN_USER } from '../../../fixtures/fakers/users/users';
import { deleteApi, importCreateApi, getApiById } from '../../../commands/management/api-management-commands';
import { getPages, getPage } from '../../../commands/management/api-pages-management-commands';
import { ApiImportFakers } from '../../../fixtures/fakers/api-imports';
import {getPlan} from "../../../commands/management/api-plans-management-commands";
import {ApiPlanSecurityType, ApiPlanStatus, ApiPlanType, ApiPlanValidationType} from "@model/apis";

context('API - Imports', () => {

  describe('Create API without ID',  () => {

    let apiId;
    const fakeApi = ApiImportFakers.api();

    it('should create API and return generated ID', () => {
      importCreateApi(ADMIN_USER, fakeApi)
        .ok()
        .should((response) => {
          apiId = response.body.id;
          expect(apiId).to.not.be.null;
          expect(apiId).to.not.be.empty;
        });
    });

    it('should get created API with generated ID', () => {
      getApiById(ADMIN_USER, apiId)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
        });
    });

    it('should delete created API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Create API with specified ID, not yet existing', () => {

    const apiId = '67d8020e-b0b3-47d8-9802-0eb0b357d84c';
    const fakeApi = ApiImportFakers.api({ id: apiId });

    it('should create API and return the specified ID', () => {
      importCreateApi(ADMIN_USER, fakeApi)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
        });
    });

    it('should get created API with the specified ID', () => {
      getApiById(ADMIN_USER, apiId)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
        });
    });

    it('should delete created API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Create API with specified ID, already existing', () => {

    const apiId = '67d8020e-b0b3-47d8-9802-0eb0b357d84c';

    const fakeApi1 = ApiImportFakers.api({ id: apiId });
    fakeApi1.proxy.virtual_hosts[0].path = "/testimport1/";

    // api 2 has different context path as api 1, but same ID
    const fakeApi2 = ApiImportFakers.api({ id: apiId });
    fakeApi2.proxy.virtual_hosts[0].path = "/testimport2/";

    it('should create API with the specified ID', () => {
      importCreateApi(ADMIN_USER, fakeApi1)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId);
        });
    });

    it('should fail to create API with the same ID', () => {
      importCreateApi(ADMIN_USER, fakeApi2)
        .badRequest()
        .should((response) => {
          expect(response.body.message).to.eq('An api [67d8020e-b0b3-47d8-9802-0eb0b357d84c] already exists.');
        });
    });

    it('should delete created API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Create empty API with an already existing context path', () => {

    const apiId1 = '67d8020e-b0b3-47d8-9802-0eb0b357d84c';
    const fakeApi1 = ApiImportFakers.api({ id: apiId1 });
    fakeApi1.proxy.virtual_hosts[0].path = "/testimport/";

    // api2 has different ID, but same context path as api 1
    const apiId2 = '67d8020e-b0b3-47d8-9802-0eb0b357d84d';
    const fakeApi2 = ApiImportFakers.api({ id: apiId2 });
    fakeApi2.proxy.virtual_hosts[0].path = "/testimport/";

    it('should create API with the specified ID', () => {
      importCreateApi(ADMIN_USER, fakeApi1)
        .ok()
        .should((response) => {
          expect(response.body.id).to.eq(apiId1);
        });
    });

    it('should fail to create API with the same context path', () => {
      importCreateApi(ADMIN_USER, fakeApi2)
        .badRequest()
        .should((response) => {
          expect(response.body.message).to.eq('The path [/testimport/] is already covered by an other API.');
        });
    });

    it('should delete created API', () => {
      deleteApi(ADMIN_USER, apiId1).httpStatus(204);
    });
  });

  describe('Create API with one page without an ID', () => {
    const fakeApi = ApiImportFakers.api({ pages: [ApiImportFakers.page()] });

    let apiId, pageId;

    it('should create an API with one page of documentation and return a generated API ID', () => {
      importCreateApi(ADMIN_USER, fakeApi)
        .ok()
        .its('body')
        .should('have.property', 'id')
        .then((id) => {
          apiId = id;
        });
    });

    it('should get API documentation pages from generated API ID', () => {
      getPages(ADMIN_USER, apiId)
        .ok()
        .its('body')
        .should('have.length', 2)
        .its(1)
        .should('have.property', 'id')
        .then((id) => {
          pageId = id;
        });
    });

    it('should get page from generated page ID', () => {
      getPage(ADMIN_USER, apiId, pageId)
        .ok()
        .its('body')
        .should((page) => {
          expect(page.order).to.eq(1);
          expect(page.type).to.eq('MARKDOWN');
          expect(page.name).to.not.be.empty;
          expect(page.content).to.not.be.empty;
          expect(page.published).to.be.false;
          expect(page.homepage).to.be.false;
        });
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe('Create API with one page with an ID', () => {
    const apiId = '08a92f8c-e133-42ec-a92f-8ce13382ec73';
    const pageId = '7b95cbe6-099d-4b06-95cb-e6099d7b0609';
    const generatedPageId = 'c02077fc-7c4d-3c93-8404-6184a6221391';

    const fakePage = ApiImportFakers.page({ id: pageId });
    const fakeApi = ApiImportFakers.api({ id: apiId, pages: [fakePage] });

    it('should create an API with one page of documentation and return specified ID', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok().its('body').should('have.property', 'id').should('eq', apiId);
    });

    it('should get API documentation pages from specified API ID', () => {
      getPages(ADMIN_USER, apiId)
        .ok()
        .its('body')
        .should('have.length', 2)
        .its(1)
        .should('have.property', 'id')
        .should('eq', generatedPageId);
    });

    it('should get API page from generated page ID', () => {
      getPage(ADMIN_USER, apiId, generatedPageId).ok().its('body').should('have.property', 'api').should('eq', apiId);
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, '08a92f8c-e133-42ec-a92f-8ce13382ec73').noContent();
    });
  });

  describe('Create API with plans without an ID', () => {

    let planId1;
    let planId2;

    const apiId = '08a92f8c-e133-42ec-a92f-8ce13382ec73';
    const fakePlan1 = ApiImportFakers.plan({name: 'test plan', description: 'this is a test plan'});
    const fakePlan2 = ApiImportFakers.plan({name: 'test plan', description: 'this is a test plan'});
    const fakeApi = ApiImportFakers.api({ id: apiId, plans: [fakePlan1, fakePlan2] });

    it('should create an API and returns created plans in response', () => {
      importCreateApi(ADMIN_USER, fakeApi).ok().should((response) => {
        expect(response.body.plans).to.be.length(2);
        planId1 = response.body.plans[0].id;
        planId2 = response.body.plans[1].id;
        expect(planId1).to.not.be.null;
        expect(planId1).to.not.be.empty;
        expect(planId2).to.not.be.null;
        expect(planId2).to.not.be.empty;
        expect(planId1).to.not.eq(planId2);
      });
    });

    it('should get plan1 with correct data', () => {
      getPlan(ADMIN_USER, apiId, planId1).ok().should((response) => {
        expect(response.body.id).to.eq(planId1);
        expect(response.body.name).to.eq('test plan');
        expect(response.body.description).to.eq('this is a test plan');
        expect(response.body.validation).to.eq(ApiPlanValidationType.AUTO);
        expect(response.body.security).to.eq(ApiPlanSecurityType.KEY_LESS);
        expect(response.body.type).to.eq(ApiPlanType.API);
        expect(response.body.status).to.eq(ApiPlanStatus.STAGING);
        expect(response.body.order).to.eq(0);
      });
    });

    it('should get plan2 with correct data', () => {
      getPlan(ADMIN_USER, apiId, planId2).ok().should((response) => {
        expect(response.body.id).to.eq(planId2);
        expect(response.body.name).to.eq('test plan');
        expect(response.body.description).to.eq('this is a test plan');
        expect(response.body.validation).to.eq(ApiPlanValidationType.AUTO);
        expect(response.body.security).to.eq(ApiPlanSecurityType.KEY_LESS);
        expect(response.body.type).to.eq(ApiPlanType.API);
        expect(response.body.status).to.eq(ApiPlanStatus.STAGING);
        expect(response.body.order).to.eq(0);
      });
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

  describe.skip('Create API with plan with ID that already exists', () => {

    let apiId;
    const planId = '08a99999-e999-4999-a999-8ce19992e999';

    const fakePlan = ApiImportFakers.plan({id: planId, name: 'first test plan', description: 'this is the first test plan'});
    const fakeApi1 = ApiImportFakers.api({ plans: [fakePlan] });
    const fakeApi2 = ApiImportFakers.api({ plans: [fakePlan] });

    it('should create API 1', () => {
      importCreateApi(ADMIN_USER, fakeApi1).ok().then((response) => {
        apiId = response.body.id;
      });
    });

    it('should fail to create API 2, cause plan, already exists on API 1', () => {
      importCreateApi(ADMIN_USER, fakeApi2).badRequest().should((response) => {
        expect(response.body.message).to.eq('A plan with id [08a99999-e999-4999-a999-8ce19992e999] already exists.');
      });
    });

    it('should delete the API', () => {
      deleteApi(ADMIN_USER, apiId).noContent();
    });
  });

});
