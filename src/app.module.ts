import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VehiclesModule } from './vehicles/vehicles.module';
import { SparePartsModule } from './spare-parts/spare-parts.module';
import { BikerGearModule } from './biker-gear/biker-gear.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { FirebaseModule } from './firebase/firebase.module';
import { FirebaseControllerModule } from './firebase/firebase.controller.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    FirebaseModule,
    FirebaseControllerModule,
    VehiclesModule,
    SparePartsModule,
    BikerGearModule,
    ChatbotModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
