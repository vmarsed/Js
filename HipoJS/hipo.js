var Hipo = (function (exports={}) {
    
    /**
     * 传入css选择器字符串, 转成 Element
     * div>p+p+div>p
     */
    exports.elementChain=elementChain
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

    
})();