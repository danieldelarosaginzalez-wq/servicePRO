import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MaterialControlController } from './material-control.controller';
import { MaterialControlService } from './material-control.service';
import { MaterialControl, MaterialControlSchema } from './schemas/material-control.schema';
import { InventoryModule } from '../inventory/inventory.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { WebSocketModule } from '../websocket/websocket.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MaterialControl.name, schema: MaterialControlSchema }
        ]),
        InventoryModule,
        forwardRef(() => NotificationsModule),
        WebSocketModule,
    ],
    controllers: [MaterialControlController],
    providers: [MaterialControlService],
    exports: [MaterialControlService],
})
export class MaterialControlModule { }
