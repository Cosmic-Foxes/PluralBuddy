import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-node";
import { opentelemetry } from "@slipher/opentelemetry";

export function openTelemetry() {
	return opentelemetry({
		serviceName: "pluralbuddy",
		spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter())],
	});
}