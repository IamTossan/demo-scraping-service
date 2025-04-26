import { ConsoleLogger } from '@nestjs/common';
import { AnyValue, Logger, SeverityNumber } from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import {
  BatchLogRecordProcessor,
  LoggerProvider,
} from '@opentelemetry/sdk-logs';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

export class LoggerWithOTEL extends ConsoleLogger {
  public readonly logger: Logger;
  constructor(public readonly context: string) {
    super(context);

    // To start a logger, you first need to initialize the Logger provider.
    const loggerProvider = new LoggerProvider({
      resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
        // [ATTR_SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION,
      }),
    });
    // Add a processor to export log record
    loggerProvider.addLogRecordProcessor(
      new BatchLogRecordProcessor(new OTLPLogExporter()),
    );

    this.logger = loggerProvider.getLogger('default');
  }

  log(message: unknown, ...rest: [...any]): void {
    this.logger.emit({
      severityNumber: SeverityNumber.INFO,
      severityText: 'INFO',
      body: message as AnyValue,
      attributes: {
        context: this.context,
      },
    });
    super.log(message, ...rest);
  }

  error(message: unknown, ...rest: [...any]): void {
    this.logger.emit({
      severityNumber: SeverityNumber.ERROR,
      severityText: 'ERROR',
      body: message as AnyValue,
      attributes: {
        context: this.context,
      },
    });
    super.error(message, ...rest);
  }
}
