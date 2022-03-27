// import Cite from 'citation-js'
// import fs from 'fs'
// import http from 'http'
const http = require("http")
const url = require('url')
const fs = require('fs')
const Cite = require('citation-js')

//reading styles
var stylesDir = './styles/'
var stylesDict = {}
var files = fs.readdirSync(stylesDir)
// console.log(files)

files.forEach(file => {
  stylesDict[file.replace('.csl', '')] = fs.readFileSync(stylesDir + '/' + file, 'utf8');
})
// console.log(stylesDict)

const stylesList = Object.keys(stylesDict)
// console.log(stylesList)

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

// let jsonInput = require('./bib.json')

let bibInput = fs.readFileSync('./bibib.bib', 'utf-8')

// let res = getCitations(bibInput, 'gost-r-7-0-5-2008')
// console.log(res)








// console.log(bibInput)

// let example = new Cite('Q21972834')
// let example = new Cite(bibInput)
// example.add(bibInput)

// console.log(example.get())

// let templateName = 'custom'
// let template = ''

// try {
//     const data = fs.readFileSync('./styles/ieee.csl', 'utf8')
//     template = data
//   } catch (err) {
//     console.error(err)
//   }

// let config = Cite.plugins.config.get('@csl')
// config.templates.add(templateName, template)


// let output = example.format('bibliography', {
//   format: 'text',
//   template: templateName,
//   lang: 'en-US'
// })

// console.log(output)

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
  // console.log(req)
  var query = url.parse(req.url,true).query
  var reqType = url.parse(req.url,true).pathname
  // console.log(a)
  res.setHeader("Content-Type", "application/json");
    switch (reqType) {
      case "/":
        res.setHeader("Content-Type", "text/html");
        res.writeHead(200);
        res.end(`<html><body><h1>BibRefServer</h1><div>(input those into config file)</div><div>Styles link: http://${host}:${port}/styles</div><div>Citations link: http://${host}:${port}/citations?style=[styleName]</div></body></html>`);
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
          // console.log('Partial body: ' + body)
        })

        req.on('end', function() {
          // console.log('Body: ' + body)
          var output = getCitations(body, query['style'])
          // console.log(output)
          res.writeHead(200);
          res.end(JSON.stringify({ citations: output }));
          console.log("\t--citations are sent")
          // res.writeHead(200, {'Content-Type': 'text/html'})
          // res.end('post received')
        })  

        // res.writeHead(200);
        // res.end(JSON.stringify({ citations: getCitations(bibInput, query['style']) }));
        break
      default:
        res.writeHead(404);
        res.end(JSON.stringify({error:"Resource not found"}));
    }
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});