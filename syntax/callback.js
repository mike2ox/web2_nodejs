/*
function a(){
  console.log('A');
}*/
//익명함수, 호출위해 var a
var a = function(){
  console.log('A');
}

function slowfunc(callback){
  callback();
}

slowfunc(a);