import { Controller, Post, Body } from '@nestjs/common';
import { PenaltyEngine, PenaltyInput } from '../engines/penalty.engine';

@Controller('penalties')
export class PenaltyController {
  constructor(private readonly engine: PenaltyEngine) {}

  @Post('calculate')
  calculate(@Body() input: PenaltyInput) {
    return this.engine.calculate(input);
  }
}
