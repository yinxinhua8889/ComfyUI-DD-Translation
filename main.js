import { app } from "../../scripts/app.js";
import { $el } from "../../scripts/ui.js";
import { applyMenuTranslation, observeFactory } from "./MenuTranslate.js";
// Translation Utils
export class TUtils {
  static TRANSLATION_ENABLED = "DD.TranslationEnabled";

  static T = {
    Menu: {},
    Nodes: {},
    NodeCategory: {},
  };
  static ELS = {};

  // 检查文本是否包含中文字符
  static containsChineseCharacters(text) {
    if (!text) return false;
    // 匹配中文字符范围
    const chineseRegex = /[\u4e00-\u9fff\uf900-\ufaff]/;
    return chineseRegex.test(text);
  }

  // 不需要翻译的设置项列表
  static nativeTranslatedSettings = [
    "Comfy", "画面", "外观", "3D", "遮罩编辑器", 
  ];

  static toggleTranslation() {
    const enabled = localStorage.getItem(TUtils.TRANSLATION_ENABLED) !== "false";
    localStorage.setItem(TUtils.TRANSLATION_ENABLED, enabled ? "false" : "true");
    setTimeout(() => {
      location.reload();
    }, 500);
  }

  static isTranslationEnabled() {
    // 如果没有设置过，默认启用翻译
    return localStorage.getItem(TUtils.TRANSLATION_ENABLED) !== "false";
  }

  static syncTranslation(OnFinished = () => {}) {
    // 如果翻译被禁用，直接返回
    if (!TUtils.isTranslationEnabled()) {
      OnFinished();
      return;
    }
    
    // 如果ComfyUI已经设置为中文，则只翻译节点和自定义内容
    const isComfyUIChineseNative = document.documentElement.lang === 'zh-CN';
    const onlyTranslateNodes = isComfyUIChineseNative;
    
    var url = "./agl/get_translation";
    var request = new XMLHttpRequest();
    request.open("post", url, false);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.onload = function () {
      /* XHR对象获取到返回信息后执行 */
      if (request.status != 200) return;
      var resp = JSON.parse(request.responseText);
      for (var key in TUtils.T) {
        if (key in resp) TUtils.T[key] = resp[key];
        else TUtils.T[key] = {};
      }
      
      // 如果ComfyUI已经原生支持中文，则过滤掉与原生支持冲突的菜单项
      if (onlyTranslateNodes) {
        // 过滤掉已经原生支持的菜单项
        const originalMenu = TUtils.T.Menu || {};
        TUtils.T.Menu = {};
        for (const key in originalMenu) {
          // 如果不在原生翻译列表中，或者不包含中文，保留
          if (!TUtils.nativeTranslatedSettings.includes(key) && 
              !TUtils.nativeTranslatedSettings.includes(originalMenu[key]) &&
              !TUtils.containsChineseCharacters(key)) {
            TUtils.T.Menu[key] = originalMenu[key];
          }
        }
      } else {
        // 合并NodeCategory 到 Menu
        TUtils.T.Menu = Object.assign(TUtils.T.Menu || {}, TUtils.T.NodeCategory || {});
      }
      
      // 提取 Node 中 key 到 Menu
      for (let key in TUtils.T.Nodes) {
        let node = TUtils.T.Nodes[key];
        if(node && node["title"]) {
          TUtils.T.Menu = TUtils.T.Menu || {};
          TUtils.T.Menu[key] = node["title"] || key;
        }
      }
      
      OnFinished();
    };
    request.send(`locale=zh-CN`);
  }
  
