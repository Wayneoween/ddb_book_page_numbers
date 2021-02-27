const BASE_URL = "https://www.dndbeyond.com/sources";
var API = chrome || browser;

// Provide help text to the user.
API.omnibox.setDefaultSuggestion({
  description: 'Jump to the DnDBeyond Compendium URL via a page number, e.g. "phb 123"'
});

// Open the page based on how the user clicks on a suggestion.
API.omnibox.onInputEntered.addListener((text, disposition) => {
  let url = ''
  let book = text.split(' ')[0];
  let page = text.split(' ')[1];

  // maybe book and page were entered the other way around
  if (isNormalInteger(book) && !isNormalInteger(page)) {
    [book, page] = [page, book]
  }

  url = getDDBURL(book.toLowerCase(), page)

  switch (disposition) {
    case "currentTab":
      API.tabs.update({url});
      break;
    case "newForegroundTab":
      API.tabs.create({url});
      break;
    case "newBackgroundTab":
      API.tabs.create({url, active: false});
      break;
  }
});

// assign an URL to the page number entered
function getDDBURL(book, page) {
  data = ''
  targeturl = ''

  // If we do not support the book just go to the book at ddb
  if (!SUPPORTED_BOOKS.includes(book) || !isNormalInteger(page)) {
    return BASE_URL + '/' + book;
  }

  // load the correct data
  switch(book) {
    case 'dmg':
      data = DMG;
      break;
    case 'mm':
      data = MM;
      break;
    case 'phb':
      data = PHB;
      break;
    case 'scag':
      data = SCAG;
      break;
    case 'xgte':
      data = XGTE;
      break;
    default:
      data = BASE_URL
  }

  // should we not be able to find the data, go to ddb
  if (data == BASE_URL) {
    return BASE_URL;
  }

  // fill targeturl if the page is a valid number
  if (data[page]) {
    urlpart = data[page].url
    pagebreak = data[page].pagebreak

    if (urlpart == "image") {
      // this is a full page image, just go to the next page
      return getDDBURL(book, page + 1)
    } else {
      if (pagebreak == "") {
        targeturl = urlpart;
      } else {
        if (urlpart.indexOf('#') != -1) {
          var split_url = urlpart.split('#');
          targeturl = split_url[0] + "?" + pagebreak + "#" + split_url[1];
        }
      }
    }
  }

  return BASE_URL + '/' + book + '/' + targeturl;
};
