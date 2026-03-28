import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddb = DynamoDBDocumentClient.from(client);
const TABLE = 'PolyUsers';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function handler(event) {
  const method = event.requestContext?.http?.method || event.httpMethod;
  const path = event.rawPath || event.path || '';
  const pathParams = event.pathParameters || {};

  // CORS preflight
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
      return respond(200, result.Item);
    }

    // PUT /user/{userId}
    if (method === 'PUT' && path.startsWith('/prod/user/')) {
      const userId = pathParams.userId || path.split('/user/')[1];
      if (!userId) return respond(400, { error: 'Missing userId' });

      const body = JSON.parse(event.body || '{}');
      const item = {
        userId,
        userName: body.userName || '',
        email: body.email || '',
        location: body.location || null,
        issueProfile: body.issueProfile || {},
        quizComplete: body.quizComplete || false,
        updatedAt: new Date().toISOString(),
      };

      await ddb.send(new PutCommand({ TableName: TABLE, Item: item }));
      return respond(200, item);
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
