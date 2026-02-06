---
title: "JavaScript防抖与节流"
date: "2026-02-06"
pubDate: "2026-02-06"
description: "简单实现一下防抖与节流"
category: ""
tags: ["JavaScript"]
slug: "javascript"
---


## 防抖


防抖可以理解为：在抖动期间不执行，在抖动结束之后才执行。


```javascript
// 防抖
      const debounce = (fn, delay = 100) => {
        let timer = null;
        return function () {
          if (timer) {
            clearTimeout(timer); // 每次触发都重新计时
          }
          timer = setTimeout(() => {
            fn.apply(this, arguments); // 改变fn函数内部的this指向，传递所有参数给fn
          }, delay);
        };
      };
      
      // 三者都能改变 this，区别在于参数传递方式
			// fn.apply(this, [arg1, arg2]);   // 参数用数组
			// fn.call(this, arg1, arg2);      // 参数逐个传
			// fn.bind(this, arg1, arg2)();    // 返回新函数，需要再调用
```


例如：我们有一个input框，在用户输入内容后再打印输入的内容，而不是一直打印。


```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>防抖</title>
  </head>
  <body>
    <input type="text" id="input" />
    <script>
      const input = document.getElementById("input");
      //   input.addEventListener("input", (e) => {
      //     console.log(e.target.value);
      //   });

      // 防抖
      const debounce = (fn, delay = 100) => {
        let timer = null;
        return function () {
          if (timer) {
            clearTimeout(timer);
          }
          timer = setTimeout(() => {
            fn.apply(this, arguments);
          }, delay);
        };
      };

      input.addEventListener(
        "input",
        debounce((e) => {
          console.log(e.target.value);
        }, 1000),
      );
    </script>
  </body>
</html>
```


## 节流


节流，即节省交互沟通。流，可理解为交流，不一定会产生网络流量。


```javascript
// 节流
      const throttle = (fn, delay = 100) => {
        let timer = null;
        return function () {
          if (timer) {
            return; // 如果正在执行，就直接返回
          }
          timer = setTimeout(() => {
            fn.apply(this, arguments);
            timer = null;
          }, delay);
        };
      }
      
      // 也可以这样实现
      function throttle(fn, delay = 100) {
        let initTime = 0; // 初始时间
        return function () {
          let now = Date.now(); // 当前时间
          if (now - initTime >= delay) {
            fn.apply(this, arguments);
            initTime = now;
          }
        };
      }
```


例如，drag 的回调，上传进度的回调，都可以设置一个固定的频率，没必要那么频繁。


```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>节流</title>
  </head>
  <body>
    <p>throttle</p>
    <div
      id="div1"
      draggable="true"
      style="width: 100px; height: 50px; background-color: #ccc; padding: 10px"
    >
      可拖拽
    </div>

    <script>
      function throttle(fn, delay = 100) {
        let timer = null;

        return function () {
          if (timer) return;

          timer = setTimeout(() => {
            fn.apply(this, arguments);
            timer = null;
          }, delay);
        };
      }

      const div1 = document.getElementById("div1");
      div1.addEventListener(
        "drag",
        throttle((e) => {
          console.log("鼠标的位置", e.offsetX, e.offsetY);
        }),
      );
    </script>
  </body>
</html>
```


## 两者的区别


触发频率：

- 防抖，不固定
- 节流，固定

场景：

- 防抖：结果式，一次调用即可，类似回城操作
- 节流：过程式，需要持续一个过程，一次不够，类似技能CD
