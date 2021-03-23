import {Document} from "mongoose";
import TelegramBot from "node-telegram-bot-api";
import {defaultJobsArray} from "./data/Jobs";

const names: string[] = defaultJobsArray.map(job => job.name)


namespace IJob {
    export type TJobNames = typeof names[number];

    export type JobMethodOptions = {
        chatId: number
        bot: TelegramBot
    } & {
        [key in string | number]: any
    };

    export type JobMethod = (arg: JobMethodOptions) => Promise<any>

    export interface RawJob {
        name: string
        schedule: string
        methodName: string
    }

    export interface ChatJob extends RawJob {
        chatId: number
    }

    export interface JobSchema extends ChatJob, Document {
    }

    export interface ReadyToExecuteJob extends ChatJob {
        method: JobMethod
    }

    // store all possible job evens
    export interface JobEventsSet {
        [key: string]: JobMethod
    }
}

export default IJob