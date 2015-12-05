
"use strict";

module("FanFictionParser");

/// Load the sample file
/// As file operation is async, load the sample file into dom, and call doneCallback when file loaded
function syncLoadFanFictionSampleDoc() {
    let that = this;
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "../testdata/FanFiction.html", false);
    xhr.send(null);
    let dom = new DOMParser().parseFromString(xhr.responseText, "text/html");
    new HttpClient().setBaseTag("https://www.fanfiction.net/s/1234567/1/WebToEpub", dom);
    return dom;
}

QUnit.test("getChapterUrls", function (assert) {
    let parser = new FanFictionParser();
    let chapterUrls = parser.getChapterUrls(syncLoadFanFictionSampleDoc());
    assert.equal(chapterUrls.length, 5);
    assert.equal(chapterUrls[0].sourceUrl, "https://www.fanfiction.net/s/1234567/1/WebToEpub");
    assert.equal(chapterUrls[1].sourceUrl, "https://www.fanfiction.net/s/1234567/2/WebToEpub");
    assert.equal(chapterUrls[4].title, "5. Using Chrome's \"Inspect Element\" to examine the DOM");
});

QUnit.test("findContent", function (assert) {
    let parser = new FanFictionParser();
    let content = parser.findContent(syncLoadFanFictionSampleDoc());
    equal(content.childNodes.length, 3);
    let regex = /^If you're like me, you will have*/;
    assert.ok(regex.test(content.childNodes[1].innerText));
});

QUnit.test("getEpubMetaInfo", function (assert) {
    let parser = new FanFictionParser();
    let metaInfo = parser.getEpubMetaInfo(syncLoadFanFictionSampleDoc());
    equal(metaInfo.title, "Web to Epub");
    equal(metaInfo.author, "David Teviotdale");
    equal(metaInfo.language, "en");
    equal(metaInfo.fileName, "WebtoEpub.epub");
});

QUnit.test("canParse", function (assert) {
    let parser = new FanFictionParser();
    ok(parser.canParse("https://www.fanfiction.net/s/1234567/1/WebToEpub"));
    notOk(parser.canParse("http://archiveofourown.org/works/123456/chapters/9876543"));
});
