import { createClient } from 'redis';
import { logger } from '../utils/logger';

// Create mock Redis client for development when Redis is not available
const createMockRedisClient = () => ({
    connect: async () => Promise.resolve(),
    disconnect: async () => Promise.resolve(),
    get: async (key: string) => null,
    set: async (key: string, value: string) => 'OK',
    setEx: async (key: string, seconds: number, value: string) => 'OK',
    del: async (key: string) => 1,
    keys: async (pattern: string) => [],
    on: (event: string, callback: (...args: any[]) => void) => { },
    isOpen: false,
    isReady: false
});

let redisClient: any;
let isRedisAvailable = true;

try {
    redisClient = createClient({
        socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
        },
        password: process.env.REDIS_PASSWORD || undefined,
    });
} catch (error) {
    logger.warn('Redis client creation failed, using mock client');
    redisClient = createMockRedisClient();
    isRedisAvailable = false;
}

if (isRedisAvailable) {
    redisClient.on('error', (err: Error) => {
        logger.error('Redis Client Error:', err);
        // Switch to mock client on persistent errors in development
        if (process.env.NODE_ENV !== 'production') {
            logger.warn('Switching to mock Redis client due to connection errors');
            redisClient = createMockRedisClient();
            isRedisAvailable = false;
        }
    });

    redisClient.on('connect', () => {
        logger.info('Redis Client Connected');
    });

    redisClient.on('ready', () => {
        logger.info('Redis Client Ready');
    });
}

// Connect to Redis
const connectRedis = async () => {
    if (!isRedisAvailable) {
        logger.info('Using mock Redis client (Redis not available)');
        return;
    }

    try {
        await redisClient.connect();
        logger.info('Redis connected successfully');
    } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        // In development, we can continue without Redis for basic functionality
        if (process.env.NODE_ENV !== 'production') {
            logger.warn('Switching to mock Redis client for development');
            redisClient = createMockRedisClient();
            isRedisAvailable = false;
            return; // Don't throw error in development
        } else {
            throw error;
        }
    }
};

export { redisClient, connectRedis };