import { Controller, Post, Body } from '@nestjs/common';
import { IndividualIncomeTaxEngine, IRInput } from '../engines/individual-income-tax.engine';

@Controller('ir')
export class IRController {
  constructor(private readonly engine: IndividualIncomeTaxEngine) {}

  @Post('calculate')
  calculate(@Body() input: IRInput) {
    return this.engine.calculate(input);
  }
}
