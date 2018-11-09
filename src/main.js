/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import HelpText from "./templates/help.js";
import CodeMirror from "codemirror/src/codemirror.js";
window.CodeMirror = CodeMirror;

let idbset, idbget;
let storageKey = "scratchpad";
const iframe = document.querySelector("iframe");
let idbkeyval = null;
let dirty = false;
let hasBeenEdited = false;
let lastObjectURL = null;

function updateIframe() {
  if (!dirty) {
    return;
  }
  if (lastObjectURL) {
    URL.revokeObjectURL(lastObjectURL);
    lastObjectURL = null;
  }
  const content = editor.getValue();
  if (idbset) {
    idbset(storageKey, content);
  }
  if (!hasFlag("norun")) {
    lastObjectURL = URL.createObjectURL(
      new Blob([content], { type: "text/html" })
    );
    iframe.contentWindow.location = lastObjectURL;
  }
  dirty = false;
}

function hasFlag(flag) {
  return (new RegExp(`(?:^#|,)(${flag}(?:=[^,]+)?)(?:,|$)`).exec(location.hash) || [])[1];
}

function loadCSS(file) {
  return new Promise(resolve => {
    const link = document.createElement("link");
    link.href = file;
    link.rel = "stylesheet";
    link.onload = resolve;
    document.head.append(link);
  });
}

async function init() {
  if (hasFlag("flip")) {
    document.body.style.flexDirection = "column-reverse";
  }
  let name = hasFlag("name");
  if(name) {
    storageKey = `scratchpad_${name.split("=")[1]}`;
  }
  const ta = document.querySelector("#editor")
  ta.value = HelpText;
  window.editor = CodeMirror.fromTextArea(ta, {
    lineNumbers: true,
    matchBrackets: true,
    styleActiveLine: true,
    theme: "monokai"
  });
  editor.on("change", () => (hasBeenEdited = dirty = true));
  setInterval(updateIframe, 1000);

  // Lazy CSS
  import("../static/third_party/monokai.css").then(m =>loadCSS(m.default));

  ({ get: idbget, set: idbset } = await import("idb-keyval"));
  if (hasFlag("help")) {
    editor.setValue(HelpText);
  } else if (hasFlag("boilerplate")) {
    editor.setValue((await import("./templates/boilerplate.js")).default);
  } else if (!hasBeenEdited) {
    const content = await idbget(storageKey);
    if (content) {
      editor.setValue(content);
    }
  }

  const { modeInjector } = await import("./mode-injector.js");
  modeInjector(CodeMirror);
  editor.setOption("mode", "htmlmixed");

  navigator.serviceWorker.register("sw.js");
}
init();
