import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { CorporateIncomeTaxEngine } from './engines/corporate-income-tax.engine';
import { IndividualIncomeTaxEngine } from './engines/individual-income-tax.engine';
import { VATEngine } from './engines/vat.engine';
import { ClassificationEngine } from './engines/classification.engine';
import { OptimizationEngine } from './engines/optimization.engine';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
  ],
  providers: [
    CorporateIncomeTaxEngine,
    IndividualIncomeTaxEngine,
    VATEngine,
    ClassificationEngine,
    OptimizationEngine,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
  exports: [
    CorporateIncomeTaxEngine,
    IndividualIncomeTaxEngine,
    VATEngine,
    ClassificationEngine,
    OptimizationEngine,
  ],
})
export class AppModule {}
