import express, { Request, Response } from 'express';
import { google } from 'googleapis';

import { container, TYPES } from '../dependency-registrar';
import { isJwtToken } from '../models/jwt-token';
import { errorToObj } from '../helpers/response-helpers';
import { MessageError, NotImplementedError } from '../models/errors';

const directory_v1 = google.admin('directory_v1');
const oauth2Client = new google.auth.OAuth2(
    'client id',
    'client secret',
    'redirect url'
);

// generate a url that asks permissions for Google+ and Google Calendar scopes
const scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/admin.directory.orgunit.readonly'
];

const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope you can pass it as a string
    scope: scopes
});

export const userController = express.Router({
    mergeParams: true
});

/**
 * Process for generating api keys for users of a domain.
 * 1) Verify users organization is correct.
 * 2) Regenerate a service key for that user.
 * 3) Send the file to the user.
 */

userController.get('/get-jwt', (req: Request, res: Response) => {
    res.render('login.html', {
        cache: true
    });
});