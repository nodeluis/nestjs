import { Injectable } from '@nestjs/common';
import fs from 'fs';
import * as pdfreader from 'pdfreader';

@Injectable()
export class CoursesService {
    public async pdfReader():Promise<boolean>{
        fs.readFile("sample.pdf", (err, pdfBuffer) => {
            // pdfBuffer contains the file content
            new pdfreader().parseBuffer(pdfBuffer, function (err, item) {
              if (item.text) console.log(item.text);
            });
          });
        return true;
    }
}
