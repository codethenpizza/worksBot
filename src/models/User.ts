import mongoose, {Schema} from "mongoose";
import {IUserSchema} from "../modules/user/types";

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