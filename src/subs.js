import axios from 'axios';

const isZip = require('is-zip');
const puppeteer = require('puppeteer');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const JSZip = require("jszip");
const fs = require("fs");
// import * as fs from 'fs-zip'
const Blob = require('blob');
import  {saveAs} from 'file-saver';

const baseURL = 'https://subscene.com';
const searchByTitle = '/subtitles/searchbytitle';

const languages = {
    'en': {
        code: 13, //TODO add it to language table as subscene_code?
        name: 'English',
    },
    'it': {
        code: 26,
        name: 'Italian'
    }
};

async function execute() {
    console.log('==========================================================================');

    const itis = isZip(fs.readFileSync('./subtitles/the_lion_king.zip'));
    console.log(itis);

    //de- hard code
    const title = 'the lion king';
    const year = '2019';
    const language = languages.en.code;

    const path = await findPath(title, year, language);
    const subtitlesListLink = await findSubtitlesListPath(path, language);
    const subtitleDownloadPath = await findSubtitleDownloadPath(subtitlesListLink, language);

    // const subtitleDownloadPath = '/subtitles/english-text/2jJpEdBIFGwJWyPLS-0j2TRzikFypVe4Mw9R8Re4VH-G2C6jDDFPHr5yHLAcRXBXQSSUgffdJbediTc4drMZdRr1DUZ2A-CLJX2mMFuT5AKX4PrxVuWMWtVsJ1feVvA-0';

    const url = baseURL+subtitleDownloadPath;

    axios.get(url, {
        withCredentials: true,
        headers:{
            'cookie': 'LanguageFilter=' + language,
            'accept-encoding': 'gzip, deflate, br',
            // 'data-type': 'text',
            // 'mime-type': 'text/plain; charset=x-user-defined',
        }
    }).then(results =>{
        const fileName = title.split(' ').join('_');
        // const path2 = './subtitles/'+fileName+'_.zip';

        saveZipFile('./subtitles/'+fileName+'_.zip', results);
        // downloadFile('./subtitles/'+fileName+'.zip', results.data);
    });
}

execute();

async function saveZipFile(path, results){
    //TODO try to save regular zip file first. (with some of those libraries) https://davidwalsh.name/javascript-zip
    //then continue

    //https://blog.logrocket.com/binary-data-in-the-browser-untangling-an-encoding-mess-with-javascript-typed-arrays-119673c0f1fe/
    //https://github.com/eligrey/FileSaver.js/issues/156

    let newContent = "";                                    //solution code
    for (var i = 0; i < results.data.length; i++) {         //solution code
        newContent += String.fromCharCode(results.data.charCodeAt(i) & 0xFF); //solution code
    }
    var bytes = new Uint8Array(newContent.length);                     //modified
    for (var i=0; i<newContent.length; i++) {                          //modified
        bytes[i] = newContent.charCodeAt(i);                           //modified
    }

    const zip = new JSZip();
    await zip.loadAsync(results.data, {type:'blob'});
    zip.generateAsync({type: "uint8array"}).then(function (content) {
        fs.writeFile(path2, content, function(err){
            const itis = isZip(fs.readFileSync(path2));
            console.log(err, itis);
        });
    });






    // let newContent = "";                                //solution code
    // for (var i = 0; i < results.data.length; i++) {         //solution code
    //     newContent += String.fromCharCode(results.data.charCodeAt(i) & 0xFF); //solution code
    // }
    // var bytes = new Uint8Array(newContent.length);                     //modified
    // for (var i=0; i<newContent.length; i++) {                          //modified
    //     bytes[i] = newContent.charCodeAt(i);                           //modified
    // }
    //
    // const buff = Buffer.from(bytes);
    // fs.writeFile('./subtitles/'+fileName+'.zip', buff, function(err){
    //     const itis = isZip(fs.readFileSync('the_lion_king.zip'));
    //     console.log(err);
    // });


    // const blob = new Blob([bytes], {type: "application/zip"});
    // saveAs(blob, './subtitles/'+fileName+'.zip');



    // zip.load(newContent);                                              //modified
    // jsonData = JSON.parse(zip.file('shouldBeThere.json').asText());


    //     //https://github.com/GoogleChrome/puppeteer/issues/299 !!!!!! pauldraper commented on Mar 19 •
    //
    //     console.log('done!');
}
async function downloadFile(filename, content){
    // fs.writeFile(filename, content, (e) => {
    //     console.log(e);
    // });

                // const vDom = new JSDOM('<div></div>');
                //
                // if (typeof vDom.window.URL.createObjectURL === 'undefined') {
                //     Object.defineProperty(vDom.window.URL, 'createObjectURL', { value: ()=>{}})
                // }
                //
                // const url = vDom.window.URL.createObjectURL(content);
                // const link = vDom.window.document.createElement('a');
                // link.href = url;
                // link.setAttribute('download', filename);
                // vDom.window.document.body.appendChild(link);
                // link.click();
                // vDom.window.document.body.removeChild(link);

    // const zip = new JSZip();
    // await zip.loadAsync(content, {base64: true});
    // const blob = await zip.generateAsync({type:"blob"});
    //
    // const vDom = new JSDOM('<div></div>');
    //
    // const element = vDom.window.document.createElement("a");
    // element.setAttribute("href", vDom.window.URL.createObjectURL(blob));
    // element.setAttribute("download", filename);
    // element.style.display = "none";
    // vDom.window.document.body.appendChild(element);
    // element.click();
    // vDom.window.document.body.removeChild(element);
}

function findSubtitleDownloadPath(path, language){
    const url = baseURL+path;

    return axios.get(url, {
        withCredentials: true,
        headers: {
            'cookie': 'LanguageFilter=' + language
        }
    }).then(results => {
        const vDom = new JSDOM(results.data);
        return vDom.window.document.querySelector('div.download a#downloadButton').href;
    });
}

function findSubtitlesListPath(path, language){
    const url = baseURL+path;

    return axios.get(url, {
        withCredentials: true,
        headers: {
            'cookie': 'LanguageFilter=' + language
        }
    }).then(results => {
        const vDom = new JSDOM(results.data);
        return vDom.window.document.querySelector('table tr td.a1 a').href;
    });
}

function findPath(title, year, language){
    return axios.post(baseURL+searchByTitle, {query: title}, {
        withCredentials: true,
        headers: {
            'cookie': 'LanguageFilter=' + language
        }
    }).then(results => {
        const vDom = new JSDOM(results.data);

        const thereAreExactResults = vDom.window.document
            .querySelector('.search-result h2').textContent === 'Exact';
        const appliedLanguageFilter = vDom.window.document
            .querySelector('#search .filter ul').textContent.indexOf('English') > -1;

        if (!thereAreExactResults) {
            return 'no results';
        } else {
            if (appliedLanguageFilter) {
                const exactList = vDom.window.document.querySelector('.search-result ul');
                const exactItems = exactList.querySelectorAll('li');
                let found = false;
                for (let i = 0; i < exactItems.length; i++) {
                    if (exactItems[i].textContent.indexOf(year) > -1) {
                        found = true;
                        return exactItems[i].querySelector('a').href;
                    }
                }

                if (!found) {
                    return 'no results';
                }
            } else {
                return 'no filter applied';
            }
        }

    });
}
