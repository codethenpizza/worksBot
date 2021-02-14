import mongoose, {Schema, Document} from "mongoose";
import TelegramBot from "node-telegram-bot-api";



export type IJobMethodOptions = {
    chatId: number
    bot: TelegramBot
} & {
    [key in string | number]: any
};

export type IJobMethod = (arg: IJobMethodOptions) => Promise<void>

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


const JobSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    schedule: {
        type: String,
        required: true,
    },
    methodName: {
        type: String,
        required: false,
    },
    chatId: {
        type: Number,
        required: false,
    },
})

export default mongoose.model<IJobSchema>('Job', JobSchema)