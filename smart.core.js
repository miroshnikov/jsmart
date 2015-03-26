
/**
 * @preserve jSmart Javascript template engine, a port of Smarty PHP to Javascript
 *
 * https://github.com/miroshnikov/jsmart
 *
 * Copyright 2011, Max Miroshnikov <miroshnikov at gmail dot com> 
 *
 * jSmart is licensed under the GNU Lesser General Public License
 * http://www.gnu.org/licenses/lgpl.html
 */

(function() {
/**
   merges two or more objects into one 
   shallow copy for objects
*/
function obMerge(ob1, ob2 /*, ...*/)
{
    for (var i=1; i<arguments.length; ++i)
    {
       for (var nm in arguments[i]) 
       {
          ob1[nm] = arguments[i][nm]; 
       }
    }
    return ob1;
}

/**
   @return  number of own properties in ob
*/
function countProperties(ob)
{
    var count = 0;
    for (var nm in ob) 
    {
        if (ob.hasOwnProperty(nm))
        {
            count++; 
        }
    }
    return count;
}

/**
   IE workaround
*/
function findInArray(a, v)
{
    if (Array.prototype.indexOf) {
        return a.indexOf(v);
    }
    for (var i=0; i < a.length; ++i) 
    {
        if (a[i] === v) 
        { 
            return i; 
        }
    }
    return -1;
}

function evalString(s)
{
    return s.replace(/\\t/,'\t').replace(/\\n/,'\n').replace(/\\(['"\\])/g,'$1');
}

/**
   @return  s trimmed and without quotes
*/
function trimQuotes(s)
{
    return evalString(s.replace(/^['"](.*)['"]$/,'$1')).replace(/^\s+|\s+$/g,'');
}

/**
   finds first {tag} in string
   @param re string with regular expression or an empty string to find any tag
   @return  null or s.match(re) result object where 
   [0] - full tag matched with delimiters (and whitespaces at the begin and the end): { tag }
   [1] - found part from passed re
   [index] - position of tag starting { in s
*/
function findTag(re,s)
{
    var openCount = 0;
    var offset = 0;
    var ldelim = jSmart.prototype.left_delimiter;
    var rdelim = jSmart.prototype.right_delimiter;
    var skipInWS = jSmart.prototype.auto_literal;

    var reAny = /^\s*(.+)\s*$/i;
    var reTag = re ? new RegExp('^\\s*('+re+')\\s*$','i') : reAny;

    for (var i=0; i<s.length; ++i)
    {
        if (s.substr(i,ldelim.length) == ldelim)
        {
            if (skipInWS && i+1 < s.length && s.substr(i+1,1).match(/\s/))
            {
                continue;
            }
            if (!openCount)
            {
                s = s.slice(i);
                offset += parseInt(i);
                i = 0;
            }
            ++openCount;
        }
        else if (s.substr(i,rdelim.length) == rdelim)
        {
            if (skipInWS && i-1 >= 0 && s.substr(i-1,1).match(/\s/))
            {
                continue;
            }
            if (!--openCount)
            {
                var sTag = s.slice(ldelim.length,i).replace(/[\r\n]/g, ' ');
                var found = sTag.match(reTag);
                if (found)
                {
                    found.index = offset;
                    found[0] = s.slice(0,i+rdelim.length);
                    return found;
                }
            }
            if (openCount < 0) //ignore any number of unmatched right delimiters
            {
                openCount = 0;
            }
        }
    }
    return null;
}

function findCloseTag(reClose,reOpen,s)
{
    var sInner = '';
    var closeTag = null;
    var openTag = null;
    var findIndex = 0;

    do 
    {
        if (closeTag)
        {
            findIndex += closeTag[0].length;
        }
        closeTag = findTag(reClose,s);
        if (!closeTag)
        {
            throw new Error('Unclosed {'+reOpen+'}');
        }
        sInner += s.slice(0,closeTag.index);
        findIndex += closeTag.index;
        s = s.slice(closeTag.index+closeTag[0].length);
        
        openTag = findTag(reOpen,sInner);
        if (openTag)
        {
            sInner = sInner.slice(openTag.index+openTag[0].length);
        }
    }
    while (openTag);

    closeTag.index = findIndex;
    return closeTag;
}

function findElseTag(reOpen, reClose, reElse, s)
{
    var offset = 0;
    for (var elseTag=findTag(reElse,s); elseTag; elseTag=findTag(reElse,s))
    {
        var openTag = findTag(reOpen,s);
        if (!openTag || openTag.index > elseTag.index)
        {
            elseTag.index += offset;
            return elseTag;
        }
        else
        {
            s = s.slice(openTag.index+openTag[0].length);
            offset += openTag.index+openTag[0].length;
            var closeTag = findCloseTag(reClose,reOpen,s);
            s = s.slice(closeTag.index + closeTag[0].length);
            offset += closeTag.index + closeTag[0].length;
        }
    }
    return null;
}

function execute(code, data)
{
    if (typeof(code) == 'string')
    {
        with ({'__code':code})
        {
            with (modifiers)
            {
                with (data)
                {
                    try {
                        return eval(__code);
                    }
                    catch(e)
                    {
                        throw new Error(e.message + ' in \n' + code);
                    }
                }
            }
        }
    }
    return code;
}

function assignVar(nm, val, data)
{
    if (nm.match(/\[\]$/))  //ar[] = 
    {
        data[ nm.replace(/\[\]$/,'') ].push(val); 
    }
    else
    {
        data[nm] = val; 
    }
}

var buildInFunctions = 
    {
        expression:
        {
            parse: function(s, tree)
            {
                var e = parseExpression(s);

                tree.push({
                    type: 'build-in',
                    name: 'expression',
                    expression: e.tree,
                    params: parseParams(s.slice(e.value.length).replace(/^\s+|\s+$/g,''))
                });

                return e.tree;
                
            },
            process: function(node, data)
            {
                var params = getActualParamValues(node.params, data);
                var res = process([node.expression],data);
                
                if (findInArray(params, 'nofilter') < 0)
                {
                    for (var i=0; i<default_modifiers.length; ++i)
                    {
                        var m = default_modifiers[i];
                        m.params.__parsed[0] = {type:'text', data:res};
                        res = process([m],data);
                    }
                    if (escape_html)
                    {
                        res = modifiers.__escape(res);
                    }
                    res = applyFilters(varFilters,res);

                    if (tpl_modifiers.length) {
                        __t = function(){ return res; }	
                        res = process(tpl_modifiers,data);
                    }
                }
                return res;
            }
        },

        operator:
        {
            process: function(node, data)
            {
                var params = getActualParamValues(node.params, data);
                var arg1 = params[0];

                if (node.optype == 'binary')
                {
                    var arg2 = params[1];
                    if (node.op == '=')
                    {
                        getVarValue(node.params.__parsed[0], data, arg2);
                        return '';
                    }
                    else if (node.op.match(/(\+=|-=|\*=|\/=|%=)/))
                    {
                        arg1 = getVarValue(node.params.__parsed[0], data);
                        switch (node.op) 
                        {
                        case '+=': arg1+=arg2; break;
                        case '-=': arg1-=arg2; break;
                        case '*=': arg1*=arg2; break;
                        case '/=': arg1/=arg2; break;
                        case '%=': arg1%=arg2; break;
                        }
                        return getVarValue(node.params.__parsed[0], data, arg1);
                    }
                    else if (node.op.match(/div/))
                    {
                        return (node.op!='div')^(arg1%arg2==0);
                    }
                    else if (node.op.match(/even/))
                    {
                        return (node.op!='even')^((arg1/arg2)%2==0);
                    }
                    else if (node.op.match(/xor/))
                    {
                        return (arg1||arg2) && !(arg1&&arg2);
                    }

                    switch (node.op)
                    {
                    case '==': return arg1==arg2;
                    case '!=': return arg1!=arg2;
                    case '+':  return arg1+arg2;
                    case '-':  return arg1-arg2;
                    case '*':  return arg1*arg2;
                    case '/':  return arg1/arg2;
                    case '%':  return arg1%arg2;
                    case '&&': return arg1&&arg2;
                    case '||': return arg1||arg2;
                    case '<':  return arg1<arg2;
                    case '<=': return arg1<=arg2;
                    case '>':  return arg1>arg2;
                    case '>=': return arg1>=arg2;
                    case '===': return arg1===arg2;
                    case '!==': return arg1!==arg2;
                    }
                }
                else if (node.op == '!')
                {
                    return (arg1 instanceof Array) ? !arg1.length : !arg1;
                }
                else 
                {
                    var isVar = node.params.__parsed[0].type == 'var';
                    if (isVar)
                    {
                        arg1 = getVarValue(node.params.__parsed[0], data);
                    }
                    var v = arg1;
                    if (node.optype == 'pre-unary')
                    {
                        switch (node.op)
                        {
                        case '-':  v=-arg1;  break;
                        case '++': v=++arg1; break;
                        case '--': v=--arg1; break;
                        }
                        if (isVar)
                        {
                            getVarValue(node.params.__parsed[0], data, arg1);
                        }
                    }
                    else
                    {
                        switch (node.op)
                        {
                        case '++': arg1++; break;
                        case '--': arg1--; break;
                        }
                        getVarValue(node.params.__parsed[0], data, arg1);
                    }
                    return v;
                }
            }
        },

        section: 
        {
            type: 'block',
            parse: function(params, tree, content)
            {
                var subTree = [];
                var subTreeElse = [];
                tree.push({
                    type: 'build-in',
                    name: 'section',
                    params: params,
                    subTree: subTree,
                    subTreeElse: subTreeElse
                });

                var findElse = findElseTag('section [^}]+', '\/section', 'sectionelse', content);
                if (findElse)
                {
                    parse(content.slice(0,findElse.index),subTree);
                    parse(content.slice(findElse.index+findElse[0].length).replace(/^[\r\n]/,''), subTreeElse);
                }
                else
                {
                    parse(content, subTree);
                }            
            },

            process: function(node, data)
            {
                var params = getActualParamValues(node.params, data);

                var props = {};
                data.smarty.section[params.__get('name',null,0)] = props;

                var show = params.__get('show',true);
                props.show = show;
                if (!show)
                {
                    return process(node.subTreeElse, data);
                }

                var from = parseInt(params.__get('start',0));
                var to = (params.loop instanceof Object) ? countProperties(params.loop) : isNaN(params.loop) ? 0 : parseInt(params.loop);
                var step = parseInt(params.__get('step',1));
                var max = parseInt(params.__get('max'));
                if (isNaN(max))
                {
                    max = Number.MAX_VALUE;
                }

                if (from < 0)
                {
                    from += to;
                    if (from < 0)
                    {
                        from = 0;
                    }
                }
                else if (from >= to)
                {
                    from = to ? to-1 : 0;
                }

                var count = 0;
                var loop = 0;
                var i = from;
                for (; i>=0 && i<to && count<max; i+=step,++count) 
                {
                    loop = i;
                }
                props.total = count;
                props.loop = count;  //? - because it is so in Smarty

                count = 0;
                var s = '';
                for (i=from; i>=0 && i<to && count<max; i+=step,++count)
                {
                    if (data.smarty['break']) 
                    {
                        break;
                    }

                    props.first = (i==from);
                    props.last = ((i+step)<0 || (i+step)>=to);
                    props.index = i;
                    props.index_prev = i-step;
                    props.index_next = i+step;
                    props.iteration = props.rownum = count+1;

                    s += process(node.subTree, data);  
                    data.smarty['continue'] = false;
                }
                data.smarty['break'] = false;

                if (count)
                {
                    return s;
                }
                return process(node.subTreeElse, data);
            }
        },

        setfilter:
        {
            type: 'block',
            parseParams: function(paramStr)
            {
                return [parseExpression('__t()|' + paramStr).tree];
            },

            parse: function(params, tree, content)
            {
                tree.push({
                    type: 'build-in',
                    name: 'setfilter',
                    params: params,
                    subTree: parse(content,[])
                });
            },

            process: function(node, data)
            {
                tpl_modifiers = node.params;
                var s = process(node.subTree, data);
                tpl_modifiers = [];
                return s;
            }                
        },

        'for':
        {
            type: 'block',
            parseParams: function(paramStr)
            {
                var res = paramStr.match(/^\s*\$(\w+)\s*=\s*([^\s]+)\s*to\s*([^\s]+)\s*(?:step\s*([^\s]+))?\s*(.*)$/);
                if (!res)
                {
                    throw new Error('Invalid {for} parameters: '+paramStr);
                }
                return parseParams("varName='"+res[1]+"' from="+res[2]+" to="+res[3]+" step="+(res[4]?res[4]:'1')+" "+res[5]);
            },

            parse: function(params, tree, content)
            {
                var subTree = [];
                var subTreeElse = [];
                tree.push({
                    type: 'build-in',
                    name: 'for',
                    params: params,
                    subTree: subTree,
                    subTreeElse: subTreeElse
                });

                var findElse = findElseTag('for\\s[^}]+', '\/for', 'forelse', content);
                if (findElse)
                {
                    parse(content.slice(0,findElse.index),subTree);
                    parse(content.slice(findElse.index+findElse[0].length), subTreeElse);
                }
                else
                {
                    parse(content, subTree);
                }            
            },

            process: function(node, data)
            {
                var params = getActualParamValues(node.params, data);
                var from = parseInt(params.__get('from'));
                var to = parseInt(params.__get('to'));
                var step = parseInt(params.__get('step'));
                if (isNaN(step))
                {
                    step = 1;
                }
                var max = parseInt(params.__get('max'));
                if (isNaN(max))
                {
                    max = Number.MAX_VALUE;
                }

                var count = 0;
                var s = '';
                var total = Math.min( Math.ceil( ((step > 0 ? to-from : from-to)+1) / Math.abs(step)  ), max);

                for (var i=parseInt(params.from); count<total; i+=step,++count)
                {
                    if (data.smarty['break']) 
                    {
                        break;
                    }
                    data[params.varName] = i;
                    s += process(node.subTree, data);
                    data.smarty['continue'] = false;
                }
                data.smarty['break'] = false;

                if (!count)
                {
                    s = process(node.subTreeElse, data);
                }
                return s;
            }
        },

        'if': 
        {
            type: 'block',
            parse: function(params, tree, content)
            {
                var subTreeIf = [];
                var subTreeElse = [];
                tree.push({
                    type: 'build-in',
                    name: 'if',
                    params: params,
                    subTreeIf: subTreeIf,
                    subTreeElse: subTreeElse
                });

                var findElse = findElseTag('if\\s+[^}]+', '\/if', 'else[^}]*', content);
                if (findElse)
                {
                    parse(content.slice(0,findElse.index),subTreeIf);

                    content = content.slice(findElse.index+findElse[0].length);
                    var findElseIf = findElse[1].match(/^else\s*if(.*)/);
                    if (findElseIf)
                    {
                        buildInFunctions['if'].parse(parseParams(findElseIf[1]), subTreeElse, content.replace(/^\n/,''));
                    }
                    else
                    {
                        parse(content.replace(/^\n/,''), subTreeElse);
                    }
                }
                else
                {
                    parse(content, subTreeIf);
                }
            },

            process: function(node, data)
            {
				var res = getActualParamValues(node.params,data)[0];
                if (res && !((res instanceof Array && !res.length) || (res instanceof Object && !countProperties(res)))) 
                {
                    return process(node.subTreeIf, data);
                }
                else
                {
                    return process(node.subTreeElse, data);
                }
            }
        },

        foreach: 
        {
            type: 'block',
            parseParams: function(paramStr)
            {
                var params = {};
                var res = paramStr.match(/^\s*([$].+)\s*as\s*[$](\w+)\s*(=>\s*[$](\w+))?\s*$/i);
                if (res) //Smarty 3.x syntax => Smarty 2.x syntax
                {
                    paramStr = 'from='+res[1] + ' item='+(res[4]||res[2]);
                    if (res[4])
                    {
                        paramStr += ' key='+res[2];
                    }
                }
                return parseParams(paramStr);
            },

            parse: function(params, tree, content)
            {
                var subTree = [];
                var subTreeElse = [];
                tree.push({
                    type: 'build-in',
                    name: 'foreach',
                    params: params,
                    subTree: subTree,
                    subTreeElse: subTreeElse
                });

                var findElse = findElseTag('foreach\\s[^}]+', '\/foreach', 'foreachelse', content);
                if (findElse)
                {
                    parse(content.slice(0,findElse.index),subTree);
                    parse(content.slice(findElse.index+findElse[0].length).replace(/^[\r\n]/,''), subTreeElse);
                }
                else
                {
                    parse(content, subTree);
                }
            },

            process: function(node, data)
            {
                var params = getActualParamValues(node.params, data);
                var a = params.from;
                if (!(a instanceof Object))
                {
                    a = [a];
                }

                var total = countProperties(a);

                data[params.item+'__total'] = total;
                if ('name' in params)
                {
                    data.smarty.foreach[params.name] = {};
                    data.smarty.foreach[params.name].total = total;
                }

                var s = '';
                var i=0;
                for (var key in a)
                {
                    if (!a.hasOwnProperty(key))
                    {
                        continue;
                    }

                    if (data.smarty['break']) 
                    {
                        break;
                    }

                    data[params.item+'__key'] = isNaN(key) ? key : parseInt(key);
                    if ('key' in params)
                    {
                        data[params.key] = data[params.item+'__key'];
                    }
                    data[params.item] = a[key];
                    data[params.item+'__index'] = parseInt(i);
                    data[params.item+'__iteration'] = parseInt(i+1);
                    data[params.item+'__first'] = (i===0);
                    data[params.item+'__last'] = (i==total-1);
                    
                    if ('name' in params)
                    {
                        data.smarty.foreach[params.name].index = parseInt(i);
                        data.smarty.foreach[params.name].iteration = parseInt(i+1);
                        data.smarty.foreach[params.name].first = (i===0) ? 1 : '';
                        data.smarty.foreach[params.name].last = (i==total-1) ? 1 : '';
                    }

                    ++i;

                    s += process(node.subTree, data);
                    data.smarty['continue'] = false;
                }
                data.smarty['break'] = false;

                data[params.item+'__show'] = (i>0);
                if (params.name)
                {
                    data.smarty.foreach[params.name].show = (i>0) ? 1 : '';
                }
                if (i>0)
                {
                    return s;
                }
                return process(node.subTreeElse, data);
            }
        },

        'function': 
        {
            type: 'block',
            parse: function(params, tree, content)
            {
                var subTree = [];
                plugins[trimQuotes(params.name?params.name:params[0])] = 
                    {
                        type: 'function',
                        subTree: subTree,
                        defautParams: params,
                        process: function(params, data)
                        {
                            var defaults = getActualParamValues(this.defautParams,data);
                            delete defaults.name;
                            return process(this.subTree, obMerge({},data,defaults,params));
                        }
                    };
                parse(content, subTree);
            }
        },

        php:
        {
            type: 'block',
            parse: function(params, tree, content) {}
        },

        'extends':
        {
            type: 'function',
            parse: function(params, tree)
            {
                tree.splice(0,tree.length);
                getTemplate(trimQuotes(params.file?params.file:params[0]),tree);
            }
        },

        block:
        {
            type: 'block',
            parse: function(params, tree, content)
            {
                tree.push({
                    type: 'build-in',
                    name: 'block',
                    params: params
                });
                params.append = findInArray(params,'append') >= 0;
                params.prepend = findInArray(params,'prepend') >= 0;
                params.hide = findInArray(params,'hide') >= 0;
                params.hasChild = params.hasParent = false;

                onParseVar = function(nm) 
                {
                    if (nm.match(/^\s*[$]smarty.block.child\s*$/))
                    {
                        params.hasChild = true;
                    }
                    if (nm.match(/^\s*[$]smarty.block.parent\s*$/))
                    {
                        params.hasParent = true;
                    }
                }
                var tree = parse(content, []);
                onParseVar = function(nm) {}

                var blockName = trimQuotes(params.name?params.name:params[0]);
                if (!(blockName in blocks))
                {
                    blocks[blockName] = [];
                }
                blocks[blockName].push({tree:tree, params:params});
            },

            process: function(node, data)
            {
                data.smarty.block.parent = data.smarty.block.child = '';
                var blockName = trimQuotes(node.params.name?node.params.name:node.params[0]);
                this.processBlocks(blocks[blockName], blocks[blockName].length-1, data);
                return data.smarty.block.child;
            },

            processBlocks: function(blockAncestry, i, data)
            {
                if (!i && blockAncestry[i].params.hide) {
                    data.smarty.block.child = '';
                    return;
                }
                var append = true;
                var prepend = false;
                for (; i>=0; --i)
                {
                    if (blockAncestry[i].params.hasParent)
                    {
                        var tmpChild = data.smarty.block.child;
                        data.smarty.block.child = '';
                        this.processBlocks(blockAncestry, i-1, data);
                        data.smarty.block.parent = data.smarty.block.child;
                        data.smarty.block.child = tmpChild;
                    }

                    var tmpChild = data.smarty.block.child;
                    var s = process(blockAncestry[i].tree, data);
                    data.smarty.block.child = tmpChild;

                    if (blockAncestry[i].params.hasChild)
                    {
                        data.smarty.block.child = s;
                    }
                    else if (append)
                    {
                        data.smarty.block.child = s + data.smarty.block.child;
                    }
                    else if (prepend)
                    {
                        data.smarty.block.child += s;
                    }
                    append = blockAncestry[i].params.append;
                    prepend = blockAncestry[i].params.prepend;
                }
            }
        },

        strip:
        {
            type: 'block',
            parse: function(params, tree, content)
            {
                parse(content.replace(/[ \t]*[\r\n]+[ \t]*/g, ''), tree);
            }
        },

        literal:
        {
            type: 'block',
            parse: function(params, tree, content)
            {
                parseText(content, tree);
            }
        },

        ldelim:
        {
            type: 'function',
            parse: function(params, tree)
            {
                parseText(jSmart.prototype.left_delimiter, tree);
            }
        },

        rdelim:
        {
            type: 'function',
            parse: function(params, tree)
            {
                parseText(jSmart.prototype.right_delimiter, tree);
            }
        },

        'while':
        {
            type: 'block',
            parse: function(params, tree, content)
            {
                tree.push({
                    type: 'build-in',
                    name: 'while',
                    params: params,
                    subTree: parse(content, [])
                });
            },

            process: function(node, data)
            {
                var s = '';
                while (getActualParamValues(node.params,data)[0])
                {
                    if (data.smarty['break']) 
                    {
                        break;
                    }
                    s += process(node.subTree, data);
                    data.smarty['continue'] = false;
                }
                data.smarty['break'] = false;
                return s;
            }
        }
    };

var plugins = {};
var modifiers = {};
var files = {};
var blocks = null;
var scripts = null;
var tpl_modifiers = [];

function parse(s, tree)
{
    for (var openTag=findTag('',s); openTag; openTag=findTag('',s))
    {
        if (openTag.index)
        {
            parseText(s.slice(0,openTag.index),tree);
        }
        s = s.slice(openTag.index + openTag[0].length);

        var res = openTag[1].match(/^\s*(\w+)(.*)$/);
        if (res)         //function
        {
            var nm = res[1];
            var paramStr = (res.length>2) ? res[2].replace(/^\s+|\s+$/g,'') : '';

            if (nm in buildInFunctions)
            {
                var buildIn = buildInFunctions[nm];
                var params = ('parseParams' in buildIn ? buildIn.parseParams : parseParams)(paramStr);
                if (buildIn.type == 'block')
                {
                    s = s.replace(/^\n/,'');  //remove new line after block open tag (like in Smarty)
                    var closeTag = findCloseTag('\/'+nm, nm+' +[^}]*', s);
                    buildIn.parse(params, tree, s.slice(0,closeTag.index));
                    s = s.slice(closeTag.index+closeTag[0].length);
                }
                else
                {
                    buildIn.parse(params, tree);
                    if (nm == 'extends')
                    {
                        tree = []; //throw away further parsing except for {block}
                    }
                }
                s = s.replace(/^\n/,'');
            }
            else if (nm in plugins)
            {
                var plugin = plugins[nm];
                if (plugin.type == 'block')
                {
                    var closeTag = findCloseTag('\/'+nm, nm+' +[^}]*', s);
                    parsePluginBlock(nm, parseParams(paramStr), tree, s.slice(0,closeTag.index));
                    s = s.slice(closeTag.index+closeTag[0].length);
                }
                else if (plugin.type == 'function')
                {
                    parsePluginFunc(nm, parseParams(paramStr), tree);
                }
                if (nm=='append' || nm=='assign' || nm=='capture' || nm=='eval' || nm=='include')
                {
                    s = s.replace(/^\n/,'');
                }
            }
            else   //variable
            {
                buildInFunctions.expression.parse(openTag[1],tree);
            }
        }
        else         //variable
        {
            var node = buildInFunctions.expression.parse(openTag[1],tree);
            if (node.type=='build-in' && node.name=='operator' && node.op == '=')
            {
                s = s.replace(/^\n/,'');
            }
        }
    }
    if (s) 
    {
        parseText(s, tree);
    }
    return tree;
}

function parseText(text, tree)
{
    if (parseText.parseEmbeddedVars)
    {
        var re = /([$][\w@]+)|`([^`]*)`/;
        for (var found=text.match(re); found; found=text.match(re))
        {
            tree.push({type: 'text', data: text.slice(0,found.index)});
            tree.push( parseExpression(found[1] ? found[1] : found[2]).tree );
            text = text.slice(found.index + found[0].length);
        }
    }
    tree.push({type: 'text', data: text});
    return tree;
}

function parseFunc(name, params, tree)
{
    params.__parsed.name = parseText(name,[])[0];
    tree.push({
        type: 'plugin',
        name: '__func',
        params: params
    });
    return tree;
}

function parseOperator(op, type, precedence, tree)
{
    tree.push({
        type: 'build-in',
        name: 'operator',
        op: op,
        optype: type,
        precedence: precedence,
        params: {}
    });
}

function parseVar(s, e, nm)
{
    var rootName = e.token;
    var parts = [{type:'text', data:nm.replace(/^(\w+)@(key|index|iteration|first|last|show|total)/gi, "$1__$2")}];

    var re = /^(?:\.|\s*->\s*|\[\s*)/;
    for (var op=s.match(re); op; op=s.match(re))
    {
        e.token += op[0];
        s = s.slice(op[0].length);

        var eProp = {value:'', tree:[]};
        if (op[0].match(/\[/))
        {
            eProp = parseExpression(s);
            if (eProp)
            {
                e.token += eProp.value;
                parts.push( eProp.tree );
                s = s.slice(eProp.value.length);
            }

            var closeOp = s.match(/\s*\]/);
            if (closeOp)
            {
                e.token += closeOp[0];
                s = s.slice(closeOp[0].length);
            }
        }
        else
        {
            var parseMod = parseModifiers.stop;
            parseModifiers.stop = true;
            if (lookUp(s,eProp))
            {
                e.token += eProp.value;
                var part = eProp.tree[0];
                if (part.type == 'plugin' && part.name == '__func')
                {
                    part.hasOwner = true;
                }
                parts.push( part );
                s = s.slice(eProp.value.length);
            }
            else
            {
                eProp = false;
            }
            parseModifiers.stop = parseMod;
        }

        if (!eProp)
        {
            parts.push({type:'text', data:''});
        }
    }

    e.tree.push({type: 'var', parts: parts});

    e.value += e.token.substr(rootName.length);

    onParseVar(e.token);

    return s;
}

function onParseVar(nm)  {}


var tokens = 
    [
        {
            re: /^\$([\w@]+)/,   //var
            parse: function(e, s)
            {
                parseModifiers(parseVar(s, e, RegExp.$1), e);
            }
        },
        {
            re: /^(true|false)/i,  //bool
            parse: function(e, s)
            {
                parseText(e.token.match(/true/i) ? '1' : '', e.tree);
            }
        },
        {
            re: /^'([^'\\]*(?:\\.[^'\\]*)*)'/, //single quotes
            parse: function(e, s)
            {
                parseText(evalString(RegExp.$1), e.tree);
                parseModifiers(s, e);
            }
        },
        {
            re: /^"([^"\\]*(?:\\.[^"\\]*)*)"/,  //double quotes
            parse: function(e, s)
            {
                var v = evalString(RegExp.$1);
                var isVar = v.match(tokens[0].re);
                if (isVar)
                {
                    var eVar = {token:isVar[0], tree:[]};
                    parseVar(v, eVar, isVar[1]);
                    if (eVar.token.length == v.length)
                    {
                        e.tree.push( eVar.tree[0] );
                        return;
                    }
                }
                parseText.parseEmbeddedVars = true;
                e.tree.push({
                    type: 'plugin',
                    name: '__quoted',
                    params: {__parsed: parse(v,[])}
                });
                parseText.parseEmbeddedVars = false;
                parseModifiers(s, e);
            }
        },
        {
            re: /^(\w+)\s*[(]([)]?)/,  //func()
            parse: function(e, s)
            {
                var fnm = RegExp.$1;
                var noArgs = RegExp.$2;
                var params = parseParams(noArgs?'':s,/^\s*,\s*/);
                parseFunc(fnm, params, e.tree);
                e.value += params.toString();
                parseModifiers(s.slice(params.toString().length), e);
            }
        },
        {
            re: /^\s*\(\s*/,  //expression in parentheses
            parse: function(e, s)
            {
                var parens = [];
                e.tree.push(parens);
                parens.parent = e.tree;
                e.tree = parens;
            }
        },
        {
            re: /^\s*\)\s*/,
            parse: function(e, s)
            {
                if (e.tree.parent) //it may be the end of func() or (expr)
                {
                    e.tree = e.tree.parent;
                }
            }
        },
        {
            re: /^\s*(\+\+|--)\s*/,
            parse: function(e, s)
            {
                if (e.tree.length && e.tree[e.tree.length-1].type == 'var')
                {
                    parseOperator(RegExp.$1, 'post-unary', 1, e.tree);
                }
                else
                {
                    parseOperator(RegExp.$1, 'pre-unary', 1, e.tree);
                }
            }
        },
        {
            re: /^\s*(===|!==|==|!=)\s*/,
            parse: function(e, s)
            {
                parseOperator(RegExp.$1, 'binary', 6, e.tree);
            }
        },
        {
            re: /^\s+(eq|ne|neq)\s+/i,
            parse: function(e, s)
            {
                var op = RegExp.$1.replace(/ne(q)?/,'!=').replace(/eq/,'==');
                parseOperator(op, 'binary', 6, e.tree);
            }
        },
        {
            re: /^\s*!\s*/,
            parse: function(e, s)
            {
                parseOperator('!', 'pre-unary', 2, e.tree);
            }
        },
        {
            re: /^\s+not\s+/i,
            parse: function(e, s)
            {
                parseOperator('!', 'pre-unary', 2, e.tree);
            }
        },
        {
            re: /^\s*(=|\+=|-=|\*=|\/=|%=)\s*/,
            parse: function(e, s)
            {
                parseOperator(RegExp.$1, 'binary', 10, e.tree);
            }
        },
        {
            re: /^\s*(\*|\/|%)\s*/,
            parse: function(e, s)
            {
                parseOperator(RegExp.$1, 'binary', 3, e.tree);
            }
        },
        {
            re: /^\s+mod\s+/i,
            parse: function(e, s)
            {
                parseOperator('%', 'binary', 3, e.tree);
            }
        },
        {
            re: /^\s*(\+|-)\s*/,
            parse: function(e, s)
            {
                if (!e.tree.length || e.tree[e.tree.length-1].name == 'operator')
                {
                    parseOperator(RegExp.$1, 'pre-unary', 4, e.tree);
                }
                else
                {
                    parseOperator(RegExp.$1, 'binary', 4, e.tree);
                }
            }
        },
        {
            re: /^\s*(<=|>=|<>|<|>)\s*/,
            parse: function(e, s)
            {
                parseOperator(RegExp.$1.replace(/<>/,'!='), 'binary', 5, e.tree);
            }
        },
        {
            re: /^\s+(lt|lte|le|gt|gte|ge)\s+/i,
            parse: function(e, s)
            {
                var op = RegExp.$1.replace(/lt/,'<').replace(/l(t)?e/,'<=').replace(/gt/,'>').replace(/g(t)?e/,'>=');
                parseOperator(op, 'binary', 5, e.tree);
            }
        },
        {
            re: /^\s+(is\s+(not\s+)?div\s+by)\s+/i,
            parse: function(e, s)
            {
                parseOperator(RegExp.$2?'div_not':'div', 'binary', 7, e.tree);
            }
        },
        {
            re: /^\s+is\s+(not\s+)?(even|odd)(\s+by\s+)?\s*/i,
            parse: function(e, s)
            {
                var op = RegExp.$1 ? ((RegExp.$2=='odd')?'even':'even_not') : ((RegExp.$2=='odd')?'even_not':'even');
                parseOperator(op, 'binary', 7, e.tree);
                if (!RegExp.$3)
                {
                    parseText('1', e.tree);
                }
            }
        },
        {
            re: /^\s*(&&)\s*/,
            parse: function(e, s)
            {
                parseOperator(RegExp.$1, 'binary', 8, e.tree);
            }
        },
        {
            re: /^\s*(\|\|)\s*/,
            parse: function(e, s)
            {
                parseOperator(RegExp.$1, 'binary', 9, e.tree);
            }
        },
        {
            re: /^\s+and\s+/i,
            parse: function(e, s)
            {
                parseOperator('&&', 'binary', 11, e.tree);
            }
        },
        {
            re: /^\s+xor\s+/i,
            parse: function(e, s)
            {
                parseOperator('xor', 'binary', 12, e.tree);
            }
        },
        {
            re: /^\s+or\s+/i,
            parse: function(e, s)
            {
                parseOperator('||', 'binary', 13, e.tree);
            }
        },
        {
            re: /^#(\w+)#/,  //config variable
            parse: function(e, s)
            {
                var eVar = {token:'$smarty',tree:[]};
                parseVar('.config.'+RegExp.$1, eVar, 'smarty');
                e.tree.push( eVar.tree[0] );                    
                parseModifiers(s, e);
            }
        },
        {
            re: /^\s*\[\s*/,   //array
            parse: function(e, s)
            {
                var params = parseParams(s, /^\s*,\s*/, /^('[^'\\]*(?:\\.[^'\\]*)*'|"[^"\\]*(?:\\.[^"\\]*)*"|\w+)\s*=>\s*/);
                parsePluginFunc('__array',params,e.tree);
                e.value += params.toString();
                var paren = s.slice(params.toString().length).match(/\s*\]/);
                if (paren)
                {
                    e.value += paren[0];
                }
            }
        },
        {
            re: /^[\d.]+/, //number
            parse: function(e, s)
            {
                parseText(e.token, e.tree);
                parseModifiers(s, e);
            }
        },
        {
            re: /^\w+/, //static
            parse: function(e, s)
            {
                parseText(e.token, e.tree);
                parseModifiers(s, e);
            }
        }
    ];

function parseModifiers(s, e)
{
    if (parseModifiers.stop) 
    {
        return;
    }

    var modifier = s.match(/^\|(\w+)/);
    if (!modifier)
    {
        return;
    }

    e.value += modifier[0];

    var fnm = modifier[1]=='default' ? '__defaultValue' : '__'+modifier[1];
    s = s.slice(modifier[0].length).replace(/^\s+/,'');
    
    parseModifiers.stop = true;
    var params = [];
    for (var colon=s.match(/^\s*:\s*/); colon; colon=s.match(/^\s*:\s*/))
    {
        e.value += s.slice(0,colon[0].length);
        s = s.slice(colon[0].length);
        
        var param = {value:'', tree:[]};
        if (lookUp(s, param))
        {
            e.value += param.value;
            params.push(param.tree[0]);
            s = s.slice(param.value.length);
        }
        else
        {
            parseText('',params);
        }
    }
    parseModifiers.stop = false;
    
    params.unshift(e.tree.pop());  //modifiers have the highest priority
    e.tree.push(parseFunc(fnm,{__parsed:params},[])[0]);
    
    parseModifiers(s, e);  //modifiers can be combined
}

function lookUp(s,e)
{
    if (!s)
    {
        return false;
    }

    if (s.substr(0,jSmart.prototype.left_delimiter.length)==jSmart.prototype.left_delimiter)
    {
        var tag = findTag('',s);
        if (tag)
        {
            e.token = tag[0];
            e.value += tag[0];
            parse(tag[0], e.tree);
            parseModifiers(s.slice(e.value.length), e);
            return true;
        }
    }

    for (var i=0; i<tokens.length; ++i)
    {
        if (s.match(tokens[i].re))
        {
            e.token = RegExp.lastMatch;
            e.value += RegExp.lastMatch;
            tokens[i].parse(e, s.slice(e.token.length));
            return true;
        }
    }
    return false;
}

function bundleOp(i, tree, precedence)
{
    var op = tree[i];
    if (op.name == 'operator' && op.precedence == precedence && !op.params.__parsed)
    {
        if (op.optype == 'binary')
        {
            op.params.__parsed = [tree[i-1],tree[i+1]];
            tree.splice(i-1,3,op);
            return true;
        } 
        else if (op.optype == 'post-unary')
        {
            op.params.__parsed = [tree[i-1]];
            tree.splice(i-1,2,op);
            return true;
        }

        op.params.__parsed = [tree[i+1]];
        tree.splice(i,2,op);
    }
    return false;
}

function composeExpression(tree)
{
    var i = 0;
    for (i=0; i<tree.length; ++i)
    {
        if (tree[i] instanceof Array)
        {
            tree[i] = composeExpression(tree[i])
        }
    }
    
    for (var precedence=1; precedence<14; ++precedence)
    {
        if (precedence==2 || precedence==10)
        {
            for (i=tree.length; i>0; --i)
            {
                i -= bundleOp(i-1, tree, precedence);
            }
        }
        else
        {
            for (i=0; i<tree.length; ++i)
            {
                i -= bundleOp(i, tree, precedence);
            }
        }
    }
    return tree[0]; //only one node must be left
}

function parseExpression(s)
{
    var e = { value:'', tree:[] };
    while (lookUp(s.slice(e.value.length), e)){}
    if (!e.tree.length)
    {
        return false;
    }
    e.tree = composeExpression(e.tree);
    return e;
}

function parseParams(paramsStr, reDelim, reName)
{
    var s = paramsStr.replace(/\n/g,' ').replace(/^\s+|\s+$/g,'');
    var params = [];
    params.__parsed = [];
    var paramsStr = '';

    if (!s)
    {
        return params;
    }

    if (!reDelim)
    {
        reDelim = /^\s+/;
        reName = /^(\w+)\s*=\s*/;
    }

    while (s)
    {
        var nm = null;
        if (reName)
        {
            var foundName = s.match(reName);
            if (foundName)
            {
                nm = trimQuotes(foundName[1]);
                paramsStr += s.slice(0,foundName[0].length);
                s = s.slice(foundName[0].length);
            }
        }

        var param = parseExpression(s);
        if (!param)
        {
            break;
        }
        
        if (nm)
        {
            params[nm] = param.value;
            params.__parsed[nm] = param.tree; 
        }
        else
        {
            params.push(param.value);
            params.__parsed.push(param.tree);
        }

        paramsStr += s.slice(0,param.value.length);
        s = s.slice(param.value.length);

        var foundDelim = s.match(reDelim);
        if (foundDelim)
        {
            paramsStr += s.slice(0,foundDelim[0].length);
            s = s.slice(foundDelim[0].length);
        }
        else
        {
            break;
        }
    }
    params.toString = function() { return paramsStr; }
    return params;
}

function parsePluginBlock(name, params, tree, content)
{
    tree.push({
        type: 'plugin',
        name: name,
        params: params,
        subTree: parse(content,[])
    });
}

function parsePluginFunc(name, params, tree)
{
    tree.push({
        type: 'plugin',
        name: name,
        params: params
    });
}

function getActualParamValues(params,data)
{
    var actualParams = [];
    for (var nm in params.__parsed)
    {
        if (params.__parsed.hasOwnProperty(nm))
        {
            var v = process([params.__parsed[nm]], data);
            if (typeof(v) == 'string' && v.match(/^[1-9]\d{0,14}$/) && !isNaN(v))
            {
                v = parseInt(v,10);
            }
            actualParams[nm] = v;
        }
    }

    actualParams.__get = function(nm,defVal,id)
    {
        if (nm in actualParams && typeof(actualParams[nm]) != 'undefined')
        {
            return actualParams[nm];
        }
        if (typeof(id)!='undefined' && typeof(actualParams[id]) != 'undefined')
        {
            return actualParams[id];
        }
        if (defVal === null)
        {
            throw new Error("The required attribute '"+nm+"' is missing");
        }
        return defVal;
    };
    return actualParams;
}

function getVarValue(node, data, val)
{
    var v = data;
    var nm = '';
    for (var i=0; i<node.parts.length; ++i)
    {
        var part = node.parts[i];
        if (part.type == 'plugin' && part.name == '__func' && part.hasOwner)
        {
            data.__owner = v;
            v = process([node.parts[i]],data);
            delete data.__owner;
        }
        else
        {
            nm = process([part],data);

            //section name
            if (nm in data.smarty.section && part.type=='text' && process([node.parts[0]],data)!='smarty')
            { 
                nm = data.smarty.section[nm].index;
            }

            //add to array
            if (!nm && typeof val != 'undefined' && v instanceof Array)
            {
                nm = v.length;
            }

            //set new value
            if (typeof val != 'undefined' && i==node.parts.length-1)
            {
                v[nm] = val;
            }

            if (typeof v == 'object' && v !== null && nm in v)
            {
                v = v[nm];
            }
            else
            {
                if (typeof val == 'undefined')
                {
                    return '';
                }
                v[nm] = {};
                v = v[nm];
            }
        }
    }
    return v;
}

function process(tree, data)
{
    var res = '';
    for (var i=0; i<tree.length; ++i)
    {
        var s = '';
        var node = tree[i];
        if (node.type == 'text')
        {
            s = node.data;
        }
        else if (node.type == 'var')
        {
            s = getVarValue(node,data);
        }
        else if (node.type == 'build-in')
        {
            s = buildInFunctions[node.name].process(node,data);
        }
        else if (node.type == 'plugin')
        {
            var plugin = plugins[node.name];
            if (plugin.type == 'block')
            {
                var repeat = {value:true};
                plugin.process(getActualParamValues(node.params,data), '', data, repeat);
                while (repeat.value)
                {
                    repeat.value = false;
                    s += plugin.process(
                        getActualParamValues(node.params,data), 
                        process(node.subTree, data), 
                        data, 
                        repeat
                    );
                }
            }
            else if (plugin.type == 'function')
            {
                s = plugin.process(getActualParamValues(node.params,data), data);
            }
        }
        if (typeof s == 'boolean')
        {
            s = s ? '1' : '';
        }
		if (s == null)
		{
			s = '';
		}
        if (tree.length == 1)
        {
            return s;
        }
        res += s;

        if (data.smarty['continue'] || data.smarty['break'])
        {
            return res;
        }
    }
    return res;    
}

function getTemplate(name, tree, nocache)
{
    if (nocache || !(name in files))
    {
        var tpl = jSmart.prototype.getTemplate(name);
        if (typeof(tpl) != 'string')
        {
            throw new Error('No template for '+ name);
        }
        parse(applyFilters(jSmart.prototype.filters_global.pre, stripComments(tpl.replace(/\r\n/g,'\n'))), tree);
        files[name] = tree;
    }
    else
    {
        tree = files[name];
    }
    return tree;
}

function stripComments(s)
{
    var sRes = '';
    for (var openTag=s.match(/{\*/); openTag; openTag=s.match(/{\*/))
    {
        sRes += s.slice(0,openTag.index);
        s = s.slice(openTag.index+openTag[0].length);
        var closeTag = s.match(/\*}/);
        if (!closeTag)
        {
            throw new Error('Unclosed {*');
        }
        s = s.slice(closeTag.index+closeTag[0].length);
    }
    return sRes + s;
}

function applyFilters(filters, s)
{
    for (var i=0; i<filters.length; ++i)
    {
        s = filters[i](s);
    }
    return s;
}


jSmart = function(tpl)
{
    this.tree = [];
    this.tree.blocks = {};
    this.scripts = {};
    this.default_modifiers = [];
    this.filters = {'variable':[], 'post':[]};
    this.smarty = {
        'smarty': {
            block: {},
            'break': false,
            capture: {},
            'continue': false,
            counter: {},
            cycle: {},
            foreach: {},
            section: {},
            now: Math.floor( (new Date()).getTime()/1000 ),
            'const': {},
            config: {},
            current_dir: '/',
            template: '',
            ldelim: jSmart.prototype.left_delimiter,
            rdelim: jSmart.prototype.right_delimiter,
            version: '2.9'
        }
    };
    blocks = this.tree.blocks;
    parse( 
        applyFilters(jSmart.prototype.filters_global.pre, stripComments((new String(tpl?tpl:'')).replace(/\r\n/g,'\n'))), 
        this.tree
    );
};

jSmart.prototype.fetch = function(data)
{
    blocks = this.tree.blocks;
    scripts = this.scripts;
    escape_html = this.escape_html;
    default_modifiers = jSmart.prototype.default_modifiers_global.concat(this.default_modifiers);
    this.data = obMerge((typeof data == 'object') ? data : {}, this.smarty);
    varFilters = jSmart.prototype.filters_global.variable.concat(this.filters.variable);
    var res = process(this.tree, this.data);
    if (jSmart.prototype.debugging)
    {
        plugins.debug.process([],this.data);
    }
    return applyFilters(jSmart.prototype.filters_global.post.concat(this.filters.post), res);
};

jSmart.prototype.escape_html = false;

/**
   @param type  valid values are 'function', 'block', 'modifier'
   @param callback  func(params,data)  or  block(params,content,data,repeat)
*/
jSmart.prototype.registerPlugin = function(type, name, callback)
{
    if (type == 'modifier')
    {
        modifiers['__'+name] = callback;
    }
    else
    {
        plugins[name] = {'type': type, 'process': callback};
    }
};

/**
   @param type  valid values are 'pre', 'variable', 'post'
   @param callback function(textValue) { ... }
*/
jSmart.prototype.registerFilter = function(type, callback)
{
    (this.tree ? this.filters : jSmart.prototype.filters_global)[type=='output'?'post':type].push(callback);
}

jSmart.prototype.filters_global = {'pre':[],'variable':[],'post':[]};

jSmart.prototype.configLoad = function(confValues, section, data)
{
    data = data ? data : this.data;
    var s = confValues.replace(/\r\n/g,'\n').replace(/^\s+|\s+$/g,'');
    var re = /^\s*(?:\[([^\]]+)\]|(?:(\w+)[ \t]*=[ \t]*("""|'[^'\\\n]*(?:\\.[^'\\\n]*)*'|"[^"\\\n]*(?:\\.[^"\\\n]*)*"|[^\n]*)))/m;
    var currSect = '';
    for (var f=s.match(re); f; f=s.match(re))
    {
         s = s.slice(f.index+f[0].length);
         if (f[1])
         {
	          currSect = f[1];
         }
         else if ((!currSect || currSect == section) && currSect.substr(0,1) != '.')
         {
	          if (f[3] == '"""')
	          {
		           var triple = s.match(/"""/);
		           if (triple)
		           {
			            data.smarty.config[f[2]] = s.slice(0,triple.index);
			            s = s.slice(triple.index + triple[0].length);
		           }
	          }
	          else
	          {
		           data.smarty.config[f[2]] = trimQuotes(f[3]);
	          }
         }
         var newln = s.match(/\n+/);
         if (newln)
         {
	          s = s.slice(newln.index + newln[0].length);
         }
         else
         {
	          break;
         }
    }
}

jSmart.prototype.clearConfig = function(varName)
{
    if (varName)
    {
        delete this.data.smarty.config[varName];
    }
    else
    {
        this.data.smarty.config = {};
    }
}

/**
   add modifier to implicitly apply to every variable in a template
   @param modifiers  single string (e.g. "replace:'from':'to'") 
                     or array of strings (e.g. ['escape:"htmlall"', "replace:'from':'to'"]) 
 */
jSmart.prototype.addDefaultModifier = function(modifiers)
{
    if (!(modifiers instanceof Array))
    {
        modifiers = [modifiers];
    }

    for (var i=0; i<modifiers.length; ++i)
    {
        var e = { value:'', tree:[0] };
        parseModifiers('|'+modifiers[i], e);
        (this.tree ? this.default_modifiers : this.default_modifiers_global).push( e.tree[0] );
    }
}

jSmart.prototype.default_modifiers_global = [];

/**
   override this function
   @param name  value of 'file' parameter in {include} and {extends}
   @return template text
*/
jSmart.prototype.getTemplate = function(name)
{
    throw new Error('No template for ' + name);
}

/**
   override this function
   @param name  value of 'file' parameter in {fetch}
   @return file content
*/
jSmart.prototype.getFile = function(name)
{
    throw new Error('No file for ' + name);
}

/**
   override this function
   @param name  value of 'file' parameter in {include_php} and {include_javascript} 
                 or value of 'script' parameter in {insert}
   @return Javascript script
*/
jSmart.prototype.getJavascript = function(name)
{
    throw new Error('No Javascript for ' + name);
}

/**
   override this function
   @param name  value of 'file' parameter in {config_load}
   @return config file content
*/
jSmart.prototype.getConfig = function(name)
{
    throw new Error('No config for ' + name);
}



/**     
   whether to skip tags in open brace { followed by white space(s) and close brace } with white space(s) before
*/
jSmart.prototype.auto_literal = true;

jSmart.prototype.left_delimiter = '{';
jSmart.prototype.right_delimiter = '}';

/** enables the debugging console */
jSmart.prototype.debugging = false;


/**
   core functions
*/
jSmart.prototype.registerPlugin(
    'function', 
    '__array', 
    function(params, data)
    {
        var a = [];
        for (var nm in params)
        {
            if (params.hasOwnProperty(nm) && params[nm] && typeof params[nm] != 'function')
            {
                a[nm] = params[nm];
            }
        }
        return a;
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    '__func', 
    function(params, data)
    {
        var paramNames = [];
        var paramValues = {};
        for(var i=0; i<params.length; ++i)
        {
            paramNames.push(params.name+'__p'+i);
            paramValues[params.name+'__p'+i] = params[i];
        }
        var fname = ('__owner' in data && params.name in data.__owner) ? ('__owner.'+params.name) : params.name;
        return execute(fname + '(' + paramNames.join(',') + ')', obMerge({},data,paramValues));
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    '__quoted', 
    function(params, data)
    {
        return params.join('');
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'break', 
    function(params, data)
    {
        data.smarty['break'] = true;
        return '';
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'continue', 
    function(params, data)
    {
        data.smarty['continue'] = true;
        return '';
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'call', 
    function(params, data)
    {
        var fname = params.__get('name',null,0);
        delete params.name;
        var assignTo = params.__get('assign',false);
        delete params.assign;
        var s = plugins[fname].process(params, data);
        if (assignTo)
        {
            assignVar(assignTo, s, data);
            return '';
        }
        return s;
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'append', 
    function(params, data)
    {
        var varName = params.__get('var',null,0);
        if (!(varName in data) || !(data[varName] instanceof Array))
        {
            data[varName] = [];
        }
        var index = params.__get('index',false);
        var val = params.__get('value',null,1);
        if (index === false)
        {
            data[varName].push(val);
        }
        else
        {
            data[varName][index] = val;
        }
        return '';
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'assign', 
    function(params, data)
    {
        assignVar(params.__get('var',null,0), params.__get('value',null,1), data);
        return '';
    }
);

jSmart.prototype.registerPlugin(
    'block', 
    'capture', 
    function(params, content, data, repeat)
    {
        if (content)
        {
            content = content.replace(/^\n/,'');
            data.smarty.capture[params.__get('name','default',0)] = content;

            if ('assign' in params)
            {
                assignVar(params.assign, content, data);
            }

            var append = params.__get('append',false);
            if (append)
            {
                if (append in data)
                {
                    if (data[append] instanceof Array)
                    {
                        data[append].push(content);
                    }
                }
			        else
			        {
				         data[append] = [content];
			        }
            }
        }
        return '';
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'eval', 
    function(params, data)
    {
        var tree = [];
        parse(params.__get('var','',0), tree);
        var s = process(tree, data);
        if ('assign' in params)
        {
            assignVar(params.assign, s, data);
            return '';
        }
        return s;
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'include', 
    function(params, data)
    {
        var file = params.__get('file',null,0);
        var incData = obMerge({},data,params);
        incData.smarty.template = file;
        var s = process(getTemplate(file,[],findInArray(params,'nocache')>=0), incData);
        if ('assign' in params)
        {
            assignVar(params.assign, s, data);
            return '';
        }
        return s;
    }
);

jSmart.prototype.registerPlugin(
    'block', 
    'nocache', 
    function(params, content, data, repeat)
    {
        return content;
    }
);

jSmart.prototype.registerPlugin(
    'block', 
    'javascript', 
    function(params, content, data, repeat)
    {
        data['$this'] = data;
        execute(content,data);
        delete data['$this'];
        return '';
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'config_load', 
    function(params, data)
    {
        jSmart.prototype.configLoad(jSmart.prototype.getConfig(params.__get('file',null,0)), params.__get('section','',1), data);
        return '';
    }
);



/**
	core modifiers
*/
jSmart.prototype.registerPlugin(
    'modifier', 
    'defaultValue',
    function(s, value)
    {
        return (s && s!='null' && s!='undefined') ? s : (value ? value : '');
    }
);

var PHPJS = 
{
	'window' : (typeof window == 'object') ? window : { document:{} }
};

String.prototype.fetch = function(data) 
{
    var tpl = new jSmart(this);
    return tpl.fetch(data);
};

jSmart.prototype.registerPlugin(
    'function', 
    'counter', 
    function(params, data)
    {
        var name = params.__get('name','default');
        if (name in data.smarty.counter)
        {
            var counter = data.smarty.counter[name];
            if ('start' in params)
            {
                counter.value = parseInt(params['start']);
            }
            else
            {
                counter.value = parseInt(counter.value);
                counter.skip = parseInt(counter.skip);
                if ('down' == counter.direction)
                {
                    counter.value -= counter.skip;
                }
                else
                {
                    counter.value += counter.skip;
                }
            }
            counter.skip = params.__get('skip',counter.skip);
            counter.direction = params.__get('direction',counter.direction);
            counter.assign = params.__get('assign',counter.assign);
        }
        else
        {
            data.smarty.counter[name] = {
                value: parseInt(params.__get('start',1)),
                skip: parseInt(params.__get('skip',1)),
                direction: params.__get('direction','up'),
                assign: params.__get('assign',false)
            };
        }

        if (data.smarty.counter[name].assign)
        {
            data[data.smarty.counter[name].assign] = data.smarty.counter[name].value;
            return '';
        }

        if (params.__get('print',true))
        {
            return data.smarty.counter[name].value;
        }

        return '';
    }
);

jSmart.prototype.registerPlugin(
    'function', 
    'cycle', 
    function(params, data)
    {
        var name = params.__get('name','default');
        var reset = params.__get('reset',false);
        if (!(name in data.smarty.cycle))
        {
            data.smarty.cycle[name] = {arr: [''], delimiter: params.__get('delimiter',','), index: 0};
            reset = true;
        }

        if (params.__get('delimiter',false))
        {
            data.smarty.cycle[name].delimiter = params.delimiter;
        }
        var values = params.__get('values',false);
        if (values)
        {
            var arr = [];
            if (values instanceof Object)
            {
                for (nm in values)
                {
                    arr.push(values[nm]);
                }
            }
            else
            {
                arr = values.split(data.smarty.cycle[name].delimiter);
            }
            
            if (arr.length != data.smarty.cycle[name].arr.length || arr[0] != data.smarty.cycle[name].arr[0])
            {
                data.smarty.cycle[name].arr = arr;
                data.smarty.cycle[name].index = 0;
                reset = true;
            }
        }

        if (params.__get('advance','true'))
        {
            data.smarty.cycle[name].index += 1;
        }
        if (data.smarty.cycle[name].index >= data.smarty.cycle[name].arr.length || reset)
        {
            data.smarty.cycle[name].index = 0;
        }

        if (params.__get('assign',false))
        {
            assignVar(params.assign, data.smarty.cycle[name].arr[ data.smarty.cycle[name].index ], data);
            return '';
        }

        if (params.__get('print',true))
        {
            return data.smarty.cycle[name].arr[ data.smarty.cycle[name].index ];
        }

        return '';
    }
);

function get_html_translation_table(table, quote_style) {
  //  discuss at: http://phpjs.org/functions/get_html_translation_table/
  // original by: Philip Peterson
  //  revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: noname
  // bugfixed by: Alex
  // bugfixed by: Marco
  // bugfixed by: madipta
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // bugfixed by: T.Wild
  // improved by: KELAN
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: Frank Forte
  //    input by: Ratheous
  //        note: It has been decided that we're not going to add global
  //        note: dependencies to php.js, meaning the constants are not
  //        note: real constants, but strings instead. Integers are also supported if someone
  //        note: chooses to create the constants themselves.
  //   example 1: get_html_translation_table('HTML_SPECIALCHARS');
  //   returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}

  var entities = {},
    hash_map = {},
    decimal;
  var constMappingTable = {},
    constMappingQuoteStyle = {};
  var useTable = {},
    useQuoteStyle = {};

  // Translate arguments
  constMappingTable[0] = 'HTML_SPECIALCHARS';
  constMappingTable[1] = 'HTML_ENTITIES';
  constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
  constMappingQuoteStyle[2] = 'ENT_COMPAT';
  constMappingQuoteStyle[3] = 'ENT_QUOTES';

  useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
  useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() :
    'ENT_COMPAT';

  if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
    throw new Error('Table: ' + useTable + ' not supported');
    // return false;
  }

  entities['38'] = '&amp;';
  if (useTable === 'HTML_ENTITIES') {
    entities['160'] = '&nbsp;';
    entities['161'] = '&iexcl;';
    entities['162'] = '&cent;';
    entities['163'] = '&pound;';
    entities['164'] = '&curren;';
    entities['165'] = '&yen;';
    entities['166'] = '&brvbar;';
    entities['167'] = '&sect;';
    entities['168'] = '&uml;';
    entities['169'] = '&copy;';
    entities['170'] = '&ordf;';
    entities['171'] = '&laquo;';
    entities['172'] = '&not;';
    entities['173'] = '&shy;';
    entities['174'] = '&reg;';
    entities['175'] = '&macr;';
    entities['176'] = '&deg;';
    entities['177'] = '&plusmn;';
    entities['178'] = '&sup2;';
    entities['179'] = '&sup3;';
    entities['180'] = '&acute;';
    entities['181'] = '&micro;';
    entities['182'] = '&para;';
    entities['183'] = '&middot;';
    entities['184'] = '&cedil;';
    entities['185'] = '&sup1;';
    entities['186'] = '&ordm;';
    entities['187'] = '&raquo;';
    entities['188'] = '&frac14;';
    entities['189'] = '&frac12;';
    entities['190'] = '&frac34;';
    entities['191'] = '&iquest;';
    entities['192'] = '&Agrave;';
    entities['193'] = '&Aacute;';
    entities['194'] = '&Acirc;';
    entities['195'] = '&Atilde;';
    entities['196'] = '&Auml;';
    entities['197'] = '&Aring;';
    entities['198'] = '&AElig;';
    entities['199'] = '&Ccedil;';
    entities['200'] = '&Egrave;';
    entities['201'] = '&Eacute;';
    entities['202'] = '&Ecirc;';
    entities['203'] = '&Euml;';
    entities['204'] = '&Igrave;';
    entities['205'] = '&Iacute;';
    entities['206'] = '&Icirc;';
    entities['207'] = '&Iuml;';
    entities['208'] = '&ETH;';
    entities['209'] = '&Ntilde;';
    entities['210'] = '&Ograve;';
    entities['211'] = '&Oacute;';
    entities['212'] = '&Ocirc;';
    entities['213'] = '&Otilde;';
    entities['214'] = '&Ouml;';
    entities['215'] = '&times;';
    entities['216'] = '&Oslash;';
    entities['217'] = '&Ugrave;';
    entities['218'] = '&Uacute;';
    entities['219'] = '&Ucirc;';
    entities['220'] = '&Uuml;';
    entities['221'] = '&Yacute;';
    entities['222'] = '&THORN;';
    entities['223'] = '&szlig;';
    entities['224'] = '&agrave;';
    entities['225'] = '&aacute;';
    entities['226'] = '&acirc;';
    entities['227'] = '&atilde;';
    entities['228'] = '&auml;';
    entities['229'] = '&aring;';
    entities['230'] = '&aelig;';
    entities['231'] = '&ccedil;';
    entities['232'] = '&egrave;';
    entities['233'] = '&eacute;';
    entities['234'] = '&ecirc;';
    entities['235'] = '&euml;';
    entities['236'] = '&igrave;';
    entities['237'] = '&iacute;';
    entities['238'] = '&icirc;';
    entities['239'] = '&iuml;';
    entities['240'] = '&eth;';
    entities['241'] = '&ntilde;';
    entities['242'] = '&ograve;';
    entities['243'] = '&oacute;';
    entities['244'] = '&ocirc;';
    entities['245'] = '&otilde;';
    entities['246'] = '&ouml;';
    entities['247'] = '&divide;';
    entities['248'] = '&oslash;';
    entities['249'] = '&ugrave;';
    entities['250'] = '&uacute;';
    entities['251'] = '&ucirc;';
    entities['252'] = '&uuml;';
    entities['253'] = '&yacute;';
    entities['254'] = '&thorn;';
    entities['255'] = '&yuml;';
  }

  if (useQuoteStyle !== 'ENT_NOQUOTES') {
    entities['34'] = '&quot;';
  }
  if (useQuoteStyle === 'ENT_QUOTES') {
    entities['39'] = '&#39;';
  }
  entities['60'] = '&lt;';
  entities['62'] = '&gt;';

  // ascii decimals to real symbols
  for (decimal in entities) {
    if (entities.hasOwnProperty(decimal)) {
      hash_map[String.fromCharCode(decimal)] = entities[decimal];
    }
  }

  return hash_map;
}

PHPJS['get_html_translation_table']=get_html_translation_table;

function htmlentities(string, quote_style, charset, double_encode) {
  // discuss at: http://phpjs.org/functions/htmlentities/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // improved by: nobbler
  // improved by: Jack
  // improved by: Rafał Kukawski (http://blog.kukawski.pl)
  // improved by: Dj (http://phpjs.org/functions/htmlentities:425#comment_134018)
  // bugfixed by: Onno Marsman
  // bugfixed by: Brett Zamir (http://brett-zamir.me)
  // input by: Ratheous
  // depends on: get_html_translation_table
  // note: function is compatible with PHP 5.2 and older
  // example 1: htmlentities('Kevin & van Zonneveld');
  // returns 1: 'Kevin &amp; van Zonneveld'
  // example 2: htmlentities("foo'bar","ENT_QUOTES");
  // returns 2: 'foo&#039;bar'
  var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
      symbol = '';

  string = string == null ? '' : string + '';

  if (!hash_map) {
    return false;
  }

  if (quote_style && quote_style === 'ENT_QUOTES') {
    hash_map["'"] = '&#039;';
  }

  double_encode = double_encode == null || !!double_encode;

  var regex = new RegExp("&(?:#\\d+|#x[\\da-f]+|[a-zA-Z][\\da-z]*);|[" +
                Object.keys(hash_map)
                  .join("")
                  // replace regexp special chars
                  .replace(/([()[\]{}\-.*+?^$|\/\\])/g, "\\$1")
                + "]",
              "g");

  return string.replace(regex, function (ent) {
    if (ent.length > 1) {
      return double_encode ? hash_map["&"] + ent.substr(1) : ent;
    }

    return hash_map[ent];
  });
}

PHPJS['htmlentities']=htmlentities;

function rawurlencode(str) {
  //       discuss at: http://phpjs.org/functions/rawurlencode/
  //      original by: Brett Zamir (http://brett-zamir.me)
  //         input by: travc
  //         input by: Brett Zamir (http://brett-zamir.me)
  //         input by: Michael Grier
  //         input by: Ratheous
  //      bugfixed by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
  //      bugfixed by: Joris
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  // reimplemented by: Brett Zamir (http://brett-zamir.me)
  //             note: This reflects PHP 5.3/6.0+ behavior
  //             note: Please be aware that this function expects to encode into UTF-8 encoded strings, as found on
  //             note: pages served as UTF-8
  //        example 1: rawurlencode('Kevin van Zonneveld!');
  //        returns 1: 'Kevin%20van%20Zonneveld%21'
  //        example 2: rawurlencode('http://kevin.vanzonneveld.net/');
  //        returns 2: 'http%3A%2F%2Fkevin.vanzonneveld.net%2F'
  //        example 3: rawurlencode('http://www.google.nl/search?q=php.js&ie=utf-8&oe=utf-8&aq=t&rls=com.ubuntu:en-US:unofficial&client=firefox-a');
  //        returns 3: 'http%3A%2F%2Fwww.google.nl%2Fsearch%3Fq%3Dphp.js%26ie%3Dutf-8%26oe%3Dutf-8%26aq%3Dt%26rls%3Dcom.ubuntu%3Aen-US%3Aunofficial%26client%3Dfirefox-a'

  str = (str + '')
    .toString();

  // Tilde should be allowed unescaped in future versions of PHP (as reflected below), but if you want to reflect current
  // PHP behavior, you would need to add ".replace(/~/g, '%7E');" to the following.
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .
  replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

PHPJS['rawurlencode']=rawurlencode;

function bin2hex(s) {
  //  discuss at: http://phpjs.org/functions/bin2hex/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // bugfixed by: Linuxworld
  // improved by: ntoniazzi (http://phpjs.org/functions/bin2hex:361#comment_177616)
  //   example 1: bin2hex('Kev');
  //   returns 1: '4b6576'
  //   example 2: bin2hex(String.fromCharCode(0x00));
  //   returns 2: '00'

  var i, l, o = '',
    n;

  s += '';

  for (i = 0, l = s.length; i < l; i++) {
    n = s.charCodeAt(i)
      .toString(16);
    o += n.length < 2 ? '0' + n : n;
  }

  return o;
}

PHPJS['bin2hex']=bin2hex;

function ord(string) {
  //  discuss at: http://phpjs.org/functions/ord/
  // original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // bugfixed by: Onno Marsman
  // improved by: Brett Zamir (http://brett-zamir.me)
  //    input by: incidence
  //   example 1: ord('K');
  //   returns 1: 75
  //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
  //   returns 2: 65536

  var str = string + '',
    code = str.charCodeAt(0);
  if (0xD800 <= code && code <= 0xDBFF) {
    // High surrogate (could change last hex to 0xDB7F to treat high private surrogates as single characters)
    var hi = code;
    if (str.length === 1) {
      // This is just a high surrogate with no following low surrogate, so we return its value;
      return code;
      // we could also throw an error as it is not a complete character, but someone may want to know
    }
    var low = str.charCodeAt(1);
    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000;
  }
  if (0xDC00 <= code && code <= 0xDFFF) {
    // Low surrogate
    // This is just a low surrogate with no preceding high surrogate, so we return its value;
    return code;
    // we could also throw an error as it is not a complete character, but someone may want to know
  }
  return code;
}

PHPJS['ord']=ord;

jSmart.prototype.registerPlugin(
    'modifier', 
    'escape', 
    function(s, esc_type, char_set, double_encode)
    {
        s = new String(s);
        esc_type = esc_type || 'html';
        char_set = char_set || 'UTF-8';
        double_encode = (typeof double_encode != 'undefined') ? Boolean(double_encode) : true;

        switch (esc_type) 
        {
        case 'html':
            if (double_encode) {
		           s = s.replace(/&/g, '&amp;');
	          }
            return s.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#039;').replace(/"/g,'&quot;');
        case 'htmlall':
            return PHPJS.htmlentities(s, 3, char_set);
        case 'url':
            return PHPJS.rawurlencode(s);
        case 'urlpathinfo':
            return PHPJS.rawurlencode(s).replace(/%2F/g, '/');
        case 'quotes': 
            return s.replace(/(^|[^\\])'/g, "$1\\'");
        case 'hex':
            var res = '';
            for (var i=0; i<s.length; ++i) 
            {
                res += '%' + PHPJS.bin2hex(s.substr(i,1));
            } 
            return res;
        case 'hexentity':
            var res = '';
            for (var i=0; i<s.length; ++i) {
                res += '&#x' + PHPJS.bin2hex(s.substr(i,1)).toUpperCase() + ';';
            } 
            return res;
        case 'decentity':
            var res = '';
            for (var i=0; i<s.length; ++i) {
                res += '&#' + PHPJS.ord(s.substr(i,1)) + ';';
            } 
            return res;
        case 'mail': 
            return s.replace(/@/g,' [AT] ').replace(/[.]/g,' [DOT] ');
        case 'nonstd': 
            var res = '';
            for (var i=0; i<s.length; ++i)
            {
                var _ord = PHPJS.ord(s.substr(i,1));
                if (_ord >= 126) {
                    res += '&#' + _ord + ';';
                } else {
                    res += s.substr(i, 1);
                } 
                
            }
            return res;
        case 'javascript': 
            return s.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/\r/g,'\\r').replace(/\n/g,'\\n').replace(/<\//g,'<\/');
        };
        return s;
    }
);

jSmart.prototype.registerPlugin(
    'modifier', 
    'lower', 
    function(s)
    {
        return new String(s).toLowerCase();
    }
);

jSmart.prototype.registerPlugin(
    'modifier', 
    'nl2br', 
    function(s)
    {
        return new String(s).replace(/\n/g,'<br />\n');
    }
);

/** 
    only modifiers (flags) 'i' and 'm' are supported 
    backslashes should be escaped e.g. \\s
*/
jSmart.prototype.registerPlugin(
    'modifier', 
    'regex_replace',
    function(s, re, replaceWith)
    {
        var pattern = re.match(/^ *\/(.*)\/(.*) *$/);
        return (new String(s)).replace(new RegExp(pattern[1],'g'+(pattern.length>1?pattern[2]:'')), replaceWith);
    }
);

jSmart.prototype.registerPlugin(
    'modifier', 
    'replace',
    function(s, search, replaceWith)
    {
        if (!search)
        {
            return s;
        }
        s = new String(s);
        search = new String(search);
        replaceWith = new String(replaceWith);
        var res = '';
        var pos = -1;
        for (pos=s.indexOf(search); pos>=0; pos=s.indexOf(search))
        {
            res += s.slice(0,pos) + replaceWith;
            pos += search.length;
            s = s.slice(pos);
        }
        return res + s;
    }
);

jSmart.prototype.registerPlugin(
    'modifier', 
    'strip',
    function(s, replaceWith)
    {
        replaceWith = replaceWith ? replaceWith : ' ';
        return (new String(s)).replace(/[\s]+/g, replaceWith);
    }
);

jSmart.prototype.registerPlugin(
    'modifier', 
    'strip_tags',
    function(s, addSpace)
    {
        addSpace = (addSpace==null) ? true : addSpace;
        return (new String(s)).replace(/<[^>]*?>/g, addSpace ? ' ' : '');
    }
);

jSmart.prototype.registerPlugin(
    'modifier', 
    'upper', 
    function(s)
    {
        return (new String(s)).toUpperCase();
    }
);


})()
