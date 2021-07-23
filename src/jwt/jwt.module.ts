import { Module, DynamicModule, Global } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { JwtOptions } from './interfaces/jwt-module-options.interface';

@Module({})
@Global()
export class JwtModule {
  static forRoot(options: JwtOptions): DynamicModule {
    return {
      module: JwtModule,
      exports: [JwtService],
      providers: [{ provide: 'BANANAS', useValue: options }, JwtService],
    };
  }
}
