import { Controller, Post, Body } from '@nestjs/common';
import { OptimizationEngine, OptProfile } from '../engines/optimization.engine';

@Controller('optimization')
export class OptimizationController {
  constructor(private readonly engine: OptimizationEngine) {}

  @Post('run')
  run(@Body() profile: OptProfile) {
    return this.engine.run(profile);
  }
}
