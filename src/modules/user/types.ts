import {Document} from "mongoose";

export interface IUserInfo {
    telegramId: number
    userName?: string
    firstName: string
    lastName?: string
}


export interface IUser extends IUserInfo{
    chatId: number
}

export interface IUserSchema extends IUser, Document {}