import http from 'k6/http'
import { sleep } from 'k6'
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js'
import { URLSearchParams } from 'https://jslib.k6.io/url/1.0.0/index.js';
import {
  tagWithCurrentStageIndex,
  tagWithCurrentStageProfile,
} from 'https://jslib.k6.io/k6-utils/1.3.0/index.js'
// more libs at https://jslib.k6.io/

// options from envs only:
// K6_LOCAL_IPS https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#local-ips
// K6_TRACES_OUTPUT https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#traces-output

// See https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#options-reference
export const options = {
  batch: 20,
  batchPerHost: 6,

  minIterationDuration: '0s',
  setupTimeout: '60s',
  teardownTimeout: '60s',

  discardResponseBodies: false,
  httpDebug: false, // true (without body), 'full' (with body)
  noConnectionReuse: false,
  noVUConnectionReuse: false,
  noCookiesReset: false,

  // useful in distributed execution: https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#execution-segment
  executionSegment: '0:1',
  executionSegmentSequence: '0,1',

  // See https://grafana.com/docs/k6/latest/using-k6/k6-options/reference/#hosts
  hosts: {},
  insecureSkipTLSVerify: false,
  tlsVersion: {
    // min: 'tls1.2',
    // max: 'tls1.3',
  },

  // See https://grafana.com/docs/grafana-cloud/k6/get-started/run-cloud-tests-from-the-cli/
  cloud: {
    projectID: 3695087,
    name: "test.js",
    distribution: { 'amazon:bh:bahrain': { loadZone: 'amazon:bh:bahrain', percent: 100 } },
    apm: [],
  },
  scenarios: {
    common: {
      // Time offset since the start of the test, at which point this scenario should begin execution.
      startTime: '0s',
      // Time to wait for iterations to finish executing before stopping them forcefully. To learn more, read Graceful stop.
      gracefulStop: '30s',
      // Name of exported JS function to execute.
      exec: 'default',
      // Environment variables specific to this scenario.
      env: {},
      // Tags specific to this scenario.
      tags: {},
    },
    scenario_1: {
      // With the constant-vus executor, a fixed number of VUs execute as many iterations as possible for a specified amount of time.
      executor: 'constant-vus',
      // * Total scenario duration (excluding `gracefulStop`).
      duration: '30s',
      // Number of VUs to run concurrently.
      vus: 1,
    },
    scenario_2: {
      // With the ramping-vus executor, a variable number of VUs executes as many iterations as possible for a specified amount of time.
      executor: 'ramping-vus',
      // * Array of objects that specify the target number of VUs to ramp up or down to.
      stages: [
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 },
      ],
      // Number of VUs to run at test start.
      startVUs: 1,
      // Time to wait for an already started iteration to finish before stopping it during a ramp down.
      gracefulRampDown: '30s',
    },
    scenario_3: {
      // This executor continues to start iterations at the given rate as long as VUs are available.
      // NOTE: Iteration starts are spaced fractionally.
      // NOTE: Don’t put sleep at the end of an iteration.
      executor: 'constant-arrival-rate',
      // * Total scenario duration (excluding `gracefulStop`).
      duration: '30s',
      // * Number of iterations to start during each `timeUnit` period.
      rate: 30,
      // * Number of VUs to pre-allocate before test start to preserve runtime resources.
      preAllocatedVUs: 2,
      // Period of time to apply the rate value.
      timeUnit: '1s',
      // Maximum number of VUs to allow during the test run. (Defaults to `preAllocatedVUs`)
      maxVUs: 50,
    },
    scenario_4: {
      // This executor has stages that configure target number of iterations and the time k6 takes to reach or stay at this target.
      // NOTE: Iteration starts are spaced fractionally.
      // NOTE: Don’t put sleep at the end of an iteration.
      executor: 'ramping-arrival-rate',
      // * Number of VUs to pre-allocate before test start to preserve runtime resources.
      preAllocatedVUs: 50,
      // * Array of objects that specify the target number of iterations to ramp up or down to.
      stages: [
        // Start 300 iterations per `timeUnit` for the first minute.
        { target: 300, duration: '1m' },
        // Linearly ramp-up to starting 600 iterations per `timeUnit` over the following two minutes.
        { target: 600, duration: '2m' },
        // Continue starting 600 iterations per `timeUnit` for the following four minutes.
        { target: 600, duration: '4m' },
        // Linearly ramp-down to starting 60 iterations per `timeUnit` over the last two minutes.
        { target: 60, duration: '2m' },
      ],
      // Number of iterations to execute each `timeUnit` period at test start.
      startRate: 0,
      // Period of time to apply the startRate to the stages’ target value. Its value is constant for
      // the whole duration of the scenario, it is not possible to change it for a specific stage.
      timeUnit: '1s',
      // Maximum number of VUs to allow during the test run. (Defaults to `preAllocatedVUs`)
      maxVUs: 50,
    },
    scenario_5: {
      // The shared-iterations executor shares iterations between the number of VUs. The test ends once k6 executes all iterations.
      // NOTE: Iterations are not guaranteed to be evenly distributed with this executor.
      executor: 'shared-iterations',
      // Number of VUs to run concurrently.
      vus: 1,
      // Total number of script iterations to execute across all VUs.
      iterations: 1,
      // Maximum scenario duration before it’s forcibly stopped (excluding `gracefulStop`).
      maxDuration: '10m',
    },
    scenario_6: {
      // The shared-iterations executor shares iterations between the number of VUs. The test ends once k6 executes all iterations.
      executor: 'per-vu-iterations',
      // Number of VUs to run concurrently.
      vus: 1,
      // Number of exec function iterations to be executed by each VU.
      iterations: 1,
      // Maximum scenario duration before it’s forcibly stopped (excluding `gracefulStop`).
      maxDuration: '10m',
    },
    scenario_7: {
      // Control and scale execution at runtime via k6’s
      //  REST API: https://grafana.com/docs/k6/latest/misc/k6-rest-api/#update-status
      //  CLI: https://k6.io/blog/how-to-control-a-live-k6-test/
      // NOTE: The `externally-controlled` executor has no graceful stop.
      // NOTE: This is the only executor that is not supported in `k6 cloud`, it can only be used locally with `k6 run`.
      executor: 'externally-controlled',
      // * Number of VUs to run concurrently.
      vus: 10,
      // * Maximum number of VUs to allow during the test run.
      maxVUs: 50,
      // * Total test duration.
      duration: '10m',
    },
  },

  thresholds: {
    // 'http_req_duration': ['avg<100', 'p(95)<200'],
    // 'http_req_connecting{cdnAsset:true}': ['p(95)<100'],
  },

  // Uncomment this section to enable the use of Browser API in your tests.
  //
  // See https://grafana.com/docs/k6/latest/using-k6-browser/running-browser-tests/ to learn more
  // about using Browser API in your test scripts.
  //
  // scenarios: {
  //   // The scenario name appears in the result summary, tags, and so on.
  //   // You can give the scenario any name, as long as each name in the script is unique.
  //   ui: {
  //     // Executor is a mandatory parameter for browser-based tests.
  //     // Shared iterations in this case tells k6 to reuse VUs to execute iterations.
  //     //
  //     // See https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/ for other executor types.
  //     executor: 'shared-iterations',
  //     options: {
  //       browser: {
  //         // This is a mandatory parameter that instructs k6 to launch and
  //         // connect to a chromium-based browser, and use it to run UI-based
  //         // tests.
  //         type: 'chromium',
  //       },
  //     },
  //   },
  // }
}

