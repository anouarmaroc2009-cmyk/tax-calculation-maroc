import { Module } from '@nestjs/common';
import { ISController } from './controllers/is.controller';
import { IRController } from './controllers/ir.controller';
import { TVAController } from './controllers/tva.controller';
import { ClassificationController } from './controllers/classification.controller';
import { OptimizationController } from './controllers/optimization.controller';
import { PenaltyController } from './controllers/penalty.controller';
import { CorporateIncomeTaxEngine } from './engines/corporate-income-tax.engine';
import { IndividualIncomeTaxEngine } from './engines/individual-income-tax.engine';
import { VATEngine } from './engines/vat.engine';
import { ClassificationEngine } from './engines/classification.engine';
import { OptimizationEngine } from './engines/optimization.engine';
import { PenaltyEngine } from './engines/penalty.engine';

@Module({
  imports: [],
  controllers: [ISController, IRController, TVAController, ClassificationController, OptimizationController, PenaltyController],
  providers: [CorporateIncomeTaxEngine, IndividualIncomeTaxEngine, VATEngine, ClassificationEngine, OptimizationEngine, PenaltyEngine],
})
export class AppModule {}
