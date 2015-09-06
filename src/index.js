'use strict';

var _ = fis.util,
    fs = _.fs,
    icon = require('./iconfont.js'),
    path = require('path');


var hasGenerate = false;
var iconfontTag = new RegExp('<!--ICONFONT_PLACEHOLDER-->');
// generate fonts files
function getAllSvgs(svgPath) {
    var iconList = fs.readdirSync(svgPath);
    iconList.forEach(function(icon, index) {
        icon = icon.replace(/\.svg$/, '');
        iconList[index] = icon;
    });
    return iconList;
}


function generateFiles(settings) {
    settings.fontsOutput = path.join(fis.project.getProjectPath(), settings.output);
    var iconList = getAllSvgs(settings.svgPath),
        fontsFile = icon.genarateFonts(settings, iconList),
        cssContent = icon.generateCss(settings, iconList, settings.pseClass);
    cssContent = cssContent.replace(/\{\{\$path\}\}/mg, fontsFile);
    fs.writeFileSync(path.join(settings.output, 'font.css'), cssContent, 'utf-8');
    hasGenerate = true;
}

module.exports = function(content, file, settings) {
    if(!hasGenerate) {
        generateFiles(settings);
    }

    var inlineCss = '<link rel="stylesheet" type="text/css" href="' + settings.output + '/fonts.css" />\r\n';
    if(iconfontTag.test(content)) {
        content = content.replace(iconfontTag, inlineCss);
    } else {
        content = content.replace('</head>', '\t' + inlineCss + '$&');
    }  
    return content;
};