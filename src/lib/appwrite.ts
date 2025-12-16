import { Client, Account, Databases, Functions, Storage } from "appwrite";

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const functions = new Functions(client);
const storage = new Storage(client);

// Verify connection on app load
client.ping().catch((error) => {
    console.error("Appwrite connection failed:", error);
});

export { client, account, databases, functions, storage };
