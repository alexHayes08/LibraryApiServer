export interface Config {
    databaseConnectionString: string;
}

interface Configurations {
    [key: string]: Config;
}

const config: Configurations = {
    production: {
        databaseConnectionString: 'mongodb://35.211.206.215:27107/libraryapi'
    },
    development: {
        databaseConnectionString: 'mongodb://127.0.0.1:27017'
    },
    default: {
        databaseConnectionString: 'mongodb://127.0.0.1:27017'
    }
};

export const Config = config[process.env.NODE_ENV] || config['default'];