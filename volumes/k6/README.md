![Load Testing Types](https://grafana.com/media/docs/k6-oss/chart-load-test-types-overview.png)

## Docs & Blogs
- [Learning JavaScript through load test scripts](https://k6.io/blog/learning-js-through-load-testing/)
- [Scenarios](https://grafana.com/docs/k6/latest/using-k6/scenarios/executors/)
- [Load Testing Your API with Swagger/OpenAPI and k6](https://k6.io/blog/load-testing-your-api-with-swagger-openapi-and-k6/)
- [SharedArray](https://grafana.com/docs/k6/latest/javascript-api/k6-data/sharedarray/)
- [Integrations & Tools](https://grafana.com/docs/k6/latest/misc/integrations/)
- [Browser Tests](https://grafana.com/docs/k6/latest/using-k6-browser/running-browser-tests/)
- [`utils` Module](https://grafana.com/docs/k6/latest/javascript-api/jslib/utils/)
- [Running large tests](https://grafana.com/docs/k6/latest/testing-guides/running-large-tests/)
  - [Fine-tune OS](https://grafana.com/docs/k6/latest/set-up/fine-tune-os/)
- [Running distributed tests](https://grafana.com/docs/k6/latest/testing-guides/running-distributed-tests/)
  - [Running distributed load tests on Kubernetes](https://grafana.com/blog/2022/06/23/running-distributed-load-tests-on-kubernetes/)
- [Explore k6 extensions](https://grafana.com/docs/k6/latest/extensions/explore/)

### Saving tests without retention
[Source](https://grafana.com/docs/grafana-cloud/cost-management-and-billing/understand-your-invoice/k6-invoice/#saving-tests-without-retention)

Besides purchasing more data retention, you have a few other options to save test data:
- Set the results of a specific test run as a baseline.
- Add results from all runs of a test to your saved tests.
- Export the results and save them locally.

### Limits
[Source](https://grafana.com/docs/grafana-cloud/cost-management-and-billing/understand-grafana-cloud-features/#k6-testing)
```
Max VUs:        100 per test
Test duration:  1 hour
Data retention: 14 days
Saved tests:    5
Load zones:     1
Usage reports:  Yes
PDF reports:    Yes
```

## Commands
First, add this to your `~/.bash_aliases`/`~/.zshrc`:
```sh
alias k6='PATH_TO_ADMIRAL_REPO/docker/compose-files/dev-stack/scripts/k6' 
```
Then use the script like below:
```sh
k6 run test.js
k6 run test.js --out cloud
k6 cloud test.js
k6 run -o experimental-prometheus-rw --tag testid=<PROJECT-ID> script.js
```
Build `k6` binary with extensions:
```sh
docker run -e HTTP_PROXY -e HTTPS_PROXY --rm -u "$(id -u):$(id -g)" -v "${PWD}:/xk6" grafana/xk6 build v0.52.0 \
  --with github.com/grafana/xk6-output-prometheus-remote@v0.4.0 \
  --with github.com/avitalique/xk6-file@v1.4.0 \
  --with github.com/szkiba/xk6-dotenv@v0.2.0
```
> **Note:** If encountered 403 errors, enable a proxy (via envs) and try again.

## Web Dashboard
Available on http://localhost:5665 (by default) when running the test.

### Generate HTML Report
Either use `K6_WEB_DASHBOARD_EXPORT=path/to/report.html` or click **Report** on the dashboard’s menu.
> **Note:** When using the env in *Docker*:
> - The directory must be owned by k6 user. (run `sudo chown 12345:12345 path/to` once)
> - The report path should be on the mounted volume of the container and is relative to `/home/k6`.

## Output to Prometheus
[Docs](https://grafana.com/docs/k6/latest/results-output/real-time/prometheus-remote-write/#time-series-visualization) - [GitHub](https://github.com/grafana/xk6-output-prometheus-remote) - [Dashboard](https://grafana.com/grafana/dashboards/19665-k6-prometheus/) - [Dashboard (Native Histogram)](https://grafana.com/grafana/dashboards/18030-k6-prometheus-native-histograms/)

Configure the envs, then add `-o experimental-prometheus-rw` option to CLI.
You can also use `--tag testid=repo` to identify the tests.

## Test Services
- https://test.k6.io/ (with a comprehensive sample script)
- https://test-api.k6.io
- https://httpbin.test.k6.io/

## Tips & Tricks
- Use HAR to automate test building
- `console.debug()` will log output only when you run k6 with the `-v/--verbose` flag.
- [Batch requests](https://grafana.com/docs/k6/latest/javascript-api/k6-http/batch/)
- Use [Threshold](https://grafana.com/docs/k6/latest/using-k6/thresholds/) for SLOs in CI
- [How to execute single scenario out of multiple scenarios in a script?](https://community.grafana.com/t/how-to-execute-single-scenario-out-of-multiple-scenarios-in-a-script/99301/1)
  - https://stackoverflow.com/questions/76713737/how-to-execute-single-scenario-out-of-multiple-scenarios-in-a-script-in-k6
- Group Similar URLs
  ```js
  http.get(http.url`http://example.com/posts/${id}`);
  // Or
  http.get(`http://example.com/posts/${id}`, {
    tags: { name: 'PostsItemURL' },
  });
  ```

# Prerequisites
- Services should be configurable to disable some proxy services in order to avoid having side-effects on external services.


