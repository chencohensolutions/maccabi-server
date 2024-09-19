import development from './development';

const configAssoc = { development };

type ConfigEnvironments = 'development';

let NODE_ENV: ConfigEnvironments = (process.env.NODE_ENV as ConfigEnvironments) || 'development';
console.log('NODE_ENV', NODE_ENV);

const config = configAssoc[NODE_ENV];

export default config;
