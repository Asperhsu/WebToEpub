
"use strict";

parserFactory.register("www.esjzone.cc", () => new EsjParser());

class EsjParser extends Parser{
    constructor() {
        super();
    }


    async getChapterUrls(dom) {
        let menu = dom.querySelector("#chapterList");
        return util.hyperlinksToChapterList(menu);
    }

    findContent(dom) {
        let gitlabContent = dom.querySelector("#gitlab")
        if (typeof(gitlabContent) != 'undefined' && gitlabContent !== null) {
            return gitlabContent;
        }

        let tiebaContent = dom.querySelector("#j_p_postlist")
        if (typeof(tiebaContent) != 'undefined' && tiebaContent !== null) {
            return tiebaContent;
        }

        return dom.querySelector(".forum-content");
    }

    extractTitleImpl(dom) {
        return dom.querySelector("h2");
    }


    extractAuthor(dom) {
        let authorLabel = dom.querySelector(".book-detail a");
        return (authorLabel === null) ? super.extractAuthor(dom) : authorLabel.textContent;
    }

    // Optional, supply if need to do special manipulation of content
    // e.g. decrypt content
    /*
    customRawDomToContentStep(chapter, content) {
        // for example of this, refer to LnmtlParser
    }
    */

    // Optional, supply if need to do custom cleanup of content
    /*
    removeUnwantedElementsFromContentElement(element) {
        util.removeChildElementsMatchingCss(element, "button");
        super.removeUnwantedElementsFromContentElement(element);
    }
    */

    // Optional, supply if individual chapter titles are not inside the content element
    /*
    findChapterTitle(dom) {
        // typical implementation is find node with the Title
        // Return Title element, OR the title as a string
        return dom.querySelector("h3.dashhead-title");
    }
    */

    // Optional, if "next/previous chapter" are nested inside other elements,
    // this says how to find the highest parent element to remove
    /*
    findParentNodeOfChapterLinkToRemoveAt(link) {
        // The links may be wrapped, so need to walk up tree to find the
        // highest element holding the chapter links.
        // e.g. Following code assumes links are sometimes enclosed in a <strong> tag
        // that is enclosed in a <p> tag.  We want to remove the <p> tag
        // and everything inside it
        let toRemove = util.moveIfParent(link, "strong");
        return util.moveIfParent(toRemove, "p");
    }
    */

    findCoverImageUrl(dom) {
        // Most common implementation is get first image in specified container. e.g.
        return util.getFirstImgSrc(dom, "div.product-gallery");
    }

    // Optional, supply if need to chase hyperlinks in page to get all chapter content
    async fetchChapter(url) {
        if (url.startsWith('https://gitlab.com')) {
            url = url.replace('blob/master', '-/raw/master')
            let content = await HttpClient.fetchText(url);
            return this.createDocument(content);
        }

        return (await HttpClient.wrapFetch(url)).responseXML;
    }

    createDocument(content) {
        let doc = document.implementation.createHTMLDocument();

        let div = doc.createElement("div");
        div.innerHTML = content.split(/\r?\n/).map(function (line) {
            return '<p>' + line + '</p>';
        }).join('');
        div.setAttribute("id", "gitlab");

        doc.body.appendChild(div);
        return doc;
    }

    // Optional, supply if source has 100s of chapters and there's lots of
    // elements in DOM that are not included in the epub.
    /*
    removeUnusedElementsToReduceMemoryConsumption(chapterDom) {
    }
    */

    // Optional, called when user presses the "Pack EPUB" button.
    // Implement if parser needs to do anything after user sets UI settings
    // but before collecting pages
    /*
    onStartCollecting() {
    }
    */

    // Optional, Return elements from page
    // that are to be shown on epub's "information" page
    /*
    getInformationEpubItemChildNodes(dom) {
        return [...dom.querySelectorAll("div.novel-details")];
    }
    */

    // Optional, Any cleanup operations to perform on the nodes
    // returned by getInformationEpubItemChildNodes
    /*
    cleanInformationNode(node) {
        return node;
    }
    */
}
