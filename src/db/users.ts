import fs from 'fs';
import path from 'path';

export enum EUserRole {
    user = 'user',
    admin = 'admin',
}

const dbFilePath = path.join(__dirname, 'users.json');

export interface IUser {
    userName: string,
    // role: EUserRole;
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

export const insertUser = (user: IUser): void => {
    const users = readDB();
    users.push(user);
    writeDB(users);
};

export const getUsers = (): IUser[] => {
    return readDB();
};

export const getUser = (userName: string): IUser => {
    const users = readDB();
    return users.find(user => user.userName === userName) || { userName: '', password: '' };
};

export const deleteUser = (userName: string): void => {
    let users = readDB();
    users = users.filter(user => user.userName !== userName);
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