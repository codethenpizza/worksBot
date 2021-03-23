// list of available jobs

import IJob from "../types";

const STATUS_JOB_SCHEDULE = process.env.STATUS_JOB_SCHEDULE || '40 14 * * 1-5';
const CALLS_JOB_SCHEDULE = process.env.CALLS_JOB_SCHEDULE || '30 21 * * 1-5';
const UNPIN_POLL_JOB_SCHEDULE = process.env.UNPIN_POLL_JOB_SCHEDULE || '30 23 * * 1-5';

export const defaultJobsArray: IJob.RawJob[]  = [
    {
        name: 'status',
        schedule: STATUS_JOB_SCHEDULE,
        methodName: 'getStatusInfo'
    },
    {
        name: 'poll',
        schedule: CALLS_JOB_SCHEDULE,
        methodName: 'createStatusPoll'
    },
    {
        name: 'uPoll',
        schedule: UNPIN_POLL_JOB_SCHEDULE,
        methodName: 'unpinPoll',
    }
]



export const defaultJobsNameMap = defaultJobsArray.reduce<{ [key: string]: IJob.RawJob }>((map, job) => {
    map[job.name] = job;
    return map;
}, {})