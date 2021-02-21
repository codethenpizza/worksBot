import User  from '../../models/User'
import {IUserSchema, IUser} from "./types";

const WORK_MANAGER_ID = process.env.MANAGER_TELEGRAM_ID;

class UserController {
    public static async getUser(userid: number): Promise<IUserSchema | null> {
        const user = await User.findOne({telegramId: userid}).exec();
        if (!user) {
            return null
        }
        return user
    }

    // e.g. upsert
    public static async findOrCreateUser(user: IUser): Promise<IUserSchema> {
        const userId = user.telegramId
        const foundedUser = await UserController.getUser(userId)
        if (foundedUser) {
            return foundedUser
        }
        return await UserController.createUser(user);
    }

    public static async createUser(user: IUser): Promise<IUserSchema> {
        return await User.create({
            telegramId: user.telegramId,
            chatId: user.chatId,
            firstName: user.firstName,
            lastName: user.lastName,
            userName: user.userName
        });
    }

    public static async removeUser(userid: number): Promise<void> {
        await User.remove({telegramId: userid})
    }

    public static async getWorkManager(): Promise<IUserSchema | null> {
        //TODO: reg work manager somehow or hardcode params here when get it

        // temporary get from env
        if (!WORK_MANAGER_ID) {
            return null
        }
        const managerId = Number(WORK_MANAGER_ID)
        const user = await User.findOne({telegramId: managerId}).exec();
        if (!user) {
            return null
        }
        return user
    }

    public static async countUsers(): Promise<number> {
        return User.count().exec();
    }

    public static async getAllUsersByChatId(chatId: number): Promise<IUser[]> {
        return User.find({chatId}).exec();
    }
}

export default UserController;