var Version = <! VERSION >
var AppName = <! AppName >
var preFetch = <! preFetch >
var injectCss = <! injectCss >
var injectJs = <! injectJs >

window.NEED_UPDATE = true;
try {
  window.NEED_UPDATE = localStorage.getItem(AppName + 'appVersion') === Version;
  window.NEED_UPDATE && localStorage.setItem(AppName + 'appVersion', Version);
} catch (err) {
  console.log(err)
}

function getTags (list, createTag) {
  var fragment = document.createDocumentFragment()
  var i = 0
  while (i < list.length) {
    fragment.appendChild(createTag(list[i++]))
  }
  return fragment
}

document.getElementsByTagName('head').appendChild(getTags(injectCss, function (url) {
  let link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  return link
}))

document.getElementsByTagName('body').appendChild(getTags(injectJs, function (url) {
  let script = document.createElement('script')
  script.type = 'text/javascript'
  script.src = url
  return script
}))

if (window.NEED_UPDATE) {
  SEND_TO_SW.send('init', {appName: AppName, list: preFetch})
}