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
package io.gravitee.management.service.impl;

import io.gravitee.management.model.ApiQualityMetricsEntity;
import io.gravitee.management.model.api.ApiEntity;
import io.gravitee.management.model.parameters.Key;
import io.gravitee.management.service.ParameterService;
import io.gravitee.management.service.QualityMetricsService;
import io.gravitee.management.service.exceptions.ApiQualityMetricsDisableException;
import io.gravitee.management.service.quality.ApiQualityMetric;
import io.gravitee.management.service.quality.ApiQualityMetricLoader;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author Nicolas GERAUD (nicolas.geraud at graviteesource.com) 
 * @author GraviteeSource Team
 */
@Component
public class QualityMetricsServiceImpl extends AbstractService implements QualityMetricsService {
    @Autowired
    ParameterService parameterService;
    @Autowired
    ApiQualityMetricLoader apiQualityMetricLoader;

    private Map<String, ApiQualityMetric> getApiMetricsMap() {
        HashMap<String, ApiQualityMetric> map = new HashMap<>();
        for (ApiQualityMetric apiQualityMetric : apiQualityMetricLoader.getApiQualityMetrics()) {
            map.put(apiQualityMetric.getWeightKey().key(), apiQualityMetric);
        }
        return Collections.unmodifiableMap(map);
    }

    private Map<String, Integer> getWeights() {
        List<Key> keys = apiQualityMetricLoader.getApiQualityMetrics()
                .stream()
                .map(ApiQualityMetric::getWeightKey)
                .collect(Collectors.toList());

        return Collections.unmodifiableMap(
                parameterService.findAll(keys, Integer::parseInt)
                        .entrySet()
                        .stream()
                        .collect(Collectors.toMap(
                                Map.Entry::getKey,
                                e -> e.getValue().get(0))
                        )) ;
    }

    public boolean isApiMetricsEnabled() {
        return parameterService.findAsBoolean(Key.API_QUALITY_METRICS_ENABLED);
    }

    @Override
    public ApiQualityMetricsEntity getMetrics(ApiEntity apiEntity) {

        if (!isApiMetricsEnabled()) {
            throw new ApiQualityMetricsDisableException();
        }

        Map<String, Integer> weights = getWeights()
                .entrySet()
                .stream()
                .filter(e -> e.getValue() > 0)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue));

        ApiQualityMetricsEntity result = new ApiQualityMetricsEntity();
        result.setMetricsPassed(new HashMap<>(weights.size()));

        if (weights.isEmpty()) {
            result.setScore(1);
        } else {
            Map<String, ApiQualityMetric> apiMetrics = getApiMetricsMap();
            double score = 0;
            double maxScore = 0;
            for (Map.Entry<String, Integer> weight : weights.entrySet()) {
                boolean passed = apiMetrics.get(weight.getKey()).isValid(apiEntity);
                result.getMetricsPassed().put(weight.getKey(), passed);
                score += weight.getValue() * (passed ? 1 : 0);
                maxScore += weight.getValue();
            }
            result.setScore( (int)((score / maxScore) * 100) / 100d);
        }
        return result;
    }
}

