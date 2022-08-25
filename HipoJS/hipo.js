var Hipo = (function (exports = {}) {
    console.log("here is Hipo");
    exports.addScriptNode = addScriptNode;
    exports.appendToHeader = appendToHeader;
    /**
     * 使用对象描述创建元素
     */
    function addScriptNode(src) {
        var node = document.createElement("script");
        node.type = "text/javascript";
        node.src = src;
        appendToHeader(node);
    }

    /**
     * 将 node|Element 插入 Header
     */
    function appendToHeader(node) {
        var headNode = document.getElementsByTagName("head")[0];
        headNode ||
            (headNode = document.body.parentNode.appendChild(
                document.createElement("head")
            )); // 相当于 如果 node 不存在, 就执行后面的, 好有意思的写法,其他语言也能这样不 php 有 ??
        headNode.appendChild(node);
    }
    /**
     * 传入css选择器字符串, 转成 Element
     * div>p+p+div>p
     */
    exports.elementChain = elementChain;
    function elementChain(chain) {
        elementChainBuild(chain);
        var res = window.NiangYaoJiaRen.node;
        delete window.NiangYaoJiaRen;
        return res;
    }
    function elementChainBuild(chain) {
        if (typeof window.NiangYaoJiaRen === "undefined") {
            console.log(chain);
            window.NiangYaoJiaRen = {};
            window.NiangYaoJiaRen.flag = false;
            window.NiangYaoJiaRen.chain = elementChainBuildOfConstruct(chain);
            chain = window.NiangYaoJiaRen.chain;
        }
        for (var key in chain) {
            if (typeof chain[key] === "object") {
                elementChainBuild(chain[key]);
            } else {
                // console.log(chain.name)
                if (chain.name.split(/\#/).length > 2)
                    throw new Error("错误: 定义了多个 id");
                var str = chain.name;

                // id 提取, 然后把他从name 中剔除
                var id = str.match(/\#([^.]+)/);
                if (id) {
                    id = str.match(/\#([^.]+)/)[1];
                    str = str.replace(/\#[^.]+/, "");
                }
                // 提取 name & class
                str = str.split(/\./);
                var name = str.shift();
                var classList = str.join(" ").trim();
                // 创建 元素
                var el = document.createElement(name);
                if (id) el.setAttribute("id", id);
                if (classList) el.setAttribute("class", classList);
                if (window.NiangYaoJiaRen.node) {
                    window.NiangYaoJiaRen.node.appendChild(el);
                } else {
                    window.NiangYaoJiaRen.node = el;
                }
            }
        }
    }
    function elementChainBuildOfConstruct(str) {
        // str = `span>span2>div+nav+div>span.notranslate>strong+b+span>strong+b`;
        // str = `span>a>b`;

        str = str.replace(/\s|\n/g, "");
        // console.log(str)
        /**
         * 构建如下结构的对象
         * 表达式 a>b+c>d
         */
        if (false) {
            var jsen = {
                name: "a",
                sons: [
                    {
                        name: "b",
                    },
                    {
                        name: "c",
                        sons: [
                            {
                                name: "d",
                            },
                        ],
                    },
                ],
            };
        }
        var tree = { name: "", sons: [] };
        var stack = str.split(">");

        while (stack.length) {
            var sons = stack.pop();
            // if son.includes + 或
            if (sons.includes("+")) {
                var sonStack = sons.split("+").reverse();

                if (tree.sons.length) {
                    tree.name = sonStack.shift();
                    tree = {
                        name: "",
                        sons: [tree],
                    };
                }

                while (sonStack.length) {
                    var son = { name: sonStack.shift() };
                    tree.sons.unshift(son);
                }
            } else {
                if (!tree.name) {
                    tree.name = sons;
                    tree = {
                        name: "",
                        sons: [tree],
                    };
                }
            }
        }
        tree = tree.sons[0];
        console.log(tree);
        return tree;
    }

    /**
     * 用 xpath 获取元素数组集合
     */
    exports.xnode = xnode;
    function xnode(path) {
        let xResults = document.evaluate(
            path,
            document.body,
            null,
            XPathResult.ORDERED_NODE_ITERATOR_TYPE,
            null
        ); // 这是个 xpathResult 对象
        let el;
        let els = [];
        while ((el = xResults.iterateNext())) {
            els.push(el);
        }
        return els;
    }

    /**
     * 计算元素拥有多少文本节点
     */
    exports.childNodesCountOfText = childNodesCountOfText
    function childNodesCountOfText(nod) {
        var textCount = 0;
        nod.childNodes.forEach((sub) => {
            if (sub.nodeType === 3) textCount++;
        });
        return textCount;
    }
    /**
     * 返回所有子文本节点
     * @param {node} nod
     */
    exports.childNodesOfText = childNodesOfText
    function childNodesOfText(nod) {
        var nodList = [];
        nod.childNodes.forEach((sub) => {
            if (sub.nodeType === 3) {
                nodList.push(sub);
            }
        });
        return nodList;
    }

    /**
     * 未测试...可能破坏原页面..还是不要 remove 而是 display none 下次要改
     */
    exports.rename = rename
    function rename(node,newName){
        let copy = node.parentNode.insertBefore(document.createElement(newName),node)
        while(node.firstChild){
            copy.appendChild(node.firstChild)
        }
        node.remove()


    }
    exports.addStyle = addStyle
    function addStyle(el, styles) {
        let hasStyle = el.getAttribute("style");
        if (!hasStyle) {
            // 没有内联样式, 创建 Style 属性并插入  https://developer.mozilla.org/zh-CN/docs/Web/API/Document/createAttribute
            // 直接用 setAttribute 会更简单, setAttribue 会检查有没有这个属性, 如果没有会创建, 有就覆盖
            let attr = document.createAttribute("style");
            attr.value = styles;
            el.setAttributeNode(attr);
        } else {
            // 读取旧样式
            let oldStyle = el.getAttribute("style").trim();
            // 分号处理,旧值末尾加分号, 如果 -1 是 undefined ,说是他定义了 style 属性, 却没给值, 此时也不需要加分号
            if (
                oldStyle[oldStyle.length - 1] &&
                oldStyle[oldStyle.length - 1] !== ";"
            )
                oldStyle = oldStyle + ";";
            // 旧值末尾总有分号, 新值前端就不能有分号了
            if (styles[0] == ";") styles = styles.slice(1);
            // 设置节点属性
            el.setAttribute("style", oldStyle + styles); // 如果不存在会自动创建, 所以上一步没啥用啊
        }
    }

    exports.insertAfter = insertAfter
    function insertAfter(newNode,refNode){
        // let nextNode = refNode.nextSibling // 这个会出现 div+p 时硬是认为 div 后面有个 #text 然后才是p 所以需要处理文本节点, 此处偷懒, 用 nextElementSibling 忽略文本节点
        let nextNode = refNode.nextElementSibling
        if (nextNode){
            return nextNode.insertBefore(newNode,nextNode)
        }else{
            return refNode.parentNode.appendChild(newNode)
        }
    }
    return exports;
})();
