import JobSchema from '../../models/Jobs'
import {IJobSchema, IJob, IDBJob, IJobMethod} from "./types";
import getJobEvent from "./JobEvents";

const cron = require('node-cron')

import {seedJobsArr} from "../../seeders";
import TelegramBot from "node-telegram-bot-api";

class JobsController {
    bot: TelegramBot
    chatId: number | null;

    constructor(bot: TelegramBot, chatId?: number) {
        this.bot = bot;
        this.chatId = chatId || null;
    }

    public async createDefaultJobs(chatId?: number): Promise<void> {

        const jobChatId = chatId || this.chatId;
        if (!jobChatId) {
            console.error('createDefaultJobs: chat id must been provided')
            return
        }

        try {
            const newJobs = seedJobsArr.map((rawJob) => {
                return {
                    name: rawJob.name,
                    schedule: rawJob.schedule,
                    methodName: rawJob.method.name,
                    chatId: jobChatId
                }
            })

            for (let i = 0; i < newJobs.length; i++) {
                await this.createNewJob(newJobs[i])
            }
        } catch (e) {
            console.error(`createNewJob error: cannot create job`, e)
        }
    }

    public async deleteAllJobs(chatId?: number): Promise<void> {
        const jobChatId = chatId || this.chatId;
        if (!jobChatId) {
            console.error('createDefaultJobs: chat id must been provided')
            return
        }

        try {
            JobSchema.deleteMany({chatId: jobChatId})
        } catch (e) {
            console.error(`createNewJob error: cannot create job`, e)
        }
    }

    public async createNewJob(job: IDBJob): Promise<void> {
        try {
            const filter = {
                chatId: job.chatId,
                methodName: job.methodName
            }
            await JobSchema.findOneAndUpdate(filter, job, {upsert: true});
        } catch (e) {
            console.error(`createNewJob error: cannot create job`, e)
        }
    }

    public async findJobsByChatId(chatId?: number): Promise<IJobSchema[]> {
        const jobChatId = chatId || this.chatId;
        if (!jobChatId) {
            console.error('findJobsByChatId: chat id must been provided')
            return []
        }
        return await JobSchema.find({chatId: jobChatId}).exec();

    }

    public async scheduleJobsForAllChats() {
        const jobs = await JobSchema.find().exec();
        if (!jobs.length) {
            return;
        }
        for (let i = 0; i < jobs.length; i++) {
            this.scheduleJob(jobs[i]);
        }
        console.log('jobs scheduled', jobs.length)
    }

    public async scheduleJobsForChat(): Promise<void> {
        const jobs: IJobSchema[] = await this.findJobsByChatId()
        if (!jobs.length) {
            return;
        }
        // TODO find way to execute multiply jobs without iteration?
        jobs.forEach(dbJob => {
            this.scheduleJob(dbJob);
        })
    }

    private scheduleJob(dbJob: IJobSchema): void {
        // move timezone to env
        try {
            const preparedJob = JobsController.prepareJobToExecute(dbJob);
            cron.schedule(preparedJob.schedule, async () => {
                return preparedJob.method({chatId: preparedJob.chatId, bot: this.bot})
            }, {
                timezone: 'Europe/Moscow'
            });
            console.log(`job scheduled. Chat id: ${dbJob.chatId}. Method: ${dbJob.methodName}. Schedule: ${dbJob.schedule}`)
        } catch (e) {
            console.error('scheduleJob: cannot schedule job', e)
        }
    }

    private static prepareJobToExecute(dbJob: IJobSchema): IJob {
        const jobMethod: IJobMethod | null = getJobEvent(dbJob.methodName);
        if (jobMethod === null) {
            throw new Error(`prepareJobToExecute: cannot find job method for job with id ${dbJob.id}. Method name: ${dbJob.methodName}`);
        }
        const { chatId, name, schedule} = dbJob
        return {
            chatId,
            name,
            schedule,
            method: jobMethod
        }
    }
}

export default JobsController;