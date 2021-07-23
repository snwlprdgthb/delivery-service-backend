import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as AWS from 'aws-sdk';

const BUCKET_NAME = 'poslushnoireact123';

@Controller('uploads')
export class UploadsController {
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file) {
    AWS.config.update({
      credentials: {
        accessKeyId: 'AKIA2XXV3GRWXR6OGCUM',
        secretAccessKey: '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',
      },
    });
    try {
      //   const upload = await new AWS.S3()
      //     .createBucket({
      //       Bucket: 'poslushnoireact123',
      //     })
      //     .promise();
      const objectName = `${Date.now() + file.originalname}`;

      await new AWS.S3()
        .putObject({
          Body: file.buffer,
          Bucket: BUCKET_NAME,
          Key: objectName,
          ACL: 'public-read',
        })
        .promise();
      const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${objectName}`;
      return { url };
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
