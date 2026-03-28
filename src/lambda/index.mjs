import { createHash, randomBytes } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = 'PolyUsers';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function hashWithSalt(password, salt) {
  return createHash('sha256').update(salt + password).digest('hex');
}

function createPasswordHash(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = hashWithSalt(password, salt);
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  // Support legacy unsalted hashes (plain SHA-256, 64 hex chars, no colon)
  if (!stored.includes(':')) {
    const legacy = createHash('sha256').update(password).digest('hex');
    return legacy === stored;
  }
  const [salt, hash] = stored.split(':');
  return hashWithSalt(password, salt) === hash;
}

export async function handler(event) {
  const method = event.requestContext?.http?.method || event.httpMethod;
  const path = event.rawPath || event.path || '';
  const pathParams = event.pathParameters || {};

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // GET /user/{userId}
    if (method === 'GET' && path.startsWith('/prod/user/')) {
      const userId = pathParams.userId || path.split('/user/')[1];
      if (!userId) return respond(400, { error: 'Missing userId' });
      const result = await ddb.send(new GetCommand({ TableName: TABLE, Key: { userId } }));
      if (!result.Item) return respond(404, { error: 'User not found' });
      const { passwordHash, ...safe } = result.Item;
      return respond(200, safe);
    }

    // POST /auth — sign in with email + password
    if (method === 'POST' && path === '/prod/auth') {
      const body = JSON.parse(event.body || '{}');
      if (!body.email || !body.password) {
        return respond(400, { error: 'Email and password are required' });
      }
      const result = await ddb.send(new QueryCommand({
        TableName: TABLE,
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :e',
        ExpressionAttributeValues: { ':e': body.email },
      }));
      if (!result.Items || result.Items.length === 0) {
        return respond(401, { error: 'Invalid email or password.' });
      }
      // Find the first user with a password set
      const user = result.Items.find(u => u.passwordHash) || result.Items[0];
      if (!verifyPassword(body.password, user.passwordHash)) {
        return respond(401, { error: 'Invalid email or password.' });
      }
      const { passwordHash, ...safe } = user;
      return respond(200, safe);
    }

    // PUT /user/{userId}
    if (method === 'PUT' && path.startsWith('/prod/user/')) {
      const userId = pathParams.userId || path.split('/user/')[1];
      if (!userId) return respond(400, { error: 'Missing userId' });
      const body = JSON.parse(event.body || '{}');

      // Preserve existing passwordHash if no new password provided
      let existingHash = null;
      if (!body.password) {
        const existing = await ddb.send(new GetCommand({ TableName: TABLE, Key: { userId } }));
        if (existing.Item?.passwordHash) {
          existingHash = existing.Item.passwordHash;
        }
      }

      const item = {
        userId,
        userName: body.userName || '',
        email: body.email || '',
        location: body.location || null,
        issueProfile: body.issueProfile || {},
        quizComplete: body.quizComplete || false,
        updatedAt: new Date().toISOString(),
      };
      if (body.password) {
        item.passwordHash = createPasswordHash(body.password);
      } else if (existingHash) {
        item.passwordHash = existingHash;
      }
      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      const { passwordHash, ...safe } = item;
      return respond(200, safe);
    }

    return respond(404, { error: 'Not found' });
  } catch (err) {
    console.error(err);
    return respond(500, { error: 'Internal server error' });
  }
}

function respond(statusCode, body) {
  return { statusCode, headers, body: JSON.stringify(body) };
}
