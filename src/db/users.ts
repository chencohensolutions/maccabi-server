import fs from 'fs';
import path from 'path';

export enum EUserRole {
    user = 'user',
    admin = 'admin',
}

const dbFilePath = path.join(__dirname, 'users.json');

export interface IUser {
    id: string;
    userName: string,
    password: string;
}

const readDB = (): IUser[] => {
    if (!fs.existsSync(dbFilePath)) {
        return [];
    }
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data);
};

const writeDB = (users: IUser[]): void => {
    fs.writeFileSync(dbFilePath, JSON.stringify(users, null, 2), 'utf-8');
};

export const createUser = (user: IUser): void => {
    const users = readDB();
    users.push(user);
    writeDB(users);
};

export const getUsers = (): IUser[] => {
    const users = readDB();
    return users;
};

export const getUser = (userName: string): IUser | null => {
    const users = readDB();
    return users.find(user => user.userName === userName) || null;
};

export const deleteUser = (userId: string): void => {
    let users = readDB();
    users = users.filter(user => user.id !== userId);
    writeDB(users);
};

export const updateUser = (userName: string, updatedUser: Partial<IUser>): void => {
    const users = readDB();
    const userIndex = users.findIndex(user => user.userName === userName);
    if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser };
        writeDB(users);
    }
};