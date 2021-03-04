import {IRawJob} from "../modules/jobs/types";
import {allEvents} from "../modules/jobs/JobEvents";

const STATUS_JOB_SCHEDULE = process.env.STATUS_JOB_SCHEDULE || '40 14 * * 1-5';
const CALLS_JOB_SCHEDULE = process.env.CALLS_JOB_SCHEDULE || '30 21 * * 1-5';
const UNPIN_POLL_JOB_SCHEDULE = process.env.UNPIN_POLL_JOB_SCHEDULE || '30 23 * * 1-5';

export const seedJobsArr: IRawJob[] = [
    {
        name: 'getStatusInfo',
        schedule: STATUS_JOB_SCHEDULE,
        method: allEvents.getStatusInfo,
    },
    {
        name: 'createPoll',
        schedule: CALLS_JOB_SCHEDULE,
        method: allEvents.createStatusPoll,
    },
    {
        name: 'unpinPoll',
        schedule: UNPIN_POLL_JOB_SCHEDULE,
        method: allEvents.unpinPoll,
    }
]

