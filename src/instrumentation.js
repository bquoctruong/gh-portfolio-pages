//const { NodeSDK } = require('@opentelemetry/sdk-node');
import {NodeSDK} from '@opentelemetry/sdk-node';
//const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');
import {ConsoleSpanExporter} from '@opentelemetry/sdk-trace-node';
//const {
//  getNodeAutoInstrumentations,
//} = require('@opentelemetry/auto-instrumentations-node');
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node';
//const {
//  PeriodicExportingMetricReader,
//  ConsoleMetricExporter,
//} = require('@opentelemetry/sdk-metrics');
import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';

const sdk = new NodeSDK({
  traceExporter: new ConsoleSpanExporter(),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new ConsoleMetricExporter(),
  }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
