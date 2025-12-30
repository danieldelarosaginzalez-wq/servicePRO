import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolizasController } from './polizas.controller';
import { PolizasService } from './polizas.service';
import { Poliza, PolizaSchema } from './schemas/poliza.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Poliza.name, schema: PolizaSchema }]),
    ],
    controllers: [PolizasController],
    providers: [PolizasService],
    exports: [PolizasService],
})
export class PolizasModule { }