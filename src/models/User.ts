import mongoose, {Schema, Document} from "mongoose";

export interface IUser {
    telegramId: number
    userName?: string
    firstName: string
    lastName?: string
    chatId: number
}

export interface IUserSchema extends Document {
    id?: string,
    userName: string
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
    userName: {
        type: String,
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