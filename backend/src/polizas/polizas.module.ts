import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PolizasController } from './polizas.controller';
import { PolizasService } from './polizas.service';
import { Poliza, PolizaSchema } from './schemas/poliza.schema';
import { Order, OrderSchema } from '../orders/schemas/order.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Poliza.name, schema: PolizaSchema },
            { name: Order.name, schema: OrderSchema },
        ]),
    ],
    controllers: [PolizasController],
    providers: [PolizasService],
    exports: [PolizasService],
})
export class PolizasModule { }