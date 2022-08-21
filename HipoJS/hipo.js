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

    return exports;
})();
