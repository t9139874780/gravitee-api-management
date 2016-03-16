/**
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
package io.gravitee.repository.mongodb;

import io.gravitee.repository.config.TestRepositoryInitializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;

/**
 * @author Azize Elamrani (azize dot elamrani at gmail dot com)
 */
public class MongoTestRepositoryInitializer implements TestRepositoryInitializer {

    private static final Logger LOG = LoggerFactory.getLogger(MongoTestRepositoryInitializer.class);

    @Autowired
    private MongoTemplate mongoTemplate;

    public void setUp() {
    }

    public void tearDown() {
        LOG.info("Dropping database...");
        mongoTemplate.getDb().dropDatabase();
    }
}
