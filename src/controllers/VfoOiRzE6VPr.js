const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const mysql = require('mysql2');
const winston = require('winston');
const cluster = require('cluster');
const os = require('os');

// Configuration
const port = 3001; // Set your desired port here
const numCPUs = os.cpus().length;

// Set default timezone to Santiago (UTC-4)
process.env.TZ = 'America/Santiago';

// Database credentials
const dbConfig = {
    host: 'localhost',
    user: 'fluxhost_softrandfusion',
    password: 'fluxhost_softrandfusion',
    database: 'fluxhost_softrandfusion'
};

// Set up logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Create a connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    ...dbConfig
});

// Function to generate a hash
function generateHash(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

// Function to generate the key hash
function generateKeyHash(agentId, agentKey, dateStr, token, gameId, lang) {
    const keyG = generateHash(dateStr + agentId + agentKey);
    const params = `Token=${token}&GameId=${gameId}&Lang=${lang}&AgentId=${agentId}`;
    const randomChars = generateRandomChars(6);
    const md5String = generateHash(params + keyG);
    const key = randomChars + md5String + randomChars;
    return key;
}

// Function to generate random characters
function generateRandomChars(length) {
    const characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        randomString += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return randomString;
}

// Function to query member status
async function queryMemberStatus(apiUrl, agentId, token) {
    const queryUrl = `${apiUrl}/GetMemberInfo`;
    const postData = new URLSearchParams({
        Accounts: token,
        AgentId: agentId
    });

    try {
        const response = await axios.post(queryUrl, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        return response.data;
    } catch (error) {
        logger.error('Error querying member status:', error);
        return null;
    }
}

// Function to calculate dateStr as it was in PHP
function calculateDateStr() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = date.getDate().toString();
    return year + month + day;
}

// Function to check if the request URL is whitelisted
function isUrlWhitelisted(url, callback) {
    const sanitizedUrl = url.replace(/[^a-zA-Z0-9:/._-]/g, ''); // Sanitize URL
    const sql = 'SELECT COUNT(*) AS count FROM url_access_control WHERE url = ? AND type = "whitelist"';
    
    pool.query(sql, [sanitizedUrl], (err, results) => {
        if (err) {
            logger.error('Database query failed:', err);
            return callback(false);
        }
        callback(results[0].count > 0);
    });
}

// Function to generate a unique 26-character string
function generateUniqueString() {
    return crypto.randomBytes(13).toString('hex'); // 26 hexadecimal characters
}

// Function to store user ID and server URL
function storeUserServerUrl(userId, serverUrl, uniqueString, callback) {
    const sql = 'INSERT INTO user_server_urls (userid, server_url, mobile) VALUES (?, ?, ?)';
    
    pool.query(sql, [userId, serverUrl, uniqueString], (err, results) => {
        if (err) {
            logger.error('Failed to store user and server URL:', err);
            return callback(false);
        }
        callback(true);
    });
}

const app = express();

app.get('/enter', async (req, res) => {
    const { gameId, mobile, agentId, agentKey } = req.query;

    if (!gameId || !mobile || !agentId || !agentKey) {
        return res.status(400).send('Missing required parameters');
    }

    const api_url = 'https://wb-api-2.royalflush888.com/api1';
    const login_url = `${api_url}/singleWallet/Login`;
    const lang = 'en-US';
    const dateStr = calculateDateStr();
    const key = generateKeyHash(agentId, agentKey, dateStr, mobile, gameId, lang);
    const finalLoginUrl = `${login_url}?Token=${mobile}&GameId=${gameId}&Lang=${lang}&AgentId=${agentId}&Key=${key}`;

    const status = await queryMemberStatus(api_url, agentId, mobile);

    if (status) {
        logger.info('Member Status:', status);
    } else {
        logger.info('Failed to fetch member status.');
    }

    res.redirect(finalLoginUrl);
});

app.get('/post', (req, res) => {
    const { gameId, mobile, agentId, agentKey, referrerUrl } = req.query;

    // Check if all parameters are provided
    if (!gameId || !mobile || !agentId || !agentKey || !referrerUrl) {
        res.status(400).json({ error: 'Missing required parameters' });
        return;
    }

    // Check if the referrer URL is whitelisted
    isUrlWhitelisted(referrerUrl, isWhitelisted => {
        if (!isWhitelisted) {
            res.status(403).json({ error: 'Access Forbidden' });
            return;
        }

        // Generate a unique 26-character string for the mobile
        const uniqueString = generateUniqueString();

        // Store the user ID (mobile), server URL (referrerUrl), and unique string
        storeUserServerUrl(mobile, referrerUrl, uniqueString, success => {
            if (!success) {
                res.status(500).json({ error: 'Failed to store user and server URL' });
                return;
            }

            // Construct a URL for redirection
            const redirectUrl = `https://api-jetx.online/enter?gameId=${gameId}&mobile=${uniqueString}&agentId=${agentId}&agentKey=${agentKey}`;

            // Perform redirection
            res.redirect(redirectUrl);
        });
    });
});

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        logger.info(`Worker ${worker.process.pid} died`);
    });
} else {
    app.listen(port, () => {
        logger.info(`Server running at https://api-jetx.online:${port}/`);
    });
}