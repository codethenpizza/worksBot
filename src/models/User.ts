import mongoose, {Schema, Document} from "mongoose";

export interface IUser {
    telegramId: number
    firstName: string
    lastName?: string
    chatId: number
}

export interface IUserSchema extends Document {
    id?: string,
    telegramId: number
    firstName: string
    lastName?: string
    chatId: number
}

const UserSchema: Schema = new mongoose.Schema({
    telegramId: {
        type: Number,
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: false,
    },
    chatId: {
        type: Number,
        required: false,
    },

})

export default mongoose.model<IUserSchema>('User', UserSchema)