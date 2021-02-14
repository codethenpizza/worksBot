import User, {IUserSchema, IUser} from '../../models/User'

class UserController {
    public static async getUser(userid: number): Promise<IUserSchema | null> {
        const user = await User.findOne({telegramId: userid}).exec();
        if (!user) {
            return null
        }
        return user
    }

    // e.g. upsert
    public static async findOrCreateUser(user: IUser): Promise<void> {
        const userId = user.telegramId
        const foundedUser = await UserController.getUser(userId)
        if (!foundedUser) {
            await UserController.createUser(user);
        }
    }

    public static async createUser(user: IUser): Promise<void> {
        //return id?
        await User.findOneAndUpdate({telegramId: user.telegramId, chatId: user.chatId}, user, {upsert: true});
    }

    public static async removeUser(userid: number): Promise<void> {
        await User.remove({telegramId: userid})
    }

    public static async getWorkManager(firstName: string, lastName: string): Promise<IUserSchema | null> {
        //TODO: reg work manager somehow or hardcode params here when get it
        const user = await User.findOne({firstName, lastName}).exec();
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