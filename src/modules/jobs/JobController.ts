import JobSchema, {IJob, IJobSchema, IJobMethod, IDBJob} from '../../models/Jobs'
import getJobEvent from "./JobEvents";

const cron = require('node-cron')

import JobEvents from "./JobEvents";
import {seedJobsArr} from "../../seeders";


class JobsController {
    chatId: number;

    constructor(chatId: number) {
        this.chatId = chatId;
    }

    public async createDefaultJobs(): Promise<void> {
        try {
            const newJobs = seedJobsArr.map((rawJob) => {
                return {
                    name: rawJob.name,
                    schedule: rawJob.schedule,
                    methodName: rawJob.method.name,
                    chatId: this.chatId
                }
            })

            for (let i = 0; i < newJobs.length; i++) {
                await this.createNewJob(newJobs[i])
            }
        } catch (e) {
            console.error(`createNewJob error: cannot create job`, e)
        }
    }

    //add decorator to create connect and close
    public async createNewJob(job: IDBJob): Promise<void> {
        try {
            await JobSchema.findOneAndUpdate(job, job, { upsert: true });
        } catch (e) {
            console.error(`createNewJob error: cannot create job`, e)
        }
    }

    public async findJobsByChatId(): Promise<IJobSchema[]> {
        return await JobSchema.find({chatId: this.chatId}).exec();

    }

    public async executeJobsForChat(): Promise<void> {
        const jobs: IJobSchema[] = await this.findJobsByChatId()
        if (!jobs.length) {
            return;
        }
        // TODO find way to execute multiply jobs without iteration?
        jobs.forEach(dbJob => {
            try {
                const job = JobsController.getReadyToExecuteJob(dbJob);
                cron.schedule(job);
            } catch (e) {
                console.error(e)
            }
        })
    }

    private static getReadyToExecuteJob(dbJob: IJobSchema): IJob {
        const jobMethod: IJobMethod | null = getJobEvent(dbJob.methodName);
        if (jobMethod === null) {
            throw new Error(`cannot find job method for job with id ${dbJob.id}`);
        }
        const {methodName, ...job} = dbJob
        return {
            ...job,
            method: jobMethod
        }
    }
}

export default JobsController;