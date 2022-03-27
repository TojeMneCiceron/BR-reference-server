var Cite = require('citation-js')

// Set variables
var cite = new Cite()
var opt = {
  format: 'string'
}

// Make shorter ref to function
var parseAsync = Cite.parse.input.async.chain

// Make a factory for callback
var callbackFactory = function (out) {
  return function (data) {
    out.html(cite.set(data).get(opt))
  }
}

$(function(){
  // jQuery elements
  var $json_in = $('#json-in'),
      $bibx_in = $('#bibx-in'),
      $wiki_in = $('#wiki-in'),
      $bibj_in = $('#bibj-in'),
      $type = $('select.type'),
      $styl = $('select.style'),
      $lang = $('select.lang')

  // Callbacks
  var jsonCb = callbackFactory($('#json-out')),
      bibxCb = callbackFactory($('#bibx-out')),
      wikiCb = callbackFactory($('#wiki-out')),
      bibjCb = callbackFactory($('#bibj-out'))

  // Declare function to update the output
  function update() {
    // Get user options
    opt.type = $type.val()
    opt.style = $styl.val()
    opt.lang = $lang.val()

    // Set data (explicit parsing only recommended for async) and set html element to get output
    parseAsync($json_in.text()).then(jsonCb)
    parseAsync($bibx_in.text()).then(bibxCb)
    parseAsync($wiki_in.text()).then(wikiCb)
    parseAsync($bibj_in.text()).then(bibjCb)
  }

  // Make output update when input is defocussed...
  $('.in').on('blur', update)
  // ... or a select tag has changed
  $('select').on('change', update)

  // Trigger update
  update()
})