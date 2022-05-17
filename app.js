const http = require("http")
const url = require('url')
const fs = require('fs')
const Cite = require('citation-js')

//reading styles
var stylesDir = './styles/'
var stylesDict = {}
var files = fs.readdirSync(stylesDir)

files.forEach(file => {
  stylesDict[file.replace('.csl', '')] = fs.readFileSync(stylesDir + '/' + file, 'utf8');
})
const stylesList = Object.keys(stylesDict)

//creating citations of certain style for bib list
function getCitations(bibList, style) {
  let example = new Cite(bibList)

  let templateName = style
  let template = stylesDict[style]

  let config = Cite.plugins.config.get('@csl')
  config.templates.add(templateName, template)

  let output = example.format('bibliography', {
    format: 'text',
    template: templateName,
    lang: 'en-US'
  })

  return output
}

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
  var query = url.parse(req.url,true).query
  var reqType = url.parse(req.url,true).pathname
  res.setHeader("Content-Type", "application/json");
    switch (reqType) {
      case "/":
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(`<html><body><h1>BibReference</h1><div>To config:</div><div>Styles link: http://[...]/styles</div><div>Citations link: http://[...]/citations?style=</div></body></html>`);
        break;
      case "/styles":
        console.log('\t--sending styles...')
        res.writeHead(200);
        res.end(JSON.stringify({ styles: stylesList }));
        break
      case "/citations":
        console.log('\t--creating citations...')

        var body = ''
        req.on('data', function(data) {
          body += data
        })

        req.on('end', function() {
          var output = getCitations(body, query['style'])
          res.writeHead(200);
          res.end(JSON.stringify({ citations: output }));
          console.log("\t--citations are sent")
        })  
        break
      default:
        res.writeHead(404);
        res.end(JSON.stringify({error:"Resource not found"}));
    }
};

const server = http.createServer(requestListener);
server.listen(port, () => {
    console.log(`Server is running...`);
    // console.log(`Server is running on ${port}`);
});