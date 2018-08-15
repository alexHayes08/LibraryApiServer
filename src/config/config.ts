export interface Config {
    databaseConnectionString: string;
}

interface Configurations {
    [key: string]: Config;
}

const config: Configurations = {
    production: {
        databaseConnectionString: 'mongodb://mongodb:27017'
    },
    development: {
        databaseConnectionString: 'mongodb://127.0.0.1:27017'
    },
    default: {
        databaseConnectionString: 'mongodb://127.0.0.1:27017'
    }
};

export const Config = config[process.env.NODE_ENV] || config['default'];