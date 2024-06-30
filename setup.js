const AWS = require('aws-sdk');

// Configure AWS SDK with LocalStack endpoint
const localstackEndpoint = 'http://localhost:4566';
AWS.config.update({
    region: 'us-east-1',
    endpoint: localstackEndpoint,
    accessKeyId: 'test',
    secretAccessKey: 'test'
});

// Initialize SNS and SQS instances
const sns = new AWS.SNS();
const sqs = new AWS.SQS();

// Function to create SNS topics
async function createSNSTopics() {
    try {
        const topics = ['broadcast-topic', 'communication-topic', 'entity-topic'];

        for (const topic of topics) {
            const createTopicParams = {
                Name: topic
            };

            const { TopicArn } = await sns.createTopic(createTopicParams).promise();
            console.log(`Created SNS topic: ${topic} (ARN: ${TopicArn})`);
        }
    } catch (err) {
        console.error('Error creating SNS topics:', err);
    }
}

// Function to create SQS queues
async function createSQSQueues() {
    try {
        const queues = ['email-queue', 'sms-queue', 'entity-queue'];

        for (const queue of queues) {
            const createQueueParams = {
                QueueName: queue
            };

            const { QueueUrl } = await sqs.createQueue(createQueueParams).promise();
            console.log(`Created SQS queue: ${queue} (URL: ${QueueUrl})`);
        }
    } catch (err) {
        console.error('Error creating SQS queues:', err);
    }
}

// Function to subscribe SQS queues to SNS topics
async function subscribeQueuesToTopics() {
    try {
        const subscriptions = [
            { topicName: 'broadcast-topic', queueName: 'email-queue' },
            { topicName: 'broadcast-topic', queueName: 'sms-queue' },
            { topicName: 'broadcast-topic', queueName: 'entity-queue' },
            { topicName: 'communication-topic', queueName: 'email-queue' },
            { topicName: 'communication-topic', queueName: 'sms-queue' },
            { topicName: 'entity-topic', queueName: 'entity-queue' }
        ];

        for (const { topicName, queueName } of subscriptions) {
            const topicArn = `arn:aws:sns:us-east-1:000000000000:${topicName}`;
            const queueArn = `arn:aws:sqs:us-east-1:000000000000:${queueName}`;

            const subscribeParams = {
                TopicArn: topicArn,
                Protocol: 'sqs',
                Endpoint: queueArn
            };

            await sns.subscribe(subscribeParams).promise();
            console.log(`Subscribed SQS queue ${queueName} to SNS topic ${topicName}`);
        }
    } catch (err) {
        console.error('Error subscribing SQS queues to SNS topics:', err);
    }
}

// Run the setup functions
async function runSetup() {
    await createSNSTopics();
    await createSQSQueues();
    await subscribeQueuesToTopics();
}

// Executing the setup process
runSetup().then(() => console.log('Setup completed successfully')).catch(err => console.error('Setup error:', err));
