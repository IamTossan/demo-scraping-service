import { Controller, Get, Query } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller('document')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) { }

  @Get()
  find(
    // TODO: add validation alphanum for domain to prevent SQL injections
    @Query('domain') domain: string[],
    @Query('limit') limit: number,
    @Query('skip') skip: number,
  ) {
    return this.documentService.find({ domain, limit, skip });
  }
}
