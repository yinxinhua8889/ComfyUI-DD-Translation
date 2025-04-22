class TExe {
  static T = null;
  MT(txt) {
    // 如果文本已经包含中文字符，跳过翻译
    if (this.containsChineseCharacters(txt)) {
      return null;
    }
    return this.T?.Menu?.[txt] || this.T?.Menu?.[txt?.trim?.()];
  }

  // 检查文本是否包含中文字符
  containsChineseCharacters(text) {
    if (!text) return false;
    // 匹配中文字符范围
    const chineseRegex = /[\u4e00-\u9fff\uf900-\ufaff]/;
    return chineseRegex.test(text);
  }

  // 不需要翻译的设置项列表
  nativeTranslatedSettings = [
    "Comfy", "画面", "外观", "3D", "遮罩编辑器", "节点", 
    "EasyUse节点", "对齐", "RG节点", "自定义脚本", 
    "MTB节点", "KJ节点", "语言", "全局输入", "Cryslools工具组"
  ];

  constructor() {
    this.excludeClass = ["lite-search-item-type"];
  }

  tSkip(node) {
    // 是否需要跳过翻译?
    // 判断node.classList 是否包含 excludeClass中的一个
    return this.excludeClass.some((cls) => node.classList?.contains(cls));
  }

  translateKjPopDesc(node) {
    let T = this.T;
    if (!T) return false;
    if (!node || !node.querySelectorAll) return false;
    if (!node?.classList?.contains("kj-documentation-popup")) return false;
    const allElements = node.querySelectorAll("*");

    for (const ele of allElements) {
      this.replaceText(ele);
    }
    return true;
  }

  translateAllText(node) {
    let T = this.T;
    if (!T) return;
    if (!node || !node.querySelectorAll) return;
    const allElements = node.querySelectorAll("*");

    for (const ele of allElements) {
      // 跳过ComfyUI原生已经翻译的设置项
      if (ele.textContent && this.nativeTranslatedSettings.includes(ele.textContent)) {
        continue;
      }
      this.replaceText(ele);
    }
  }

  replaceText(target) {
    if (!target) return;
    if (!this.T) return;
    if (this.tSkip(target)) return;
    
    // 如果节点的内容是原生已翻译的设置项，跳过翻译
    if (target.textContent && this.nativeTranslatedSettings.includes(target.textContent)) {
      return;
    }
    
    for (const childNode of target.childNodes || [])
      this.replaceText(childNode);
    this.replaceText(target.firstChild);
    
    // 翻译target
    if (target.nodeType === Node.TEXT_NODE) {
      if (target.nodeValue && !this.containsChineseCharacters(target.nodeValue)) {
        target.nodeValue = this.MT(target.nodeValue) || target.nodeValue;
      }
    }
    else if (target.nodeType === Node.ELEMENT_NODE) {
      if (target.title && !this.containsChineseCharacters(target.title)) {
        target.title = this.MT(target.title) || target.title;
      }

      if (target.nodeName === "INPUT" && target.type === "button" && !this.containsChineseCharacters(target.value)) {
        target.value = this.MT(target.value) || target.value;
      }

      if (target.innerText && !this.containsChineseCharacters(target.innerText) && this.MT(target.innerText)) {
        target.innerText = this.MT(target.innerText);
      }
      
      if (target.textContent && !this.containsChineseCharacters(target.textContent) && this.MT(target.textContent)) {
        target.textContent = this.MT(target.textContent);
      }
      
      // 添加对select和option元素的特殊处理
      if (target.nodeName === "SELECT") {
        // 确保翻译下拉框中的选项
        Array.from(target.options).forEach(option => {
          if (option.text && !this.containsChineseCharacters(option.text) && this.MT(option.text)) {
            option.text = this.MT(option.text);
          }
        });
      }
    }else if(target.nodeType === Node.COMMENT_NODE){
      // pass
    }
  }
}
let texe = new TExe();

