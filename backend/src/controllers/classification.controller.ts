import { Controller, Post, Body } from '@nestjs/common';
import { ClassificationEngine, ClassContext } from '../engines/classification.engine';

@Controller('classification')
export class ClassificationController {
  constructor(private readonly engine: ClassificationEngine) {}

  @Post('classify')
  classify(@Body() body: { type: string; context: ClassContext }) {
    return this.engine.classifyIncome(body.type, body.context);
  }
}
