import{z as f,G as u}from"./anu.BEFiqz5l.js";import{S as w,H as z,V as r,A as L}from"./flowGraphSceneTickEventBlock.jsKt_esu.js";import{i as a}from"./iris.BAQHmt8h.js";import"./transform.bqJWYwjj.js";import{l as n}from"./linear.DaneNRwP.js";import{e as i}from"./extent.Ccx1MofX.js";import{m as o}from"./map.B1ecjv1F.js";const I=function(d){const t=new w(d);new z("light1",new r(0,10,0),t);const s=new L("Camera",-(Math.PI/4)*3,Math.PI/4,10,new r(0,0,0),t);s.attachControl(!0),s.position=new r(20,2,-40);var p=n().domain(i(o(a,e=>e.sepalLength))).range([-10,10]).nice(),m=n().domain(i(o(a,e=>e.petalLength))).range([-10,10]).nice(),c=n().domain(i(o(a,e=>e.sepalWidth))).range([-10,10]).nice();let l=f("cot");return l.bind("sphere",{diameter:.5},a).positionX((e,h,g)=>p(e.sepalLength)).positionY((e,h,g)=>m(e.petalLength)).positionZ((e,h,g)=>c(e.sepalWidth)),u("axes",t,{parent:l,scale:{x:p,y:m,z:c}}),t};export{I as scatterPlot3DStep4};