export function applyMenuTranslation(T) {
  texe.T = T;
  
  // 处理主要的UI元素
  texe.translateAllText(document.querySelector(".litegraph"));
  
  // 处理模态框
  for (let node of document.querySelectorAll(".comfy-modal"))
    observeFactory(node, (mutationsList, observer) => {
      for (let mutation of mutationsList) {
        texe.translateAllText(mutation.target);
      }
    });
  
  // 处理新版UI菜单
  if (document.querySelector(".comfyui-menu")) {
    observeFactory(document.querySelector(".comfyui-menu"), handleComfyNewUIMenu, true);
  }
  
  // 处理弹出窗口
  for (let node of document.querySelectorAll(".comfyui-popup"))
    observeFactory(node, handleComfyNewUIMenu, true);
  
  // 处理历史按钮和队列按钮
  const viewHistoryButton = document.getElementById("comfy-view-history-button");
  const viewQueueButton = document.getElementById("comfy-view-queue-button");

  [viewHistoryButton, viewQueueButton].filter(Boolean).forEach(btn => {
    observeFactory(btn, (mutationsList, observer) => {
      observer.disconnect();
      for (let mutation of mutationsList) {
        if (mutation.type === "childList") {
          const translatedValue = texe.MT(mutation.target.textContent);
          if (!translatedValue) continue;
          mutation.target.innerText = translatedValue;
        }
      }
      observer.observe(btn, { childList: true, attributes: true });
    });
  });

  // 处理设置对话框
  const comfySettingDialog = document.querySelector("#comfy-settings-dialog");

  // 老版设置面板的翻译
  if(comfySettingDialog?.querySelector("tbody")){
    observeFactory(comfySettingDialog.querySelector("tbody"), handleComfySettingDialogObserver);
  }

  // 新版设置面板处理（特别是颜色主题部分）
  const newSettingsPanels = document.querySelectorAll(".p-dialog-content, .p-tabview-panels");
  for (const panel of newSettingsPanels) {
    observeFactory(panel, handleNewSettingsObserver, true);
  }

  // 处理菜单和列表
  if(document.querySelector(".comfy-menu")) {
    observeFactory(document.querySelector(".comfy-menu"), handleViewQueueComfyListObserver);

    const comfyLists = document.querySelector(".comfy-menu").querySelectorAll(".comfy-list");
    if(comfyLists.length > 0) {
      observeFactory(comfyLists[0], handleViewQueueComfyListObserver);
      if(comfyLists.length > 1) {
        observeFactory(comfyLists[1], handleViewQueueComfyListObserver);
      }
    }
  }

  // 处理页面变化
  observeFactory(document.querySelector("body.litegraph"), (mutationsList, observer) => {
    for (let mutation of mutationsList) {
      for (const node of mutation.addedNodes) {
        texe.translateAllText(node);
        
        // 处理设置对话框 - 新版的p-dialog-mask
        if (node.classList?.contains("p-dialog-mask"))
        {
          const dialog = node.querySelector(".p-dialog");
          if(dialog) {
            observeFactory(dialog, (mutationsList, observer) => {
              for (let mutation of mutationsList) {
                texe.translateAllText(mutation.target);
              }
            }, dialog?.role === "dialog");
          }
          continue;
        }
        
        // 处理comfy-modal
        if (node.classList?.contains("comfy-modal")) {
          observeFactory(node, (mutationsList, observer) => {
            for (let mutation of mutationsList) {
              texe.translateAllText(mutation.target);
            }
          });
        }
      }
    }
  });

  // 处理搜索框
  observeFactory(document.querySelector(".litegraph"), (mutationsList, observer) => {
    if (observer.ob == undefined) {
      observer.ob = [];
    }
    for (let mutation of mutationsList) {
      if (mutation.removedNodes.length > 0 && observer.ob != undefined) {
        for (let ob of observer.ob) ob.disconnect();
        observer.ob = [];
        break;
      }
      for (const sb of mutation.addedNodes) {
        if (!sb || !sb.querySelector) continue
        var helper = sb.querySelector(".helper");
        if (!helper) continue;
        var ob = observeFactory(helper, (mutationsList, observer) => {
          for (let mutation of mutationsList) {
            for (const item of mutation.addedNodes) {
              if (item.innerText in T.Nodes) {
                item.innerText = T.Nodes[item.innerText]["title"];
              }
            }
          }
        });
        for (let item of helper.querySelectorAll(".lite-search-item")) {
          if (item.innerText in T.Nodes) {
            item.innerText = T.Nodes[item.innerText]["title"];
          }
        }
        observer.ob.push(ob);
      }
    }
  });

  // 注意：已移除对色彩主题的所有特殊处理，使用原生样式
  
  function handleViewQueueComfyListObserver(mutationsList) {
    for (let mutation of mutationsList) {
      texe.replaceText(mutation.target);
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          texe.replaceText(node);
        }
      }
    }
  }

  function handleNewSettingsObserver(mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          texe.translateAllText(node);
        }
      }
    }
  }

  const translateSettingDialog = () => {
    if (!comfySettingDialog) return;
    
    const comfySettingDialogAllElements = comfySettingDialog.querySelectorAll("*");
    for (const ele of comfySettingDialogAllElements) {
      // 跳过已经有中文的元素
      if (texe.containsChineseCharacters(ele.innerText) || 
          texe.nativeTranslatedSettings.includes(ele.innerText)) {
        continue;
      }
      
      let targetLangText = texe.MT(ele.innerText);
      let titleText = texe.MT(ele.title);
      if(titleText) ele.title = titleText;
      if (!targetLangText) {
        if (ele.nodeName === "INPUT" && ele.type === "button") {
          targetLangText = texe.MT(ele.value);
          if (!targetLangText) continue;
          ele.value = targetLangText;
        }
        continue;
      }
      texe.replaceText(ele);
    }
  };

  function handleComfySettingDialogObserver(mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        translateSettingDialog();
      }
    }
  }

  function handleComfyNewUIMenu(mutationsList) {
    for (let mutation of mutationsList) {
      texe.translateAllText(mutation.target);
    }
  }
}

export function observeFactory(observeTarget, fn, subtree=false) {
  if (!observeTarget) return;
  const observer = new MutationObserver(function (mutationsList, observer) {
    fn(mutationsList, observer);
  });

  observer.observe(observeTarget, {
    childList: true,
    attributes: true,
    subtree: subtree,
  });
  return observer;
}
