import{z as a}from"./anu.BEFiqz5l.js";import{S as p,H as c,V as t,A as h}from"./flowGraphSceneTickEventBlock.jsKt_esu.js";import{i as m}from"./iris.BAQHmt8h.js";const g=function(i){const r=new p(i);new c("light1",new t(0,10,0),r);const n=new h("Camera",-(Math.PI/4)*3,Math.PI/4,10,new t(0,0,0),r);return n.attachControl(!0),n.position=new t(-5,-2,-1),a("cot").bind("sphere",{diameter:1},m).props({position:(e,o,s)=>new t(e.sepalLength,e.sepalWidth,e.petalWidth),"scaling.x":.1,name:(e,o,s)=>"iris_sphere:"+s,renderOutline:!0}),r};export{g as props};