  static enhandeDrawNodeWidgets() {
    // 移除了对主题颜色的检测，使用通用处理方式
    let drawNodeWidgets = LGraphCanvas.prototype.drawNodeWidgets;
    LGraphCanvas.prototype.drawNodeWidgets = function (node, posY, ctx, active_widget) {
      if (!node.widgets || !node.widgets.length) {
        return 0;
      }
      const widgets = node.widgets.filter((w) => w.type === "slider");
      widgets.forEach((widget) => {
        widget._ori_label = widget.label;
        const fixed = widget.options.precision != null ? widget.options.precision : 3;
        widget.label = (widget.label || widget.name) + ": " + Number(widget.value).toFixed(fixed).toString();
      });
      let result;
      try {
        result = drawNodeWidgets.call(this, node, posY, ctx, active_widget);
      } finally {
        widgets.forEach((widget) => {
          widget.label = widget._ori_label;
          delete widget._ori_label;
        });
      }
      return result;
    };
  }
  static applyNodeTypeTranslationEx(nodeName) {
    let nodesT = this.T.Nodes;
    var nodeType = LiteGraph.registered_node_types[nodeName];
    let class_type = nodeType.comfyClass ? nodeType.comfyClass : nodeType.type;
    if (nodesT.hasOwnProperty(class_type)) {
      nodeType.title = nodesT[class_type]["title"] || nodeType.title;
    }
  }

  /**
   * Translate node def's display name in place.
   * @param {ComfyNodeDef} nodeDef
   * Ref: https://github.com/Comfy-Org/ComfyUI_frontend/blob/adcef7d2f4124f03bd1a6a86d6c781bdc5bdf3a6/src/types/apiTypes.ts#L360
   */
  static applyVueNodeDisplayNameTranslation(nodeDef) {
    const nodesT = TUtils.T.Nodes;
    const class_type = nodeDef.name;
    if (nodesT.hasOwnProperty(class_type)) {
      nodeDef.display_name = nodesT[class_type]["title"] || nodeDef.display_name;
    }
  }

  static applyVueNodeTranslation(nodeDef) {
    const catsT = TUtils.T.NodeCategory;
    const nodesT = TUtils.T.Nodes;
    const nodeT = TUtils.T.Nodes[nodeDef.name];
    // category
    if (!nodeDef.category) return;
    const catArr = nodeDef.category.split("/");
    nodeDef.category = catArr.map((cat) => catsT?.[cat] || cat).join("/");
    if (!nodeT) return;
    return;
    for (let itype in nodeDef.input) {
      if (itype === "hidden") continue;
      for (let socketname in nodeDef.input[itype]) {
        let inp = nodeDef.input[itype][socketname];
        if (inp[1] === undefined) continue;
        inp.name = nodeT["inputs"]?.[socketname] || nodeT["widgets"]?.[socketname] || undefined;
      }
    }
  }

  static applyNodeTypeTranslation(app) {
    // 如果翻译被禁用，直接返回
    if (!TUtils.isTranslationEnabled()) return;
    
    for (let nodeName in LiteGraph.registered_node_types) {
      this.applyNodeTypeTranslationEx(nodeName);
    }
  }

  static applyNodeTranslation(node) {
    let keys = ["inputs", "outputs", "widgets"];
    let nodesT = this.T.Nodes;
    let class_type = node.constructor.comfyClass ? node.constructor.comfyClass : node.constructor.type;
    if (!nodesT.hasOwnProperty(class_type)) {
      for (let key of keys) {
        if (!node.hasOwnProperty(key) || !Array.isArray(node[key])) continue;
        node[key].forEach((item) => {
          if (item?.hasOwnProperty("name")) item.label = item.name;
        });
      }
      return;
    }
    var t = nodesT[class_type];
    for (let key of keys) {
      if (!t.hasOwnProperty(key)) continue;
      if (!node.hasOwnProperty(key)) continue;
      node[key].forEach((item) => {
        if (item?.name in t[key]) {
          item.label = t[key][item.name];
        }
      });
    }
    if (t.hasOwnProperty("title")) {
      node.title = t["title"];
      node.constructor.title = t["title"];
    }
    // 转换 widget 到 input 时需要刷新socket信息
    let addInput = node.addInput;
    node.addInput = function (name, type, extra_info) {
      var oldInputs = [];
      this.inputs?.forEach((i) => oldInputs.push(i.name));
      var res = addInput.apply(this, arguments);
      this.inputs?.forEach((i) => {
        if (oldInputs.includes(i.name)) return;
        if (t["widgets"] && i.widget?.name in t["widgets"]) {
          i.label = t["widgets"][i.widget?.name];
        }
      });
      return res;
    };
    let onInputAdded = node.onInputAdded;
    node.onInputAdded = function (slot) {
      if (onInputAdded) var res = onInputAdded.apply(this, arguments);
      // console.log(slot);
      let t = TUtils.T.Nodes[this.comfyClass];
      if (t["widgets"] && slot.name in t["widgets"]) {
        slot.localized_name = t["widgets"][slot.name];
      }
      if (onInputAdded) return res;
    };
  }

