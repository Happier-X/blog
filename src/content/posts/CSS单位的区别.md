---
title: "CSS单位的区别"
date: "2026-02-06"
pubDate: "2026-02-06"
description: "CSS中常用单位的区别"
category: ""
tags: ["CSS"]
slug: "css"
---


## px


像素，基本单位。


## %


相对于父元素的尺寸。


如：`position:absolute;`居中显示时，需要设置`left:50%;` 


## em


相对于当前元素的fontsize。


如：首行缩进可以使用`text-indent:2em;` 


## rem


相对于根元素的fontsize。


如：通过媒体查询，设置根元素的fontsize，实现移动端适配。


## vw/vh


相对于屏幕的宽度和高度。


如：1vw是屏幕宽度的1%，1vh是屏幕高度的1%，vmin是两者最小值，vmax是两者最大值。

