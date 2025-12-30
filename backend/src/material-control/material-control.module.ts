import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialControlController } from './material-control.controller';
import { MaterialControlService } from './material-control.service';
import { MaterialControl, MaterialControlSchema } from './schemas/material-control.schema';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MaterialControl.name, schema: MaterialControlSchema }
        ]),
        InventoryModule,
    ],
    controllers: [MaterialControlController],
    providers: [MaterialControlService],
    exports: [MaterialControlService],
})
export class MaterialControlModule { }
