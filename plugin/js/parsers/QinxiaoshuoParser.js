"use strict";

parserFactory.register("qinxiaoshuo.com", () => new QinxiaoshuoParser());

class QinxiaoshuoParser extends Parser{
    constructor() {
        super();
    }

    getChapterUrls(dom) {
        let chapters = [...dom.querySelectorAll("div.chapters a")]
            .map(a => util.hyperLinkToChapter(a));
        return Promise.resolve(chapters);
    }

    findContent(dom) {
        return dom.querySelector("div#chapter_content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("div.right > h1").textContent;
    }

    extractAuthor(dom) {
        let authorLabel = dom.querySelector("div.info_item a");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    extractLanguage() {
        return "cn";
    }

    findCoverImageUrl(dom) {
        return util.getFirstImgSrc(dom, "div.show_info");
    }

    fetchChapter(url) {
        return HttpClient.wrapFetch(url).then(function (xhr) {
            let finalDom = xhr.responseXML;
            let fetchedUrls = new Set();
            fetchedUrls.add(url);
            fetchedUrls.add(url + "?xiaoshuo=1");
            let nextUrl = QinxiaoshuoParser.urlOfNextPageOfChapter(finalDom, fetchedUrls);
            return QinxiaoshuoParser.fetchPagesOfChapter(finalDom, fetchedUrls, nextUrl);
        });
    }

    static fetchPagesOfChapter(finalDom, fetchedUrls, url) {
        if (url === null) {
            return Promise.resolve(finalDom);
        } else {
            return HttpClient.wrapFetch(url).then(function (xhr) {
                fetchedUrls.add(url);
                QinxiaoshuoParser.copyContentNodes(finalDom, xhr.responseXML);
                let nextUrl = QinxiaoshuoParser.urlOfNextPageOfChapter(xhr.responseXML, fetchedUrls);
                return QinxiaoshuoParser.fetchPagesOfChapter(finalDom, fetchedUrls, nextUrl);
            });
        }
    }

    static urlOfNextPageOfChapter(dom, fetchedUrls) {
        let links = [...dom.querySelectorAll("a.qxs_btn")]
            .filter(link => QinxiaoshuoParser.isPossibleNextPage(link, fetchedUrls));
        return (0 < links.length) ? links[0].href : null;
    }

    static isPossibleNextPage(link, fetchedUrls) {
        if (!link.href) return false;
        let url = new URL(link.href);
        let xiaoshuo = url.searchParams.get("xiaoshuo");
        return (xiaoshuo !== null) && !fetchedUrls.has(link.href);
    }

    static copyContentNodes(copyTo, copyFrom) {
        let parser = new QinxiaoshuoParser();
        let toElement = parser.findContent(copyTo);
        let newDiv = copyTo.createElement("div");
        toElement.appendChild(newDiv);
        for (let n of parser.findContent(copyFrom).childNodes) {
            let c = copyTo.importNode(n);
            newDiv.appendChild(c);
        }
    }

    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll(".book_info .info, .book_info .book_name, .book_info .book_intro")];
    }
}
