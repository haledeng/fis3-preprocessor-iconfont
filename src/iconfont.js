/*
 生成字体文件，
 生成字体 content
 */
'use strict';
var fs = require('fs'),
    path = require('path'),
    fontCarrier = require('font-carrier');


// 十进制 转 16进制
function decimal2Hex(n){
    var hex = n.toString(16);
    hex = '000'.substr(0, 3 - hex.length) + hex;
    return hex;
}

// 生成 icon 对应的 content
function generateIconContent(n){
    return '&#xf' + decimal2Hex(n);
}

function mkdir(dir) {
    if(!fs.existsSync(dir)) {
        mkdir(path.dirname(dir));
        fs.mkdirSync(dir);
    }
}

/*
* generate font files
* 字体文件 md5
*/
exports.genarateFonts = function (opt, icons) {
    var svgPath = opt.svgPath,
        output = opt.fontsOutput,
        font = fontCarrier.create(),
        svgsObj = {},
        filePath,
        iconContent;
    icons.forEach(function(icon, index){
        filePath = path.join(svgPath, icon + '.svg');
        if(fs.existsSync(filePath)) {
            iconContent = generateIconContent(index);
            svgsObj[iconContent] = fs.readFileSync(filePath).toString();
        } else {
            fis.log.warning(path.join(fis.project.getProjectPath(), filePath) + ' ------ svg file does not exist!');
        }

    });

    font.setSvg(svgsObj);

    // var outputDir = path.dirname(output);
    // mkdir(outputDir);
    mkdir(output);

    var outFontsContent = font.output({}),
        outFileName = 'iconfont';
    if(opt.useHash) {
        outFileName += (fis.get('project.md5Connector') || '.') + fis.util.md5(JSON.stringify(svgsObj), 7);
    }

    for(var type in outFontsContent){
        if(outFontsContent.hasOwnProperty(type)) {
            fs.writeFileSync(output + '/' + outFileName + '.' + type, outFontsContent[type]);
        }  
    }
    return opt.output + '/' + outFileName;
    // 导出字体
    // font.output({
    //     path: output
    // });
};

/*
* 根据icon生成对应的字体
* 需要判断实际的svg（正则匹配到了不是icon的表达式）文件是否存在，否则会有多余样式
 */
exports.generateCss = function (opt, iconNames, pseClass, start, step) {
    var self = this,
        pseudoClass = ~['after', 'before'].indexOf(pseClass) ? pseClass : 'after',
        start = start || 0,
        step = step || 1;

    var content = [],
        iconContent;
    // 字体的引用和每个css的引入路径有关系

    content.push('@font-face { ');
    content.push('font-family: "mfont";');
    content.push('src: url("{{$path}}.eot");'); // ie9
    content.push('src: url("{{$path}}.eot?#iefix") format("embedded-opentype"),'); // ie6-8
    content.push('url("{{$path}}.woff") format("woff"),');  // chrome、firefox
    content.push('url("{{$path}}.ttf") format("truetype");}'); // chrome、firefox、opera、Safari, Android, iOS 4.2+

    content.push('.icon-font{font-family:"mfont";font-size:16px;font-style:normal;font-weight: normal;font-variant: normal;text-transform: none;line-height: 1;position: relative;-webkit-font-smoothing: antialiased;}');
    iconNames.forEach(function(iconName){
        iconContent = generateIconContent(start++);
        if (typeof iconContent !== 'undefined' && fs.existsSync(path.join(opt.svgPath, iconName + '.svg')) ) {
            iconContent = iconContent.replace('&#xf', '\\f');
            content.push('.i-' + iconName + ':' + pseudoClass + '{content: "' + iconContent + '";}');
        }
    });
    return content.join('\r\n');
};


exports.exportCssFile = function(iconNames, pseClass, path) {
    var content = this.generateCss(iconNames, pseClass);
    fs.writeFileSync(path, content, 'utf-8');
}