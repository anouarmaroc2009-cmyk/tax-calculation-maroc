import { Controller, Post, Body } from '@nestjs/common';
import { VATEngine, TVAInput } from '../engines/vat.engine';

@Controller('tva')
export class TVAController {
  constructor(private readonly engine: VATEngine) {}

  @Post('calculate')
  calculate(@Body() input: TVAInput) {
    return this.engine.calculate(input);
  }
}
