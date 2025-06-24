import { expect, Locator, test } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { MerchandisePo } from './page-objects/merchandise.po';

interface Metadata {
  title: string;
  rating: string;
  position: number;
}

async function fetchMetadataOnPage(_rows: Locator, metadata: Metadata[]): Promise<void> {
  const rows = (await _rows.all()).slice(1); // remove header row

  for (const row of rows) {
    const title = await row.locator(':scope>th>a').textContent();
    const ratingTitle = await row.locator(':scope>td[data-title="Bewertung"]>div:nth-child(1)').getAttribute('title');
    const positionString = await row.locator(':scope>td[data-title="Position"]').textContent();

    metadata.push({
      title,
      rating: ratingTitle.split(' ').at(0),
      position: +positionString,
    });
  }
}

const userPathIdentifier = '22752,kirdock';

test.skip('Get titles', async ({ page }, testInfo) => {

  const metadata:Metadata [] = [];
  const acceptAllButton = page.getByText('ACCEPT ALL');
  const rows = page.locator('.responsive-table.mtC').getByRole('row');
  const nextButton = page.locator('.pagenav-next')

  await page.addLocatorHandler(acceptAllButton, async () => {
    await acceptAllButton.click();
  });

  // if you log in:
  // await page.goto('https://www.anisearch.de/usercp/list/anime/index/page-1?char=all&sort=updated&order=desc&view=2&limit=100');
  // public view:
  await page.goto(`https://www.anisearch.de/member/${userPathIdentifier}/anime/page-1?char=all&sort=rating&order=desc&view=2&limit=100`);

  await fetchMetadataOnPage(rows, metadata);

  while (await page.$('.pagenav-next')) {
    await nextButton.click();
    await fetchMetadataOnPage(rows, metadata);
  }


  const dataString = metadata.map(({title, rating, position}) => `${title};${rating};${position}`).join('\n');
  await writeFile('./anime-export.csv', 'Titel;Bewertung;Position\n'.concat(dataString));
});

test('Get Merchandise', async ({page}, testInfo) => {
  const merchandisePo = new MerchandisePo(page);

  const acceptAllButton = page.getByText('ACCEPT ALL');
  await page.addLocatorHandler(acceptAllButton, async () => {
    await acceptAllButton.click();
  });

  await page.goto(`https://www.anisearch.de/member/${userPathIdentifier}/merchandise?type=20&sort=title`);
  const options = await merchandisePo.getMerchandiseOptions();
  for (const option of options) {
    await merchandisePo.selectMerchandiseOption(option.value);
    await expect(merchandisePo.cardsContainer).toBeVisible();
    const info = await merchandisePo.getCardsInfo();

    const dataString = info.map(({title, date}) => `${title};${date}`).join('\n');
    await writeFile(`./anime-${option.text.replace(/ /g, '_')}.csv`, 'Titel;Datum\n'.concat(dataString));
  }
})