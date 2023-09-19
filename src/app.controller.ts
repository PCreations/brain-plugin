import { Controller, Get } from '@nestjs/common';
import * as aiPluginJson from './ai-plugin.json';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  constructor() {}

  @Public()
  @ApiExcludeEndpoint()
  @Get('.well-known/ai-plugin.json')
  aiPlugin() {
    return aiPluginJson;
  }
}
