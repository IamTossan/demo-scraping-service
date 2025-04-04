import { Mistral } from '@mistralai/mistralai';
import { responseFormatFromZodObject } from '@mistralai/mistralai/extra/structChat';
import { FileT } from '@mistralai/mistralai/models/operations';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { invoiceExtract, InvoiceExtract } from './entities/invoice-extract';

@Injectable()
export class MistralaiService {
  private client: Mistral;
  constructor(private configService: ConfigService) {
    this.client = new Mistral({ apiKey: configService.get('MISTRAL_API_KEY') });
  }

  async uploadFile(file: FileT['content']): Promise<string> {
    const uploadedFile = await this.client.files.upload({
      file: { fileName: 'my_pdf.pdf', content: file },
      purpose: 'ocr',
    });
    const signedUrl = await this.client.files.getSignedUrl({
      fileId: uploadedFile.id,
    });
    return signedUrl.url;
  }

  async processFile(signedUrl: string): Promise<InvoiceExtract> {
    const responseFormat = responseFormatFromZodObject(invoiceExtract);

    const chatResponse = await this.client.chat.complete({
      model: 'mistral-small-latest',
      responseFormat,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Voici un fichier PDF, peux-tu extraire la date de la facture, le nom du fournisseur, la nature de la dépense, le montant hors taxe, le montant total, le montant TVA, le montant TTC?',
            },
            {
              type: 'document_url',
              documentUrl: signedUrl,
            },
          ],
        },
      ],
    });

    return invoiceExtract.parse(
      JSON.parse(
        (chatResponse.choices![0].message.content as string)?.trim() || '{}',
      ),
    );
  }
}
