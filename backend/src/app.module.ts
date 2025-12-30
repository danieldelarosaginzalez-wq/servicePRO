import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PolizasModule } from './polizas/polizas.module';
import { OrdersModule } from './orders/orders.module';
import { MaterialsModule } from './materials/materials.module';
import { InventoryModule } from './inventory/inventory.module';
import { MaterialControlModule } from './material-control/material-control.module';
import { VisitReportsModule } from './visit-reports/visit-reports.module';
import { FilesModule } from './files/files.module';
import { WebSocketModule } from './websocket/websocket.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(
            process.env.MONGODB_URI || 'mongodb://localhost:27017/serviceops-pro'
        ),
        AuthModule,
        UsersModule,
        PolizasModule,
        OrdersModule,
        MaterialsModule,
        InventoryModule,
        MaterialControlModule,
        VisitReportsModule,
        FilesModule,
        WebSocketModule,
    ],
})
export class AppModule { }