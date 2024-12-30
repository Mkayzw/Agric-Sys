const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const DB_NAME = 'agriconnect';

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db(DB_NAME);
    cachedDb = db;
    return db;
}

exports.handler = async (event, context) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const db = await connectToDatabase();
        const { path } = event;
        const body = JSON.parse(event.body);

        // Login
        if (path === '/auth/login') {
            const { email, password } = body;
            const user = await db.collection('users').findOne({ email });

            if (!user || !(await bcrypt.compare(password, user.password))) {
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ message: 'Invalid email or password' })
                };
            }

            const token = jwt.sign(
                { userId: user._id, email: user.email, userType: user.userType },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            delete user.password;
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ token, user })
            };
        }

        // Register
        if (path === '/auth/register') {
            const { email, password, firstName, lastName, userType } = body;

            const existingUser = await db.collection('users').findOne({ email });
            if (existingUser) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({ message: 'Email already registered' })
                };
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const user = {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                userType,
                createdAt: new Date()
            };

            await db.collection('users').insertOne(user);
            
            const token = jwt.sign(
                { userId: user._id, email: user.email, userType: user.userType },
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            delete user.password;
            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({ token, user })
            };
        }

        return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Endpoint not found' })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ message: 'Internal server error' })
        };
    }
}; 