export interface Config {
    databaseConnectionString: string;
}

interface Configurations {
    [key: string]: Config;
}

const config: Configurations = {
    production: {
        databaseConnectionString: 'monodb://mongodb-1-servers-vm-0/ligbraryapi?replicaSet=rs0'
    },
    development: {
        databaseConnectionString: 'mongodb://127.0.0.1:27017'
    },
    default: {
        databaseConnectionString: 'mongodb://127.0.0.1:27017'
    }
};

export const Config = config[process.env.NODE_ENV] || config['default'];