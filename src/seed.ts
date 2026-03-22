import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Repository } from "typeorm";
import { User } from "./Common/Entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import bcrypt from "bcrypt"

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule)
    const userRepo = app.get<Repository<User>>(getRepositoryToken(User))

    const exists = await userRepo.findOne({ where: { email: 'aga77ams@gmail.com' } })
    if (!exists) {
        const hashed = await bcrypt.hash('Admin123456', 10)
        const admin = userRepo.create({
            email: 'aga77ams@gmail.com',
            password: hashed,
            name: 'Agasalim',
            role: 'ADMIN',
            phone: '+994773997811'
        })
        await userRepo.save(admin)
        console.log('Admin created')
    }
    else console.log('Admin already exists')

    await app.close()
}

seed()