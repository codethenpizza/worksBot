import TelegramBot from "node-telegram-bot-api";
import {Document} from "mongoose";

//TODO refactor job interfaces
export type IJobMethodOptions = {
    chatId: number
    bot: TelegramBot
} & {
    [key in string | number]: any
};

export type IJobMethod = (arg: IJobMethodOptions) => Promise<any>

// for create new job
export interface IRawJob {
    name: string
    schedule: string
    method: IJobMethod
}

export interface IDBJob {
    name: string
    schedule: string
    methodName: string
    chatId: number
}

// for saving job
export interface IJobSchema extends Document {
    id?: string
    name: string
    schedule: string
    methodName: string
    chatId: number
}

// ready to execute job
export interface IJob {
    id?: string
    name: string
    schedule: string
    method: IJobMethod
    chatId: number
}

// store all possible job evens
export interface IJobEventsSet {
    [key: string]: IJobMethod
}