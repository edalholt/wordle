import { MongoClient } from 'mongodb';
import { DB_URI } from '$env/static/private';

// MongoDB connection URL
const uri = DB_URI;

let client: MongoClient;

async function connectToDatabase() {
	if (!client) {
		client = new MongoClient(uri);
		await client.connect();
	}
	return client;
}

export async function getCollection(collectionName: string) {
	const dbClient = await connectToDatabase();
	const database = dbClient.db('wordle');
	return database.collection(collectionName);
}