  static applyNodeDescTranslation(nodeType, nodeData, app) {
    let nodesT = this.T.Nodes;
    var t = nodesT[nodeType.comfyClass];
    nodeData.description = t?.["description"] || nodeData.description;

    var nodeT = nodesT[nodeType.comfyClass] || {};
    // 输入和widget提示
    var nodeInputT = nodeT["inputs"] || {};
    var nodeWidgetT = nodeT["widgets"] || {};
    for (let itype in nodeData.input) {
      for (let socketname in nodeData.input[itype]) {
        let inp = nodeData.input[itype][socketname];
        if (inp[1] === undefined || !inp[1].tooltip) continue;
        var tooltip = inp[1].tooltip;
        var tooltipT = nodeInputT[tooltip] || nodeWidgetT[tooltip] || tooltip;
        inp[1].tooltip = tooltipT;
      }
    }
    // 输出提示
    var nodeOutputT = nodeT["outputs"] || {};
    for (var i = 0; i < (nodeData.output_tooltips || []).length; i++) {
      var tooltip = nodeData.output_tooltips[i];
      var tooltipT = nodeOutputT[tooltip] || tooltip;
      nodeData.output_tooltips[i] = tooltipT;
    }
  }

  static applyMenuTranslation(app) {
    // 如果翻译被禁用，直接返回
    if (!TUtils.isTranslationEnabled()) return;
    
    // 搜索菜单 常驻菜单
    applyMenuTranslation(TUtils.T);
    // Queue size 单独处理
    observeFactory(app.ui.menuContainer.querySelector(".drag-handle").childNodes[1], (mutationsList, observer) => {
      for (let mutation of mutationsList) {
        for (let node of mutation.addedNodes) {
          var match = node.data.match(/(Queue size:) (\w+)/);
          if (match?.length == 3) {
            const t = TUtils.T.Menu[match[1]] ? TUtils.T.Menu[match[1]] : match[1];
            node.data = t + " " + match[2];
          }
        }
      }
    });
  }

