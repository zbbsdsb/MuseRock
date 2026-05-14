import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  HandlerRegistry,
  MCPHandler,
} from './handlers/handler.registry';
import { MemoryHandler } from './handlers/memory.handler';
import { ApprenticeHandler, GetApprenticeJobHandler } from './handlers/apprentice.handler';
import { FetchBioAssetHandler } from './handlers/fetch-bio-asset.handler';
import { SearchBioAssetsHandler } from './handlers/search-bio-assets.handler';
import { ListCharactersHandler } from './handlers/list-characters.handler';
import { GetCharacterDetailHandler } from './handlers/get-character-detail.handler';
import { ContentHandler } from './handlers/content.handler';
import { PromptHandler } from './handlers/prompt.handler';

@Injectable()
export class McpService implements OnModuleInit {
  constructor(
    private readonly handlerRegistry: HandlerRegistry,
    private readonly memoryHandler: MemoryHandler,
    private readonly apprenticeHandler: ApprenticeHandler,
    private readonly getApprenticeJobHandler: GetApprenticeJobHandler,
    private readonly fetchBioAssetHandler: FetchBioAssetHandler,
    private readonly searchBioAssetsHandler: SearchBioAssetsHandler,
    private readonly listCharactersHandler: ListCharactersHandler,
    private readonly getCharacterDetailHandler: GetCharacterDetailHandler,
    private readonly contentHandler: ContentHandler,
    private readonly promptHandler: PromptHandler,
  ) {}

  onModuleInit() {
    this.registerHandlers([
      this.memoryHandler,
      this.apprenticeHandler,
      this.getApprenticeJobHandler,
      this.fetchBioAssetHandler,
      this.searchBioAssetsHandler,
      this.listCharactersHandler,
      this.getCharacterDetailHandler,
      this.contentHandler,
      this.promptHandler,
    ]);
  }

  private registerHandlers(handlers: MCPHandler[]) {
    handlers.forEach((handler) => {
      this.handlerRegistry.registerToolHandler(handler);
    });
  }

  getHandlerRegistry(): HandlerRegistry {
    return this.handlerRegistry;
  }
}
