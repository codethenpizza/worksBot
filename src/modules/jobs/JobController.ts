import TelegramBot from "node-telegram-bot-api";
import IJob from "./types";
import getJobMethod from "./data/JobMethods";
import {defaultJobsNameMap, defaultJobsArray} from "./data/Jobs";
import JobSchema from "../../models/Jobs";


const cron = require('node-cron')

/* control all functionality with single job */
class SingleJobController {
    public static async createJobForChat(job: IJob.ChatJob): Promise<void> {
        try {
            const filter = {
                chatId: job.chatId,
                methodName: job.methodName
            }
            await JobSchema.findOneAndUpdate(filter, job, {upsert: true});
        } catch (e) {
            console.error(`createJobForChat error: cannot create job`, e)
        }
    }

    public static getRawJobByName(name: string): IJob.RawJob | null {
        if (!name) {
            console.error('getRawJobByName: job name must been provided')
            return null
        }
        const job = defaultJobsNameMap[name]
        if (!job) {
            console.error(`getRawJobByName: job with name ${name} doesn't exist`)
            return null
        }
        return job
    }

    // prepare job to execute (get job method)
    private static prepareJobToExecute(dbJob: IJob.JobSchema): IJob.ReadyToExecuteJob {
        const jobMethod: IJob.JobMethod | null = getJobMethod(dbJob.methodName);
        if (jobMethod === null) {
            throw new Error(`prepareJobToExecute: cannot find job method for job with id ${dbJob.id}. Method name: ${dbJob.methodName}`);
        }
        return {
            ...dbJob,
            method: jobMethod
        }
    }

    // schedule job from db(cron) // bot needed for jobs methods
    public static scheduleJob(dbJob: IJob.JobSchema, bot: TelegramBot): void {
        try {
            const preparedJob = SingleJobController.prepareJobToExecute(dbJob);
            cron.schedule(preparedJob.schedule, async () => {
                return preparedJob.method({chatId: preparedJob.chatId, bot})
            }, {
                timezone: 'Europe/Moscow'
            });
            console.log(`job scheduled. Chat id: ${dbJob.chatId}. Method: ${dbJob.methodName}. Schedule: ${dbJob.schedule}`)
        } catch (e) {
            console.error('scheduleJob: cannot schedule job', e)
        }
    }
}

/* control all functionality with jobs list */
class JobController extends SingleJobController {
    // create jobs for specific chat
    public static async createJobsForChat(rawJobs: IJob.RawJob[], chatId: number): Promise<void> {
        try {
            const newJobs = rawJobs.map((rawJob: IJob.RawJob): IJob.ChatJob => {
                return {
                    name: rawJob.name,
                    schedule: rawJob.schedule,
                    methodName: rawJob.methodName,
                    chatId: chatId
                }
            })
            for (let i = 0; i < newJobs.length; i++) {
                await JobController.createJobForChat(newJobs[i])
            }
        } catch (e) {
            console.error(e)
            throw new Error(`createDefaultJobs error: cannot create default jobs for chat ${chatId}`)
        }
    }

    // create jobs for chat by name (db)
    public static async createJobsForChatByName(namesArr: IJob.TJobNames[], chatId: number): Promise<void> {
        if (!chatId) {
            console.error('createJobsForChatByName: chat id must been provided');
            return;
        }
        try {
            const jobs: IJob.RawJob[] = [];
            namesArr.forEach(name => {
                const rawJob = JobController.getRawJobByName(name);
                if (rawJob) {
                    jobs.push(rawJob);
                }
            })
            if (!jobs.length) {
                console.warn(`createJobsForChatByName: cant find any job for array of names = ${namesArr.join(', ')}`)
                return;
            }
            await JobController.createJobsForChat(jobs, chatId);
        } catch (e) {
            console.error(`createJobsForChatByName error:`, e)
        }
    }

    // create all jobs for chat (db)
    public static async createDefaultJobs(chatId: number): Promise<void> {
        if (!chatId) {
            console.error('createDefaultJobs: chat id must been provided');
            return;
        }

        try {
            await JobController.createJobsForChat(defaultJobsArray, chatId);
        } catch (e) {
            console.error(`createDefaultJobs error: cannot create default jobs for chat ${chatId}`, e)
        }
    }

    // get all jobs for chat (db)
    public static async findJobsByChatId(chatId: number): Promise<IJob.JobSchema[]> {
        if (!chatId) {
            console.error('findJobsByChatId error: chat id must been provided')
            return []
        }
        return await JobSchema.find({chatId}).exec();
    }

    // schedule multiply jobs
    private static scheduleMultiplyJobs(jobs: IJob.JobSchema[], bot: TelegramBot): void {
        // TODO find way to execute multiply jobs without iteration?
        jobs.forEach(dbJob => {
            JobController.scheduleJob(dbJob, bot);
        })
    }

    // delete ALL jobs for ONE chat (db)
    public static async deleteAllJobs(chatId: number): Promise<void> {
        if (!chatId) {
            console.error('deleteAllJobs: chat id must been provided')
            return
        }

        try {
            await JobSchema.deleteMany({chatId})
        } catch (e) {
            console.error(`deleteAllJobs error: cannot delete job for chat ${chatId}`, e)
        }
    }

    // schedule ALL jobs for ONE chat (cron)
    public static async scheduleAllJobsForChat(chatId: number, bot: TelegramBot): Promise<void> {
        try {
            const jobs: IJob.JobSchema[] = await JobController.findJobsByChatId(chatId);
            if (!jobs.length) {
                return;
            }

            JobController.scheduleMultiplyJobs(jobs, bot);
        } catch (e) {
            console.error(`scheduleAllJobsForChat error: cannot schedule all jobs for chat ${chatId}`, e)
        }
    }

    // schedule ALL jobs for ALL chat (cron)
    public static async scheduleJobsForAllChats(bot: TelegramBot): Promise<void> {
        try {
            const jobs = await JobSchema.find().exec();
            if (!jobs.length) {
                return;
            }
            JobController.scheduleMultiplyJobs(jobs, bot);
            console.log(`Total jobs scheduled - ${jobs.length}`)
        } catch (e) {
            console.error(`scheduleJobsForAllChats error: cannot schedule all jobs for all chats`, e)
        }
    }
}

export default JobController