  static applyContextMenuTranslation(app) {
    // 如果翻译被禁用，直接返回
    if (!TUtils.isTranslationEnabled()) return;
    
    // 右键上下文菜单
    var f = LGraphCanvas.prototype.getCanvasMenuOptions;
    LGraphCanvas.prototype.getCanvasMenuOptions = function () {
      var res = f.apply(this, arguments);
      let menuT = TUtils.T.Menu;
      for (let item of res) {
        if (item == null || !item.hasOwnProperty("content")) continue;
        if (item.content in menuT) {
          item.content = menuT[item.content];
        }
      }
      return res;
    };
    const f2 = LiteGraph.ContextMenu;
    LiteGraph.ContextMenu = function (values, options) {
      // 右键上下文菜单先从此处翻译, 随后会经过 applyMenuTranslation走通用翻译
      if (options.hasOwnProperty("title") && options.title in TUtils.T.Nodes) {
        options.title = TUtils.T.Nodes[options.title]["title"] || options.title;
      }
      // Convert {w.name} to input
      // Convert {w.name} to widget
      var t = TUtils.T.Menu;
      var tN = TUtils.T.Nodes;
      var reInput = /Convert (.*) to input/;
      var reWidget = /Convert (.*) to widget/;
      var cvt = t["Convert "] || "Convert ";
      var tinp = t[" to input"] || " to input";
      var twgt = t[" to widget"] || " to widget";
      for (let value of values) {
        if (value == null || !value.hasOwnProperty("content")) continue;
        // 子菜单先走 节点标题菜单
        if (value.value in tN)
        {
          value.content = tN[value.value]["title"] || value.content;
          continue;
        }
        // inputs
        if (value.content in t) {
          value.content = t[value.content];
          continue;
        }
        var extra_info = options.extra || options.parentMenu?.options?.extra; // for capture translation text of input and widget
        // widgets and inputs
        var matchInput = value.content?.match(reInput);
        if (matchInput) {
          var match = matchInput[1];
          extra_info?.inputs?.find((i) => {
            if (i.name != match) return false;
            match = i.label ? i.label : i.name;
          });
          extra_info?.widgets?.find((i) => {
            if (i.name != match) return false;
            match = i.label ? i.label : i.name;
          });
          value.content = cvt + match + tinp;
          continue;
        }
        var matchWidget = value.content?.match(reWidget);
        if (matchWidget) {
          var match = matchWidget[1];
          extra_info?.inputs?.find((i) => {
            if (i.name != match) return false;
            match = i.label ? i.label : i.name;
          });
          extra_info?.widgets?.find((i) => {
            if (i.name != match) return false;
            match = i.label ? i.label : i.name;
          });
          value.content = cvt + match + twgt;
          continue;
        }
      }

      const ctx = f2.call(this, values, options);
      return ctx;
    };
    LiteGraph.ContextMenu.prototype = f2.prototype;
    // search box
    // var f3 = LiteGraph.LGraphCanvas.prototype.showSearchBox;
    // LiteGraph.LGraphCanvas.prototype.showSearchBox = function (event) {
    // 	var res = f3.apply(this, arguments);
    // 	var t = TUtils.T.Menu;
    // 	var name = this.search_box.querySelector(".name");
    // 	if (name.innerText in t)
    // 		name.innerText = t[name.innerText];
    // 	t = TUtils.T.Nodes;
    // 	var helper = this.search_box.querySelector(".helper");
    // 	var items = helper.getElementsByClassName("litegraph lite-search-item");
    // 	for (let item of items) {
    // 		if (item.innerText in t)
    // 			item.innerText = t[item.innerText]["title"];
    // 	}
    // 	return res;
    // };
    // LiteGraph.LGraphCanvas.prototype.showSearchBox.prototype = f3.prototype;
  }

  static addRegisterNodeDefCB(app) {
    const f = app.registerNodeDef;
    async function af() {
      return f.apply(this, arguments);
    }
    app.registerNodeDef = async function (nodeId, nodeData) {
      var res = af.apply(this, arguments);
      res.then(() => {
        TUtils.applyNodeTypeTranslationEx(nodeId);
      });
      return res;
    };
  }
  static addPanelButtons(app) {
    // 检查是否已有切换按钮
    if(document.getElementById("toggle-translation-button")) return;
    
    const translationEnabled = TUtils.isTranslationEnabled();
    
    // 创建样式元素，添加按钮动画效果
    const styleElem = document.createElement('style');
    styleElem.textContent = `
      @keyframes flowEffect {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
      
      .dd-translation-active {
        background: linear-gradient(90deg, #e6a919, #f4d03f, #f9e79f, #f4d03f, #e6a919);
        background-size: 300% 100%;
        color: #333;
        border: none;
        animation: flowEffect 5s ease infinite;
        text-shadow: 0 1px 1px rgba(0,0,0,0.1);
        box-shadow: 0 0 5px rgba(244, 208, 63, 0.5);
        transition: all 0.3s ease;
      }
      
      .dd-translation-inactive {
        background: linear-gradient(90deg, #1a5276, #2980b9, #3498db, #2980b9, #1a5276);
        background-size: 300% 100%;
        color: white;
        border: none;
        animation: flowEffect 7s ease infinite;
        box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
        transition: all 0.3s ease;
      }
      
      .dd-translation-btn:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
    `;
    document.head.appendChild(styleElem);
    
    // 添加旧版UI的切换按钮
    if(document.querySelector(".comfy-menu") && !document.getElementById("toggle-translation-button")) {
      app.ui.menuContainer.appendChild(
        $el("button.dd-translation-btn", {
          id: "toggle-translation-button",
          textContent: translationEnabled ? "附加翻译" : "官方实现",
          className: translationEnabled ? "dd-translation-btn dd-translation-active" : "dd-translation-btn dd-translation-inactive",
          style: {
            fontWeight: "bold",
            fontSize: "12px",
            padding: "5px 10px",
            borderRadius: "4px",
          },
          title: translationEnabled ? "已开启额外附加翻译" : "已使用官方原生翻译",
          onclick: () => {
            TUtils.toggleTranslation();
          },
        })
      );
    }
    
    // 添加新版UI的切换按钮
    try {
      if(window?.comfyAPI?.button?.ComfyButton && window?.comfyAPI?.buttonGroup?.ComfyButtonGroup) {
        var ComfyButtonGroup = window.comfyAPI.buttonGroup.ComfyButtonGroup;
        var ComfyButton = window.comfyAPI.button.ComfyButton;
        
        var btn = new ComfyButton({
          action: () => {
            TUtils.toggleTranslation();
          },
          tooltip: translationEnabled ? "已开启额外附加翻译" : "已使用官方原生翻译",
          content: translationEnabled ? "附加翻译" : "官方实现",
          classList: "toggle-translation-button"
        });
        
        // 设置按钮样式
        if(btn.element) {
          btn.element.classList.add("dd-translation-btn");
          btn.element.classList.add(translationEnabled ? "dd-translation-active" : "dd-translation-inactive");
          btn.element.style.fontWeight = "bold";
          btn.element.style.fontSize = "12px";
          btn.element.style.padding = "5px 10px";
          btn.element.style.borderRadius = "4px";
        }
        
        var group = new ComfyButtonGroup(btn.element);
        if(app.menu?.settingsGroup?.element) {
          app.menu.settingsGroup.element.before(group.element);
        }
      }
    } catch(e) {
      console.log("Error adding new UI language button:", e);
    }
  }
}

