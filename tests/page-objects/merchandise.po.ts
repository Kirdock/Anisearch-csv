import { Locator, Page } from '@playwright/test';

interface CardInfo {
    title: string;
    date: string;
}

interface SelectOption {
    text: string;
    value: string;
}

export class MerchandisePo {
    public readonly merchTypeSelect: Locator;
    public readonly cardsContainer: Locator;
    public readonly detailOfCards: Locator;

    constructor(private readonly page: Page) {
        this.merchTypeSelect = page.locator('#merchandise_type');
        this.cardsContainer = page.locator('.covers.merchandise');
        this.detailOfCards = this.cardsContainer.locator(':scope>li>a .details');
    }

    private getMerchOptions(): Locator {
        return this.merchTypeSelect.getByRole('option');
    }

    public async getMerchandiseOptions(): Promise<SelectOption[]> {
        const optionElements = await this.getMerchOptions().all();
        const options: SelectOption[] = [];

        for (const element of optionElements) {
            options.push({
                text: await element.innerText(),
                value: await element.getAttribute('value'),
            });
        }
        return options;
    }

    public async selectMerchandiseOption(optionValue: string): Promise<void> {
        await this.page.selectOption('#merchandise_type', optionValue);
    }

    public async getCardsInfo(): Promise<CardInfo[]> {
        const titles: CardInfo[] = [];
        let counter = 0;
        const cardInfoElements = await this.detailOfCards.all();
        for (const element of cardInfoElements) {
            counter++;
            const title = await element.locator('.title').textContent();
            const date = await element.locator('.company').textContent();

            titles.push({
                title,
                date,
            });
            console.log(counter);
        }
        return titles;
    }
}