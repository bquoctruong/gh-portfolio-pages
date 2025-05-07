/*instrumentation.js*/
require('dotenv').config();

// Require dependencies
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-proto');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-proto');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics');

// Grafana Cloud configuration
const GRAFANA_CLOUD_URL = process.env.GRAFANA_CLOUD_URL || 'https://tempo-us-central1.grafana.net/tempo';
const GRAFANA_INSTANCE_ID = process.env.GRAFANA_INSTANCE_ID;
const GRAFANA_SERVICE_ACCOUNT_TOKEN = process.env.GRAFANA_SERVICE_ACCOUNT_TOKEN;

if (!GRAFANA_SERVICE_ACCOUNT_TOKEN || !GRAFANA_INSTANCE_ID) {
    console.warn('Warning: Grafana Cloud credentials not set. Telemetry data will not be exported.');
}

// Configure OTLP exporters with service account authentication
const headers = {
    'Authorization': `Bearer ${GRAFANA_SERVICE_ACCOUNT_TOKEN}`,
    'X-Scope-OrgID': GRAFANA_INSTANCE_ID
};

const traceExporter = new OTLPTraceExporter({
    url: GRAFANA_CLOUD_URL,
    headers
});

const metricExporter = new OTLPMetricExporter({
    url: GRAFANA_CLOUD_URL.replace('/tempo', '/otlp/v1/metrics'),
    headers
});

const sdk = new NodeSDK({
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 10000, // Export metrics every 10 seconds
    }),
    instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK
sdk.start()
    // .then(() => console.log('OpenTelemetry SDK started successfully'))
    // .catch((error) => console.error('Error starting OpenTelemetry SDK:', error));

// Graceful shutdown
process.on('SIGTERM', () => {
    sdk.shutdown()
        // .then(() => console.log('SDK shut down successfully'))
        // .catch((error) => console.error('Error shutting down SDK:', error))
        // .finally(() => process.exit(0));
});
