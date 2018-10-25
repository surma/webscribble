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
import CodeMirror from "codemirror/src/codemirror.js";

const iframe = document.querySelector("iframe");
const autoRun = !location.hash.includes("!norun");
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
  if (idbkeyval) {
    idbkeyval.set("scratchpad", content);
  }
  if (autoRun) {
    lastObjectURL = URL.createObjectURL(
      new Blob([content], { type: "text/html" })
    );
    iframe.contentWindow.location = lastObjectURL;
  }
  dirty = false;
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
  window.editor = CodeMirror.fromTextArea(document.querySelector("#editor"), {
    lineNumbers: true,
    matchBrackets: true,
    styleActiveLine: true,
    theme: "monokai"
  });
  window.CodeMirror = CodeMirror;
  // editor.setSize("50%", "100%");
  editor.on("change", () => (hasBeenEdited = dirty = true));
  setInterval(updateIframe, 1000);

  // Lazy CSS
  ["/third_party/monokai.css"].map(loadCSS);

  const { modeInjector } = await import("./mode-injector.js");
  modeInjector(CodeMirror);
  editor.setOption("mode", "htmlmixed");
  const { get, set } = await import("idb-keyval");
  idbkeyval = { get, set };
  if (!hasBeenEdited) {
    const content = await get("scratchpad");
    if (content) {
      editor.setValue(content);
    }
  }
}
init();
