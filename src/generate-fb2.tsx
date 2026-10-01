import * as fs from "fs";
import { lexer } from "marked";
import { create } from "xmlbuilder2";
import { globalConfig } from "./config";
import { createChapter, createFB2 } from "./create-fb2";

const contents = fs.readFileSync(`README.md`, "utf-8");
const index = lexer(contents);

const extractHref = (element: any): Array<string> => {
    if (element["href"]) return [element["href"]];
    if (element["items"] && element["items"].length > 0)
        return element["items"].map((item: any) => extractHref(item)).flat();
    if (element["tokens"] && element["tokens"].length > 0)
        return element["tokens"].map((token: any) => extractHref(token)).flat();
    return [];
};

const fb2 = create(createFB2(globalConfig));
const body = fb2.root().ele("body");

index
    .map((item) => extractHref(item))
    .flat()
    .filter((file) => file.indexOf(".md") >= 0)
    .forEach((file) => {
        createChapter(body.ele("section"), fs.readFileSync(`${file}`, "utf-8"));
    });

fb2.root()
    .ele("binary")
    .att("id", globalConfig.cover.name)
    .att("content-type", "image/jpeg")
    .txt(fs.readFileSync(`${globalConfig.cover.name}`).toString("base64"));

fs.writeFileSync(`tsidukciya.fb2`, fb2.end({ prettyPrint: true }));