const ext = {
  name: "AIGODLIKE.Translation",
  async init(app) {
    // Any initial setup to run as soon as the page loads
    TUtils.enhandeDrawNodeWidgets();
    TUtils.syncTranslation();
  },
  async setup(app) {
    // 检查ComfyUI是否已原生中文
    const isComfyUIChineseNative = document.documentElement.lang === 'zh-CN';
    
    // 只有在翻译启用时才应用翻译
    if (TUtils.isTranslationEnabled()) {
      TUtils.applyNodeTypeTranslation(app);
      TUtils.applyContextMenuTranslation(app);
      // 如果ComfyUI已经原生支持中文，只翻译节点和自定义内容
      if (!isComfyUIChineseNative) {
        TUtils.applyMenuTranslation(app);
      }
      TUtils.addRegisterNodeDefCB(app);
    }
    
    // 按钮总是添加，方便切换翻译
    TUtils.addPanelButtons(app);
  },
  async addCustomNodeDefs(defs, app) {
    // Add custom node definitions
    // These definitions will be configured and registered automatically
    // defs is a lookup core nodes, add yours into this
    // console.log("[logging]", "add custom node definitions", "current nodes:", Object.keys(defs));
  },
  async getCustomWidgets(app) {
    // Return custom widget types
    // See ComfyWidgets for widget examples
    // console.log("[logging]", "provide custom widgets");
  },
  async beforeRegisterNodeDef(nodeType, nodeData, app) {
    TUtils.applyNodeDescTranslation(nodeType, nodeData, app);
    // Run custom logic before a node definition is registered with the graph
    // console.log("[logging]", "before register node: ", nodeType.comfyClass);
    // This fires for every node definition so only log once
    // applyNodeTranslationDef(nodeType, nodeData);
    // delete ext.beforeRegisterNodeDef;
  },
  beforeRegisterVueAppNodeDefs(nodeDefs) {
    nodeDefs.forEach(TUtils.applyVueNodeDisplayNameTranslation);
    nodeDefs.forEach(TUtils.applyVueNodeTranslation);
  },
  async registerCustomNodes(app) {
    // Register any custom node implementations here allowing for more flexability than a custom node def
    // console.log("[logging]", "register custom nodes");
  },
  loadedGraphNode(node, app) {
    // 只有在翻译启用时才应用翻译
    if (TUtils.isTranslationEnabled()) {
      TUtils.applyNodeTranslation(node);
    }
  },
  nodeCreated(node, app) {
    // 只有在翻译启用时才应用翻译
    if (TUtils.isTranslationEnabled()) {
      TUtils.applyNodeTranslation(node);
    }
  },
};

app.registerExtension(ext);
