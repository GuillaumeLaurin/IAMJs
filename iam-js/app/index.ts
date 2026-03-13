import { AppModule } from "./app.module";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    app.enableShutdownHooks();

    const config = new DocumentBuilder().setTitle('IAMJs API').setDescription('API documentation for IAMJs').setVersion('1.0').build();
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api/docs', app, document);
    SwaggerModule.setup('', app, document);

    await app.listen(process.env.PORT);
}

bootstrap();