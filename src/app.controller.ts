import { Controller, Get } from '@nestjs/common';
import * as aiPluginJson from './ai-plugin.json';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor() {}

  @ApiExcludeEndpoint()
  @Get('.well-known/ai-plugin.json')
  aiPlugin() {
    return aiPluginJson;
  }

  @Get('hello-world')
  helloWorld() {
    return 'Hello World';
  }
}
