import { Controller, Post, Body } from '@nestjs/common';
import { CorporateIncomeTaxEngine, ISInput } from '../engines/corporate-income-tax.engine';

@Controller('is')
export class ISController {
  constructor(private readonly engine: CorporateIncomeTaxEngine) {}

  @Post('calculate')
  calculate(@Body() input: ISInput) {
    return this.engine.calculate(input);
  }
}
