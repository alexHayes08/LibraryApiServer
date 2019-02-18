import express, { Request, Response } from 'express';

export const randomDataController = express.Router({
    mergeParams: true
});

randomDataController.get('', (req: Request, res: Response) => {
    res.render('');
});
