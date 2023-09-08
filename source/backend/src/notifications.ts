import { Redis, RedisOptions } from 'ioredis';

interface Notification {
    isNewExecution: () => this is NewExecutionNotification;
    isUpdatedWebsiteRecord: () => this is UpdatedWebsiteRecordNotification;
    isCancelExecution: () => this is CancelExecutionNotification;
}

class NewExecutionNotification implements Notification {
    constructor(
        public executionId: string,
        public websiteRecordId: string
    ) {}
    isNewExecution() {
        return true;
    }
    isUpdatedWebsiteRecord() {
        return false;
    }
    isCancelExecution() {
        return false;
    }
}

class UpdatedWebsiteRecordNotification implements Notification {
    constructor(public websiteRecordId: string) {}
    isNewExecution() {
        return false;
    }
    isUpdatedWebsiteRecord() {
        return true;
    }
    isCancelExecution() {
        return false;
    }
}

class CancelExecutionNotification implements Notification {
    constructor(public executionId: string) {}
    isNewExecution() {
        return false;
    }
    isUpdatedWebsiteRecord() {
        return false;
    }
    isCancelExecution() {
        return true;
    }
}

enum NotificationType {
    NewExecution = 'new-execution',
    UpdatedWebsiteRecord = 'updated-website-record',
    CancelExecution = 'cancel-execution',
}
const notificationQueueName = 'notifications';

export function createNotifier(redisOptions: RedisOptions) {
    const redis = new Redis(redisOptions);

    function addNewExecutionNotification(executionId: string, websiteRecordId: string): Promise<number> {
        return redis.lpush(
            notificationQueueName,
            JSON.stringify({ type: NotificationType.NewExecution, executionId: executionId, websiteRecordId: websiteRecordId })
        );
    }

    function addUpdatedWebsiteRecordNotification(websiteRecordId: string): Promise<number> {
        return redis.lpush(notificationQueueName, JSON.stringify({ type: NotificationType.NewExecution, websiteRecordId: websiteRecordId }));
    }

    function addCancelExecutionNotification(executionId: string): Promise<number> {
        return redis.lpush(notificationQueueName, JSON.stringify({ type: NotificationType.CancelExecution, executionId: executionId }));
    }

    async function getNotification(): Promise<Notification | null> {
        const element = await redis.rpop(notificationQueueName);
        if (element) {
            const rawNotification = JSON.parse(element);
            if (rawNotification.type === NotificationType.NewExecution) {
                return new NewExecutionNotification(rawNotification.executionId, rawNotification.websiteRecordId);
            }
            if (rawNotification.type === NotificationType.UpdatedWebsiteRecord) {
                return new UpdatedWebsiteRecordNotification(rawNotification.websiteRecordId);
            }
            if (rawNotification.type === NotificationType.CancelExecution) {
                return new CancelExecutionNotification(rawNotification.executionId);
            }
        }

        return null;
    }

    return {
        addNewExecutionNotification,
        addUpdatedWebsiteRecordNotification,
        addCancelExecutionNotification,
        getNotification,
    };
}
