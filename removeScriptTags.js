var html = document.documentElement.innerHTML;
html = html.replace(/<script[^]*?<\/script>/g,"");
var windowCopy = window.open();
windowCopy.document.write(html);