// See https://grafana.com/docs/k6/latest/using-k6/test-lifecycle/#overview-of-the-lifecycle-stages
export function setup() {
  // https://grafana.com/docs/k6/latest/examples/url-query-parameters/
  const searchParams = new URLSearchParams([
    ['id', 'foo'],
    ['sort', 'bar'],
  ])
  const res = http.get(http.url`https://${__ENV.MY_HOSTNAME}/get?${searchParams.toString()}`)
  return { data: res.json() }
}

// See https://grafana.com/docs/k6/latest/examples/get-started-with-k6/ to learn more
export default function (data) {
  tagWithCurrentStageIndex()
  tagWithCurrentStageProfile()

  group('get current data', function () {
    // You can also use `httpx`: https://grafana.com/docs/k6/latest/javascript-api/jslib/httpx/
    http.batch([
      ['GET', 'https://test-api.k6.io/public/crocodiles/1/'],
      ['GET', 'https://test-api.k6.io/public/crocodiles/2/'],
      ['GET', 'https://test-api.k6.io/public/crocodiles/3/'],
    ])
  })
  group('change some data', function () {
    // ...
  })

  console.log(JSON.stringify(data))
}

export function teardown(data) {
  console.log(JSON.stringify(data))
}

export function handleSummary(output) {
  return {
    stdout: textSummary(output, { indent: '→', enableColors: true }),
  }
}
