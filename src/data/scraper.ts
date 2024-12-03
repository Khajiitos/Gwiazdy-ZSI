function removeDuplicates(arr: RegExpMatchArray | string[]): [] {
    return [...new Set(arr)] as [];
}

function filterImages(arr: string[]): string[] {
    const out: string[] = [];


    for (const imgUrl of arr) {
        const name = imgUrl.substring(imgUrl.lastIndexOf("/") + 1, imgUrl.length - 5);
        const r = name.substring(name.lastIndexOf("-")+1).match(/\d{1,5}x\d{1,5}/gm);
        if (r != null && r.length > 0) {
            out.push(imgUrl.substring(0, imgUrl.lastIndexOf("-")
        ) + ".jpeg")
        } else {
            out.push(imgUrl)
        }
    }

    return removeDuplicates(out);
}

export async function scrape() {
    const blogListRegex = /\"(https:\/\/www.zsi.kielce.pl\/blog\/\d{4}\/\d{2}\/\d{2}\/[A-Za-z0-9-\/]*)\"/gm
    const html = await (await fetch("https://www.zsi.kielce.pl/")).text();

    const result = html.match(blogListRegex);

    if (!result) {
        return;
    }

    for (let i = 0; i < result.length; i++) {
        result[i] = result[i].replaceAll("\"", "");
    }

    let cleanResults = removeDuplicates(result);

    const imgs: string[] = []
    //await Promise.all(cleanResults.map((url) => async () => await getImgs(url, imgs)));

    for (const url of cleanResults) {
        await getImgs(url, imgs)
    }

    console.log(imgs);
}

async function getImgs(url:string, imgs: string[]) {
    //console.log(url);
    const imagesRegex = /\"(https:\/\/www\.zsi\.kielce\.pl\/wp-content\/uploads\/\d{4}\/\d{2}\/[a-z0-9\-]*\.jpeg)\"/gm

    const html = await (await fetch(url)).text();

    const result = html.match(imagesRegex);

    if (!result) {
        return;
    }

    for (let i = 0; i < result.length; i++) {
        result[i] = result[i].replaceAll("\"", "");
    }

    let cleanResults = filterImages(result);

    cleanResults.forEach(str => imgs.push(str));
}