import {test as setup} from '@playwright/test';
import { authPath } from '../../constants';


setup('Authenticate', async({page}) => {
    if (!process.env.AUTH_USER) {
        throw Error('Missing AUTH_USER env');
    }
    if (!process.env.AUTH_PASSWORD) {
        throw Error('Missing AUTH_PASSWORD env');
    }
    await page.goto('https://www.anisearch.de/login');
    await page.locator('#email').fill(process.env.AUTH_USER);
    await page.locator('#password').fill(process.env.AUTH_PASSWORD);
    await page.getByRole('button', {name: 'Anmelden'}).click();
    await page.getByText('ACCEPT ALL').click();

    await page.context().storageState({path: authPath});
});
